# Hilal Vision — Visibility Map Technical Reference

> **Audience:** New developers picking up this codebase for the first time.  
> **Purpose:** Exhaustive reference for the visibility map pipeline, known bugs, and how to diagnose/fix them.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Overview](#2-architecture-overview)
3. [Visibility Calculation Pipeline](#3-visibility-calculation-pipeline)
4. [Key Files Reference](#4-key-files-reference)
5. [Common Bugs and Fixes](#5-common-bugs-and-fixes)
6. [Dev Server Troubleshooting](#6-dev-server-troubleshooting)
7. [Testing](#7-testing)
8. [Deployment](#8-deployment)

---

## 1. Project Overview

**Hilal Vision** is a React + Node.js web application that predicts Islamic crescent moon (*hilal*) visibility worldwide using established astronomical criteria (Yallop 1997 and Odeh 2004). Users see a 2D world map and 3D globe overlaid with a colour-coded visibility heat-map.

### Colour Zones

| Zone | Colour | Meaning |
|------|--------|---------|
| A | Green | Easily visible with naked eye |
| B | Yellow | Visible under perfect conditions |
| C | Orange | May need optical aid |
| D | Red | Needs optical aid, crescent very thin |
| E | Grey | Not visible even with telescope |
| F | Dark navy | Moon below horizon at sunset |

---

## 2. Architecture Overview

```
client/src/
├── pages/
│   ├── VisibilityPage.tsx   ← Tab container: switches Globe ↔ Map
│   ├── GlobePage.tsx        ← 3D globe using globe.gl / Three.js
│   └── MapPage.tsx          ← 2D map using Leaflet + D3 contours
├── workers/
│   └── visibility.worker.ts ← Web Worker: computes visibility grid off-thread
├── hooks/
│   └── useVisibilityWorker.ts ← React hook that manages worker lifecycle
├── components/
│   └── Layout.tsx           ← App shell: navbar, footer, <main>
shared/
└── astronomy.ts             ← All astronomical calculations (shared server/client)
server/
└── ...                      ← Express + tRPC API server
```

### Core Design: Mosaic of Local Sunsets

> ⚠️ **Critical concept for new developers:** The visibility map is **not** a simultaneous global snapshot. It is a **mosaic of individual sunset moments**. Each point on the map shows the moon's visibility at **that location's own local sunset time** on the selected date.
>
> Because sunset sweeps from East to West over 24 hours, the map stitches together thousands of these individual local observations. If the map shows a wide green arc covering Australia, the Middle East, and Africa, it means: at the moment the sun set in Sydney, the crescent was easily visible. Hours later when the sun set in Riyadh, it was still visible. And still later in Lagos, it remained visible. **A mostly-green world on a given date simply means the crescent is easily visible at local sunset everywhere that day** — which is expected around day 10–15 of the lunar cycle.

### Data Flow

```
User selects date/location
        ↓
GlobalStateContext stores { date, location, visibilityCriterion }
        ↓
useVisibilityWorker hook posts message to Web Worker
        ↓
visibility.worker.ts loops over lat/lng grid:
  - for each (lat, lng): compute local noon → find local sunset via SearchRiseSet
  - this ensures each cell uses *its own* local sunset time, not a shared UTC instant
  - compute sun/moon positions at that local sunset
  - compute Yallop q or Odeh v value
  - classify into zone A–F
  - write RGBA pixel + q-value to output buffers
        ↓
Worker posts back { pixels, qValues, width, height }
        ↓
Hook draws pixels onto offscreen canvas with blur(12px) smoothing
        ↓
GlobePage: drapes canvas as texture on Three.js globe sphere
MapPage:   uses D3 contours to convert qValues grid into smooth
           SVG zone shapes → Leaflet imageOverlay
```

---

## 3. Visibility Calculation Pipeline

### 3.1 The Astronomy Engine Migration

In commit **43cdb38**, the codebase used **SunCalc** for all astronomical calculations. After that commit, it was migrated to **astronomy-engine** for higher precision. Both the worker (`visibility.worker.ts`) and the shared module (`shared/astronomy.ts`) were updated. Understanding the differences is critical for debugging.

| Aspect | SunCalc (old) | astronomy-engine (current) |
|--------|--------------|---------------------------|
| Sunset time | `SunCalc.getTimes(date, lat, lng).sunset` | `Astronomy.SearchRiseSet(Body.Sun, obs, -1, startOfDay, 1)` |
| Sun position | `SunCalc.getPosition(time, lat, lng)` → altitude in radians | `Astronomy.Equator()` → `Astronomy.Horizon()` → altitude in degrees |
| Moon position | `SunCalc.getMoonPosition(time, lat, lng)` | Same pattern as sun |
| Elongation | Computed from azimuth/altitude separation formula | `Astronomy.AngleFromSun(Body.Moon, time)` — geocentric |
| Moon distance | `moonPos.distance` — already in **km** | `moonIllum.geo_dist` — in **AU**, must convert: `× 149597870.7` |
| Refraction | Simplified flat formula | More accurate but standard refraction already applied by `Horizon("normal")` |

### 3.2 The startOfDay Calculation

In the Web Worker, each grid point needs to find "local sunset for the user's chosen date". The trick is that the worker runs in UTC, so it must compute what UTC time corresponds to "noon on the chosen day at longitude X":

```typescript
// Worker: visibility.worker.ts, inside the grid loop
const utcNoon = Date.UTC(
    date.getUTCFullYear(),  // ← MUST use UTC getters!
    date.getUTCMonth(),
    date.getUTCDate(),
    12, 0, 0
);
// Shift noon to local longitude (converts UTC noon → local noon)
const startOfDay = new Date(utcNoon - (lng / 15) * 3600 * 1000);
```

`Astronomy.SearchRiseSet` then searches **forward 1 day** from `startOfDay` for the next sunset, which will always be the correct local evening.

> ⚠️ **Critical Gotcha — Timezone Bug (Fixed in this codebase):**  
> Using `date.getFullYear()` instead of `date.getUTCFullYear()` is a classic JavaScript bug. `.getFullYear()` returns the **local browser timezone** value, but `Date.UTC()` treats its arguments as UTC values. In any timezone with a UTC offset, this causes `startOfDay` to be shifted to the wrong calendar day. One shifted day in moon phase terms is enormous — it changes the entire character of the visibility map (e.g., showing all-green when the moon was actually barely visible the day before).

### 3.3 Yallop and Odeh Criteria

Both are empirical curve-fitting formulas relating the Arc of Vision (ARCV) and Crescent Width (W):

**Yallop q-value** (`shared/astronomy.ts: yallopQ`):
```
q = (ARCV - (11.8371 - 6.3226·W + 0.7319·W² - 0.1018·W³)) / 10
```
- q ≥ 0.216 → Zone A (easily visible)
- q ≥ -0.014 → Zone B
- q ≥ -0.160 → Zone C
- q ≥ -0.232 → Zone D
- q ≥ -0.999 → Zone E (not visible)
- Moon below horizon → Zone F (override, regardless of q)

**Odeh V-value** (`shared/astronomy.ts: odehV`):
```
V = ARCV - (-0.1018·W³ + 0.7319·W² - 6.3226·W + 7.1651)
```
- V ≥ 5.65 → Zone A
- V ≥ 2.00 → Zone B
- V ≥ -0.96 → Zone C
- V ≥ -0.999 → Zone D
- else → Zone E
- Moon below horizon → Zone F

**Crescent Width W** (`shared/astronomy.ts: crescentWidth`):
```
SD = arcsin(1737.4 / moonDistKm) × 60   [arcminutes]
W  = SD × (1 - cos(elongation))          [arcminutes]
```
Where 1737.4 km is the Moon's radius and `moonDistKm` is Earth-Moon distance in km.

### 3.4 The qValues Grid and Contour Rendering (MapPage)

The Worker outputs both a pixel array (RGBA for GlobePage) and a `Float32Array` of q/v-values (`qValues`) that MapPage uses for smooth D3 contour rendering:

```typescript
// MapPage.tsx — convert qValues grid to SVG contours
const contourGen = d3.contours()
    .size([width, height])
    .thresholds(thresholds);  // zone boundaries

const contours = contourGen(Array.from(qValues));
// Each contour is a GeoJSON-like MultiPolygon
// → rendered as SVG path → wrapped in data: URI → Leaflet imageOverlay
```

This produces smooth zone boundaries rather than blocky pixels — the D3 contour algorithm interpolates between grid points.

---

## 4. Key Files Reference

### `shared/astronomy.ts`
The single source of truth for all astronomical computations. Used by both the server (tRPC routes) and client. Key exports:
- `computeSunMoonAtSunset(date, loc)` — full calculation for one location; used by detail panels and click handlers
- `crescentWidth(elongationDeg, moonDistKm)` — Yallop crescent width formula
- `yallopQ(arcv, w)` / `odehV(arcv, w)` — criterion formulas
- `classifyYallop(q, moonAlt)` / `classifyOdeh(v, moonAlt)` — A–F zone classification
- `generateVisibilityGrid(date, resolution, criterion)` — server-side grid for API/exports
- `ZONE_RGB`, `HIGH_CONTRAST_ZONE_RGB` — pixel colour tables used by the worker

### `client/src/workers/visibility.worker.ts`
Web Worker that runs the visibility grid computation off the main thread. It loops over a latitude/longitude grid, calls `computeVisibilityAtPoint()` for each cell, and posts back a pixel buffer and qValues buffer.

Key implementation notes:
- Uses `Date.UTC(...getUTCFullYear()...)` to find local noon — **must use UTC getters**
- The `isDaylight()` helper uses the raw `date` (user's timestamp) which is fine — it just determines alpha transparency for day/night visual, not the actual visibility zone
- Resolution is configurable: 4° (default) = 90×45 grid, 8° = 45×22, 2° = 180×90

### `client/src/hooks/useVisibilityWorker.ts`
Manages the Web Worker lifecycle in React. Key behaviour:
- Worker is created once (persists across renders)
- Terminated on component unmount
- When worker finishes, it draws pixels to a 1024×512 canvas with a `blur(12px)` filter for smooth transitions, then calls `canvas.toDataURL()` for GlobePage's texture
- Also stores the raw `qValues` Float32Array for MapPage's D3 contour rendering

### `client/src/pages/VisibilityPage.tsx`
Tab container that switches between GlobePage and MapPage. Critical CSS constraints:
```tsx
// Root: fixed height = viewport minus Layout's nav padding (pt-28 = 7rem)
// overflow-hidden: clips children so they can't overflow the declared height
className="relative flex flex-col pt-12 lg:pt-0 h-[calc(100vh-7rem)] overflow-hidden"

// Inner flex child: min-h-0 is the flexbox fix that allows shrinking
// Without it, a flex child defaults to min-height: auto which can be > parent
className="flex-1 min-h-0 w-full relative"
```

### `client/src/components/Layout.tsx`
The global app shell. The `<main>` element has `pt-28` (7rem = 112px) to push all page content below the floating navbar. This is why all full-height pages must subtract 7rem: `h-[calc(100vh-7rem)]`.

---

## 5. Common Bugs and Fixes

### Bug 1: Wrong Visibility Zones (Timezone Date Shift)
**Important context first:** A mostly-green map is NOT inherently a bug. Because the map is a mosaic of local sunsets (see §2), wide green coverage simply means the moon is easily visible at local sunset across most longitudes for that date — which is normal around day 10–15 of the lunar cycle.

**Actual Symptom:** Zones appear shifted by one full lunar day — e.g., selecting the day *after* new moon (when only 1–2 locations should show Zone A) but seeing broad Zone A coverage that only makes sense for day 2–3. The pattern is plausible but consistently displaced. It manifests most reliably for users in UTC+ timezones browsing the app late at night (when their local date is ahead of UTC date).

**Root Cause:** Timezone bug in the Web Worker. Using `date.getFullYear()` (local timezone) inside `Date.UTC()` (expects UTC) shifts the computation to the wrong calendar day. Only triggers when browser's local date differs from UTC date (i.e., user is in UTC+ timezone and it is past midnight UTC but not yet local midnight).

**Location:** `client/src/workers/visibility.worker.ts`, inside the inner `for` loop

**Fix:**
```typescript
// ❌ WRONG — uses local timezone, shifts calendar day in non-UTC browsers
const utcNoon = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);

// ✅ CORRECT — always uses the UTC calendar day matching the user's selected date
const utcNoon = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12, 0, 0);
```

**How to reproduce the bug:** In a UTC+5 browser, at 11pm local (= 6pm UTC), select a date and screenshot the map. Then change your system timezone to UTC and compare — the UTCgetter version should show identical maps; the local-getter buggy version will show different zones.

---

### Bug 2: Dead Space / Excessive Scrolling on Visibility Page
**Symptom:** The 2D map or 3D globe is not visible without scrolling. There is a large blank area above the map.

**Root Cause:** The height constraint chain in the flex hierarchy was broken in two ways:
1. `VisibilityPage` used `h-[calc(100vh-4rem)]` which didn't match `Layout`'s `pt-28` (7rem) — the declared height was taller than the actual available space
2. No `overflow-hidden` — without it, children with `min-h` constraints overflow the container and push the document height to 2000+px
3. No `min-h-0` on the inner flex child — flexbox children default to `min-height: auto`, preventing shrinking below content size

**Fix:** Three changes in `VisibilityPage.tsx`:
```tsx
// 1. Fix the height calc to match pt-28, add overflow-hidden to clip children
<div className="relative flex flex-col pt-12 lg:pt-0 h-[calc(100vh-7rem)] overflow-hidden">

// 2. Add min-h-0 to the inner flex container (critical flexbox fix)
<div className="flex-1 min-h-0 w-full relative">

// 3. Switch view wrappers to flex display to propagate height correctly
<div style={{ display: view === "map" ? "flex" : "none", height: "100%", flexDirection: "column" }}>
```

**General Rule:** In any full-height flex layout, every flex child in the chain from the viewport root down to the scrollable content must have either `min-h-0` (for flex containers) or an explicit pixel/vh height. Missing a single `min-h-0` anywhere in the chain breaks height containment.

---

### Bug 3: Leaflet Map Tiles Not Loading On Tab Switch
**Symptom:** Switching from Globe to Map view shows an empty grey/tiled map with no basemap tiles rendered.

**Root Cause:** Leaflet calculates tile bounds based on the container's dimensions. When the map is inside a `display:none` element (the inactive tab), the container has zero dimensions, so Leaflet can't load tiles.

**Fix (already in place):** `MapPage.tsx` uses a `ResizeObserver` on the map container. When the container becomes visible and gets non-zero dimensions (on tab switch), the observer fires `map.invalidateSize()` which tells Leaflet to recalculate and load the correct tiles.

---

### Bug 4: Moon Distance Unit Mismatch
**Symptom:** Crescent width (`W`) values are wildly wrong (either near 0 or enormous), causing all zones to show incorrectly.

**Root Cause:** `astronomy-engine`'s `Illumination()` returns `geo_dist` in **Astronomical Units (AU)**, not km. The `crescentWidth()` function expects km. Missing or incorrect conversion.

**Fix:**
```typescript
// moonIllum.geo_dist is in AU — convert to km before passing to crescentWidth
const moonDistKm = moonIllum.geo_dist * 149597870.7;  // 1 AU in km
const crescent = crescentWidth(elongation, moonDistKm);
```

**Validation:** Earth-Moon distance is typically 356,000–406,000 km. `geo_dist` ~= 0.00239–0.00272 AU. Multiplied by 149597870.7 gives the correct km range.

---

### Bug 5: Globe Initialises at 0×0 (Blank Globe)
**Symptom:** The 3D Globe tab shows nothing, or appears as a tiny pinpoint.

**Root Cause:** `GlobePage` initialises the `globe.gl` instance on mount. If mounted while inside a `display:none` parent (tab not active), `clientWidth`/`clientHeight` are 0, creating a broken WebGL viewport.

**Fix (already in place):** `GlobePage.tsx` uses a `ResizeObserver` on its container. When `clientWidth === 0 || clientHeight === 0`, it skips initialisation. The `ResizeObserver` callback retries when the container becomes visible and has real dimensions.

---

### Known Limitation: Yallop/Odeh at Full Moon Shows Green (Zone A)
**Symptom:** On days far from new moon (e.g., day 10–15 of the lunar cycle), parts of the map show Zone A (green). This looks like "the crescent is easily visible" but the moon is actually gibbous or full — there is no crescent to sight.

**Root Cause:** The Yallop and Odeh formulas were designed **only for the thin new crescent** (elongation < ~20°, W < ~3 arcmin). At full moon (elongation ~180°), the formula computes an enormous crescent width W (~31 arcmin), producing a q-value of ~250 — massively Zone A. The formula doesn't know it's evaluating a non-crescent phase.

**Not a regression:** This behavior has existed since the original SunCalc implementation. It's a fundamental limitation of applying Yallop/Odeh outside their intended domain.

**Potential Fix (not yet implemented):**
```typescript
// Guard: skip Yallop/Odeh if elongation > 25° (moon is not a new crescent)
if (elongation > 25) {
    return { zone: "F", value: -99 }; // "Not applicable — not a crescent phase"
}
```
This would make the map only show meaningful visibility zones on the 1–3 days after each new moon, which is the only time crescent sighting is astronomically relevant. The rest of the month would show Zone F everywhere.

---

## 6. Dev Server Troubleshooting

### The Dev Server Hangs Silently on Windows
**Symptom:** Running `pnpm dev` prints `cross-env NODE_ENV=development tsx watch server/_core/index.ts` and then nothing. Port appears unresponsive.

**Root Cause:** `tsx watch` on Windows can swallow error logs silently. Common causes: DB connection pool hanging (bad `DATABASE_URL` format), or Vite middleware throwing an unhandled rejection.

**Fix — Run Without Watch Mode:**
```powershell
npx cross-env NODE_ENV=development npx tsx server/_core/index.ts
```
This prints errors directly instead of swallowing them.

**Check .env:** Ensure these are set:
- `DATABASE_URL` — must be a valid MySQL connection string
- `UPSTASH_REDIS_REST_URL` — Upstash Redis URL
- `CLERK_SECRET_KEY` — Clerk auth backend key

**Check DB timeout:** `server/db.ts` must have `connectTimeout: 5000` on the MySQL pool so it fails fast instead of hanging 60+ seconds.

### Port Already in Use
The server will auto-increment the port if 3000/3001 are busy. Check the startup log: `Port 3000 is busy, using port 3002 instead`.

### `FUNCTION_INVOCATION_FAILED` in Console
**Context:** This error appears on the deployed production site (Vercel). It occurs when a serverless function (tRPC handler) times out.

**Common Causes:**
1. DB connection pool exhausted — ensure `connectionLimit: 3` in `server/db.ts`
2. External API calls (Open-Meteo weather) timing out — they should be wrapped in `AbortSignal.timeout(2000)`
3. React Query's `refetchOnWindowFocus: true` causing duplicate requests — disabled for heavy queries

**These errors in the browser console when running locally** are from the service worker pointing at the production Vercel deployment. They are harmless during local development.

---

## 7. Testing

Run the full test suite:
```powershell
cd "c:\Users\rayan\Desktop\Antigravity workspaces\Moon-dashboard"
npx pnpm test
```

144 tests across 9 test files. All should pass. Key test files:

| File | Covers |
|------|--------|
| `server/visibility.test.ts` | `computeSunMoonAtSunset`, `crescentWidth`, `yallopQ`, `classifyYallop`, visibility grid generation |
| `server/astronomy.test.ts` | Moon phase, new moon finder, Hijri calendar |
| `server/calendar.test.ts` | Gregorian↔Hijri conversion |
| `e2e/visibility.spec.ts` | Browser E2E tests (Playwright) |

**When to run tests:** Always run after modifying `shared/astronomy.ts` or `visibility.worker.ts`. The worker runs in a browser context so it can't be unit-tested directly, but `shared/astronomy.ts`'s exported functions (which the worker imports) are fully tested.

---

## 8. Deployment

This project deploys to **Vercel**. Before pushing:

1. Ensure `pnpm-lock.yaml` is updated (never install with `npm`, only `pnpm`)
2. Fix any TypeScript errors (`npx tsc --noEmit`)
3. Run tests (`npx pnpm test`)
4. Check `docs/DEPLOYMENT_CHECKLIST.md` for the full pre-push checklist

The `/deploy` workflow in `.agents/workflows/deploy.md` automates the deployment checklist.
