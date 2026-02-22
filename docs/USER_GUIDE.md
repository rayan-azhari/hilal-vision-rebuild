# Hilal Vision User Guide

Welcome to **Hilal Vision**, a precision astronomical platform designed for predicting, tracking, and crowdsourcing Islamic crescent moon sightings worldwide. This guide walks you through every feature.

## Navigation

The top navigation bar provides access to all views and includes:
- **Theme Toggle** (Light/Dark mode)
- **Report Sighting** button (golden `+` icon)

---

## 1. Home Dashboard (`/`)

Your command center for at-a-glance astronomical data.
- **Ephemeris Cards** — Sunrise time, sighting probability, current Hijri date, and more.
- **Expandable Deep-Dives** — Cards with a subtle gold glow open into detailed scientific overlays when clicked.

## 2. Visibility (`/visibility`)

A **unified page** with a floating toggle to switch between **3D Globe** and **2D Map** views. All controls are fully synchronized — changing the date, hour offset, or location on one view carries over instantly to the other.

### Shared Controls (both views)
- **Date Picker** — Select any Gregorian date.
- **Hour Offset Slider** — Slide ±24 hours to see visibility evolve over time.
- **Location Selector** — Choose from 85+ world capitals, or use **Auto-Detect GPS** to fly to your current position.

### 3D Globe View
- Interactive Globe.gl sphere with day/night terminator.
- Smooth Gaussian-blurred visibility zone overlay mapped directly onto the sphere.
- Play/Pause auto-rotation and toggle the visibility overlay on/off.
- Sidebar shows live astronomical data for the selected city: Moon altitude, azimuth, elongation, ARCV, crescent width, Yallop q-value, illumination, sunset, and moonset times.

### 2D Map View
- Leaflet map with dark/light CARTO basemaps.
- Web Mercator–projected visibility heatmap with smooth Gaussian-blurred zone boundaries.
- **Click anywhere** on the map to inspect the visibility zone for that exact coordinate.
- Crowdsourced sighting pins: 🟢 Naked Eye, 🔵 Optical Aid, ⚪ Not Seen.
- Resolution selector: Fine (2°), Normal (4°), or Fast (6°).

## 3. Moon Phase (`/moon`)

A dedicated dashboard for the lunar cycle.
- **Sun & Moon Altitude Tracker** (top of page) — Interactive chart plotting Sun and Moon altitudes throughout the day.
- **Moon Illustration** — Accurate SVG rendering of the current phase with craters and terminator.
- **Stats Grid** — Illumination, Lunar Age, Visibility Zone, Moon Altitude, Elongation, Next New Moon countdown.
- **Ephemeris** — Sunrise, Sunset, Moonrise, and Moonset times.
- **30-Day Phase Calendar** — Visual strip of tiny moon phase icons for the surrounding month.
- **Scientific Methodology** (bottom) — Pro-level section with:
  - **Yallop (1997) Criterion** explanation and formula
  - **Interactive Threshold Curve** (Recharts) — ARCV vs Crescent Width with Zone A/C boundaries
  - **Danjon Limit** physics (elongation < 7° is physically impossible)
  - **Atmospheric Refraction** notes

## 4. Hijri Calendar (`/calendar`)

- View the current Gregorian month mapped against Hijri dates.
- The Hijri dates are computed using an **astronomical conjunction-based algorithm** powered by SunCalc, which finds the actual new moon for each month boundary. This is accurate to ±1 day of the official Umm al-Qura calendar used in Saudi Arabia.
- Highlights significant upcoming events (Ramadan, Eid al-Fitr, Eid al-Adha, Ashura, Mawlid).
- Each day shows a small moon phase icon.

## 5. Horizon View (`/horizon`)

- Input your city and see exactly where the moon sits on the horizon relative to the setting sun.
- **Detect My Location** button uses the browser Geolocation API to auto-fill your GPS coordinates, with reverse-geocoding via Nominatim to display a human-readable location name.
- Custom latitude/longitude input for precise positioning.

## 6. Archive (`/archive`)

- Historical crescent visibility data and maps (1438–1465 AH).

---

## 🔍 SEO

Every page sets a dynamic `document.title` for better search engine discoverability. Titles include the page name and the Hilal Vision brand.

---

## 📡 Crowdsourcing Sighting Reports

### How to Submit a Report
1. Click the golden **"Report Sighting" (+)** button in the navigation bar.
2. Click **"Auto-detect Location"** to grab your GPS coordinates.
3. Set the **Observation Time** precisely.
4. Select your result:
   - **Seen with Naked Eye** — Clear sighting without instruments.
   - **Seen with Optical Aid** — Required binoculars/telescope.
   - **Attempted, Not Seen** — This negative data is equally valuable for refining models.
5. Add optional **Notes** (max 1000 characters).
6. Click **Submit Sighting**.

### What Happens Behind the Scenes
- **Rate Limiting** — The server enforces a limit of 5 submissions per minute per IP to prevent abuse.
- **Input Validation** — All fields are validated with strict Zod schemas (coordinate bounds, temperature ranges, etc.).
- **Meteorological Enrichment** — The backend automatically contacts **Open-Meteo** APIs to fetch live Cloud Cover, Surface Pressure, and Aerosol Optical Depth at your exact coordinates, storing this data alongside your report.
- **Paginated Retrieval** — Observation queries support limit/offset pagination (default 50 results).
