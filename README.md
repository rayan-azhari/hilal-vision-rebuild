# Hilal Vision (Moon Dashboard)

A precision astronomical platform for predicting and visualizing Islamic crescent moon sightings worldwide. Built with modern web technologies, Hilal Vision provides observatory-grade tools to track lunar phases, predict visibility using established criteria (Yallop & Odeh), and plan for the new Hijri month.

## Features

- **🌐 Unified Visibility Page (`/visibility`)**: A seamless toggle between an interactive 3D Globe (Globe.gl) and a 2D Leaflet Map. Both views share synchronized state — date, hour offset, and selected city carry over instantly when switching between them.
  - *3D Globe*: Interactive day/night terminator with smooth visibility zone overlays.
  - *2D Map*: Web Mercator projected visibility heatmap with Gaussian blur smoothing, click-to-inspect, and crowdsourced sighting pins.
  - *Hour Offset Slider*: Slide ±24 hours to see how visibility evolves over time.
  - *GPS Auto-Detect*: Instantly fly to your current position using the browser Geolocation API.
  - *Global City Selector*: 85+ world capitals and major cities.
- **🌔 Moon Phase Dashboard (`/moon`)**: Current lunar phase, age, illumination, rise/set times, Sun & Moon Altitude Tracker chart (moved to top of page), and a **Scientific Methodology** section with interactive Yallop criterion charts and Danjon Limit physics.
- **📅 Hijri Calendar (`/calendar`)**: Astronomical conjunction-based Gregorian ↔ Islamic calendar conversion with moon phase indicators and significant date highlighting.
- **🌅 Horizon View (`/horizon`)**: Local horizon simulator showing the moon's position relative to the setting sun, with **GPS auto-detect** via browser Geolocation API and Nominatim reverse-geocoding.
- **📁 Archive (`/archive`)**: Historical crescent visibility maps (1438–1465 AH).

## Tech Stack

- **Frontend:** React 19, Vite 7, Tailwind CSS v4, Radix UI, Recharts
- **Design System:** Breezy Weather Design (`.breezy-card`, Space-Navy/Gold themes)
- **Mapping & Scientific Viz:** Leaflet, Globe.gl, Three.js, SunCalc
- **Backend:** Node.js, Express, tRPC (Type-safe API with rate limiting & input validation)
- **Database:** Drizzle ORM (MySQL — `observation_reports` table)
- **State Management:** React Query (`@tanstack/react-query`)
- **External APIs:** Open-Meteo (weather, air quality, elevation)

## Recent Architecture Highlights

1. **Unified Visibility Page**: Globe and Map views merged into a single page with synced state (date, hour offset, location) lifted to the parent component for seamless toggling.
2. **Smooth Visibility Zones**: Canvas-based Gaussian blur replaces raw CSS rectangles — zone boundaries are smooth and organic on both 2D and 3D views with no resolution increase needed.
3. **Scientific Methodology Panel**: Interactive Yallop threshold curve chart, Danjon Limit explanation, and atmospheric refraction notes for pro users on the Moon Phase page.
4. **Rate-Limited Telemetry API**: Server-side in-memory rate limiter (5 req/min/IP), Zod input validation with min/max bounds, and paginated `getObservations` endpoint.
5. **Open-Meteo Integration**: Autonomous server-side enrichment of sighting reports with live cloud cover, surface pressure, and aerosol optical depth data.
6. **Conjunction-Based Hijri Calendar**: SunCalc-powered astronomical new moon detection replaces the old arithmetic algorithm, accurate to ±1 day of the Umm al-Qura calendar.
7. **SEO & Accessibility**: Dynamic `document.title` on every page, meta descriptions, and semantic HTML.

## Getting Started

### Prerequisites

- Node.js (v18+)
- `pnpm` (recommended) or `npm`

### Installation & Running

```bash
# Install dependencies
pnpm install
# or
npm install --legacy-peer-deps

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

# Optional: set DATABASE_URL env var for telemetry persistence
```

See `docs/DEPLOYMENT.md` for the full Vercel deployment guide.

### Code Quality & Testing

```bash
npm run test    # Unit tests (Yallop models, Sun/Moon trajectories)
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
