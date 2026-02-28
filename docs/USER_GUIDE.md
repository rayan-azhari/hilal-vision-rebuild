# Hilal Vision User Guide

Welcome to **Hilal Vision**, a precision astronomical platform designed for predicting, tracking, and crowdsourcing Islamic crescent moon sightings worldwide. This guide walks you through every feature.

## Navigation

The top navigation bar provides access to all views and includes:
- **Global Date & Location Pickers** (Search any city or Auto-Detect GPS. Syncs across all map and dashboard views)
- **High Contrast Toggle** (Color-blind friendly accessible palette for visibility zones)
- **Theme Toggle** (Light/Dark mode)
- **Report Sighting** button (golden `+` icon) - Submit crowdsourced telemetry and earn Observer Badges (Novice to Master).
- **Account Settings** / Sign In (Clerk authentication)

---

## 1. Home Dashboard (`/`)

Your command center for at-a-glance astronomical data.
- **Quick Links** - Primary buttons direct you straight to the core `Visibility Map` and `Moon Phases` tools.
- **Live Status** - Four persistent cards displaying real-time UTC Time, current Moon Phase & Illumination, today's Hijri Date (Astronomical/Civic), and the Lunar Age with a countdown to the next New Moon.

## 2. Visibility (`/visibility`)

A **unified page** with a floating toggle to switch between **3D Globe** and **2D Map** views. All controls are fully synchronized - changing the date, hour offset, or location on one view carries over instantly to the other.

### Shared Controls (Both Views & Global Navbar)
- **Global Date Picker** (in Navbar) - Select any Gregorian date to instantly update the map, globe, and moon phases.
- **Global Location Selector** (in Navbar) - Dynamically search any world city via Open-Meteo geocoding, or use **Auto-Detect GPS** to fly to your current position.
- **Visibility Criterion Switch** (in Map/Globe Sidebars) - Toggle the classification engine between the traditional Yallop (1997) criterion and the modern Odeh (2004) criterion to evaluate overlapping constraints.
- **Hour Offset Slider** (in Map/Globe Sidebars) - Slide ±24 hours to see visibility evolve over time for the currently selected global date.

### 3D Globe View
- Interactive Globe.gl sphere with day/night terminator.
- Smooth Gaussian-blurred visibility zone overlay mapped directly onto the sphere.
- **Cloud Cover Overlay** - Real-time cloud cover from Open-Meteo rendered as a translucent sphere above the visibility layer, geographically aligned with the earth texture. Toggle on/off with the "Clouds" button.
- Play/Pause auto-rotation and toggle the visibility overlay on/off.
- **Best Time to Observe** card - Shows the optimal crescent viewing time, observation window, and moon/sun altitudes. Accounts for the observer's specific topographical elevation.
- Sidebar shows live astronomical data for the selected city: Moon altitude, azimuth, elongation, ARCV, crescent width, Yallop q-value or Odeh V-value, illumination, sunset, and moonset times.

### 2D Map View
- Leaflet map with dark/light CARTO basemaps.
- Web Mercator–projected visibility heatmap with smooth Gaussian-blurred zone boundaries. (Supports perceptual High Contrast mode dynamically).
- **Cloud Cover Overlay** - Open-Meteo cloud data rendered as a Mercator-projected semi-transparent layer over the map, geographically aligned with the 3D globe view. Toggle independently from visibility using the "Cloud Cover" switch in Map Controls.
- **Best Time to Observe** card - Automatically calculates the optimal observation window (sunset → moonset), displaying local altitude parameters including Topographical Elevation.
- **Atmospheric Overrides** - Collapsible panel for manual or auto-fetched temperature (°C), pressure (hPa), and elevation (m) overrides. Toggle "Auto-fetch" to pull real-time atmospheric data from Open-Meteo's weather API based on the selected location. These corrections refine the refraction model for observatory-grade accuracy.
- **GPS Native Altitude** - The auto-detect location feature now pulls hardware altitude (`coords.altitude`) directly from your mobile device's GPS chip when available, providing true terrestrial precision before falling back to DEM APIs.
- **DEM Integration** - Clicking any point automatically fetches the real terrain elevation from the Open-Meteo Elevation API (Digital Elevation Model). This elevation is used to compute accurate horizon dip corrections and is displayed in the click tooltip.
- **Enhanced Click Tooltips** - Click anywhere on the map to see a detailed popup with: visibility zone, q-value breakdown, moon age, altitude, azimuth, elongation, crescent width, and the DEM-sourced local terrain elevation.
- Crowdsourced sighting pins: 🟢 Naked Eye, 🔵 Optical Aid, ⚪ Not Seen.
- Resolution selector: Fine (2°), Normal (4°), or Fast (6°).
- **Mobile Touch Accessibility** - All controls, selectors, and checkboxes adhere to strict mobile spacing rules (minimum 44px) for comfortable use on smartphones.

## 3. Moon Phase (`/moon`)

A dedicated dashboard for the lunar cycle.
- **Location & Date Settings** - Exact same geocoding and synchronized date offsets as the Visibility map.
- **Sun & Moon Altitude Tracker** *(Free)* (top of page) - Interactive linear chart plotting Sun and Moon altitudes throughout the day.
- **The Sky Dome** *(Pro)* - Integrated custom SVG polar stereographic projection mapping azimuth and altitude. Both the Altitude Tracker and Sky Dome share a deeply synchronized time slider—changing one instantly updates the other for perfect alignment.
- **Moon Illustration** - Accurate SVG rendering of the current phase with craters and terminator.
- **Stats Grid** - Illumination, Lunar Age, Visibility Zone, Moon Altitude, Elongation, Next New Moon countdown with **exact conjunction time** displayed to the second.
- **Ephemeris** *(Pro)* - Sunrise, Sunset, Moonrise, and Moonset times.
- **30-Day Phase Calendar** - Visual strip of tiny moon phase icons for the surrounding month.
- **Scientific Methodology** (bottom) - Pro-level section with:
  - **Yallop (1997) Criterion** explanation and formula
  - **Interactive Threshold Curve** (Recharts) - ARCV vs Crescent Width with Zone A/C boundaries
  - **Danjon Limit** physics (elongation < 7° is physically impossible)
  - **Atmospheric Refraction** notes

## 4. Hijri Calendar (`/calendar`)

- View the current Gregorian month mapped against Hijri dates.
- **Triple-Engine Calendar**: Choose between three distinct calculation algorithms:
  - **Astronomical (astronomy-engine)**: Conjunction-based algorithm finding the actual physical new moon.
  - **Umm al-Qura**: The official civic Saudi Arabian calendar powered by KACST tables.
  - **Tabular (Kuwaiti)**: The standard arithmetic approximation.

- Highlights significant upcoming events (Ramadan, Eid al-Fitr, Eid al-Adha, Ashura, Mawlid).
- Each day shows a small moon phase icon.

## 5. Horizon View (`/horizon`)

- Input your city and see exactly where the moon sits on the horizon relative to the setting sun.
- **Detect My Location** button uses the browser Geolocation API to auto-fill your GPS coordinates, with reverse-geocoding via Nominatim to display a human-readable location name.
- Custom latitude/longitude input for precise positioning.

## 6. Archive (`/archive`)

- Explore authentic historical crescent visibility data featuring 1,000+ real sighting records scraped from the Islamic Crescents' Observation Project (ICOP) spanning 1438–1465 AH.
- Sightings are overlaid on theoretical algorithms (Yallop/Odeh) providing a real-world verifiable dashboard of moon crescent visibility.
- **Data Export** - Download buttons for both ICOP observation data and computed visibility tables:
  - **CSV Export** - One-click download of tabular data (City, Country, Result, Optical Aid or City, Country, Zone, Q-Value).
  - **JSON Export** - Full structured data download for programmatic analysis.

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
6. **Attach a Photo** (optional) - The image is securely uploaded to our cloud storage backend to provide verifying photographic evidence on the visibility map. If the image contains EXIF metadata (GPS coordinates, camera model, timestamp), these fields are automatically extracted and pre-filled into the form.
7. Click **Submit Sighting**.

### What Happens Behind the Scenes
- **Authentication** - Clerk ensures bots don't pollute the data.
- **Rate Limiting** - The server enforces a limit of 5 submissions per minute per IP using a lazily-initialized Upstash Redis global database to prevent DDoS attacks (gracefully degrades if Redis is temporarily unavailable).
- **Smart Validation** - The system algorithmically calculates the sun & moon geometric position at the precise time of sighting. If you claim to see the moon when it is physically below the horizon (Zone F), the mathematical engine rejects the payload immediately.
- **Input Bounds** - All fields are validated with strict Zod schemas (coordinate bounds, temperature ranges, etc.).
- **Meteorological Enrichment** - The backend automatically contacts **Open-Meteo** APIs to fetch live Cloud Cover, Surface Pressure, and Aerosol Optical Depth at your exact coordinates, storing this data alongside your report.
- **Paginated Retrieval** - Observation queries support limit/offset pagination (default 50 results).
- **Sighting Feed Export** - The Live Sighting Feed widget includes a Download button (⬇) with options to export all visible reports as CSV or JSON for offline analysis.

---

## 7. About (`/about`)

Hilal Vision's mission and background page.

- **Mission statement** - Why this platform exists and who it is for.
- **Platform tools** - Clickable overview of all six tools (Globe, Map, Moon, Calendar, Horizon, Archive).
- **How We Compare** - Feature comparison table against Moonsighting.com, IslamicFinder, LuneSighting, and HilalMap, showing Hilal Vision's unique combination of 3D globe, weather overlay, ICOP data, and Best-Time calculator.
- **Technology** - Brief overview of the tech stack (React, astronomy-engine, Globe.gl, tRPC, Clerk, Capacitor, etc.).
- **Data Sources & Attributions** - Linked credits for Yallop 1997, Odeh 2004, ICOP, astronomy-engine, Umm al-Qura tables, and Open-Meteo.
- **Proprietary Software** - License information.

## 8. Methodology (`/methodology`)

A full technical reference for scientists, Islamic calendar scholars, and astronomers.

- **Table of Contents sidebar** (desktop) - Anchored navigation to all sections.
- **The Crescent Visibility Problem** - Why bi-parametric criteria are necessary; limits of age/lag-time models.
- **Yallop (1997) Criterion** - Complete q-value formula, crescent width derivation (SD, elongation), and zone classification table (A–F).
- **Odeh (2004) Criterion** - V-value formula and four-zone classification table.
- **Triple-Engine Hijri Calendar** - Astronomical (astronomy-engine conjunction search), Umm al-Qura (KACST tables), and Tabular (Kuwaiti Julian Date) engines explained.
- **Best-Time-to-Observe Calculator** - 5-minute scanning algorithm, darkness/altitude scoring formula.
- **World Visibility Grid** - Resolution levels (8°/4°/2°), Web Worker offloading, texture caching.
- **ICOP Archive** - How 1,000+ records were sourced and how theory and observation are compared.
- **Crowdsourced Telemetry & Validation** - Zone F rejection, Upstash rate limiting, Open-Meteo enrichment.
- **Atmospheric Refraction** - Saemundsson formula with temperature and pressure correction.
- **References** - Yallop 1997, Odeh 2004, Meeus, astronomy-engine, ICOP, Umm al-Qura.

## 9. Privacy Policy (`/privacy`)

Covers what data Hilal Vision collects (GPS, Clerk account, sighting reports, Sentry error logs), third-party sub-processors (Clerk, Upstash, Sentry, Open-Meteo, Vercel), cookie usage, data retention periods, and your GDPR/UK DPA/CCPA rights (access, correction, deletion, export).

## 10. Terms of Service (`/terms`)

Covers acceptable use of the platform (no false sighting reports, no DDoS), user-generated content policy, accuracy disclaimer (predictions ≠ religious rulings), All Rights Reserved notice, limitation of liability, and governing law.

## 11. Support (`/support`)

Hilal Vision's goodwill and monetization page, framed around the Islamic concept of **Sadaqah Jariyah** (صدقة جارية — ongoing charity).

- **Hero** - Mission-driven messaging with CTA buttons for Pro upgrade and one-time donation.
- **Why Your Support Matters** - Three pillars: Keep It Running (server costs), Keep It Accurate (calibration), Keep It Ad-Free.
- **Feature Access Matrix** - Full comparison table of 13 features across Free and Pro tiers:
  - **Free**: 2D Map, Moon Phase basics, Umm al-Qura calendar, recent ICOP archive (1463-1465 AH), Horizon View, Sighting Reports.
  - **Pro**: 3D Globe, Sky Dome, Ephemeris, Astronomical & Tabular calendar engines, full ICOP archive (1438-1465 AH), Push Notifications, Ad-free.
- **Pricing Plans** - Three tiers: Monthly ($2.99), Annual ($14.99, "Most Popular"), Lifetime ($49.99).
- **One-Time Donation** - Preset amounts ($5, $10, $25, $50). Donors of $10+ receive a **Golden Crescent** Patron badge on their sighting reports. *(Note: Due to Apple/Google IAP charity policies, one-time donations are only available on the Web platform).*

> **Billing Architecture:** Upgrading to Pro uses a split platform approach. On the web, payments are securely processed via **Stripe**. On native mobile apps, transactions use native Apple App Store or Google Play **In-App Purchases** via RevenueCat. Regardless of where you subscribe, your Pro status synchronizes across all devices via your Clerk account.

## 12. Pro Tier & Feature Gating

Hilal Vision uses a **soft paywall** model: all features are visible from Day 1, but deeper interaction requires a Pro subscription.

### How It Works
- `ProTierContext` manages premium status (`isPremium`) and modal visibility.
- `<ProGate>` wraps gated content with a blurred preview and "Upgrade to Pro" prompt for free users.
- `UpgradeModal` presents the three pricing plans.
- The **Pro badge** in the navbar is only visible to users with an active Pro subscription or admin status. It no longer functions as a development toggle in production (`TESTING_DISABLE_PRO_GATE = false`).

### Gated Features by Page
| Page | Gated Feature | Free Default |
|------|--------------|---------------|
| Visibility (Globe + Map) | 3D Globe | 2D Map (always free) |
| Visibility (Globe + Map) | Cloud Cover Overlay | Toggle visible, locked on click |
| Visibility (Globe + Map) | Atmospheric Overrides (Temp/Pressure) | Blurred ProGate overlay |
| Visibility (Globe + Map) | Best Time to Observe | Blurred ProGate overlay |
| Moon Phase | Sky Dome, Ephemeris | Altitude Chart (free) + basic illumination, age, phase |
| Calendar | Astronomical & Tabular engines | Umm al-Qura only |
| Archive | Years before 1463 AH | 1463-1465 AH (3 most recent) |

## 13. Push Notifications *(Pro Feature)*

Hilal Vision can send you push notifications for important lunar events.

### Enabling Notifications

1. Sign in and upgrade to Pro.
2. Open **Account Settings** (top-right) and enable **Moon Alerts**.
3. Your browser or device will prompt for notification permission — click **Allow**.
4. Your device is now registered. Notifications will arrive automatically.

### Alert Types

| Alert | When sent |
|---|---|
| **Crescent Watch** | Every 29th Hijri night — reminder to look for the new crescent |
| **Full Moon** | Night of the full moon |
| **Blue Moon** | When a second full moon occurs in a single Gregorian month |
| **Lunar Eclipse** | Total, partial, or penumbral eclipse alert |

Alerts are sent daily at **08:00 UTC** via Firebase Cloud Messaging.

### Disabling Notifications

Go to **Account Settings** → toggle **Moon Alerts** off. Your device token is removed immediately and no further alerts will be sent.

> **Platform note:** Push notifications work on web (browsers supporting the Web Push API) and on the native iOS/Android apps. Safari on iOS requires iOS 16.4+ and the app must be added to the Home Screen as a Web App.

---

## 14. Public REST API

Hilal Vision exposes a programmatic REST API for external integrations and developers:

### Endpoints

| Endpoint | Method | Parameters | Description |
|----------|--------|------------|-------------|
| `/api/v1/visibility` | GET | `lat`, `lng`, `date` (ISO) | Returns the crescent visibility zone (A-F), q-value, and key lunar parameters for the specified location and date. |
| `/api/v1/moon-phases` | GET | `date` (ISO) | Returns moon phase data including illumination, age, altitude, azimuth, and exact next New Moon / Full Moon conjunction times. |

All parameters are validated with Zod schemas. Invalid or out-of-range inputs return structured HTTP 400 error responses.

For full schemas, `curl` integration examples, and detailed JSON response breakdowns, please see the [**Public API Reference Guide**](PUBLIC_API_REFERENCE.md).

## 15. Atmospheric Overrides & DEM *(Pro Feature)*

Both the 2D Map and 3D Globe pages feature an **Atmospheric Overrides** panel. This panel is gated behind the Pro tier — free users see a blurred preview with an upgrade prompt.

- **Temperature** (°C) - Adjusts atmospheric refraction. Standard: 10°C.
- **Pressure** (hPa) - Adjusts atmospheric refraction. Standard: 1010 hPa.
- **Elevation** (m) - Adjusts theoretical horizon dip via `1.76 × √elevation`.
- **Auto-fetch Toggle** - When enabled, real-time temperature, pressure, and elevation are fetched from Open-Meteo's weather and elevation APIs for the currently selected location.

The refraction correction formula applied is:
```
R_true = R_standard × (P / 1010) × (283 / (273 + T))
```
This delta is applied to both sun and moon altitude calculations, providing observatory-grade accuracy for near-horizon crescent visibility predictions.

---

*Last updated: February 28, 2026 (Round 40 — all phases complete)*
