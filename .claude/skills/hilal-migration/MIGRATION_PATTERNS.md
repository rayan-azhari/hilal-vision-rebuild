# Hilal Vision — Migration Patterns

How to port each category of artifact from the legacy Vite/React app to the new Next.js 15 Turborepo monorepo. Read the relevant pattern before starting migration work, then check `CI_RULES.md` and `DOMAIN_KNOWLEDGE.md` for gotchas.

---

## Pattern 1: Porting a Page

**Legacy:** `_legacy/client/src/pages/FooPage.tsx` with Wouter routing (`<Route path="/foo">`)
**New target:** `apps/web/src/app/foo/page.tsx` (Next.js App Router)

### What Changes

| Legacy | New |
|--------|-----|
| `import { Route } from "wouter"` | File-system routing via `app/foo/page.tsx` |
| `useGlobalState()` context | `useAppStore()` Zustand selector |
| `useProTier()` context | `useAppStore((s) => s.clerkHasPro \|\| s.nativeHasPro \|\| s.isAdmin)` |
| `useTheme()` context | `useAppStore((s) => s.isDarkMode)` |
| `<Link href="/foo">` from `wouter` | `<Link href="/foo">` from `next/link` |
| `trpc.useContext()` | `api.useUtils()` (tRPC v11 naming) |
| `import { trpc } from "@/lib/trpc"` | `import { api } from "@/trpc/client"` (check actual import path in the new app) |
| `Helmet` / `react-helmet-async` for SEO | `export const metadata = { title: "..." }` (Next.js static metadata) or `generateMetadata()` (dynamic) |

### Step-by-Step
1. Create `apps/web/src/app/foo/page.tsx`
2. Add `"use client"` at the top if the page uses: Zustand, canvas, globe.gl, MapLibre, `useEffect`, `useRef`, `window`, or any event handlers
3. Replace context imports with `useAppStore` selectors (see table above)
4. Replace Wouter `<Link>` with `next/link` `<Link>`
5. Replace any tRPC `trpc.*` import with the new `api.*` pattern
6. If the page uses globe.gl or MapLibre, extract the heavy component into a `FooClient.tsx` with `"use client"` and wrap it with `dynamic({ssr: false})` (see CI Rule 3)
7. Add `export const metadata` for SEO if the page is SSR-safe (no `"use client"` at page level)
8. Port i18n: if legacy used `useTranslation()`, keep it — it works identically
9. Port Pro gating: if legacy had `<ProGate>` or `isPremium` checks, preserve them exactly

### Common Pitfalls
- Date hydration mismatch: `useAppStore().date` is rehydrated from localStorage on mount. Don't render date-dependent content during SSR — wrap it in `useEffect` or check `useIsMounted()`.
- Astronomical SVG paths: add `suppressHydrationWarning` to any `<svg>` computing paths from astronomy-engine (CI Rule 4)

---

## Pattern 2: Porting a Hook

**Legacy:** `_legacy/client/src/hooks/useFoo.ts`
**New target:** `apps/web/src/hooks/useFoo.ts`

### What Changes

| Legacy | New |
|--------|-----|
| `import { computeSunMoonAtSunset } from "@/lib/astronomy"` | `import { computeSunMoonAtSunset } from "@hilal/astronomy"` |
| `import { useGlobalState } from "@/contexts/GlobalStateContext"` | `import { useAppStore } from "@/store/useAppStore"` |
| `import { useProTier } from "@/contexts/ProTierContext"` | `const isPremium = useAppStore((s) => s.clerkHasPro \|\| s.nativeHasPro \|\| s.isAdmin)` |
| Accessing `window`, `localStorage` at top level | Wrap in `useEffect` or add `if (typeof window === "undefined") return` guard |

### Step-by-Step
1. Copy the hook file to `apps/web/src/hooks/useFoo.ts`
2. Find and replace all `@/lib/astronomy` → `@hilal/astronomy`
3. Find and replace all context hook calls → `useAppStore` selectors
4. Scan for any use of `window`, `document`, `localStorage`, `navigator` at hook initialization (outside `useEffect`) — guard them
5. The hook file itself does NOT need `"use client"` — that directive only goes in React component files. But hooks are only called from components, so the component must have it.
6. Export the hook and verify the types compile

### Common Pitfalls
- `useAtmosphericData` pattern: this hook reads legacy's `useGlobalState` for location + `useProTier` for premium status. Replace both with `useAppStore` selectors.
- Hooks that used Capacitor APIs (`@capacitor/geolocation`, etc.) — check if the new app needs these or if browser geolocation is sufficient for the web version

---

## Pattern 3: Porting a Web Worker

**Legacy:** `_legacy/client/src/workers/foo.worker.ts`
**New target:** `apps/web/src/workers/foo.worker.ts`

### What Changes

| Legacy | New |
|--------|-----|
| `import { computeSunMoonAtSunset } from "../../shared/astronomy"` | `import { computeSunMoonAtSunset } from "@hilal/astronomy"` |
| Worker registered via Vite: `new Worker(new URL("./workers/foo.worker.ts", import.meta.url))` | Same pattern — Next.js with Webpack supports this |
| `self.postMessage(result)` | Unchanged |
| `self.onmessage = (event) => { ... }` | Unchanged |

### Step-by-Step
1. Copy the worker file to `apps/web/src/workers/foo.worker.ts`
2. Replace all `shared/astronomy` imports with `@hilal/astronomy`
3. Verify the worker has no `window`, `document`, or DOM API usage — workers run in a separate context without DOM access
4. Verify the worker has no Node.js built-in imports (`fs`, `path`, etc.) — workers run in a browser context
5. In the calling hook, register the worker:
   ```typescript
   const workerRef = useRef<Worker | null>(null);

   useEffect(() => {
     workerRef.current = new Worker(
       new URL("../workers/foo.worker.ts", import.meta.url)
     );
     return () => workerRef.current?.terminate();
   }, []);
   ```
6. Verify TypeScript sees the worker correctly — may need `/// <reference lib="webworker" />` at the top of the worker file

### The archiveMiniMap Worker (G-03)
- Legacy file: `_legacy/client/src/workers/archiveMiniMap.worker.ts`
- Renders ICOP observation points onto a mini-globe texture using Three.js/canvas inside the worker
- Note: `OffscreenCanvas` is needed for canvas inside workers — check browser support and add `{ offscreen: true }` if needed
- Output: an `ImageBitmap` posted back to the main thread for rendering

---

## Pattern 4: Porting a tRPC Router

**Legacy:** `_legacy/server/routers/foo.ts`
**New target:** `apps/web/src/server/routers/foo.ts`

### What Changes

| Legacy | New |
|--------|-----|
| `import { router, publicProcedure, authedProcedure } from "../_core/trpc.js"` | `import { router, publicProcedure, protectedProcedure } from "../trpc"` (no extension, `authed` → `protected`) |
| `import { getDb } from "../db"` or direct MySQL pool | `import { db } from "@hilal/db"` |
| MySQL queries (`db.select().from(table)`) | Drizzle ORM with PostgreSQL — same Drizzle API, different schema types |
| MySQL geometry columns | PostGIS: `ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)` |
| `catch (error: any)` | `catch (error: unknown)` (CI Rule 5) |
| `express.Request` / `express.Response` types | Not needed — tRPC context provides auth |

### Step-by-Step
1. Copy the router file to `apps/web/src/server/routers/foo.ts`
2. Fix the `trpc` import path (remove `.js` extension, update procedure names)
3. Replace the DB import with `@hilal/db`
4. Update schema types if the Drizzle schema changed between MySQL and PostgreSQL (check `packages/db/src/schema.ts`)
5. Port any raw SQL — translate MySQL syntax to PostgreSQL (array literals, string functions, PostGIS for spatial)
6. Fix all `catch` blocks: `error: any` → `error: unknown`
7. Register the new router in `apps/web/src/server/routers/_app.ts`
8. Verify the procedure is callable from the client using the tRPC client

### Adding the Router to _app.ts
```typescript
// apps/web/src/server/routers/_app.ts
import { fooRouter } from "./foo";

export const appRouter = router({
  // ... existing routers
  foo: fooRouter,
});
```

### The `dem` Router (G-15)
- Legacy: calls Open-Meteo elevation API (`https://api.open-meteo.com/v1/elevation?latitude=...&longitude=...`)
- Port as a simple `publicProcedure` with Zod input validation for `lat`/`lng`
- Return the elevation in meters — used by `useAtmosphericData` hook to auto-fill elevation

---

## Pattern 5: Porting a Component

**Legacy:** `_legacy/client/src/components/Foo.tsx`
**New target:** `apps/web/src/components/Foo.tsx`

### What Changes

| Legacy | New |
|--------|-----|
| Context hooks for state | `useAppStore` selectors |
| Radix UI imports (`@radix-ui/react-dialog`) | Same package names — check `@hilal/ui` first for shared abstractions |
| CSS variables (`var(--gold)`, `var(--space)`) | Identical in new `globals.css` — no change needed |
| `useTranslation()` from `react-i18next` | Identical — no change needed |
| `<Link href="...">` from `wouter` | `<Link href="...">` from `next/link` |
| `next-themes` for dark mode | `useAppStore((s) => s.isDarkMode)` |
| `export default function Foo()` | Same — no change if component is pure UI |

### When to Add `"use client"`
- Uses `useAppStore()` → yes
- Uses `useState`, `useEffect`, `useRef` → yes
- Uses event handlers (`onClick`, `onChange`) → yes
- Is pure markup/display with no interactivity → no (can be a Server Component)

### Globe.gl and MapLibre Components
These need the two-step wrapper pattern (CI Rule 3):
1. `FooClient.tsx` — the actual implementation with `"use client"`
2. `Foo.tsx` — wrapper using `dynamic(() => import("./FooClient"), { ssr: false })`

### CSS Variable Reference
Key variables that work identically in legacy and new:
- `var(--gold)` — gold/amber crescent color
- `var(--gold-muted)` — muted gold variant
- `var(--zone-a)` through `var(--zone-f)` — visibility zone colors
- `var(--glass)` — glassmorphism background
- `var(--space-1)` through `var(--space-8)` — spacing scale

---

## Pattern 6: MDX Content Pages

**Legacy:** Full React page component with embedded text
**New target:** `apps/web/content/<slug>.mdx` + the dynamic `(marketing)/[slug]/page.tsx` route renders it

### Step-by-Step
1. Extract the text content from the legacy page component
2. Write it as MDX to `apps/web/content/<slug>.mdx`
   - Slug must match: `about`, `methodology`, `support`, `privacy`, `terms`
3. Add the slug to `generateStaticParams()` in `apps/web/src/app/(marketing)/[slug]/page.tsx`:
   ```typescript
   export function generateStaticParams() {
     return [
       { slug: "about" },
       { slug: "methodology" },
       // ... add new slug here
     ];
   }
   ```
4. No other code changes required — the route handler already reads MDX files from `content/`

### For About and Methodology (G-10, G-11)
- Legacy `AboutPage.tsx` (400+ lines) — extract: Mission statement, tech stack table, competitor comparison, team section, attribution list
- Legacy `MethodologyPage.tsx` — extract: Yallop q-value formula explanation, Odeh V-formula, Hijri calendar engine comparison, accuracy discussion, citations
- Both can use MDX components for the formula sections (import `<MathBlock>` or similar if available in `@hilal/ui`)

---

## Pattern 7: Adding an API Route Handler

**Legacy:** Express handler in `_legacy/api/` or tRPC router called via serverless function
**New target:** `apps/web/src/app/api/<path>/route.ts` (Next.js Route Handler)

### Step-by-Step
1. Create `apps/web/src/app/api/<path>/route.ts`
2. Choose the runtime:
   - Default (Edge runtime): lightweight, fast cold starts, no Node.js built-ins
   - Node.js runtime (required for): Stripe webhook raw body, Firebase Admin, heavy crypto, file system
   ```typescript
   export const runtime = "nodejs"; // only if needed
   ```
3. Export named functions for HTTP methods:
   ```typescript
   import { NextRequest, NextResponse } from "next/server";

   export async function POST(req: NextRequest): Promise<NextResponse> {
     // ...
     return NextResponse.json({ success: true });
   }
   ```
4. Use Zod for input validation — parse `await req.json()` through a schema
5. Check `apps/web/src/app/api/_cors.ts` for the shared CORS utility if the route needs cross-origin access
6. If adding a new cron job, configure it in `vercel.json`:
   ```json
   {
     "crons": [{ "path": "/api/cron/foo", "schedule": "0 8 * * *" }]
   }
   ```

### Stripe and Push Routes (G-07)
- Both need `export const runtime = "nodejs"`
- FCM push send route: port `_legacy/api/push/send.ts` — lazy-initialize Firebase Admin (never at module top level):
  ```typescript
  let adminApp: admin.App | null = null;
  function getAdmin() {
    if (!adminApp) {
      adminApp = admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS!)) });
    }
    return adminApp;
  }
  ```

---

## Pattern 8: Implementing DB Persistence (G-09)

**Legacy:** MySQL via Drizzle ORM
**New:** Neon PostgreSQL via Drizzle ORM (same Drizzle API, different schema types)

### The `submitObservation` Port
Legacy: `_legacy/server/appRouter.ts` → `telemetry.submitObservation`
New: `apps/web/src/server/routers/telemetry.ts`

Key things to port correctly:
1. **Location jitter** — jitter lat/lng by ~0.01 degrees before storage (privacy):
   ```typescript
   const jitteredLat = input.lat + (Math.random() - 0.5) * 0.02;
   const jitteredLng = input.lng + (Math.random() - 0.5) * 0.02;
   ```
2. **PostGIS insertion** — use `sql` template for the GEOGRAPHY column:
   ```typescript
   import { sql } from "drizzle-orm";

   await db.insert(observationReports).values({
     // ... other fields
     location: sql`ST_SetSRID(ST_MakePoint(${jitteredLng}, ${jitteredLat}), 4326)`,
   });
   ```
3. **Auth check** — use `protectedProcedure` (Clerk token required)
4. **Image URL** — store placeholder until S3/R2 pipeline is implemented (G-06)
