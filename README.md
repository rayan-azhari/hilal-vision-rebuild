# Hilal Vision (Moon Dashboard)

A precision astronomical platform for predicting and visualizing Islamic crescent moon sightings worldwide. Built with modern web technologies, Hilal Vision provides observatory-grade tools to track lunar phases, predict visibility using established criteria (Yallop & Odeh), and plan for the new Hijri month.

## Features

- **🌐 Unified Visibility Page (`/visibility`)**: Toggle between an interactive 3D Globe (Globe.gl) and a 2D Leaflet Map.
  - *Hour Offset Slider*: Slide ±24 hours to see how visibility evolves over time.
  - *GPS Auto-Detect*: Instantly fly to your current position using the browser Geolocation API.
  - *Custom Geocoding Search*: Search any city worldwide via Open-Meteo integration.
  - *Cloud Cover Overlay*: Real-time cloud cover data from Open-Meteo rendered as a translucent overlay (toggleable independently from visibility zones).
  - *Best-Time-to-Observe Calculator*: Automatically computes the optimal observation window between sunset and moonset, scoring by moon altitude and sky darkness.
- **🌔 Moon Phase Dashboard (`/moon`)**: Current lunar phase, age, illumination, Sun & Moon Altitude chart, and interactive scientific charts (Yallop/Danjon limits). Includes auto-geolocation and hour-offset.
- **📅 Hijri Calendar (`/calendar`)**: Astronomical conjunction-based calendar accurate to the new moon.
- **🌅 Horizon View (`/horizon`)**: Local horizon simulator showing the moon's position relative to the setting sun.
- **📁 Archive (`/archive`)**: Authentic historical crescent visibility data featuring 1,000+ real sighting records from the Islamic Crescents' Observation Project (ICOP).
- **🌐 SEO**: Per-page dynamic meta tags, Open Graph & Twitter cards, JSON-LD structured data, sitemap.xml, robots.txt.
- **🌍 i18n**: English, Arabic (العربية), and Urdu (اردو) with a navbar language switcher and full RTL support.
- **📤 Social Sharing**: Native share API (mobile) with clipboard fallback, plus a live sighting feed on the Home page.

## Tech Stack

- **Frontend:** React 19, Vite 7, Tailwind CSS v4, Radix UI, Recharts
- **Design System:** Breezy Weather Design (`.breezy-card`, Space-Navy/Gold themes)
- **Mapping & Scientific Viz:** Leaflet, Globe.gl, Three.js, SunCalc
- **Backend:** Node.js, Express, tRPC (Type-safe API)
- **Database:** Drizzle ORM (MySQL — `observation_reports` table)
- **Authentication:** Clerk
- **Rate Limiting:** Upstash Redis
- **i18n:** react-i18next + i18next-browser-languagedetector
- **SEO:** react-helmet-async
- **Mobile Packaging:** Capacitor.js (iOS & Android Native)

## Recent Architecture Highlights

1. **Web Worker Visibility Engine**: The heavy astronomical calculations (3,600+ sun-moon evaluations per frame) are completely offloaded to a Web Worker, ensuring a 60FPS buttery-smooth UI map experience.
2. **Capacitor Mobile Native**: The identical codebase compiles beautifully into native iOS and Android applications.
3. **Clerk Authentication**: Secure user management replacing legacy custom OAuth.
4. **Smart Telemetry Validation**: Sighting reports are algorithmically verified against astronomical reality. If a user maliciously claims to see the moon when it is physically below the horizon (Zone F), the mathematical engine rejects the payload.
5. **Real ICOP Data Extraction**: Features an integrated scraper that autonomously pulled 1,000+ historical crescent sight reports to serve as verifiable proof-of-concept records alongside theoretical algorithms.
6. **Conjunction-Based Hijri Calendar**: SunCalc-powered astronomical new moon detection replaces the old arithmetic algorithm, precise to the minute of conjunction.
7. **Production Upstash Protection**: Hardened TRPC mutation endpoints utilizing Upstash Redis sliding window token bucket rate-limiting.
8. **Open-Meteo Cloud Cover Overlay**: Real-time cloud cover data fetched from Open-Meteo's forecast API for a sparse global grid (~162 points), bilinearly interpolated into a smooth canvas texture, and overlaid on both 2D Map (Leaflet `imageOverlay`) and 3D Globe (Three.js sphere mesh). Independently toggleable from visibility zones.
9. **Best-Time-to-Observe Engine**: A `computeBestObservationTime()` function in the astronomy engine scans sunset→moonset in 5-minute steps, scoring each moment by moon altitude, sky darkness (civil/nautical twilight), and atmospheric extinction. Results displayed in a Breezy-styled sidebar card on both views.
10. **Trilingual i18n with RTL**: Full Arabic and Urdu translation files (100+ strings) with automatic RTL direction switching and browser language detection.
11. **Dynamic SEO Engine**: Per-page meta tags, OG/Twitter cards (PNG format for social platform compatibility), and JSON-LD structured data via `react-helmet-async`, with canonical URLs and a complete sitemap.
12. **Shared Astronomy Module**: The 843-line astronomy engine has been extracted to `shared/astronomy.ts` — a platform-agnostic module importable by the server, Web Workers, and tests without cross-boundary imports. Only `buildVisibilityTexture` (DOM-dependent) remains in the client wrapper.
13. **Code Splitting**: All 6 heavy pages are lazy-loaded via `React.lazy` + `Suspense`, keeping Globe.gl, Three.js, Leaflet, D3, and Recharts out of the initial bundle.
14. **Reliable Test Suite**: 21 unit tests import directly from the production `shared/astronomy.ts` module (not duplicated copies) and cover Yallop classification, crescent width, Hijri conversion, q-value formula, degree/radian conversions, and best-time-to-observe.

## Getting Started

### Prerequisites

- Node.js (v18+)
- `pnpm` (required — **do not use `npm install`**)

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

See `docs/DEPLOYMENT.md` for the full Vercel deployment guide.

### Code Quality & Testing

```bash
npm run test    # Unit tests (21 tests — Yallop, crescent width, Hijri calendar, best-time)
npm run check   # TypeScript type checking
```

## Documentation

- `docs/USER_GUIDE.md` — Comprehensive walkthrough of all features
- `docs/HILAL_VISION_DOCUMENTATION.md` — Core algorithms and math
- `docs/DEPLOYMENT.md` — Vercel deployment guide
- `docs/Islamic Calendar Astronomical Dashboard.md` — Problem space overview
- `docs/The Hilal Dashboard Revised Architecture.md` — Telemetry architecture

## License

MIT License
