# Hilal Vision (Moon Dashboard)

A precision astronomical platform for predicting and visualizing Islamic crescent moon sightings worldwide. Built with modern web technologies, Hilal Vision provides observatory-grade tools to track lunar phases, predict visibility using established criteria (Yallop & Odeh), and plan for the new Hijri month.

## Features

- **🌐 Unified Visibility Page (`/visibility`)**: Toggle between an interactive 3D Globe (Globe.gl) and a 2D Leaflet Map.
  - *Criterion Switch*: Seamlessly toggle between the Yallop (1997) and Odeh (2004) criteria to evaluate visibility zones.
  - *Hour Offset Slider*: Slide ±24 hours to see how visibility evolves over time.
  - *GPS Auto-Detect*: Instantly fly to your current position using the browser Geolocation API.
  - *Custom Geocoding Search*: Search any city worldwide via Open-Meteo integration.
  - *Cloud Cover Overlay*: Real-time cloud cover data from Open-Meteo rendered as a translucent overlay (toggleable independently from visibility zones).
  - *Atmospheric Overrides*: Manual or auto-fetched temperature (°C), pressure (hPa), and elevation (m) overrides via Open-Meteo's real-time weather API. Adjusts atmospheric refraction for observatory-grade accuracy.
  - *DEM Integration*: Digital Elevation Model data automatically fetched from Open-Meteo's Elevation API on map click, providing true terrain-aware horizon dip calculations.
  - *Enhanced Tooltips*: Click any point on the 2D Map to see detailed lunar data - q-value, moon age, altitude, elongation, crescent width, and local terrain elevation.
  - *Best-Time-to-Observe Calculator*: Automatically computes the optimal observation window between sunset and moonset, scoring by moon altitude and sky darkness. Incorporates topographical elevation precision where available.
  - *Accessibility*: High Contrast Color-Blind mode to ensure the visibility gradients remain intelligible for users with Color Vision Deficiency.
- **🌔 Moon Phase Dashboard (`/moon`)**: Current lunar phase, age, illumination, Sun & Moon Altitude chart, Sky Dome polar visualization, and interactive scientific charts (Yallop/Danjon limits). Includes auto-geolocation and hour-offset.
- **📅 Hijri Calendar (`/calendar`)**: Triple-engine Hijri calendar featuring true Astronomical (SunCalc), Official Umm al-Qura, and Tabular (Kuwaiti) calculations.
- **🌅 Horizon View (`/horizon`)**: Local horizon simulator showing the moon's position relative to the setting sun.
- **📁 Archive (`/archive`)**: Authentic historical crescent visibility data featuring 1,000+ real sighting records from the Islamic Crescents' Observation Project (ICOP). Includes CSV and JSON export for both ICOP observations and computed visibility tables.
- **🌐 SEO**: Per-page dynamic meta tags, Open Graph & Twitter cards, JSON-LD structured data, sitemap.xml, robots.txt.
- **🌍 i18n**: English, Arabic (العربية), and Urdu (اردو) with a navbar language switcher and full RTL support.
- **📤 Social Sharing**: Native share API (mobile) with clipboard fallback, plus a live sighting feed on the Home page with CSV/JSON data export.
- **🔌 Public REST API**: Programmatic access to visibility and moon phase data via `/api/v1/visibility` and `/api/v1/moon-phases` endpoints with Zod-validated query parameters. See the [`docs/PUBLIC_API_REFERENCE.md`](docs/PUBLIC_API_REFERENCE.md) documentation.
- **📸 EXIF Metadata Extraction**: Sighting report photo uploads are automatically parsed for GPS coordinates, camera model, and timestamp using the `exif-js` library.
- **ℹ️ About Page (`/about`)**: Mission statement, platform overview, technology stack, competitor comparison table (vs Moonsighting.com, IslamicFinder, LuneSighting, HilalMap), and data attributions.
- **🔬 Methodology Page (`/methodology`)**: Full technical reference - Yallop q-value formula derivation, Odeh V-value, triple-engine Hijri calendar algorithms, Best-Time-to-Observe scoring function, ICOP archive sourcing, atmospheric refraction physics, and peer-reviewed references.
- **⚖️ Legal Pages (`/privacy`, `/terms`)**: Privacy Policy (GDPR-aware, covering GPS, Clerk auth, ICOP data) and Terms of Service (acceptable use, All Rights Reserved, accuracy disclaimer).
- **💛 Support Page (`/support`)**: Sadaqah Jariyah (ongoing charity) mission narrative, Feature Access Matrix (Free vs Pro comparison), three-tier pricing (Monthly/Annual/Lifetime), one-time donation with preset amounts, and Patron badge system.

## Tech Stack

- **Frontend:** React 19, Vite 7, Tailwind CSS v4, Radix UI, Recharts
- **Design System:** Breezy Weather Design (`.breezy-card`, Space-Navy/Gold themes)
- **Mapping & Scientific Viz:** Leaflet, Globe.gl, Three.js, SunCalc
- **Backend:** Node.js, Express, tRPC (Type-safe API)
- **Database:** Drizzle ORM (MySQL - `observation_reports` table)
- **Authentication:** Clerk
- **Rate Limiting:** Upstash Redis
- **i18n:** react-i18next + i18next-browser-languagedetector
- **SEO:** react-helmet-async
- **Testing:** Vitest (Unit), Playwright (E2E)
- **Mobile Packaging:** Capacitor.js (iOS & Android Native with Safe Area optimizing)

## Recent Architecture Highlights

1. **Web Worker Visibility Engine**: The heavy astronomical calculations (3,600+ sun-moon evaluations per frame) are completely offloaded to a Web Worker, ensuring a 60FPS buttery-smooth UI map experience.
2. **Capacitor Mobile Native**: The identical codebase compiles beautifully into native iOS and Android applications.
3. **Clerk Authentication**: Secure user management replacing legacy custom OAuth.
4. **Smart Telemetry Validation**: Sighting reports are algorithmically verified against astronomical reality. If a user maliciously claims to see the moon when it is physically below the horizon (Zone F), the mathematical engine rejects the payload.
5. **Real ICOP Data Extraction**: Features an integrated scraper that autonomously pulled 1,000+ historical crescent sight reports to serve as verifiable proof-of-concept records alongside theoretical algorithms.
6. **Triple-Engine Hijri Calendar**: Supports `SunCalc`-powered astronomical new moon detection, `@umalqura/core` for official KACST Saudi civic dates, and an arithmetic Tabular fallback.
7. **Production Upstash Protection**: Hardened TRPC mutation endpoints utilizing Upstash Redis sliding window token bucket rate-limiting.
8. **Open-Meteo Cloud Cover Overlay**: Real-time cloud cover data fetched from Open-Meteo's forecast API for a sparse global grid (~162 points), bilinearly interpolated into a smooth canvas texture, and overlaid on both 2D Map (Leaflet `imageOverlay`) and 3D Globe (Three.js sphere mesh). Independently toggleable from visibility zones.
9. **Best-Time-to-Observe Engine**: A `computeBestObservationTime()` function in the astronomy engine scans sunset→moonset in 5-minute steps, scoring each moment by moon altitude, sky darkness (civil/nautical twilight), and atmospheric extinction. Results displayed in a Breezy-styled sidebar card on both views.
10. **Trilingual i18n with RTL**: Full Arabic and Urdu translation files (100+ strings) with automatic RTL direction switching and browser language detection.
11. **Dynamic SEO Engine**: Per-page meta tags, OG/Twitter cards (PNG format for social platform compatibility), and JSON-LD structured data via `react-helmet-async`, with canonical URLs and a complete sitemap.
12. **Shared Astronomy Module**: The 843-line astronomy engine has been extracted to `shared/astronomy.ts` - a platform-agnostic module importable by the server, Web Workers, and tests without cross-boundary imports. Only `buildVisibilityTexture` (DOM-dependent) remains in the client wrapper.
13. **Code Splitting**: All 6 heavy pages are lazy-loaded via `React.lazy` + `Suspense`, keeping Globe.gl, Three.js, Leaflet, D3, and Recharts out of the initial bundle.
14. **Reliable Test Suite**: 21 unit tests import directly from the production `shared/astronomy.ts` module (not duplicated copies) and cover Yallop/Odeh classification, crescent width, Hijri conversion, q-value formula, degree/radian conversions, and best-time-to-observe.
15. **Dual Visibility Criteria**: Users can now seamlessly toggle between the traditional Yallop (1997) q-value criterion and the modern Odeh (2004) V-value criterion across all map and globe views. The UI logic, backend calculations, and D3 contour thresholds dynamically adapt to the selected algorithm.
16. **PWA with Service Worker**: A hand-written `sw.js` implements three caching strategies - CacheFirst for map tiles/fonts, NetworkFirst for API calls, StaleWhileRevalidate for the app shell - enabling offline functionality.
17. **Sentry Error Monitoring**: `@sentry/react` with `ErrorBoundary`, API error capture, performance tracing (20% sampling), and session replays (10%), with graceful no-op when DSN is unset.
18. **Unified GPS Geolocation**: All pages auto-detect the user's GPS location on mount via a shared `useGeolocation(true)` hook with reverse-geocoding. A reusable `AutoDetectButton` component provides consistent visuals across the app.
19. **Global Location & Date State**: A unified `GlobalStateContext` centralizes the location and date pickers into the main navigation bar. Changing your location or date instantly pushes the update to all 3D Globe, 2D Map, Moon Phase, and Horizon modules simultaneously.
20. **Accessibility & High Contrast**: A specialized perceptual color palette ensures all scientific visibility gradients are legible for users with Color Vision Deficiency (CVD), computed via the Web Worker.
21. **Topographical Refraction & DEM Integration**: The application automatically fetches the observer's physical elevation (meters above sea level) via the Open-Meteo Elevation API (`dem.getDem` tRPC endpoint) on every map/globe click. This terrain-aware elevation adjusts the theoretical local horizon dip, providing precise observatory-grade altitude calculations for both sun and moon.
22. **E2E Playwright Testing**: Critical user journeys, DOM sync, and rendering are safeguarded from regressions using a comprehensive Playwright automation suite.
23. **Atmospheric Overrides**: Both MapPage and GlobePage feature a collapsible "Atmospheric Overrides" panel where users can manually set temperature (°C), pressure (hPa), and elevation (m) - or toggle "Auto-fetch" to pull real-time values from Open-Meteo's weather API based on the selected location. These parameters feed into the refraction correction formula `R = R_std × (P/1010) × (283/(273+T))` for observatory-grade precision.
24. **Public REST API**: Express-based REST endpoints (`/api/v1/visibility?lat=...&lng=...&date=...` and `/api/v1/moon-phases?lat=...&lng=...&date=...`) with Zod input validation provide programmatic access to visibility zone classification and lunar phase data for external integrations.
25. **Data Export**: CSV and JSON export buttons on the Archive page (both ICOP historical data and computed visibility tables) and the Sighting Feed widget, enabling researchers to download datasets for offline analysis.
26. **EXIF Metadata Extraction**: Photo uploads in the Sighting Report form are automatically parsed for embedded GPS coordinates, camera model, and capture timestamp using the `exif-js` library, pre-filling the location and time fields for accuracy.
27. **Enhanced Map Click Tooltips**: Clicking any point on the 2D Map displays a rich popup showing the visibility zone, q-value, moon age, altitude, azimuth, elongation, crescent width, and local DEM-sourced terrain elevation.
23. **App Store Readiness**: Mobile web views are strictly styled using `env(safe-area-inset-top)` to seamlessly accommodate iOS Dynamic Islands and Android gesture navs via Capacitor.
24. **Exact Conjunction Times**: The `findNewMoonNear()` algorithm (two-pass SunCalc phase minimization) is now exported and wired to the Moon Phase Dashboard, displaying the exact UTC time of the next new moon conjunction down to the second.
25. **Soft Paywall Monetization (Pro Tier)**: A `ProTierContext` + `<ProGate>` component system gates deep feature interaction behind a "Pro" subscription while keeping all features visible to free users from Day 1. Gated features include the 3D Globe, Sky Dome, Altitude Chart, Ephemeris, Astronomical/Tabular calendar engines, and historical ICOP data. An `UpgradeModal` offers Monthly ($2.99), Annual ($14.99), and Lifetime ($49.99) plans (Stripe integration pending).
26. **Goodwill & Support Page**: A dedicated `/support` page with Sadaqah Jariyah messaging, Feature Access Matrix, pricing tiers, one-time donation options, and a Patron badge system. A Sadaqah banner on the Home page links to `/support`.

## Getting Started

### Prerequisites

- Node.js (v18+)
- `pnpm` (required - **do not use `npm install`**)

### Installation & Running

```bash
# Install dependencies (MUST use pnpm)
pnpm install
# or if pnpm is not installed globally:
npx pnpm install

# Start the development server
npm run dev

# Database migration (optional, for telemetry)
npm run db:push

# Production build (self-hosted)
npm run build && npm run start
```

### Vercel Deployment

```bash
# Push to GitHub, then import at https://vercel.com/new
# Vercel auto-detects settings from vercel.json:
#   Build: npx vite build
#   Output: dist/public
#   API: api/trpc/[trpc].ts (serverless function)

# ⚠️ IMPORTANT: Always use pnpm for package management.
# npm install will desync pnpm-lock.yaml and break Vercel builds.
# If desynced, run: npx pnpm install --no-frozen-lockfile

# Optional: set DATABASE_URL env var for telemetry persistence
```

```

See `docs/DEPLOYMENT.md` for the full Vercel deployment guide and **Native Mobile Deployment (iOS & Android)** instructions using Capacitor.

### Native Mobile Build (Capacitor)

Hilal Vision compiles to native iOS and Android. To generate the release builds:

```bash
# First, synchronize the web assets with the native wrappers
npm run build:cap

# For Android (Requires Android Studio)
npx cap open android
# -> Generate Signed Bundle / APK -> Android App Bundle -> Use hilalvision.keystore

# For iOS (Requires Mac & Xcode)
npx cap open ios
# -> Product -> Archive -> Distribute App
```

### Code Quality & Testing

```bash
npm run test     # Unit tests (21 tests - Yallop, crescent width, Hijri calendar, best-time)
npm run test:e2e # Playwright End-to-End browser tests
npm run check    # TypeScript type checking
```

## Documentation

- `docs/USER_GUIDE.md` - Comprehensive walkthrough of all features
- `docs/HILAL_VISION_DOCUMENTATION.md` - Core algorithms and math
- `docs/DEPLOYMENT.md` - Vercel deployment guide
- `docs/Islamic Calendar Astronomical Dashboard.md` - Problem space overview
- `docs/The Hilal Dashboard Revised Architecture.md` - Telemetry architecture

### In-App Documentation Pages

- `/about` - Mission, tools, tech stack, competitor comparison, and attributions
- `/methodology` - Full algorithm reference (Yallop, Odeh, Hijri calendar engines, Best-Time calculator, ICOP, refraction)
- `/support` - Sadaqah Jariyah mission, Feature Access Matrix (Free vs Pro), pricing tiers, one-time donation
- `/privacy` - Privacy Policy (data collection, sub-processors, GDPR rights)
- `/terms` - Terms of Service (acceptable use, All Rights Reserved, accuracy disclaimer)

### Developer Documentation

- `docs/PUBLIC_API_REFERENCE.md` - Standalone documentation providing schema details and `curl` examples for interacting with the Hilal Vision backend.

## Monetization Roadmap

**Model:** Soft Paywall — all features visible from Day 1, depth gated behind Pro.

| Status | Item | Description |
|--------|------|-------------|
| ✅ Done | Pro Infrastructure | `ProTierContext`, `<ProGate>`, `UpgradeModal` (Stripe/RevenueCat split) |
| ✅ Done | Feature Gating | 3D Globe, Sky Dome, Altitude Chart, Ephemeris, Astronomical/Tabular engines, historical Archive |
| ✅ Done | Support Page | `/support` with Feature Access Matrix, pricing, donation, Sadaqah banner on Home |
| ✅ Done | Payment Gateways | Stripe checkout (Web) + RevenueCat Native SDK (iOS/Android) + Clerk webhook sync |
| ⏳ Planned | Push Notifications | Pro-only crescent alerts via Capacitor + FCM/APNs |
| ⏳ Planned | Ethical Ads | Muslim Ad Network below-fold for free tier, suppressed for Pro |
| ✅ Done | Public REST API | `/api/v1/visibility` and `/api/v1/moon-phases` endpoints (free, Zod-validated) |
| ✅ Done | Data Export | CSV/JSON download for Archive page and Sighting Feed |
| ✅ Done | Atmospheric Overrides | Auto-fetch T/P/elevation from Open-Meteo or manual input on Map/Globe |
| ✅ Done | DEM Integration | Real terrain elevation via Open-Meteo Elevation API on map click |
| 🔮 Future | Tiered Developer API | Rate-limited API keys with usage-based pricing |
| 🔮 Future | Mosque Widget | Embeddable `<iframe>` ($10–$20/month B2B) |
| 🔮 Future | Developer API | REST API for visibility calculations (tiered pricing) |

## License

All Rights Reserved
