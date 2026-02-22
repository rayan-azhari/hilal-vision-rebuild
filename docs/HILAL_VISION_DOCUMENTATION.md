# Hilal Vision — Full Application Documentation

**Version:** Round 14 (current)
**Stack:** React 19 + TypeScript + Tailwind 4 + tRPC 11 + Express 4 + MySQL (Drizzle ORM)
**Deployment:** Vercel (static frontend + serverless tRPC API)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Design System](#3-design-system)
4. [Global State Management](#4-global-state-management)
5. [Astronomy Engine](#5-astronomy-engine)
6. [Pages and Features](#6-pages-and-features)
7. [Performance Architecture](#7-performance-architecture)
8. [Database and Backend](#8-database-and-backend)
9. [Testing](#9-testing)
10. [Development History](#10-development-history)
11. [Planned: Round 10 Design Overhaul](#11-planned-round-10-design-overhaul)

---

## 1. Project Overview

Hilal Vision is a precision astronomical web application for predicting and visualising Islamic crescent moon (hilal) sightings worldwide. The application is built for two audiences: the general Muslim public who want to know whether the crescent will be visible from their location on a given evening, and professional astronomers and Islamic calendar scholars who need detailed technical data about moon visibility criteria, conjunction times, and calendar comparisons.

The application's core purpose is to answer the question: **"Will the new crescent moon be visible tonight from my location?"** — and to present the answer with the scientific rigour and visual clarity that the question deserves. Islamic calendar months begin with the sighting of the new crescent moon, making this question of direct religious and practical significance for over 1.8 billion Muslims worldwide.

The application is named after the Arabic word *hilal* (هلال), which specifically refers to the new crescent moon — the thin sliver of illuminated moon visible in the western sky shortly after sunset on the first evening of a new lunar month.

---

## 2. Architecture

### 2.1 Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend framework | React | 19.2.1 |
| Language | TypeScript | 5.9.3 |
| Styling | Tailwind CSS | 4.1.14 |
| Component library | shadcn/ui (Radix UI) | Various |
| Routing | Wouter | 3.7.1 |
| API layer | tRPC | 11.6.0 |
| Server | Express | 4.21.2 |
| Database ORM | Drizzle ORM | 0.44.5 |
| Database | MySQL (TiDB) | — |
| Build tool | Vite | 7.1.7 |
| Test runner | Vitest | 2.1.4 |
| Package manager | pnpm | 10.4.1 |

### 2.2 Key Frontend Libraries

The application uses several specialised libraries beyond the core stack. **SunCalc** (`suncalc@1.9.0`) provides the foundational sun and moon position calculations. **globe.gl** (`globe.gl@2.45.0`) renders the interactive 3D globe using WebGL via Three.js. **Leaflet** (`leaflet@1.9.4`) with **react-leaflet** provides the flat 2D world map. **D3** (`d3@7.9.0`) is available for custom data visualisations. **Recharts** (`recharts@2.15.2`) renders the sun/moon altitude charts. **Framer Motion** (`framer-motion@12.23.22`) handles page transitions and micro-animations. **Three.js** (`three@0.183.0`) is used directly for the custom visibility overlay mesh on the globe.

### 2.3 File Structure

```
hilal-vision/
├── client/
│   ├── src/
│   │   ├── pages/          ← 10 page components
│   │   ├── components/     ← Shared UI components
│   │   ├── contexts/       ← React contexts (Location, ProMode, Theme)
│   │   ├── hooks/          ← Custom hooks (useVisibilityTexture, useGeolocation)
│   │   ├── lib/
│   │   │   ├── astronomy.ts    ← Core calculation engine
│   │   │   └── ummalqura.ts    ← Umm al-Qura calendar engine
│   │   ├── App.tsx         ← Routes and providers
│   │   ├── main.tsx        ← Entry point
│   │   └── index.css       ← Global design system
│   └── public/             ← Static assets
├── server/
│   ├── routers.ts          ← tRPC procedures
│   ├── db.ts               ← Database query helpers
│   └── _core/              ← Framework plumbing (OAuth, tRPC, etc.)
├── drizzle/
│   └── schema.ts           ← Database schema
├── shared/
│   └── types.ts            ← Shared TypeScript types
├── api/
│   └── trpc/[trpc].ts      ← Vercel serverless tRPC handler
├── vercel.json             ← Vercel deployment configuration
├── todo.md                 ← Feature tracking
└── DOCUMENTATION.md        ← This file
```

### 2.4 Routing

The application uses Wouter for client-side routing. All routes are wrapped in a shared `Layout` component that provides the navigation header and footer. The route table is:

| Path | Component | Description |
|---|---|---|
| `/` | `Home` | Landing page with live status cards and feature navigation |
| `/dashboard` | `DashboardPage` | Unified multi-panel desktop dashboard |
| `/globe` | `GlobePage` | Interactive 3D globe with visibility overlay |
| `/map` | `MapPage` | Flat world map with time-slider heatmap |
| `/moon` | `MoonPage` | Moon phase detail with altitude charts |
| `/calendar` | `CalendarPage` | Hijri calendar with Umm al-Qura comparison |
| `/horizon` | `HorizonPage` | Local horizon visibility simulator |
| `/archive` | `ArchivePage` | Historical visibility archive 1438–1465 AH |
| `/ramadan` | `RamadanPage` | Ramadan start predictor 1447–1456 AH |
| `/404` | `NotFound` | 404 error page |

---

## 3. Design System

### 3.1 Design Philosophy

Hilal Vision's design is inspired by two sources: the **NASA Daily Moon Guide** (deep navy gradients, large stat cards, immersive hero sections) and **Breezy Weather** (glassmorphism cards, generous whitespace, data-as-decoration visual elements). The result is a dark-mode-first application that feels like a scientific instrument — precise, data-rich, and visually compelling.

### 3.2 Colour Palette

The colour system is defined in `client/src/index.css` using OKLCH colour space, which provides perceptually uniform colour mixing and better gradient quality than HSL or RGB.

**Space palette (backgrounds):**

| Token | OKLCH Value | Approximate Hex | Usage |
|---|---|---|---|
| `--space` / `--background` | `oklch(0.06 0.02 265)` | `#0a0e1a` | Page background |
| `--space-deep` | `oklch(0.04 0.015 265)` | `#060810` | Deepest background |
| `--space-mid` / `--card` | `oklch(0.09 0.02 265)` | `#0f1420` | Card backgrounds |
| `--space-light` / `--secondary` | `oklch(0.13 0.025 265)` | `#161c2e` | Elevated surfaces |
| `--space-lighter` | `oklch(0.17 0.028 265)` | `#1e2540` | Hover states |
| `--space-surface` | `oklch(0.11 0.022 265)` | `#131828` | Surface variant |

**Gold palette (primary accent):**

| Token | OKLCH Value | Usage |
|---|---|---|
| `--gold` / `--primary` | `oklch(0.80 0.14 75)` | Primary actions, active nav, logo |
| `--gold-glow` | `oklch(0.88 0.16 75)` | Hover states, highlights |
| `--gold-dim` | `oklch(0.62 0.11 75)` | Secondary gold text |
| `--gold-subtle` | `oklch(0.50 0.08 75)` | Muted gold |
| `--gold-mist` | `oklch(0.40 0.06 75)` | Very subtle gold tint |

**Accent colours:**

| Token | OKLCH Value | Usage |
|---|---|---|
| `--celestial-blue` | `oklch(0.65 0.15 240)` | Globe, map accents |
| `--aurora-green` | `oklch(0.72 0.18 155)` | Zone A visibility |
| `--nebula-purple` | `oklch(0.55 0.18 300)` | Calendar accents |
| `--sunset-orange` | `oklch(0.70 0.18 50)` | Horizon page accents |

**Visibility zone colours:**

| Zone | OKLCH Value | Meaning |
|---|---|---|
| Zone A | `oklch(0.72 0.20 145)` | Easily visible — naked eye |
| Zone B | `oklch(0.85 0.18 90)` | Visible under good conditions |
| Zone C | `oklch(0.72 0.20 50)` | Optical aid helpful |
| Zone D | `oklch(0.60 0.22 25)` | Optical aid only |
| Zone E | `oklch(0.40 0.01 265)` | Not visible |

### 3.3 Typography

The application uses three typefaces, each serving a distinct purpose. **Inter** is the primary body font — a highly legible, neutral sans-serif used for all data values, descriptions, and UI text. **Cinzel** is the display serif font — a classical Roman letterform used for headings, the logo, and section titles. It evokes the historical and scholarly nature of Islamic calendar science. **Noto Naskh Arabic** is used for all Arabic text — Islamic month names, Quranic phrases, and Arabic numerals — ensuring correct rendering across all platforms.

The heading hierarchy uses Cinzel with `letter-spacing: 0.05em` and `line-height: 1.2`. Body text uses Inter with `line-height: 1.6` and `letter-spacing: 0.01em`. The combination of a classical serif for headings and a modern sans-serif for body creates a visual tension that feels both ancient and contemporary — appropriate for an application that bridges 7th-century Islamic calendar tradition with 21st-century astronomical computation.

### 3.4 Component Classes

The design system defines several reusable component classes in `index.css`:

**`.glass`** — A glassmorphism panel with `backdrop-filter: blur(20px)`, a semi-transparent dark background gradient, and a subtle gold border. Used for overlay panels and floating controls.

**`.glass-card`** — A more opaque glassmorphism card with `backdrop-filter: blur(16px)`, used for the live status cards on the home page and similar data display elements. Includes a hover state that brightens the gold border.

**`.card-elevated`** — A solid dark card without backdrop blur, used for content sections that do not sit over a complex background. Includes a subtle lift animation on hover (`translateY(-2px)`).

**`.glow-gold`**, **`.glow-gold-sm`**, **`.glow-gold-lg`** — Box shadow utilities that add a gold glow effect at different intensities. Used for the logo, primary buttons, and highlighted elements.

**`.star-field`** — A CSS background-image pattern using multiple `radial-gradient` stops to simulate a star field. Used as an overlay on the hero section and other dark backgrounds.

**`.gradient-text-gold`** — A gradient text effect using `-webkit-background-clip: text` to apply a gold gradient to heading text.

**`.section-divider`** — A 1px horizontal line with a gradient that fades from transparent to gold and back, used to separate major sections.

### 3.5 Background Gradient Utilities

Three pre-built background gradient utilities are available:

**`.bg-deep-space`** — A subtle 4-stop vertical gradient from near-black to slightly lighter navy, evoking the depth of space. Used as the default page background.

**`.bg-twilight`** — A warmer gradient with a slight blue-purple shift, evoking the sky at twilight. Used for the horizon page.

**`.bg-horizon-glow`** — A gradient that transitions from dark navy at the top to warm amber at the bottom, evoking the glow of a sunset horizon. Used for the horizon page hero section.

---

## 4. Global State Management

### 4.1 LocationContext

The `LocationContext` (`client/src/contexts/LocationContext.tsx`) provides a globally shared location state that persists across all pages and survives page refreshes via `localStorage`. The default location is **Mecca, Saudi Arabia** — the spiritual centre of Islam and the reference point for the Umm al-Qura calendar.

The context exposes: `location` (the current `CityLocation` object with `name`, `country`, `lat`, `lng`), `setLocation` (set to a city from the `MAJOR_CITIES` database), `setCustomLocation` (set to arbitrary coordinates), `nextEvent` (the nearest upcoming Islamic event), and `upcomingEvents` (all upcoming Islamic events sorted by proximity).

The Islamic event calculation covers Ramadan (1 Ramadan), Eid al-Fitr (1 Shawwal), and Eid al-Adha (10 Dhu al-Hijjah). Events are computed by converting the Hijri event date to Gregorian using the algorithmic Hijri calendar, checking the current year and the next two years to ensure a future event is always available, and sorting by days until the event. The computation runs hourly via `setInterval` to stay current.

### 4.2 ProModeContext

The `ProModeContext` (`client/src/contexts/ProModeContext.tsx`) provides a boolean `isPro` flag and a `togglePro` function. When Pro Mode is enabled, each page reveals additional technical data panels — extended orbital parameters, methodology explanations, q-value data tables, and physics annotations. The state persists via `localStorage` under the key `"hilal-pro-mode"`.

Pro Mode is designed for astronomers, Islamic calendar scholars, and technically sophisticated users who want access to the raw calculation parameters (ARCV, DAZ, W, q-value, Odeh criterion) rather than just the simplified visibility zone classification.

### 4.3 ThemeContext

The `ThemeContext` wraps the `next-themes` `ThemeProvider` with `defaultTheme="dark"`. The application is exclusively dark-themed; the context exists for future light mode support and for correct shadcn/ui component theming.

---

## 5. Astronomy Engine

The astronomy engine (`client/src/lib/astronomy.ts`) is the computational heart of Hilal Vision. It implements the two primary crescent visibility criteria used by Islamic calendar authorities worldwide, plus supporting calculations for the Hijri calendar, moon phases, and day/night terminator geometry.

### 5.1 Data Dependencies

All position calculations use the **SunCalc** library, which implements Jean Meeus's astronomical algorithms for sun and moon positions. SunCalc provides: sun altitude and azimuth at any time and location, moon altitude, azimuth, and distance at any time and location, moon illumination fraction and phase angle, and rise/set times for both sun and moon.

### 5.2 Yallop (1997) Criterion

The **Yallop criterion** is the primary visibility classification used throughout the application. It was developed by B.D. Yallop of HM Nautical Almanac Office in 1997 and is widely used by Islamic calendar authorities in the UK, Malaysia, and internationally.

The criterion computes a **q-value** from two inputs: the Arc of Vision (ARCV, the moon's altitude minus the sun's altitude at sunset) and the crescent width W (in arcminutes). The formula is:

```
q = (ARCV - (11.8371 - 6.3226·W + 0.7319·W² - 0.1018·W³)) / 10
```

The crescent width W is calculated from the moon's elongation (angular distance from the sun) and its distance from Earth:

```
SD = arcsin(1737.4 / moonDist) × 60   [semi-diameter in arcminutes]
W = SD × (1 - cos(elongation))
```

The q-value maps to visibility zones as follows:

| q-value Range | Zone | Interpretation |
|---|---|---|
| q ≥ +0.216 | A | Easily visible with naked eye |
| −0.014 ≤ q < +0.216 | B | Visible under perfect conditions |
| −0.160 ≤ q < −0.014 | C | May need optical aid (binoculars) |
| −0.232 ≤ q < −0.160 | D | Only visible with telescope |
| q < −0.232 | E | Not visible even with optical aid |
| Moon below horizon | F | Below horizon / not yet born |

### 5.3 Odeh (2004) Criterion

The **Odeh criterion** was developed by Mohammad Odeh in 2004 as a refinement of the Yallop criterion, incorporating a larger observational dataset. It computes a V-value using a slightly different polynomial:

```
V = ARCV - (−0.1018·W³ + 0.7319·W² − 6.3226·W + 7.1651)
```

The Odeh criterion is displayed in Pro Mode as an alternative classification, allowing scholars to compare the two methodologies for borderline cases.

### 5.4 Hijri Calendar Conversion

The application uses an **astronomical conjunction-based algorithm** for Gregorian-to-Hijri conversion. Instead of the older Kuwaiti arithmetic approximation, the converter uses SunCalc's `getMoonIllumination()` to find the actual new moon (conjunction) for each month boundary.

**Algorithm:**
1. A known epoch is established: **1 Muharram 1446 AH ≈ July 7, 2024** (conjunction date).
2. `findNewMoonNear()` searches for the phase minimum in two passes: a coarse 6-hour sweep (±15 days) followed by a fine 30-minute sweep (±6 hours).
3. New moon dates are cached in a `Map<number, Date>` keyed by month offset from the epoch, so each new moon is computed only once.
4. `gregorianToHijri()` estimates the month offset from the epoch, then checks adjacent months to find the one containing the target date.
5. The day within the month is simply `floor(days since month start) + 1`.

The conversion is accurate to ±1 day of the official **Umm al-Qura** calendar used in Saudi Arabia. The 1-day variance is inherent to the difference between astronomical conjunction and the actual crescent sighting that determines the official calendar.

The Kuwaiti arithmetic algorithm is retained as an internal fallback for dates far from the epoch.

### 5.5 World Visibility Grid

The `generateVisibilityGrid()` function computes crescent visibility for every grid point on Earth at a given resolution (default 4°, producing a 90×40 grid of 3,600 points). For each point, it calls `computeSunMoonAtSunset()` and records the visibility zone and q-value. This grid is the data source for both the 3D Globe overlay and the flat Map heatmap.

At 2° resolution (the high-quality pass), the grid has 14,400 points. At 8° resolution (the preview pass), it has 900 points. The computation is offloaded to a Web Worker to prevent blocking the main thread.

### 5.6 Day/Night Terminator

The `getTerminatorPoints()` function computes the day/night boundary (the terminator) by calculating the sub-solar point (the location where the sun is directly overhead) and then finding the great circle 90° from that point. The sub-solar point is computed from the solar declination and Greenwich Hour Angle using standard astronomical formulas. The terminator is returned as an array of 360 `[lng, lat]` points that can be used to draw the boundary on a map or globe.

### 5.7 Moon Phase Calculation

The `getMoonPhaseInfo()` function returns a complete moon phase description for any date. The phase value (0–1, where 0 = new moon, 0.5 = full moon) comes from SunCalc's `getMoonIllumination()`. The moon age in days is computed as `phase × 29.53058867`. The next new moon and next full moon are found by iterating forward in 12-hour steps until the phase value is within 0.02 of the target phase.

Phase names are provided in both English and Arabic, covering all 8 standard phases from New Moon (المحاق) through Waxing Crescent (الهلال المتزايد), First Quarter (التربيع الأول), Waxing Gibbous (الأحدب المتزايد), Full Moon (البدر), Waning Gibbous (الأحدب المتناقص), Last Quarter (التربيع الأخير), and Waning Crescent (الهلال المتناقص).

---

## 6. Pages and Features

### 6.1 Home Page (`/`)

The home page serves as both a landing page and a live status dashboard. It is structured in three sections.

The **hero section** occupies 94% of the viewport height. It features a radial gradient background with a star field overlay, three decorative orbit rings, and a floating animated SVG moon that renders the current phase with correct crescent geometry. The heading "Hilal Vision" uses the Cinzel serif font with a gradient text effect. Two call-to-action buttons link to the Dashboard and the 3D Globe.

The **live status cards** section shows four glassmorphism cards in a 2×2 (mobile) or 4×1 (desktop) grid: current UTC time (updating every second), current moon phase name and illumination, current Hijri date (tabular and Umm al-Qura), and the next new moon time and days remaining.

The **feature cards** section shows all seven application features in a responsive grid (1 column on mobile, 2 on tablet, 3–4 on desktop). Each card has a unique accent colour, an icon, an English title, an Arabic subtitle, and a description. Cards lift on hover with a coloured border glow matching the card's accent colour.

### 6.2 Dashboard Page (`/dashboard`)

The Dashboard is a unified desktop-optimised view that combines the most important elements from multiple pages into a single layout. It is intended for users who want a comprehensive overview without navigating between pages.

The layout uses a CSS grid with a large left panel (globe or map) and a right sidebar with stacked data cards. The dashboard includes: a compact 3D globe with the visibility overlay, the current moon phase illustration and key metrics, the Hijri date and next Islamic event countdown, and a summary of crescent visibility for the selected location.

### 6.3 3D Globe Page (`/globe`)

The Globe page is the most technically complex feature in the application. It renders an interactive 3D globe using `globe.gl` (a WebGL-based library built on Three.js) with several custom overlays.

The **visibility overlay** is a canvas texture computed by the `useVisibilityTexture` hook and applied to a custom Three.js `SphereGeometry` mesh added directly to the globe's scene. The texture uses a bilinear interpolation algorithm to produce smooth colour gradients between grid points rather than a stepped rectangular grid. The overlay uses semi-transparent RGBA colours for each visibility zone, allowing the Earth texture to show through.

The **day/night terminator overlay** is a second Three.js mesh that renders the night-side hemisphere as a dark semi-transparent overlay. The terminator boundary is computed from the sub-solar point using the `getTerminatorPoints()` function.

The globe supports: auto-rotation toggle, overlay opacity slider, date selection (any date), geolocation auto-detect, shareable URL encoding (date + location in query string), and a location pin for the selected city.

The **side panel** shows the full astronomical data readout for the selected location and date: sun altitude/azimuth, moon altitude/azimuth, elongation, ARCV, DAZ, crescent width W, q-value, Odeh criterion, visibility zone, illumination, moon age, and rise/set times. In Pro Mode, the panel expands to show additional physics explanations for each parameter.

### 6.4 Visibility Map Page (`/map`)

The Map page uses Leaflet with CartoDB dark tiles to render a flat 2D world map. The crescent visibility heatmap is rendered as a canvas overlay using bilinear interpolation between the grid points, producing a smooth gradient rather than the stepped rectangular grid of earlier versions.

The page features a **time slider** with 15-minute granularity covering ±24 hours from the selected date, an **animate button** that plays through the time range automatically, and a **resolution control** (2°/4°/6°) that trades computation time for grid density. Clicking any point on the map shows the visibility data for that location in a popup.

The map also supports geolocation auto-detect and shareable URLs. In Pro Mode, a methodology panel explains the Yallop and Odeh criteria in detail, and a contour label overlay shows the q-value contour lines.

### 6.5 Moon Phase Page (`/moon`)

The Moon Phase page provides a detailed view of the current lunar cycle. The hero section shows a large SVG moon illustration with correct phase geometry, the phase name in English and Arabic, illumination percentage, and moon age in days.

Below the hero, four stat cards show moonrise time, moonset time, sunrise time, and sunset time for the selected location. A **next new moon countdown** shows the exact time and days remaining until the next new moon.

The **30-day phase calendar strip** shows a horizontal scroll of 30 days, each with a small moon phase icon and the phase name. The selected day is highlighted.

The **sun/moon altitude chart** is a Recharts area chart showing the altitude of both the sun and moon over 24 hours (288 data points at 5-minute intervals). The sun area is filled with a warm amber gradient; the moon area is filled with a cool blue gradient. A vertical time slider allows the user to inspect the exact altitude of both bodies at any time of day. Rise and set times are marked with vertical dashed lines.

In Pro Mode, the page shows extended orbital data including libration (the apparent rocking of the moon), parallax, the equation of time, and the moon's distance from Earth.

### 6.6 Hijri Calendar Page (`/calendar`)

The Calendar page provides a comprehensive Hijri calendar with two parallel calendar systems displayed side by side.

The **tabular Hijri calendar** uses the Kuwaiti algorithmic conversion. The **Umm al-Qura calendar** uses the pre-computed KACST tables from the `ummalqura.ts` engine, covering Hijri years 1437–1465 AH (approximately 2015–2044 CE). Where the two systems disagree on a date (which happens roughly 30–40% of the time due to the difference between algorithmic and observational calendars), the discrepancy is highlighted with a visual indicator.

The page supports year navigation from 1438 to 1465 AH, month selection, and day selection with a moon phase indicator for each day. Islamic events (Ramadan, Eid al-Fitr, Eid al-Adha, Ashura, Mawlid, etc.) are marked on their respective dates.

In Pro Mode, the page shows conjunction times (the exact moment of new moon) and a lunar month length analysis showing the variation in month lengths over the selected year.

### 6.7 Local Horizon View Page (`/horizon`)

The Horizon page simulates the local sky at sunset from any location on Earth. It renders a canvas-based panoramic horizon view showing the silhouette of the landscape, the position of the setting sun, and the position of the crescent moon relative to the sun.

The canvas renders: a gradient sky background (transitioning from deep blue at the top through twilight colours to warm amber at the horizon), a stylised landscape silhouette, the sun disc at its computed azimuth and altitude, the moon disc at its computed position, a dashed arc showing the moon's path across the sky, and an ARCV line showing the angular separation between sun and moon.

The altitude and azimuth readout updates in real time as the user changes the location or date. A city dropdown and custom coordinate input allow precise location selection. A city search filter makes it easy to find any of the 50+ cities in the database.

In Pro Mode, the canvas adds atmosphere refraction annotations, ARCV/DAZ/W measurement lines with labels, and an explanation of how each parameter affects visibility.

### 6.8 Crescent Visibility Archive Page (`/archive`)

The Archive page provides a historical and future record of crescent visibility for every Islamic month from 1438 AH to 1465 AH (approximately 2016 to 2044 CE). For each month, the page shows a grid of major cities with their visibility zone for that month's crescent.

The page supports filtering by year and month. Each city cell is colour-coded by visibility zone (A–F). The visibility criteria legend is displayed at the bottom of the page.

In Pro Mode, the archive shows q-value data tables alongside the zone classifications, and a methodology comparison panel showing how the Yallop and Odeh criteria differ for each month.

### 6.9 Ramadan Start Predictor Page (`/ramadan`)

The Ramadan page predicts the start date of Ramadan for the next 10 years (1447–1456 AH, approximately 2025–2034 CE). For each year, it shows the predicted Gregorian date range (accounting for the ±1 day uncertainty of crescent sighting), the visibility zone for a selection of major cities, and a visual timeline.

The prediction is based on the Yallop criterion applied to the expected new moon for 1 Ramadan of each year. The city-by-city comparison shows how visibility varies geographically — a crescent that is Zone A (easily visible) in Mecca may be Zone C (optical aid needed) in London due to the different sun-moon geometry at different latitudes.

In Pro Mode, the page shows detailed conjunction times, elongation at sunset, and q-values for each city and year.

---

## 7. Performance Architecture

### 7.1 Web Worker Offloading

The visibility grid computation is the most computationally intensive operation in the application. At 2° resolution, it requires 14,400 calls to `computeSunMoonAtSunset()`, each involving trigonometric calculations for sun and moon positions. Running this on the main thread would block the UI for several seconds.

The `useVisibilityTexture` hook offloads this computation to a dedicated Web Worker. The worker receives the date and grid resolution, computes the visibility grid, renders it to a raw RGBA pixel buffer using bilinear interpolation, and returns the buffer to the main thread. The main thread converts the buffer to a PNG data URL using an off-screen canvas and applies it to the globe or map overlay.

### 7.2 Progressive Resolution

The visibility texture uses a two-pass progressive rendering strategy. Pass 1 runs at 8° resolution (900 grid points) and completes in approximately 100ms, providing an immediate preview. Pass 2 runs at 2° resolution (14,400 grid points) and completes in approximately 800ms, replacing the preview with the high-quality result. The `isRefining` state flag allows the UI to show a subtle indicator while the refinement pass is running.

### 7.3 Texture Caching

Computed textures are cached in a `Map<string, TextureResult>` keyed by `"YYYY-M-D-WxH-RES"`. The cache holds up to 24 entries (LRU eviction). This means that navigating back to a previously viewed date does not require recomputation — the cached texture is used immediately. The cache persists for the lifetime of the browser session.

---

## 8. Database and Backend

### 8.1 Database Schema

The current database schema (`drizzle/schema.ts`) contains only the core user table, as the application's primary functionality is entirely client-side (astronomical calculations are pure JavaScript, no server round-trips required).

```typescript
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});
```

### 8.2 tRPC API

The tRPC router (`server/routers.ts`) exposes authentication and telemetry procedures:

- `auth.me` — Returns the current user session (public procedure)
- `auth.logout` — Clears the session cookie (public procedure)
- `telemetry.submitObservation` — Submits a crescent sighting report (public, rate-limited to 5/min/IP, Zod-validated)
- `telemetry.getObservations` — Retrieves sighting reports with pagination (public, default 50 results)

All astronomical calculations are performed client-side. The telemetry endpoints store crowdsourced sighting data and automatically enrich reports with Open-Meteo weather data (cloud cover, surface pressure, aerosol optical depth).

### 8.3 Authentication

Authentication previously used Manus OAuth, which has been removed as it is platform-specific. The application is fully functional without authentication — all pages and API endpoints are publicly accessible. A standard auth provider (e.g., Clerk, NextAuth) can be added in the future if user accounts are needed.

### 8.4 Vercel Deployment

The application is configured for Vercel deployment:

- **Frontend**: Vite builds static assets to `dist/public/`, served from Vercel's CDN.
- **Backend**: The tRPC API runs as a Vercel Node.js serverless function at `api/trpc/[trpc].ts`, wrapping the existing tRPC router with the `@trpc/server/adapters/fetch` adapter.
- **Configuration**: `vercel.json` defines build commands, output directory, and routing rules (API rewrites + SPA fallback).
- **Environment Variables**: `DATABASE_URL` (optional, for telemetry persistence).

---

## 9. Testing

The test suite (`server/astronomy.test.ts`) contains 18 unit tests covering the core astronomical calculation functions. Tests are written with Vitest and run with `pnpm test`.

The test suite covers five areas. The **Yallop q-value classification** tests verify that the zone boundaries (A, B, C, D, E, F) are correctly applied for representative q-values and moon altitudes. The **crescent width calculation** tests verify that the W formula produces physically reasonable values (near-zero for small elongation, increasing with elongation, semi-diameter approximately 15 arcminutes at mean lunar distance). The **Hijri calendar conversion** tests verify known date conversions (e.g., 2024-03-10 → Sha'ban/Ramadan 1445 AH). The **Yallop q-value formula** tests verify the polynomial formula against hand-computed values. The **degree/radian conversion** tests verify the utility functions with round-trip identity checks.

All 18 tests pass as of the current version.

---

## 10. Development History

Hilal Vision was developed in 10 rounds of iterative feature additions and refinements. The following table summarises the major work completed in each round.

| Round | Focus | Key Deliverables |
|---|---|---|
| 1 | Foundation | Design system, routing, astronomy engine, city database |
| 2 | Core features | 3D Globe, flat Map, Moon Phase, Hijri Calendar, Horizon View, Archive |
| 3 | Polish & QA | Responsive layout, dark theme overrides, star field, animations, 18 unit tests |
| 4 | Performance | Globe hex-bin → canvas texture, Map rectangle grid → bilinear interpolation |
| 5 | Performance | Web Worker offloading, texture caching, progressive resolution |
| 6 | Bug fixes | Globe.gl overlay API fix (Three.js mesh), crescent SVG geometry correction |
| 7 | Pro Mode | Pro Technician mode context, Dashboard page, per-page pro panels |
| 8 | NASA design | Deep navy gradients, frosted glass cards, refined typography, better spacing |
| 9 | Umm al-Qura | Umm al-Qura calendar engine (KACST tables), side-by-side calendar comparison |
| 10 | Location sync | Global LocationContext, location selector in header, Islamic event countdown |
| 11 | Enhancements | Moon altitude chart (5-min intervals), map time slider (15-min granularity) |
| 12 | Ramadan | Ramadan start predictor page (1447–1456 AH), city-by-city comparison |
| 13 | Bug fixes | Countdown logic fix, dashboard map width fix, moon phase curve density fix |
| 14 | Hardening | Manus artifact removal, dead route cleanup, telemetry rate limiting, Zod validation |
| 15 | Accuracy | Conjunction-based Hijri calendar (SunCalc), moon phase chart verification |
| 16 | Reach | SEO (dynamic titles), geolocation auto-detect (Horizon page), Vercel deployment |
| 17 | Bug fixes | Infinite render loop fix (useMemo), Leaflet tile fix (ResizeObserver) |

---

## 11. Planned: Round 10 Design Overhaul

The next major development round will apply a comprehensive design overhaul inspired by Breezy Weather's design system. The following changes are planned (tracked in `todo.md`):

The **global CSS** will be rewritten with Breezy Weather's colour tokens adapted for the dark night-sky theme. The **navigation** will be redesigned with Breezy Weather's style — a more minimal, immersive header that blends into the page background. The **Home page** will be restructured with expandable card-based sections rather than a flat grid. Each feature page will be redesigned with the Breezy Weather card pattern: full-width primary content cards and half-width detail cards with decorative visual elements that encode data (e.g., a moon arc card for the moon path, a dot-scale card for visibility quality). The **Dashboard page** will be removed from the navigation and routing, consolidating the application around the individual feature pages.

The design overhaul will not change any astronomical calculations or data — only the visual presentation layer will be modified.

---

*Documentation updated February 2026. For the latest feature status, see `todo.md`.*
