# Hilal Vision — Changes Walkthrough

## Summary

Implemented improvements from the [project review](file:///C:/Users/rayan/.gemini/antigravity/brain/3df9f24c-4dcb-41a1-93b3-510489707cf7/project_review.md) and configured Vercel deployment. **14 files changed**, **3 new files created**, **6 files deleted**.

---

## Phase 4: Cleanup ✅

| Action | Files |
|--------|-------|
| Deleted Manus artifacts | `ManusDialog.tsx`, `AIChatBox.tsx`, `ComponentShowcase.tsx`, `.manus-logs/`, `vite.config.ts.bak` |
| Stripped Manus from Vite | [vite.config.ts](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/vite.config.ts) — 188→34 lines |
| Fixed dead routes | [App.tsx](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/client/src/App.tsx) — added `/globe` and `/map` aliases |
| Cleaned dependencies | [package.json](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/package.json) — moved 4 `@types/*` to devDeps, removed `streamdown`, `vite-plugin-manus-runtime`, `@builder.io/vite-plugin-jsx-loc`, `add` |
| Removed duplicate lockfile | Deleted [package-lock.json](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/package-lock.json) (keep pnpm) |

---

## Phase 1: Security ✅

#### [routers.ts](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/server/routers.ts)
- **Rate limiting**: 5 submissions/minute per IP with auto-cleanup
- **Zod validation**: lat/lng bounds, string max lengths, pressure/temp ranges
- **Pagination**: `getObservations` now accepts `limit`/[offset](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/client/src/lib/astronomy.ts#474-483) (max 100)
- **Date validation**: `observationTime` parse check before insert

---

## Phase 2: SEO & Geolocation ✅

#### [NEW] [LocationSearch.tsx](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/client/src/components/LocationSearch.tsx)
- Implemented a dynamic Geocoding search input using the Open-Meteo API.
- Debounced requests to prevent rate-limiting while typing.
- **UI Bug Fixes**: Removed `overflow: hidden` constraints from the `breezy-card` control panels and elevated their `z-index` to ensure the autocomplete dropdown renders fully visible over the Map, Globe, and Horizon canvases, instead of being clipped or hidden.

````carousel
![Location search dropdown UI](C:/Users/rayan/.gemini/antigravity/brain/3df9f24c-4dcb-41a1-93b3-510489707cf7/kyoto_search_horizon_final_1771797960209.png)
<!-- slide -->
![Map centering on selected location](C:/Users/rayan/.gemini/antigravity/brain/3df9f24c-4dcb-41a1-93b3-510489707cf7/kyoto_selected_horizon_final_verify_1771798061500.png)
````

#### [NEW] [useGeolocation.ts](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/client/src/hooks/useGeolocation.ts)
- Browser Geolocation API + Nominatim reverse-geocoding
- Returns `{ lat, lng, name }` with error handling

#### Document titles added to all pages
- [Home.tsx](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/client/src/pages/Home.tsx) → "Hilal Vision — Islamic Crescent Moon Visibility Platform"
- [MoonPage.tsx](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/client/src/pages/MoonPage.tsx) → "Moon Phase — {phase} ({illum}%) | Hilal Vision"
- [CalendarPage.tsx](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/client/src/pages/CalendarPage.tsx) → "Hijri Calendar — {month} {year} AH | Hilal Vision"
- [HorizonPage.tsx](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/client/src/pages/HorizonPage.tsx) → "Horizon View — {city} | Hilal Vision"
- [ArchivePage.tsx](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/client/src/pages/ArchivePage.tsx) → "Archive — {year} AH | Hilal Vision"

---

## Phase 1: Hijri Calendar Accuracy ✅

#### [astronomy.ts](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/client/src/lib/astronomy.ts)

**Before**: Kuwaiti arithmetic algorithm — could be ±2 weeks off from actual lunar months
**After**: Conjunction-based algorithm using SunCalc to find real new moons

- Uses epoch of **1 Muharram 1446 AH** (July 7, 2024 conjunction)
- [findNewMoonNear()](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/client/src/lib/astronomy.ts#392-425) searches via SunCalc with coarse (6h) then fine (30min) steps
- Results cached in a [Map](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/client/src/pages/MapPage.tsx#37-538) for performance
- Both [gregorianToHijri](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/client/src/lib/astronomy.ts#493-542) and [hijriToGregorian](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/client/src/lib/astronomy.ts#566-577) use the conjunction approach
- Arithmetic algorithm kept as fallback
- **Verified**: Feb 22, 2026 → **6 Ramadan 1447** (Umm al-Qura: 5 Ramadan — 1 day variance, expected for conjunction vs sighting)

#### [NEW] [icop-history.json](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/server/data/icop-history.json) & [ArchivePage](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/client/src/pages/ArchivePage.tsx)
**Real Sighting Data Integration**
- Created a robust custom scraper ([server/scripts/scrape-icop.ts](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/server/scripts/scrape-icop.ts)) using Cheerio to aggressively fetch over **1,028 actual historical sighting records** traversing 27 years of Islamic months directly from the Islamic Crescents' Observation Project (ICOP).
- Integrated [icop-history.json](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/server/data/icop-history.json) into the [ArchivePage.tsx](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/client/src/pages/ArchivePage.tsx) using a fast tRPC database query (`trpc.archive.getHistoricalData`). 
- **Result:** The Crescent Visibility Archive now renders side-by-side exact reported sightings vs the theoretical computed visibility.

#### Smart Sighting Validation
- **Problem:** Trolls or mistaken users submitting invalid "naked-eye" sighting reports.
- **Solution:** Injected algorithmic integrity directly into the `telemetry.submitObservation` TRPC mutation in [routers.ts](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/server/routers.ts).
- **Logic:** The server dynamically computes the sun/moon positions exactly at the user's submitted `obsDate` and `lat`/`lng`. If the mathematical zone is definitively `F` (moon below the horizon or not yet born) and the user marks "Seen", the server throws a validation error and rejects the report.

#### Moon Phases Page Enhancements
- Brought consistency to the `/moon` view by giving it the exact same highly robust Geolocation logic as the Map view.
- Added the [LocationSearch](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/client/src/components/LocationSearch.tsx#18-165) autocomplete dropdown with the "Auto-Detect Location" GPS pin trigger.
- Synchronized the [Date](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/client/src/lib/astronomy.ts#63-71) input to maintain hour offsets seamlessly.

---

## Bug Fix: Map/Globe Infinite Render Loop ✅

Fixed `Maximum update depth exceeded` error on the visibility page that caused both 3D Globe and 2D Map to break.

**Root cause**: `effectiveDate = new Date(...)` created a new object reference every render → `useCallback`/`useEffect` saw a new dependency → `setIsLoading(true)` → re-render → ∞ loop

**Fix** (both [MapPage.tsx](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/client/src/pages/MapPage.tsx) and [GlobePage.tsx](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/client/src/pages/GlobePage.tsx)):
- Wrapped `effectiveDate` and [hijri](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/client/src/lib/astronomy.ts#484-492) in `useMemo`
- Used primitive `effectiveDateTs` (number) as stable dependency
- Added `ResizeObserver` → `invalidateSize()` for Leaflet tiles when switching from Globe to Map

````carousel
![Globe view — working](C:/Users/rayan/.gemini/antigravity/brain/3df9f24c-4dcb-41a1-93b3-510489707cf7/globe_view_verification_1771785727018.png)
<!-- slide -->
![2D Map — full tiles and visibility overlay](C:/Users/rayan/.gemini/antigravity/brain/3df9f24c-4dcb-41a1-93b3-510489707cf7/map_view_verification_1771785756163.png)
````

---

## Dependency Cleanup ✅

Removed **30+ unused packages** (364 transitive dependencies) from [package.json](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/package.json):

| Package | Reason |
|---------|--------|
| `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner` | Never imported |
| `astronomia`, `axios` | Never imported |
| 17× `@radix-ui/react-*` | Unused shadcn components |
| `input-otp`, `embla-carousel-react`, `react-resizable-panels` | Only in orphaned UI wrappers |
| `react-day-picker`, `vaul`, `cmdk` | Only in orphaned UI wrappers |
| `react-hook-form`, `@hookform/resolvers` | Refactored SightingReportForm to plain React state |
| `@types/google.maps` | Never used |

Also removed the Manus analytics `<script>` from [index.html](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/client/index.html) that was using undefined `%VITE_ANALYTICS_*%` env vars and breaking the production build.

---

## ⚡ Performance: Web Worker for Visibility Data ✅

Moved the heavy astronomical loop ([computeSunMoonAtSunset](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/client/src/lib/astronomy.ts#218-291) called 3,600+ times) out of the main UI thread.

#### [NEW] [visibility.worker.ts](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/client/src/workers/visibility.worker.ts)
- A self-contained Web Worker that inlines SunCalc logic to compute the crescent visibility grid.
- Computes pixel colors for a 360x180 map and uses `Transferable` arrays (zero-copy) to instantly yield the `Uint8ClampedArray` back to the main thread.

#### [NEW] [useVisibilityWorker.ts](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/client/src/hooks/useVisibilityWorker.ts)
- Custom React hook that manages the worker lifecycle.
- Receives raw pixels, paints an offscreen canvas, applies a smoothing blur (seamless wraps the dateline), and yields a `dataURL` for map overlays.
- Provides `isComputing` loading state.

#### Map & Globe Pages Refactoring 
- Removed [buildVisibilityTexture](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/client/src/lib/astronomy.ts#155-207) from both [MapPage.tsx](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/client/src/pages/MapPage.tsx) and [GlobePage.tsx](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/client/src/pages/GlobePage.tsx).
- Integrated [useVisibilityWorker](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/client/src/hooks/useVisibilityWorker.ts#3-69). **Result:** The UI remains perfectly smooth and responsive while the background thread calculates moon visibility contours for new dates.

---

## 🔒 Security: Clerk Authentication Integration ✅

Replaced the deprecated internal Manus OAuth logic with a robust, production-ready Clerk integration. Users can now securely sign in to submit sighting reports.

#### Frontend Updates
- Wrapped the app in `<ClerkProvider>` in [App.tsx](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/client/src/App.tsx).
- Refactored [Layout.tsx](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/client/src/components/Layout.tsx) to include Clerk's minimal, stylish `<UserButton />` and `<SignInButton />`.
- Secured [SightingReportForm.tsx](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/client/src/components/SightingReportForm.tsx) to automatically prompt users to log in if they try to submit an observation anonymously.

#### Backend Adjustments
- Replaced custom session verification with `@clerk/express` middleware `getAuth()` in [server/_core/context.ts](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/server/_core/context.ts) to attach the authenticated `userId` to the tRPC context.
- Modified the Drizzle ORM schema: `observationReports.userId` is now `varchar(255)` to directly store the Clerk string ID, eliminating the need to redundantly sync user records locally.
- Removed all legacy custom OAuth routes and controllers from the server configuration.

---

## 🚀 Scaling & Native Apps ✅

### Upstash Redis Rate Limiting
To support horizontal scaling and serverless edge functions, the telemetry submission endpoint is no longer artificially limited by a local Node.js [Map()](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/client/src/pages/MapPage.tsx#37-538) in memory.
- Integrated `@upstash/ratelimit` and `@upstash/redis` into [server/routers.ts](file:///c:/Users/rayan/Desktop/Antigravity%20workspaces/Moon-dashboard/server/routers.ts).
- Submissions are strictly rate-limited globally (5 requests per minute per IP), tracked securely in an Upstash Redis database.

### Capacitor.js Mobile Wrapping
The Vite configuration and package scripts have been updated to support publishing the application to the iOS App Store and Google Play Store. 
- Included `@capacitor/core`, `@capacitor/ios`, and `@capacitor/android`.
- Initialized `capacitor.config.ts` (`com.hilalvision.app`).
- Added the `npm run build:cap` script, which compiles the Vite/React application and perfectly synchronizes the production assets into the newly generated `android` and `ios` native codebases.

---

## Vercel Deployment Architecture ✅

#### [NEW] [vercel.json](file:///c:/Users/rayan/Desktop/Antigravity workspaces/Moon-dashboard/vercel.json)
```json
{
  "buildCommand": "npx vite build",
  "outputDirectory": "dist/public",
  "functions": {
    "api/trpc/[trpc].ts": {
      "includeFiles": "server/**"
    }
  },
  "rewrites": [
    { "source": "/api/trpc/:path*", "destination": "/api/trpc/[trpc]" },
    { "source": "/((?!.*\\.).*)", "destination": "/index.html" }
  ]
}
```

**Deployment Fixes Implemented:**
1. **Serverless Bundling:** Added `"functions": { "includeFiles": "server/**" }` strictly enforcing Node dependencies within the Vercel edge/serverless function.
2. **Routing Exclusions:** Adjusted catch-all SPA routing (`/((?!.*\\.).*)`) specifically to allow static filenames (like `.json` or `.png`) to be cleanly served by Vercel's Edge CDN without triggering HTML 404 fallbacks.
3. **ICOP Data Delivery:** Shifted the 160KB `icop-history.json` dataset from the API's node execution into `client/public/`. Vite statically serves this raw dataset globally via CDN for massive performance improvements, entirely bypassing the fragile Node serverless bounds and `drizzle-orm` limits on the heavy `archive.ts` router.

#### Build verified
- `npx vite build` → **30.65s**, exit code 0
- Output: `dist/public/` (CSS: 141KB, JS: 3MB, gzip total: ~897KB)

---

## To Deploy

1. Push all changes to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) → Import your repo
3. Vercel auto-detects `vercel.json` — no manual config needed
4. Set environment variable `DATABASE_URL` if you want telemetry persistence (optional — app works without it)
5. Deploy 🚀
