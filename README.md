# Hilal Vision (Moon Dashboard)

A precision astronomical platform for predicting and visualizing Islamic crescent moon sightings worldwide. Built with modern web technologies, Hilal Vision provides observatory-grade tools to track lunar phases, predict visibility using established criteria (Yallop & Odeh), and plan for the new Hijri month.

## Features

- **🌐 Unified Visibility Page (`/visibility`)**: Toggle between an interactive 3D Globe (Globe.gl) and a 2D Leaflet Map.
  - *Hour Offset Slider*: Slide ±24 hours to see how visibility evolves over time.
  - *GPS Auto-Detect*: Instantly fly to your current position using the browser Geolocation API.
  - *Custom Geocoding Search*: Search any city worldwide via Open-Meteo integration.
- **🌔 Moon Phase Dashboard (`/moon`)**: Current lunar phase, age, illumination, Sun & Moon Altitude chart, and interactive scientific charts (Yallop/Danjon limits). Includes auto-geolocation and hour-offset.
- **📅 Hijri Calendar (`/calendar`)**: Astronomical conjunction-based calendar accurate to the new moon.
- **🌅 Horizon View (`/horizon`)**: Local horizon simulator showing the moon's position relative to the setting sun.
- **📁 Archive (`/archive`)**: Authentic historical crescent visibility data featuring 1,000+ real sighting records from the Islamic Crescents' Observation Project (ICOP).

## Tech Stack

- **Frontend:** React 19, Vite 7, Tailwind CSS v4, Radix UI, Recharts
- **Design System:** Breezy Weather Design (`.breezy-card`, Space-Navy/Gold themes)
- **Mapping & Scientific Viz:** Leaflet, Globe.gl, Three.js, SunCalc
- **Backend:** Node.js, Express, tRPC (Type-safe API)
- **Database:** Drizzle ORM (MySQL — `observation_reports` table)
- **Authentication:** Clerk
- **Rate Limiting:** Upstash Redis
- **Mobile Packaging:** Capacitor.js (iOS & Android Native)

## Recent Architecture Highlights

1. **Web Worker Visibility Engine**: The heavy astronomical calculations (3,600+ sun-moon evaluations per frame) are completely offloaded to a Web Worker, ensuring a 60FPS buttery-smooth UI map experience.
2. **Capacitor Mobile Native**: The identical codebase compiles beautifully into native iOS and Android applications.
3. **Clerk Authentication**: Secure user management replacing legacy custom OAuth.
4. **Smart Telemetry Validation**: Sighting reports are algorithmically verified against astronomical reality. If a user maliciously claims to see the moon when it is physically below the horizon (Zone F), the mathematical engine rejects the payload.
5. **Real ICOP Data Extraction**: Features an integrated scraper that autonomously pulled 1,000+ historical crescent sight reports to serve as verifiable proof-of-concept records alongside theoretical algorithms.
6. **Conjunction-Based Hijri Calendar**: SunCalc-powered astronomical new moon detection replaces the old arithmetic algorithm, precise to the minute of conjunction.
7. **Production Upstash Protection**: Hardened TRPC mutation endpoints utilizing Upstash Redis sliding window token bucket rate-limiting.

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
