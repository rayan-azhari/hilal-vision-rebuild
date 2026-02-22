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
- [x] Vitest unit tests (18 tests, all passing)
- [x] TypeScript: 0 errors
- [x] Final checkpoint

## Bug Fixes
- [x] Fix globe.gl colorAlpha crash — hex callbacks return CSS color-mix/oklch strings that globe.gl can't parse; must return standard hex/rgba
- [x] Fix duplicate React keys — MAJOR_CITIES has duplicate entries (e.g. Kuala Lumpur) causing non-unique keys

## Improvements (Round 2)
- [ ] 3D Globe: replace slow hex-bin point cloud with fast canvas texture overlay
- [ ] Visibility Map: replace stepped rectangle grid with smooth SVG contour curves
- [ ] Moon Phase: add sun/moon altitude chart (smooth curves, filled areas, day selector, rise/set cards)

## Improvements (Round 3)
- [x] Geolocation auto-detect (browser GPS + Nominatim reverse-geocoding)
- [x] SEO: dynamic document.title on all pages
- [x] Hijri calendar: conjunction-based SunCalc algorithm (replaces Kuwaiti arithmetic)
- [x] Telemetry: rate limiting (5/min/IP), Zod validation, pagination
- [x] Cleanup: removed Manus artifacts, dead routes, leaky dependencies
- [x] Vercel deployment: `vercel.json`, serverless tRPC, `vercel-build` script
- [x] Bug fix: infinite render loop on Map/Globe (useMemo + stable deps)
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

## Future
- [ ] Server-side visibility grid precomputation
- [ ] Weather/cloud cover integration on map
- [ ] Educational "How to Sight the Moon" content
- [ ] AR Moon Finder (Capacitor camera + WebGL)
- [ ] Push notifications for sighting alerts
- [ ] Multi-language UI (Arabic, Urdu, Malay)
- [ ] Photo upload for sighting reports
- [ ] Best-time-to-observe calculator
- [ ] VSOP87/ELP2000 high-accuracy planetary theory
