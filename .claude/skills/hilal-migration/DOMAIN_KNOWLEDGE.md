# Hilal Vision — Domain Knowledge for Migration

Critical invariants and gotchas. Read the relevant sections before executing any migration task. Getting these wrong causes silent bugs, broken payments, or incorrect lunar calculations.

---

## 1. Astronomical Math

### Single Source of Truth
`@hilal/astronomy` is the ONLY place astronomy math lives in the new codebase. It is the split-out of `_legacy/shared/astronomy.ts` (843 lines) into separate modules.

**Never:**
- Import from `_legacy/shared/astronomy.ts` in new code
- Import from `@/lib/astronomy` (legacy re-export path)
- Duplicate any trig, Yallop formula, or Hijri conversion logic

**Always:**
```typescript
import { computeSunMoonAtSunset, yallopQ, classifyYallop, ... } from "@hilal/astronomy";
```

### What `@hilal/astronomy` Exports (packages/astronomy/src/index.ts)
- `./constants` — Yallop coefficients, Odeh V-formula, synodic constant (29.53058867 days)
- `./utils` — `toRad`, `toDeg`, angle conversions
- `./core` — Ephemeris core (sun/moon position from `astronomy-engine`)
- `./sunMoon` — `computeSunMoonAtSunset`, `getSunsetTime`, ARCV, DAZ, crescent width W
- `./grid` — `generateVisibilityGrid` — lat/lng sampling for global grid
- `./moonPhase` — `getMoonPhaseInfo`, `gregorianToHijri`, `hijriToGregorian`
- `./hijri` — Hijri calendar (3 engines: Astronomical, Umm al-Qura, Tabular)
- `./terminator` — Day/night terminator geometry for globe overlay
- `./bestTime` — `computeBestObservationTime` — scans sunset→moonset, scores by altitude + darkness
- `./eclipse` — `predictLunarEclipse(date): LunarEclipseType` using node regression
- Also re-exports everything from `@hilal/types`

### Key Type Interfaces
```typescript
interface SunMoonData {
  sunAlt, sunAz, moonAlt, moonAz, elongation, moonAge,
  arcv, daz, crescent, qValue, odehCriterion,
  visibility, illumination, phase,
  moonrise, moonset, sunset, sunrise, maghrib
}

interface Location {
  lat: number; lng: number; name?: string;
  elevation?: number; temperature?: number; pressure?: number;
}

type VisibilityZone = "A" | "B" | "C" | "D" | "E" | "F"
```

### Globe Texture Rotation — MANDATORY
Any Three.js mesh added to the globe scene via `scene.add()` MUST set:
```typescript
overlayMesh.rotation.y = -Math.PI / 2;
```
This matches three-globe's internal coordinate system. Forgetting it shifts visibility zones 90° east. No exception.

### Cloud Overlay Projection
The `useCloudOverlay` hook accepts a `projection` parameter:
- Globe (equirectangular): `projection: "equirectangular"`
- 2D Map (MapLibre/Leaflet, Mercator): `projection: "mercator"`

These are different projections — passing the wrong one gives visually wrong cloud placement.

### Visibility Worker Output Shape
The worker posts back this exact shape:
```typescript
{
  qValues: Float32Array;  // flat array: width * height floats
  width: number;          // 1024 for high-res
  height: number;         // 512 for high-res
}
```
Do NOT change this shape. `useVisibilityWorker` depends on it. If the worker output shape changes, the hook must change too.

---

## 2. Pro Tier Gating

### The isPremium Formula
```typescript
// From useAppStore
const { clerkHasPro, nativeHasPro, isAdmin } = useAppStore();
const isPremium = clerkHasPro || nativeHasPro || isAdmin;
```

### Wrapping Gated Features
Use the `<ProGate>` component for component-level gating:
```tsx
<ProGate featureName="3D Globe">
  <GlobeComponent />
</ProGate>
```

For inline gating (show different UI, not a paywall overlay):
```tsx
const { clerkHasPro, nativeHasPro, isAdmin } = useAppStore();
const isPremium = clerkHasPro || nativeHasPro || isAdmin;

if (!isPremium) return <UpgradeCTA />;
```

### Admin Bypass
Admin access is granted via Clerk Dashboard only:
- Go to Clerk Dashboard → Users → select user → Public metadata
- Set: `{ "isAdmin": true }`

This is NOT hardcoded in the codebase. Never add email-based admin checks.

### Dev Bypass
`ProGate` has `NODE_ENV === "development"` bypass enabled. This means all Pro features are unlocked in local dev. The `TESTING_DISABLE_PRO_GATE` flag in the legacy app does not exist in the new app.

### Gated Features (current list)
- 3D Globe toggle
- Cloud Cover overlay
- Atmospheric Overrides panel
- Best Time to Observe
- Sky Dome polar chart
- Ephemeris table
- Historical calendar engines (Astronomical, Tabular)
- Archive years beyond 1440 AH

When migrating a page that has any of these features, preserve the `<ProGate>` wrapper.

---

## 3. Database (Neon PostgreSQL)

### Driver Rule
Always use the **Neon serverless HTTP driver** — never a TCP connection pool. PostgreSQL TCP pools exhaust Neon's connection limit under Vercel's concurrent serverless invocations.

```typescript
// ✅ Correct — import from the @hilal/db package
import { db } from "@hilal/db";

// ❌ Wrong — don't create a raw connection
import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
```

### Drizzle Query Operator Imports — MANDATORY
**Always import drizzle operators (`eq`, `inArray`, `desc`, `sql`, etc.) from `@hilal/db`, never directly from `drizzle-orm`.**

`@hilal/db` re-exports all query helpers from its own `drizzle-orm` instance. If you import from the top-level `drizzle-orm`, TypeScript may resolve a different package instance, causing:
```
Type error: Argument of type 'SQL<unknown>' is not assignable to parameter of type 'SQL<unknown>'.
  Types have separate declarations of a private property 'shouldInlineParams'.
```

```typescript
// ✅ Correct — both db and operators from the same package instance
import { db, eq, inArray, desc, sql, and, or } from "@hilal/db";
import { someTable } from "@hilal/db"; // schema also from @hilal/db

// ❌ Wrong — mixing instances causes private-type mismatch at build time
import { db } from "@hilal/db";
import { eq } from "drizzle-orm"; // ← NEVER do this
```

Available operator re-exports from `@hilal/db`: `eq, ne, lt, lte, gt, gte, and, or, not, isNull, isNotNull, inArray, notInArray, like, ilike, sql, asc, desc`.

### PostGIS Point Insertion — LONGITUDE FIRST
PostGIS uses `(longitude, latitude)` order — the opposite of what most people expect:
```sql
-- ✅ Correct: ST_MakePoint(longitude, latitude)
ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)

-- ❌ Wrong: ST_MakePoint(latitude, longitude) — subtle, silent bug
ST_SetSRID(ST_MakePoint(${lat}, ${lng}), 4326)
```

### Location Privacy Jitter — MANDATORY
Before storing any observation lat/lng, jitter by ~1.1km for privacy. The legacy implementation is in `_legacy/server/appRouter.ts` → `submitObservation`. Port this logic exactly when implementing DB insertions:

```typescript
// Jitter by up to ~0.01 degrees (~1.1km) in each direction
const jitteredLat = lat + (Math.random() - 0.5) * 0.02;
const jitteredLng = lng + (Math.random() - 0.5) * 0.02;
```

### Schema Tables (from legacy, mapped to Neon)
- `users` — Clerk userId, name, email, role, observerBadge, sightingCount
- `observation_reports` — lat/lng (PostGIS point), observationTime, atmospheric data, visualSuccess, notes, imageUrl
- `push_tokens` — FCM/APNs token, userId, deviceType
- `stripe_customers` — clerkUserId ↔ stripeCustomerId mapping
- `emailSignups` — newsletter/waitlist

---

## 4. Stripe

### Live Mode is Active
Production keys are set in Vercel env vars. **Never test Stripe payments with live keys in local dev.** Use test keys only in `.env.local`.

### Checkout Route Requirements
- Requires a valid Clerk auth token in the `Authorization` header
- Exception: anonymous donations use `price_data` inline (no Price ID required)
- Plans need Price IDs from env: `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_ANNUAL`, `STRIPE_PRICE_LIFETIME`

### Stripe Lazy Initialization — MANDATORY
**Never instantiate `new Stripe(...)` at module level.** Next.js `next build` runs static analysis that executes module-level code. If `STRIPE_SECRET_KEY` is absent at build time, Stripe throws `"Neither apiKey nor config.authenticator provided"` and the build fails.

```typescript
// ✅ Correct — lazy factory function, called inside the handler
export const dynamic = "force-dynamic";

function getStripe() {
    // @ts-expect-error - known API version mismatch
    return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });
}

export async function POST(req: Request) {
    const stripe = getStripe(); // constructed only at request time
    // ...
}

// ❌ Wrong — module-level init crashes the build when env var is absent
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { ... });
```

### Webhook Route Requirements
```typescript
// apps/web/src/app/api/stripe/webhook/route.ts
export const dynamic = "force-dynamic";
export const runtime = "nodejs";  // ← REQUIRED — raw body parsing needs Node.js
```
Without this, Vercel uses the Edge runtime which doesn't support `stripe.webhooks.constructEvent(rawBody, ...)`.

### Plans
- Monthly: $2.99 (STRIPE_PRICE_MONTHLY)
- Annual: $14.99 (STRIPE_PRICE_ANNUAL)
- Lifetime: $49.99 (STRIPE_PRICE_LIFETIME)
- Donations: $5/$10/$25/$50 (use `price_data` — no env var needed)
- $10+ donation → `isPatron: true` set via webhook → Clerk `publicMetadata.isPatron`

---

## 5. CORS and Android / Capacitor

This section is only relevant for the mobile app (`apps/mobile/`), not the Next.js web app.

### Capacitor WebView Origin
The Capacitor WebView in Android/iOS sends requests with origin `https://localhost`. This is cross-origin to the Vercel-deployed API at `https://moonsighting.live`.

### Credential Fetch Pattern
```typescript
// In any fetch/XHR call inside the mobile app context:
fetch(url, {
  credentials: Capacitor.isNativePlatform() ? "omit" : "include",
})
```

Using `credentials: "include"` with `Access-Control-Allow-Origin: *` is a CORS violation — the browser/WebView rejects it and the app appears offline. Always use `"omit"` on native.

### CORS Whitelist (shared utility)
The web app's CORS whitelist in `apps/web/src/app/api/_cors.ts` includes:
- `https://moonsighting.live`
- `https://moon-dashboard-one.vercel.app`
- `https://localhost` (Capacitor WebView)
- `capacitor://localhost` (iOS Capacitor)
- `http://localhost:3000` (dev)
- `http://localhost:5173` (legacy Vite dev)

---

## 6. i18n and Package Management

### i18n — Identical API
`useTranslation()` from `react-i18next` works identically in the new app. The hook, namespace, and key structure are unchanged from legacy.

```typescript
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t("moon.title")}</h1>;
}
```

### RTL Auto-Set
Arabic (`ar`) and Urdu (`ur`) trigger RTL automatically via `Layout.tsx`. No per-component RTL logic needed.

### Translation Keys
All locale files are at `apps/web/src/locales/{en,ar,ur}/common.json`. Check existing keys before adding new ones — duplicating keys causes silent overrides.

Pages NOT yet translated (only English works): CalendarPage, ArchivePage, HorizonPage, GlobePage, MapPage, MoonPage. Wire up `useTranslation()` during migration even if you only add the English keys now — the structure must be correct for future translation PRs.

### pnpm — Never npm
```bash
# ✅ Always
npx pnpm add <package>
npx pnpm add -D <package>  # for devDependencies

# ❌ Never
npm install <package>
```

If the lockfile drifts after adding packages:
```bash
npx pnpm install --no-frozen-lockfile
```
Then commit the updated `pnpm-lock.yaml`.

### Package Placement
- Shared code used by both web and mobile → `packages/<name>/`
- Web-only code → `apps/web/src/`
- Mobile-only code → `apps/mobile/src/` (once created)
- Pure astronomy math → always `packages/astronomy/src/` (consumed via `@hilal/astronomy`)
