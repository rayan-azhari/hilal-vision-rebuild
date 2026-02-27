# Hilal Vision — Project TODO

## Design System & Layout
- [x] Global CSS variables, dark theme, fonts (Inter + Cinzel + Noto Naskh Arabic)
- [x] Navigation header with logo and page links (desktop + mobile)
- [x] Page routing structure in App.tsx
- [x] Footer with credits

## Core Astronomy Engine
- [x] Sun position calculations (altitude, azimuth, sunset time)
- [x] Moon position calculations (altitude, azimuth, elongation, age)
- [x] Yallop/Odeh crescent visibility criterion (q-value)
- [x] Hijri calendar conversion utilities (Gregorian ↔ Hijri, conjunction-based)
- [x] Day/night terminator geometry
- [x] Major cities database (50+ cities worldwide)

## Interactive 3D Globe (GlobePage)
- [x] globe.gl globe with Earth texture
- [x] Real-time day/night terminator overlay
- [x] Moon visibility color-coded hex regions overlay
- [x] Rotation and zoom interaction (auto-rotate toggle)
- [x] Location pin on selected city
- [x] Date/time controls linked to globe
- [x] Side panel with full astronomical data readout

## Flat World Map (MapPage)
- [x] Leaflet map with dark tiles (CartoDB)
- [x] Crescent visibility heatmap overlay (rectangle grid)
- [x] Time slider (±24h from selected date)
- [x] Resolution control (2°/4°/6°)
- [x] Color legend (Zone A–E)
- [x] Click-to-inspect grid point

## Moon Phase Dashboard (MoonPage)
- [x] Current lunar phase illustration (SVG crescent/gibbous)
- [x] Phase name, age, illumination %
- [x] Moonrise/moonset/sunrise/sunset times
- [x] Next new moon countdown (live timer)
- [x] Next full moon date
- [x] Moon phase calendar strip (30-day)

## Hijri Calendar (CalendarPage)
- [x] Current Hijri date display
- [x] Gregorian ↔ Hijri conversion
- [x] Islamic month names (Arabic + English)
- [x] Upcoming Islamic events (Ramadan, Eid, Ashura, etc.)
- [x] Year navigation (1438–1465 AH)
- [x] Day selection with moon phase indicator

## Local Horizon View (HorizonPage)
- [x] Canvas-based dusk horizon panorama
- [x] Moon position arc relative to sunset
- [x] ARCV line between sun and moon
- [x] Altitude/azimuth readout
- [x] Location selector (city dropdown + coordinates)
- [x] Custom coordinate input
- [x] City search filter

## Crescent Visibility Archive (ArchivePage)
- [x] Year/month grid for 1438–1465 AH
- [x] City-by-city visibility results per month
- [x] Filter by year and month
- [x] Visibility criteria legend

## Polish & QA
- [x] Responsive layout (mobile/tablet/desktop)
- [x] Leaflet CSS dark theme overrides
- [x] Star field background
- [x] Float/glow animations
- [x] Vitest unit tests (21 tests, all passing)
- [x] TypeScript: 0 errors
- [x] Final checkpoint

## Bug Fixes
- [x] Fix globe.gl colorAlpha crash — hex callbacks return CSS color-mix/oklch strings that globe.gl can't parse; must return standard hex/rgba
- [x] Fix duplicate React keys — MAJOR_CITIES has duplicate entries (e.g. Kuala Lumpur) causing non-unique keys

## Improvements (Round 2)
- [x] 3D Globe: replace slow hex-bin point cloud with fast canvas texture overlay
- [ ] Visibility Map: replace stepped rectangle grid with smooth SVG contour curves
- [x] Moon Phase: add sun/moon altitude chart (smooth curves, filled areas, day selector, rise/set cards)

## Improvements (Round 3)
- [x] Geolocation auto-detect (browser GPS + Nominatim reverse-geocoding)
- [x] SEO: dynamic document.title on all pages
- [x] Hijri calendar: conjunction-based SunCalc algorithm (replaces Kuwaiti arithmetic)
- [x] Telemetry: rate limiting (5/min/IP), Zod validation, pagination
- [x] Cleanup: removed Manus artifacts, dead routes, leaky dependencies
- [x] Vercel deployment: `vercel.json`, serverless tRPC, `vercel-build` script
- [x] Bug fix: infinite render loop on Map/Globe (useMemo + stable deps)
  - [x] Push all changes to git repository branch Main.
- [x] Phase 8: Expose Public REST API on Vercel
  - [x] Create serverless function entrypoint for Express app (`api/v1/[...path].ts`)
  - [x] Add `api/v1/*` routes to `vercel.json` rewrites mapped to the Express instance
  - [x] Verify `publicApi.ts` endpoints map correctly
- [x] Bug fix: Leaflet tiles not loading on tab switch (ResizeObserver + invalidateSize)

## Improvements (Round 4)
- [x] Unified PageHeader component across all tool pages
- [x] Clerk authentication fix for public tRPC endpoints
- [x] ICOP historical sighting data integrated into Archive page
- [x] Custom location search (Open-Meteo geocoding) on all pages
- [x] Location search on Moon Phase page
- [x] Clerk Auth replacing Manus OAuth
- [x] Upstash Redis distributed rate limiting
- [x] Web Worker for visibility texture computation
- [x] Capacitor.js mobile app wrapping

## Improvements (Round 5 — Phase 2 Features)
- [x] Open-Meteo cloud cover overlay on Visibility Map & Globe (toggleable)
- [x] Best-time-to-observe calculator (`computeBestObservationTime()` in astronomy.ts)
- [x] BestTimeCard sidebar component on both Map and Globe pages
- [x] New `weather` tRPC router with `getCloudGrid` endpoint (5-min TTL cache)
- [x] `useCloudOverlay` hook with bilinear interpolation canvas texture
- [x] Fixed CSS @import ordering for Vite hot-reload

## Completed (Rounds 10–39)

### Rounds 10–20: Pro Tier Infrastructure & Feature Gating
- [x] `ProTierContext`, `ProGate`, `UpgradeModal` — full soft paywall system
- [x] Feature gating: 3D Globe (click intercept), Cloud Cover toggle, Atmospheric Overrides (ProGate blur), Best Time to Observe (ProGate blur)
- [x] Feature gating: Sky Dome + Ephemeris (MoonPage ProGate)
- [x] Feature gating: Astronomical & Tabular calendar engines (CalendarPage)
- [x] Feature gating: Archive years < 1463 AH (ArchivePage)
- [x] Admin bypass: `moonsightinglive@gmail.com` always isPremium
- [x] `/support` page with Sadaqah Jariyah framing, Feature Access Matrix, and 3-tier pricing cards
- [x] i18n: English, Arabic, Urdu with full RTL direction support
- [x] High Contrast accessibility color-blind mode (perceptual palette)
- [x] Social sharing (ShareButton — Web Share API + clipboard fallback)
- [x] JSON-LD structured data (`SoftwareApplication` schema), `sitemap.xml` via `vite-plugin-sitemap`
- [x] `/about`, `/methodology`, `/privacy`, `/terms` informational pages
- [x] Global Visibility Criterion switch (Yallop 1997 / Odeh 2004) across Globe + Map

### Rounds 21–35: Payments, Native Mobile & Pro Launch
- [x] Stripe integration — Live mode (`sk_live_...`) for monthly, annual, lifetime plans + one-time donations ($5/$10/$25/$50)
- [x] Stripe webhook (`api/stripe/webhook.ts`) — grants/revokes `isPro` in Clerk `publicMetadata`
- [x] RevenueCat native billing (`@revenuecat/purchases-capacitor`) for iOS App Store / Google Play
- [x] RevenueCat webhook (`api/revenuecat/webhook.ts`) — syncs INITIAL_PURCHASE, RENEWAL, CANCELLATION, EXPIRATION to Clerk
- [x] Donations $10+ → `isPatron` Patron badge via webhook
- [x] Sign-in required for checkout (prevents guest payment bug)
- [x] Android App Bundle (.aab) — signed with `hilalvision.keystore`
- [x] Capacitor native URL fix — `API_BASE` set to absolute Vercel URL on native
- [x] Pro tier fully live (Round 35): all 6 gated features active

### Round 36: Bug Fixes
- [x] `exif-js` → `exifr` migration (fixes Android Chrome crash on photo upload)
- [x] tRPC batch error fix — return one error entry **per procedure** in batch (fixed "Missing result")

### Round 37: Globe Polish
- [x] Cloud overlay chrome-ball fix — switched from `MeshPhongMaterial` to `MeshBasicMaterial` (no more specular sphere effect)
- [x] Globe cloud mesh rotation fix — apply `rotation.y = -Math.PI / 2` for geographic alignment

### Round 38: Stability & Service Worker Fixes
- [x] Service Worker offline fallback fixed — return valid tRPC batch error array for `/api/` calls (fixes Safari "string did not match" error)
- [x] Redis cold-start crash fixed — lazy getter pattern for `Ratelimit` + `Redis` initialization
- [x] Cloud projection fix — `equirectangular` for globe (Three.js), `mercator` for 2D map (Leaflet)

### Round 39: Android CORS & tRPC (Current)
- [x] Android CORS fix — `credentials: Capacitor.isNativePlatform() ? "omit" : "include"` in `main.tsx`
- [x] tRPC error handler final fix — split batch `path` on commas, return one error per procedure
- [x] Android versionCode bumped to **5** / versionName **"1.0.4"**

---

## Future Backlog (as of Round 39)

### Release Preparation
- [ ] **Set `TESTING_DISABLE_PRO_GATE = false`** in `client/src/contexts/ProTierContext.tsx` before public release
- [ ] **Sync iOS version in Xcode** — update MARKETING_VERSION to `1.0.4` and CURRENT_PROJECT_VERSION to `5` (currently at `1.0` / `1`)

### Mobile & Monetization
- [ ] Push Notifications (FCM + APNs) — `push_tokens` DB schema exists; Capacitor + Firebase wiring needed
- [ ] Google Play Console — finalise Data Safety form, screenshots, store listing
- [ ] Play Store Internal Testing → Open Testing → Production launch
- [ ] iOS TestFlight → App Store Connect review submission
- [ ] Subscription revocation pipeline — map `stripeCustomerId` → Clerk user ID in DB for `customer.subscription.deleted` webhook

### Features
- [ ] Photo uploads for sighting reports — form UI exists, no cloud storage backend
- [ ] Real-time 29th-night feed — push trigger on the 29th of each Islamic month
- [ ] Educational "How to Sight the Moon" content section
- [ ] AR Moon Finder (Capacitor camera + device orientation sensors)

### Scientific Accuracy
- [ ] VSOP87 / ELP2000 high-accuracy planetary theory (replace SunCalc, ~0.3° precision → <1 arcsecond)
- [ ] Server-side visibility grid precomputation (cron job → Redis cache → instant texture serving)

### i18n
- [ ] Malay language (4th i18n locale after EN/AR/UR)

### Business
- [ ] Tiered Developer API — rate-limited API keys with usage-based pricing
- [ ] Mosque Widget — embeddable iframe for mosques ($10–$20/month B2B)

## Improvements (Round 6 — Audit & Code Quality)
- [x] Comprehensive code audit (7.5/10 scorecard, competitive analysis, tiered action plan)
- [x] `robots.txt` updated with `/api/` Disallow
- [x] OG image format fixed (SVG → PNG for social platform compatibility)
- [x] `getObservations` pagination bug fixed (proper `COUNT(*)` query)
- [x] Code splitting with `React.lazy` + `Suspense` (6 heavy pages lazy-loaded)
- [x] Exported 6 private astronomy functions for testability
- [x] Test suite rewritten to import from production module (21 tests, no more inline copies)
- [x] Extracted astronomy engine to `shared/astronomy.ts` (isomorphic, no DOM)
- [x] `client/src/lib/astronomy.ts` reduced to thin re-export wrapper + `buildVisibilityTexture`
- [x] Web Worker updated to import from shared module (no more inlined copies)
- [x] Server import fixed: `../shared/astronomy` replaces cross-boundary `../client/src/lib/astronomy`

## Improvements (Round 7 — PWA, Monitoring & UX)
- [x] Hand-written Service Worker (`sw.js`) with CacheFirst / NetworkFirst / StaleWhileRevalidate strategies
- [x] PWA manifest + generated icons (192px, 512px, maskable)
- [x] Sentry error monitoring (`@sentry/react`) with ErrorBoundary + API error capture
- [x] Unified geolocation: all pages auto-detect GPS on mount via `useGeolocation(true)`
- [x] Created shared `AutoDetectButton` component (inline + button variants)
- [x] Removed ~120 lines of duplicated inline geolocation code across 5 files
- [x] Submit Sighting button made red for visibility, Sign In button sizing fixed
- [x] Mobile navbar dropdown moved outside flex header to fix upward overlapping

## Bug Fixes & UX Round 8
- [x] Fix cloud cover overlay not visible on 3D Globe (Fixed Vercel 500 long-URL error)
- [x] Add Cloud Cover and Visibility toggles to 2D Map (`MapPage.tsx`)
- [x] Unify overlay toggles on Globe + Map into the Map Controls sidebar
- [x] Replace stepped visibility grid on 2D map with smooth mathematical SVG contour curves (`d3-contour`)

## Improvements & Fixes (Round 9)
- [x] E2E Testing suite setup with Playwright
- [x] Color-blind accessibility mode (High Contrast perceptual palette)
- [x] Topographical refraction adjustments via Open-Meteo Elevation API
- [x] App Store Readiness (Capacitor UI viewport safe-areas & splash screen lock)
- [x] Mobile UI/UX overhaul (Bottom navigation + Drawer for side panels)
- [x] Resolving Vercel TRPCClientError 500 crashes
- [x] Deep Navy theme refinements (Globe night shading and Moon SVGs)
