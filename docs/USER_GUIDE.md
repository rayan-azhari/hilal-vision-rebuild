# Hilal Vision User Guide

Welcome to **Hilal Vision**, a precision astronomical platform designed for predicting, tracking, and crowdsourcing Islamic crescent moon sightings worldwide. This guide walks you through every feature.

## Navigation

The top navigation bar provides access to all views and includes:
- **Global Date & Location Pickers** (Search any city or Auto-Detect GPS. Syncs across all map and dashboard views)
- **Theme Toggle** (Light/Dark mode)
- **Report Sighting** button (golden `+` icon)
- **Account Settings** / Sign In (Clerk authentication)

---

## 1. Home Dashboard (`/`)

Your command center for at-a-glance astronomical data.
- **Ephemeris Cards** - Sunrise time, sighting probability, current Hijri date, and more.
- **Expandable Deep-Dives** - Cards with a subtle gold glow open into detailed scientific overlays when clicked.

## 2. Visibility (`/visibility`)

A **unified page** with a floating toggle to switch between **3D Globe** and **2D Map** views. All controls are fully synchronized - changing the date, hour offset, or location on one view carries over instantly to the other.

### Shared Controls (Both Views & Global Navbar)
- **Global Date Picker** (in Navbar) - Select any Gregorian date to instantly update the map, globe, and moon phases.
- **Global Location Selector** (in Navbar) - Dynamically search any world city via Open-Meteo geocoding, or use **Auto-Detect GPS** to fly to your current position.
- **Hour Offset Slider** (in Map/Globe Sidebars) - Slide ±24 hours to see visibility evolve over time for the currently selected global date.

### 3D Globe View
- Interactive Globe.gl sphere with day/night terminator.
- Smooth Gaussian-blurred visibility zone overlay mapped directly onto the sphere.
- **Cloud Cover Overlay** - Real-time cloud cover from Open-Meteo rendered as a translucent sphere above the visibility layer. Toggle on/off with the "Clouds" button.
- Play/Pause auto-rotation and toggle the visibility overlay on/off.
- **Best Time to Observe** card - Shows the optimal crescent viewing time, observation window, and moon/sun altitudes.
- Sidebar shows live astronomical data for the selected city: Moon altitude, azimuth, elongation, ARCV, crescent width, Yallop q-value, illumination, sunset, and moonset times.

### 2D Map View
- Leaflet map with dark/light CARTO basemaps.
- Web Mercator–projected visibility heatmap with smooth Gaussian-blurred zone boundaries.
- **Cloud Cover Overlay** - Open-Meteo cloud data rendered as a semi-transparent layer over the map. Toggle independently from visibility using the "Cloud Cover" switch in Map Controls.
- **Best Time to Observe** card - Automatically calculates the optimal observation window (sunset → moonset) and displays it in the sidebar.
- **Click anywhere** on the map to inspect the visibility zone for that exact coordinate.
- Crowdsourced sighting pins: 🟢 Naked Eye, 🔵 Optical Aid, ⚪ Not Seen.
- Resolution selector: Fine (2°), Normal (4°), or Fast (6°).

## 3. Moon Phase (`/moon`)

A dedicated dashboard for the lunar cycle.
- **Location & Date Settings** - Exact same geocoding and synchronized date offsets as the Visibility map.
- **Sun & Moon Altitude Tracker** (top of page) - Interactive linear chart plotting Sun and Moon altitudes throughout the day.
- **The Sky Dome** - Integrated custom SVG polar stereographic projection mapping azimuth and altitude simultaneously to show physical separation of celestial bodies.
- **Moon Illustration** - Accurate SVG rendering of the current phase with craters and terminator.
- **Stats Grid** - Illumination, Lunar Age, Visibility Zone, Moon Altitude, Elongation, Next New Moon countdown.
- **Ephemeris** - Sunrise, Sunset, Moonrise, and Moonset times.
- **30-Day Phase Calendar** - Visual strip of tiny moon phase icons for the surrounding month.
- **Scientific Methodology** (bottom) - Pro-level section with:
  - **Yallop (1997) Criterion** explanation and formula
  - **Interactive Threshold Curve** (Recharts) - ARCV vs Crescent Width with Zone A/C boundaries
  - **Danjon Limit** physics (elongation < 7° is physically impossible)
  - **Atmospheric Refraction** notes

## 4. Hijri Calendar (`/calendar`)

- View the current Gregorian month mapped against Hijri dates.
- **Triple-Engine Calendar**: Choose between three distinct calculation algorithms:
  - **Astronomical (SunCalc)**: Conjunction-based algorithm finding the actual physical new moon.
  - **Umm al-Qura**: The official civic Saudi Arabian calendar powered by KACST tables.
  - **Tabular (Kuwaiti)**: The standard arithmetic approximation.
- **Compare to Heavens**: A visual overlay highlighting instances where civic calendar systems diverge from true astronomical reality.
- Highlights significant upcoming events (Ramadan, Eid al-Fitr, Eid al-Adha, Ashura, Mawlid).
- Each day shows a small moon phase icon.

## 5. Horizon View (`/horizon`)

- Input your city and see exactly where the moon sits on the horizon relative to the setting sun.
- **Detect My Location** button uses the browser Geolocation API to auto-fill your GPS coordinates, with reverse-geocoding via Nominatim to display a human-readable location name.
- Custom latitude/longitude input for precise positioning.

## 6. Archive (`/archive`)

- Explore authentic historical crescent visibility data featuring 1,000+ real sighting records scraped from the Islamic Crescents' Observation Project (ICOP) spanning 1438–1465 AH.
- Sightings are overlaid on theoretical algorithms (Yallop/Odeh) providing a real-world verifiable dashboard of moon crescent visibility.

---

## 🔍 SEO

Every page sets a dynamic `document.title` for better search engine discoverability. Titles include the page name and the Hilal Vision brand.

---

## 📡 Crowdsourcing Sighting Reports

### How to Submit a Report
1. **Sign In** using the Clerk widget in the navigation bar. Unauthenticated users cannot submit reports.
2. Click the golden **"Report Sighting" (+)** button.
3. Click **"Auto-detect Location"** to grab your GPS coordinates.
3. Set the **Observation Time** precisely.
4. Select your result:
   - **Seen with Naked Eye** - Clear sighting without instruments.
   - **Seen with Optical Aid** - Required binoculars/telescope.
   - **Attempted, Not Seen** - This negative data is equally valuable for refining models.
5. Add optional **Notes** (max 1000 characters).
6. Click **Submit Sighting**.

### What Happens Behind the Scenes
- **Authentication** - Clerk ensures bots don't pollute the data.
- **Rate Limiting** - The server enforces a limit of 5 submissions per minute per IP using an Upstash Redis global database to prevent DDoS attacks.
- **Smart Validation** - The system algorithmically calculates the sun & moon geometric position at the precise time of sighting. If you claim to see the moon when it is physically below the horizon (Zone F), the mathematical engine rejects the payload immediately.
- **Input Bounds** - All fields are validated with strict Zod schemas (coordinate bounds, temperature ranges, etc.).
- **Meteorological Enrichment** - The backend automatically contacts **Open-Meteo** APIs to fetch live Cloud Cover, Surface Pressure, and Aerosol Optical Depth at your exact coordinates, storing this data alongside your report.
- **Paginated Retrieval** - Observation queries support limit/offset pagination (default 50 results).

---

## 7. About (`/about`)

Hilal Vision's mission and background page.

- **Mission statement** - Why this platform exists and who it is for.
- **Platform tools** - Clickable overview of all six tools (Globe, Map, Moon, Calendar, Horizon, Archive).
- **How We Compare** - Feature comparison table against Moonsighting.com, IslamicFinder, LuneSighting, and HilalMap, showing Hilal Vision's unique combination of 3D globe, weather overlay, ICOP data, and Best-Time calculator.
- **Technology** - Brief overview of the tech stack (React, SunCalc, Globe.gl, tRPC, Clerk, Capacitor, etc.).
- **Data Sources & Attributions** - Linked credits for Yallop 1997, Odeh 2004, ICOP, SunCalc, Umm al-Qura tables, and Open-Meteo.
- **Open Source / MIT License** - GitHub link and license information.

## 8. Methodology (`/methodology`)

A full technical reference for scientists, Islamic calendar scholars, and astronomers.

- **Table of Contents sidebar** (desktop) - Anchored navigation to all sections.
- **The Crescent Visibility Problem** - Why bi-parametric criteria are necessary; limits of age/lag-time models.
- **Yallop (1997) Criterion** - Complete q-value formula, crescent width derivation (SD, elongation), and zone classification table (A–F).
- **Odeh (2004) Criterion** - V-value formula and four-zone classification table.
- **Triple-Engine Hijri Calendar** - Astronomical (SunCalc conjunction search), Umm al-Qura (KACST tables), and Tabular (Kuwaiti Julian Date) engines explained.
- **Best-Time-to-Observe Calculator** - 5-minute scanning algorithm, darkness/altitude scoring formula.
- **World Visibility Grid** - Resolution levels (8°/4°/2°), Web Worker offloading, texture caching.
- **ICOP Archive** - How 1,000+ records were sourced and how theory and observation are compared.
- **Crowdsourced Telemetry & Validation** - Zone F rejection, Upstash rate limiting, Open-Meteo enrichment.
- **Atmospheric Refraction** - Saemundsson formula with temperature and pressure correction.
- **References** - Yallop 1997, Odeh 2004, Meeus, SunCalc, ICOP, Umm al-Qura.

## 9. Privacy Policy (`/privacy`)

Covers what data Hilal Vision collects (GPS, Clerk account, sighting reports, Sentry error logs), third-party sub-processors (Clerk, Upstash, Sentry, Open-Meteo, Vercel), cookie usage, data retention periods, and your GDPR/UK DPA/CCPA rights (access, correction, deletion, export).

## 10. Terms of Service (`/terms`)

Covers acceptable use of the platform (no false sighting reports, no DDoS), user-generated content policy, accuracy disclaimer (predictions ≠ religious rulings), MIT License notice, limitation of liability, and governing law.

