# Implementation Plan Audit Report
**Date:** 2026-03-05 | **Commit:** `a7cd074`

This is a line-by-line review of the 5-phase plan against the current codebase.

---

## Phase 1: Foundation ✅ Mostly Done

| # | Task | Status |
|---|------|--------|
| 1 | Port Deep Space CSS palette (gold, zone colors, glass, breezy) | ✅ Done — [globals.css](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/apps/web/src/app/globals.css) uses OKLCH tokens |
| 2 | Header + Footer in [layout.tsx](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/apps/web/src/app/layout.tsx) (all pages) | ✅ Done |
| 3 | LanguageSwitcher in Header | ✅ Done — [I18nProvider](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/apps/web/src/components/I18nProvider.tsx#5-8) with AR/UR |
| 4 | Fix light theme (replace hardcoded `bg-white/5`) | ⚠️ Partial — dark mode is well-implemented; light mode needs review across all pages |

---

## Phase 2: Visibility Map Core ✅ Mostly Done

| # | Task | Status |
|---|------|--------|
| 5 | Port [visibility.worker.ts](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/apps/web/src/workers/visibility.worker.ts) | ✅ Done — full Web Worker with Mercator projection |
| 6 | Port [useVisibilityWorker](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/_legacy/client/src/hooks/useVisibilityWorker.ts#9-82) hook | ✅ Done — d3 contours → GeoJSON |
| 7 | Rewrite [VisibilityMap.tsx](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/apps/web/src/components/VisibilityMap.tsx) with Leaflet | ⚠️ **Gap** — uses MapLibre GL (`@vis.gl/react-maplibre`), not Leaflet. Contour overlay is GeoJSON fill layers, which works. However, overlays are not visible if the worker hasn't returned data yet (delay on first load). |
| 8 | Port [useCloudOverlay](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/apps/web/src/hooks/useCloudOverlay.ts#106-171) hook | ✅ Done |
| 9 | Wire date sync from Zustand | ✅ Done — reads `useAppStore.date` |
| 10 | Port [BestTimeCard](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/_legacy/client/src/components/BestTimeCard.tsx#17-224) in sidebar | ✅ Done |

---

## Phase 3: Auth & Payments ✅ Done (with caveats)

| # | Task | Status |
|---|------|--------|
| 11 | Install `@clerk/nextjs`, wrap in `ClerkProvider` | ✅ Done |
| 12 | Sign In / User Button in Header | ⚠️ Partial — Clerk `SignInButton` exists but conditional rendering based on auth state needs verification |
| 13 | [ProTierContext](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/_legacy/client/src/contexts/ProTierContext.tsx#7-28) (Zustand-based) from `publicMetadata.isPro` | ✅ Done — `useAppStore` has `clerkHasPro`, `isAdmin`, `isPatron` |
| 14 | `/api/stripe/checkout` route | ✅ Done |
| 15 | `/api/stripe/webhook` route | ✅ Done |
| 16 | [UpgradeModal](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/_legacy/client/src/components/UpgradeModal.tsx#35-211) + [ProGate](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/apps/web/src/components/ProGate.tsx#12-72) components | ✅ Done — dev bypass now enabled (`NODE_ENV === "development"`) |
| 17 | Pro gating wired to features | ✅ Done — SkyDome, cloud overlay, ephemeris all gated |
| — | RevenueCat (native payments) | ❌ **Missing** — no `@revenuecat/purchases-react-native` integration |

---

## Phase 4: Crowdsourcing & Sightings ✅ Done (with caveats)

| # | Task | Status |
|---|------|--------|
| 18 | Port [SightingReportForm](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/_legacy/client/src/components/SightingReportForm.tsx#15-276) (EXIF, GPS, tRPC mutation) | ✅ Done — [ObservationForm.tsx](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/apps/web/src/components/ObservationForm.tsx) + [SightingModal.tsx](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/apps/web/src/components/SightingModal.tsx) |
| 19 | Port [SightingFeed](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/_legacy/client/src/components/SightingFeed.tsx#16-317) (live feed, CSV export, push subscribe) | ❌ **Missing** — no public sighting feed component |
| 20 | Render observation pins on map | ❌ **Missing** — no `telemetry.getObservations` + no map pins |

---

## Phase 5: Content & Polish ⚠️ Partially Done

| # | Task | Status |
|---|------|--------|
| 21 | Create About & Methodology pages | ❌ **Missing** — [(marketing)](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/_legacy/client/src/pages/HorizonPage.tsx#85-90) group only has a layout, no `about/page.tsx` or `methodology/page.tsx` |
| 22 | Explanatory text (legend, zone descriptions, physics) | ✅ Done — `PhysicsExplanations`, legend on visibility page |
| 23 | Update Home page (feature cards, mission statement) | ✅ Done — rich Home page with FEATURE_DEFS cards |
| 24 | Delete /weather route | ✅ Done — route is gone |
| 25 | 3D Globe placeholder | ✅ Done — replaced with CSS crescent (globe.gl crashed SSR) |

---

## APIs & Backend Gaps ❌

| Feature | Status |
|---------|--------|
| `telemetry.getObservations` (public feed) | ❌ Missing |
| DB insertions in `/api/sightings` | ⚠️ Stubbed — queued but not stored |
| ICOP Archive static JSON (`/public/icop-history.json`) | ❌ Missing — archive page [fetch](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/apps/web/src/server/routers/weather.ts#33-71)es it but the file doesn't exist |
| Push Notifications (`notificationsRouter`) | ❌ Missing |
| Email signup endpoint | ❌ Missing |

---

## Summary: What Needs Doing Next

### High Priority (blocks production)
1. **`/about` and `/methodology` pages** — layouts exist, pages don't. Can be simple MDX.
2. **`/public/icop-history.json`** — the Archive page tries to fetch this but the file doesn't exist.
3. **DB insertions in `/api/sightings`** — currently mocked; need Neon queries via Drizzle.
4. **Sighting feed component** — SightingFeed.tsx doesn't exist yet.
5. **RevenueCat native payments** — needed for the mobile app Pro tier.
6. **Moon Color Consistency** — Golden bright color (`var(--gold)`) must be used wherever a moon or crescent is displayed (e.g. `MoonGlobe` crescent placeholder).
7. **Main Page Moon Phase** — The moon on the main page must reflect the current moon phase (similar to the one on the Moon page).
8. **Map Auto-Location** — The 2d map on the visibility page should automatically default to the detected location if enabled.

### Medium Priority
6. Observation map pins on VisibilityMap
7. Light mode review across all pages
8. Clerk Sign In button conditional state check
9. Push notifications router

---

## 🛡️ Permanent CI Rules (to prevent recurrence)

### Rule 1: Every package with `"lint": "eslint ."` MUST have [eslint.config.mjs](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/packages/ui/eslint.config.mjs)

**Root cause:** All 4 workspace packages (`@hilal/db`, `@hilal/astronomy`, `@hilal/types`, `@hilal/ui`) had ESLint `lint` scripts but no config file. ESLint 9+ requires a flat config ([eslint.config.mjs](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/packages/ui/eslint.config.mjs)). Without it, CI fails with `ELIFECYCLE`.

**Fix pattern:** When adding a `lint` script to any package, always create:

```js
// eslint.config.mjs
import js from "@eslint/js";
export default [js.configs.recommended, { rules: { "no-unused-vars": "warn" } }];
```

And add to `devDependencies`:
```json
"@eslint/js": "^9.0.0",
"eslint": "^9.0.0"
```

**Packages fixed (commit `a7cd074` + follow-up):** `@hilal/ui`, `@hilal/db`, `@hilal/astronomy`, `@hilal/types`

---

### Rule 2: [turbo.json](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/turbo.json) must define all tasks run in CI

**Root cause:** CI runs `pnpm turbo run lint typecheck` but `typecheck` was missing from `turbo.json tasks`.

**Fix:** Any task in `pnpm turbo run <task>` must exist in [turbo.json](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/turbo.json):
```json
"typecheck": { "dependsOn": ["^typecheck"] }
```

---

### Rule 3: SSR-incompatible components must use `"use client"` + `dynamic(..., { ssr: false })`

**Root cause:** [MoonGlobe](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/apps/web/src/components/MoonGlobe.tsx#7-68) (using `globe.gl`) and [VisibilityMap](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/apps/web/src/components/VisibilityMap.tsx#79-205) (MapLibre) crash on SSR because they access `window`/`document` at import time.

**Fix pattern:**
- Add `"use client"` to any component using Zustand, browser APIs, or canvas
- Wrap heavy WebGL components with `next/dynamic(() => import(...), { ssr: false })` inside a Client Component wrapper

---

### Rule 4: Floating-point SVG paths cause hydration mismatches

**Root cause:** `astronomy-engine` computes slightly different float values between the Node.js SSR pass and the browser, causing React hydration warnings on SVG `d` attributes.

**Fix:** Add `suppressHydrationWarning` to any SVG element whose paths are computed from astronomical calculations:
```tsx
<svg ... suppressHydrationWarning>
```

- ✅ Visibility worker + d3 contours
- ✅ Cloud overlay hook
- ✅ BestTimeCard
- ✅ Clerk auth
- ✅ Stripe checkout + webhook
- ✅ ProGate + UpgradeModal
- ✅ SightingModal + ObservationForm
- ✅ Horizon page (full canvas rendering — 413 lines)
- ✅ Archive page (Hijri calendar selector — 354 lines)
- ✅ Documentation ([ARCHITECTURE.md](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/docs/ARCHITECTURE.md), [SERVICES_AND_DEPLOYMENT.md](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/docs/SERVICES_AND_DEPLOYMENT.md))

---

### Rule 5: No explicit `any` types

**Root cause:** `Unexpected any` build errors in `archive/page.tsx`, `api/stripe/webhook/route.ts`, and `api/stripe/checkout/route.ts` were breaking TypeScript checks in CI.

**Fix pattern:**
- Never use `any`. Use `unknown` for caught errors (`catch (error: unknown)`).
- Provide strong typing for external data payloads (e.g., creating `IcopObservation` interfaces for JSON fetches).
- If an external library has incorrect/outdated typings that block compilation but runtime behavior is correct, use `// @ts-expect-error` with a descriptive comment instead of casting to `any`.
