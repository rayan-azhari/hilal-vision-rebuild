# Hilal Vision (Moon Dashboard)

A precision astronomical platform for predicting and visualizing Islamic crescent moon sightings worldwide. Built with modern web technologies, Hilal Vision provides observatory-grade tools to track lunar phases, predict visibility using established criteria (Yallop & Odeh), and plan for the new Hijri month.

## Features

- **🌐 3D Globe (`/globe`)**: Interactive Globe.gl visualization with real-time day/night terminator and moon visibility overlays.
- **🗺️ Visibility Map (`/map`)**: Detailed Leaflet map with a time slider, showing crescent visibility predictions highlighting regions (Zones A-E) from "Easily Visible" to "Telescope Only".
- **🌔 Moon Phase Dashboard (`/moon`)**: Current lunar phase, age, illumination, rise/set times, and upcoming celestial events.
- **📅 Hijri Calendar (`/calendar`)**: Seamless Gregorian to Islamic calendar conversion, highlighting significant dates and current Hijri months.
- **🌅 Horizon View (`/horizon`)**: Local horizon simulator visualizing the moon's position relative to the setting sun for a specified location.
- **📁 Archive (`/archive`)**: Historical crescent visibility data and maps covering Islamic months from 1438 to 1465 AH.

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS (v4), Radix UI 
- **Design System:** Breezy Weather Design System (`.breezy-card`, Space-Navy themes, interactive data-driven SVG decorations)
- **Mapping & Scientific Viz:** Leaflet (react-leaflet), Globe.gl, Three.js, SunCalc, Astronomia
- **Backend:** Node.js, Express, tRPC (Type-safe API layer)
- **Database / Telemetry:** Drizzle ORM (Logging crowd-sourced observation reports)
- **State Management:** React Query (`@tanstack/react-query`)

## Recent Architecture Upgrades

1. **Classy Scientific Redesign (Phase 3)**: Complete UI overhaul replacing the cinematic "Breezy" tokens with a purely academic, high-contrast, black/gold/white monochromatic theme using `Inter`. Implemented deep-dive interactive `recharts` data plots inside Shadcn `<Dialog>` expandable cards.
2. **Telemetry Pipeline & Open-Meteo (Phase 2)**: Database infrastructure built via Drizzle ORM (`observation_reports`) and tRPC routers to aggregate ground-truth visual sightings. Open-Meteo API integration planned for retrieving real-time Digital Elevation Models (DEM) and Aerosol Optical Depth (AOD) data to validate public moon sighting submissions.
3. **Optimized Globe.gl Visualization**: Transitioned from generic `overlayImageUrl` to a native `THREE.MeshBasicMaterial` mapping, reducing texture generation resolution for a 16x calculation speedup, and integrated dynamic Light/Dark mode satellite basemaps.

## Getting Started

### Prerequisites

- Node.js (v18+)
- `pnpm` or `npm` package manager

### Installation & Running

1. **Install dependencies:**
   ```bash
   pnpm install
   # or
   npm install --legacy-peer-deps
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```
   The backend server and Vite frontend will auto-start concurrently.

3. **Database Migration (Optional, for Telemetry features):**
   Ensure an appropriate `DATABASE_URL` is set in your `.env`, and run:
   ```bash
   npm run db:push
   ```

4. **Production Build:**
   ```bash
   npm run build
   npm run start
   ```

### Code Quality & Testing

Verify the robustness of the astronomical engine and type definitions:

- **Run unit tests** (validates Yallop models and Sun/Moon trajectories):
  ```bash
  npm run test
  ```
- **Type Checking**:
  ```bash
  npm run check
  ```

## Documentation

Comprehensive project documentation detailing the underlying math, the Yallop & Odeh criteria, ML integration plans, and UI specifications can be found within the `docs/` folder:

- `HILAL_VISION_DOCUMENTATION.md`: Core mechanics and algorithms.
- `USER_GUIDE.md`: Comprehensive walkthrough of application features and how to log telemetry.
- `Islamic Calendar Astronomical Dashboard.md`: Broad overview of the problem space and validation data (ICOP).
- `The Hilal Dashboard Revised Architecture.md`: Telemetry, Hub & Spoke model, DEM/AOD architecture.
- `BREEZY_DESIGN_REPORT.md` & `BREEZY_CONVERSION_GUIDE.md`: Design system principles.

## License

MIT License
