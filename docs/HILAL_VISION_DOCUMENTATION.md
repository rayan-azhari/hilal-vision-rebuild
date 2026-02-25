# Hilal Vision - Full Application Documentation

**Version:** Round 21 (current)
**Stack:** React 19 + TypeScript + Tailwind 4 + tRPC 11 + Express 4 + MySQL (Drizzle ORM)
**Deployment:** Vercel (static frontend + serverless tRPC API)
**Mobile Packaging:** Capacitor.js

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Design System](#3-design-system)
4. [Global State Management](#4-global-state-management)
5. [Astronomy Engine](#5-astronomy-engine)
6. [Pages and Features](#6-pages-and-features)
   - 6.1 Home / Dashboard (`/`)
   - 6.2 Visibility - 3D Globe & 2D Map (`/visibility`, `/globe`, `/map`)
   - 6.3 Moon Phase (`/moon`)
   - 6.4 Hijri Calendar (`/calendar`)
   - 6.5–6.9 Horizon, Archive, Ramadan, Sighting Feed
   - 6.10 About (`/about`)
   - 6.11 Methodology (`/methodology`)
   - 6.12 Privacy Policy (`/privacy`)
   - 6.13 Terms of Service (`/terms`)
7. [Performance Architecture](#7-performance-architecture)
8. [Database and Backend](#8-database-and-backend)
9. [Testing](#9-testing)
10. [Development History](#10-development-history)
11. [Planned: Round 10 Design Overhaul](#11-planned-round-10-design-overhaul)

---

## 1. Project Overview

Hilal Vision is a precision astronomical web application for predicting and visualising Islamic crescent moon (hilal) sightings worldwide. The application is built for two audiences: the general Muslim public who want to know whether the crescent will be visible from their location on a given evening, and professional astronomers and Islamic calendar scholars who need detailed technical data about moon visibility criteria, conjunction times, and calendar comparisons.

The application's core purpose is to answer the question: **"Will the new crescent moon be visible tonight from my location?"** - and to present the answer with the scientific rigour and visual clarity that the question deserves. Islamic calendar months begin with the sighting of the new crescent moon, making this question of direct religious and practical significance for over 1.8 billion Muslims worldwide.

The application is named after the Arabic word *hilal* (هلال), which specifically refers to the new crescent moon - the thin sliver of illuminated moon visible in the western sky shortly after sunset on the first evening of a new lunar month.

---

## 2. Architecture

### 2.1 Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend framework | React | 19.2.1 |
| Language | TypeScript | 5.9.3 |
| Styling | Tailwind CSS | 4.1.14 |
| Component library | shadcn/ui (Radix UI) | Various |
| Authentication | Clerk Auth | 1.1 |
| Rate Limiting | Upstash Redis | 1.34 |
| Mobile Bridge | Capacitor.js | 7.0 |
| Routing | Wouter | 3.7.1 |
| API layer | tRPC | 11.6.0 |
| Server | Express | 4.21.2 |
| Database ORM | Drizzle ORM | 0.44.5 |
| Database | MySQL (TiDB) | - |
| Build tool | Vite | 7.1.7 |
| Test runner | Vitest (Unit), Playwright (E2E) | 2.1.4, 1.58.2 |
| Package manager | pnpm | 10.4.1 |

### 2.2 Key Frontend Libraries

The application uses several specialised libraries beyond the core stack. **SunCalc** (`suncalc@1.9.0`) provides the foundational sun and moon position calculations. **globe.gl** (`globe.gl@2.45.0`) renders the interactive 3D globe using WebGL via Three.js. **Leaflet** (`leaflet@1.9.4`) with **react-leaflet** provides the flat 2D world map. **D3** (`d3@7.9.0`) is available for custom data visualisations. **Recharts** (`recharts@2.15.2`) renders the sun/moon altitude charts. **Framer Motion** (`framer-motion@12.23.22`) handles page transitions and micro-animations. **Three.js** (`three@0.183.0`) is used directly for the custom visibility overlay mesh on the globe.

### 2.3 File Structure

```
hilal-vision/
├── android/            ← Native Android App container (Capacitor)
├── ios/                ← Native iOS App container (Capacitor)
├── client/
│   ├── src/
│   │   ├── pages/          ← 10 page components (Home, Visibility, Moon, Calendar, Horizon, Archive, About, Methodology, Privacy, Terms, Support)
│   │   ├── components/     ← Shared UI components (PageHeader, LocationSearch, AutoDetectButton, ProGate, UpgradeModal, etc.)
│   │   ├── contexts/       ← React contexts (Theme, GlobalState, ProTier)
│   │   ├── hooks/          ← Custom hooks (useVisibilityWorker, useGeolocation)
│   │   ├── workers/        ← Web Workers (visibility.worker.ts)
│   │   ├── lib/
│   │   │   ├── astronomy.ts    ← Re-export wrapper (re-exports shared + DOM-only buildVisibilityTexture)
│   │   │   └── ummalqura.ts    ← Umm al-Qura calendar engine
│   │   ├── App.tsx         ← Routes, providers, and React.lazy code splitting
│   │   ├── main.tsx        ← Entry point
│   │   └── index.css       ← Global design system
│   └── public/             ← Static assets
├── server/
│   ├── routers.ts          ← tRPC procedures
│   ├── routers/            ← Modular routers (archive.ts)
│   ├── data/               ← ICOP sighting data (icop-history.json)
│   ├── scripts/            ← Data scrapers (scrape-icop.ts)
│   ├── db.ts               ← Database query helpers
│   └── _core/              ← Framework plumbing (context, tRPC, server setup)
├── drizzle/
│   └── schema.ts           ← Database schema
├── shared/
│   ├── astronomy.ts        ← Core astronomy engine (isomorphic, no DOM)
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
| `/visibility` | `VisibilityPage` | Unified page with 3D Globe / 2D Map toggle |
| `/moon` | `MoonPage` | Moon phase detail with altitude charts |
| `/calendar` | `CalendarPage` | Hijri calendar with Islamic events |
| `/horizon` | `HorizonPage` | Local horizon visibility simulator |
| `/archive` | `ArchivePage` | Historical visibility archive (1,028+ ICOP real-world records) |
| `/404` | `NotFound` | 404 error page |

All tool pages share a consistent `PageHeader` component providing a unified header bar with icon, title (Cinzel serif), and subtitle, plus an optional right-side slot for page-specific controls (location pickers, dates, Hijri date badges).

---

## 3. Design System

### 3.1 Design Philosophy

Hilal Vision's design is inspired by two sources: the **NASA Daily Moon Guide** (deep navy gradients, large stat cards, immersive hero sections) and **Breezy Weather** (glassmorphism cards, generous whitespace, data-as-decoration visual elements). The result is a dark-mode-first application that feels like a scientific instrument - precise, data-rich, and visually compelling.

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
| Zone A | `oklch(0.72 0.20 145)` | Easily visible - naked eye |
| Zone B | `oklch(0.85 0.18 90)` | Visible under good conditions |
| Zone C | `oklch(0.72 0.20 50)` | Optical aid helpful |
| Zone D | `oklch(0.60 0.22 25)` | Optical aid only |
| Zone E | `oklch(0.40 0.01 265)` | Not visible |

### 3.3 Typography

The application uses three typefaces, each serving a distinct purpose. **Inter** is the primary body font - a highly legible, neutral sans-serif used for all data values, descriptions, and UI text. **Cinzel** is the display serif font - a classical Roman letterform used for headings, the logo, and section titles. It evokes the historical and scholarly nature of Islamic calendar science. **Noto Naskh Arabic** is used for all Arabic text - Islamic month names, Quranic phrases, and Arabic numerals - ensuring correct rendering across all platforms.

The heading hierarchy uses Cinzel with `letter-spacing: 0.05em` and `line-height: 1.2`. Body text uses Inter with `line-height: 1.6` and `letter-spacing: 0.01em`. The combination of a classical serif for headings and a modern sans-serif for body creates a visual tension that feels both ancient and contemporary - appropriate for an application that bridges 7th-century Islamic calendar tradition with 21st-century astronomical computation.

### 3.4 Component Classes

The design system defines several reusable component classes in `index.css`:

**`.glass`** - A glassmorphism panel with `backdrop-filter: blur(20px)`, a semi-transparent dark background gradient, and a subtle gold border. Used for overlay panels and floating controls.

**`.glass-card`** - A more opaque glassmorphism card with `backdrop-filter: blur(16px)`, used for the live status cards on the home page and similar data display elements. Includes a hover state that brightens the gold border.

**`.card-elevated`** - A solid dark card without backdrop blur, used for content sections that do not sit over a complex background. Includes a subtle lift animation on hover (`translateY(-2px)`).

**`.glow-gold`**, **`.glow-gold-sm`**, **`.glow-gold-lg`** - Box shadow utilities that add a gold glow effect at different intensities. Used for the logo, primary buttons, and highlighted elements.

**`.star-field`** - A CSS background-image pattern using multiple `radial-gradient` stops to simulate a star field. Used as an overlay on the hero section and other dark backgrounds.

**`.gradient-text-gold`** - A gradient text effect using `-webkit-background-clip: text` to apply a gold gradient to heading text.

**`.section-divider`** - A 1px horizontal line with a gradient that fades from transparent to gold and back, used to separate major sections.

### 3.5 Background Gradient Utilities

Three pre-built background gradient utilities are available:

**`.bg-deep-space`** - A subtle 4-stop vertical gradient from near-black to slightly lighter navy, evoking the depth of space. Used as the default page background.

**`.bg-twilight`** - A warmer gradient with a slight blue-purple shift, evoking the sky at twilight. Used for the horizon page.

**`.bg-horizon-glow`** - A gradient that transitions from dark navy at the top to warm amber at the bottom, evoking the glow of a sunset horizon. Used for the horizon page hero section.

---

## 4. Global State Management

### 4.1 GlobalStateContext

The `GlobalStateContext` (`client/src/contexts/GlobalStateContext.tsx`) provides a globally shared state for both **location** and **date**, ensuring that all pages (3D Globe, 2D Map, Moon Phase, Horizon) instantly synchronize to a single source of truth without redundant local pickers. The default location is **Mecca, Saudi Arabia** - the spiritual centre of Islam and the reference point for the Umm al-Qura calendar, and the default date is the current system date.

The context exposes: `location` (the current `CityLocation` object), `setLocation`, `setCustomLocation`, `date`, `setDate`, `nextEvent` (the nearest upcoming Islamic event), and `upcomingEvents` (all upcoming Islamic events sorted by proximity).

The Islamic event calculation covers Ramadan (1 Ramadan), Eid al-Fitr (1 Shawwal), and Eid al-Adha (10 Dhu al-Hijjah). Events are computed by converting the Hijri event date to Gregorian using the algorithmic Hijri calendar, checking the current year and the next two years to ensure a future event is always available, and sorting by days until the event. The computation runs hourly via `setInterval` to stay current.

### 4.2 ProModeContext

The `ProModeContext` (`client/src/contexts/ProModeContext.tsx`) provides a boolean `isPro` flag and a `togglePro` function. When Pro Mode is enabled, each page reveals additional technical data panels - extended orbital parameters, methodology explanations, q-value data tables, and physics annotations. The state persists via `localStorage` under the key `"hilal-pro-mode"`.

Pro Mode is designed for astronomers, Islamic calendar scholars, and technically sophisticated users who want access to the raw calculation parameters (ARCV, DAZ, W, q-value, Odeh criterion) rather than just the simplified visibility zone classification.

### 4.3 ThemeContext

The `ThemeContext` wraps the `next-themes` `ThemeProvider` with `defaultTheme="dark"`. The application is exclusively dark-themed; the context exists for future light mode support and for correct shadcn/ui component theming.

---

## 5. Astronomy Engine

The astronomy engine (`shared/astronomy.ts`) is the computational heart of Hilal Vision. It is an **isomorphic module** that runs in the browser main thread, Web Workers, Node.js server, and test runners - with no DOM dependencies. It implements the two primary crescent visibility criteria used by Islamic calendar authorities worldwide, plus supporting calculations for the Hijri calendar, moon phases, and day/night terminator geometry.

The client-side wrapper (`client/src/lib/astronomy.ts`) re-exports everything from the shared module and adds the single DOM-dependent function `buildVisibilityTexture()`, which uses `document.createElement('canvas')` to render the visibility grid as a data URL.

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

Users can seamlessly toggle between the Yallop and Odeh criteria across the 3D Globe and 2D Map views. The active criterion dictates the color-coded contour thresholds, the Zone A–F visibility classifications, and the live astronomical data readouts, allowing researchers to evaluate borderline visual cases using both mathematical models seamlessly.

### 5.4 Hijri Calendar Conversion

The application features a **triple-engine Hijri calendar system**, supporting three distinct methodologies for converting Gregorian dates to Hijri dates:

1. **Astronomical (SunCalc):** The default engine uses an astronomical conjunction-based algorithm. `findNewMoonNear()` uses SunCalc's `getMoonIllumination()` to search for the physical phase minimum in two passes (6-hour coarse sweep, 30-minute fine sweep). Dates are cached relative to an epoch (1 Muharram 1446 AH ≈ July 7, 2024). This provides the true physical commencement of the lunar cycle.

2. **Umm al-Qura:** The official civic calendar of Saudi Arabia, powered by the pre-computed KACST tables via the `@umalqura/core` package. This acts as the standard for civic/administrative date conversions. A set of wrapper functions (`getUmmAlQuraHijri`, `getUmmAlQuraDaysInMonth`, `getUmmAlQuraMonthStart`) within `shared/astronomy.ts` normalises the package's output to match the application's `HijriDate` interface.

3. **Tabular (Kuwaiti):** The standard arithmetic approximation commonly used in software, implemented via Julian Date conversions (`gregorianToJD`, `jdToHijri`).


### 5.5 World Visibility Grid

The `generateVisibilityGrid()` function computes crescent visibility for every grid point on Earth at a given resolution (default 4°, producing a 90×40 grid of 3,600 points). For each point, it calls `computeSunMoonAtSunset()` and records the visibility zone and q-value. This grid is the data source for both the 3D Globe overlay and the flat Map heatmap.

At 2° resolution (the high-quality pass), the grid has 14,400 points. At 8° resolution (the preview pass), it has 900 points. The computation is offloaded to a Web Worker to prevent blocking the main thread.

### 5.6 Day/Night Terminator

The `getTerminatorPoints()` function computes the day/night boundary (the terminator) by calculating the sub-solar point (the location where the sun is directly overhead) and then finding the great circle 90° from that point. The sub-solar point is computed from the solar declination and Greenwich Hour Angle using standard astronomical formulas. The terminator is returned as an array of 360 `[lng, lat]` points that can be used to draw the boundary on a map or globe.

### 5.7 Moon Phase Calculation

The `getMoonPhaseInfo()` function returns a complete moon phase description for any date. The phase value (0–1, where 0 = new moon, 0.5 = full moon) comes from SunCalc's `getMoonIllumination()`. The moon age in days is computed as `phase × 29.53058867`. The next new moon and next full moon are found by iterating forward in 12-hour steps until the phase value is within 0.02 of the target phase.

Phase names are provided in both English and Arabic, covering all 8 standard phases from New Moon (المحاق) through Waxing Crescent (الهلال المتزايد), First Quarter (التربيع الأول), Waxing Gibbous (الأحدب المتزايد), Full Moon (البدر), Waning Gibbous (الأحدب المتناقص), Last Quarter (التربيع الأخير), and Waning Crescent (الهلال المتناقص).

### 5.8 Best-Time-to-Observe Calculator

The `computeBestObservationTime(date, location)` function determines the optimal time for crescent moon observation. It scans from **sunset** to **moonset** (or sunset + 2 hours if moonset is unavailable/before sunset) in **5-minute steps**.

At each step, the function evaluates:
- **Moon altitude** - must be above the horizon (> 0°)
- **Sky darkness factor** - sun below -12° = 1.0 (astronomical twilight), below -6° = 0.8 (nautical), below 0° = 0.5 (civil), above horizon = 0.1
- **Altitude factor** - penalises very low altitudes where atmospheric extinction is high (airmass ∝ 1/sin(alt))
- **Horizon Dip (Refraction)** - observer elevation is factored in via `1.76 * Math.sqrt(elevation)` to dynamically adjust the theoretical horizon.

The composite score is: `score = moonAlt × darknessFactor × altFactor`

The function returns the time with the highest score, along with the full observation window (windowStart = sunset, windowEnd = moonset), moon/sun altitudes at the optimal moment, and a `viable` flag indicating whether any valid observation window exists.

---

## 6. Pages and Features

### 6.1 Home Page (`/`)

The home page serves as both a landing page and a live status dashboard. It is structured in three sections.

The **hero section** occupies 94% of the viewport height. It features a radial gradient background with a star field overlay, three decorative orbit rings, and a floating animated SVG moon that renders the current phase with correct crescent geometry. The heading "Hilal Vision" uses the Cinzel serif font with a gradient text effect. Two call-to-action buttons link to the Visibility Page and the Moon Phases Page.

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

The globe also features a **cloud cover overlay** - a second Three.js `SphereGeometry` mesh at `r * 1.004` (slightly above the visibility sphere at `r * 1.002`) displaying real-time cloud cover data from Open-Meteo. This overlay is independently toggleable via a "Clouds" button alongside the existing "Visibility" toggle.

A **High Contrast Mode** toggle is available from the main header. When active, the Web Worker dynamically generates the visibility texture utilizing a Cividis-inspired perceptual palette (Bright Yellow, Orange, Reddish Brown, Deep Blue, Dark Navy) to guarantee intelligibility for users with Color Vision Deficiency (CVD).

A **Best Time to Observe** card in the sidebar displays the optimal crescent viewing window, computed by the `computeBestObservationTime()` function.

### 6.4 Visibility Map Page (`/map`)

The Map page uses Leaflet with CartoDB dark tiles to render a flat 2D world map. The crescent visibility heatmap is rendered as a canvas overlay using bilinear interpolation between the grid points, producing a smooth gradient rather than the stepped rectangular grid of earlier versions.

The page features a **time slider** with 15-minute granularity covering ±24 hours from the selected date, an **animate button** that plays through the time range automatically, and a **resolution control** (2°/4°/6°) that trades computation time for grid density. Clicking any point on the map shows the visibility data for that location in a popup.

A **cloud cover overlay** fetches real-time data from Open-Meteo's forecast API via a dedicated tRPC endpoint (`weather.getCloudGrid`). The sparse grid (~162 points at 15°×20° resolution) is bilinearly interpolated into a smooth canvas texture and rendered as an independent Leaflet `imageOverlay` at 35% opacity. The overlay can be toggled on/off independently from the visibility layer.

A **Best Time to Observe** card in the sidebar displays the optimal crescent viewing window computed by `computeBestObservationTime()`, showing the optimal time, observation window (sunset to moonset), and moon/sun altitudes at the best moment. This card additionally displays the observer's elevation when GPS is active.

The map also supports geolocation auto-detect and shareable URLs. In Pro Mode, a methodology panel explains the Yallop and Odeh criteria in detail, and a contour label overlay shows the q-value contour lines. A high visibility color-blind accessible mapping state is also supported, instantly syncing with the globe logic when toggled.

### 6.5 Moon Phase Page (`/moon`)

The Moon Phase page provides a detailed view of the current lunar cycle. The hero section shows a large SVG moon illustration with correct phase geometry, the phase name in English and Arabic, illumination percentage, and moon age in days.

Below the hero, four stat cards show moonrise time, moonset time, sunrise time, and sunset time for the selected location. A **next new moon countdown** shows the exact time and days remaining until the next new moon.

The **30-day phase calendar strip** shows a horizontal scroll of 30 days, each with a small moon phase icon and the phase name. The selected day is highlighted.

The **sun/moon altitude chart** is a Recharts area chart showing the altitude of both the sun and moon over 24 hours (288 data points at 5-minute intervals). The sun area is filled with a warm amber gradient; the moon area is filled with a cool blue gradient. A vertical time slider allows the user to inspect the exact altitude of both bodies at any time of day. Rise and set times are marked with vertical dashed lines.

Alongside it, **The Sky Dome** offers a custom SVG-based polar stereographic projection that maps the spatial tracking dimension. Altitude determines the radius (Zenith at center, Horizon at edge) and Azimuth determines the angle. The tracker traces the correct daily trajectory of both bodies. Both the companion linear altitude chart and the Sky Dome are deeply synchronized to a shared "time-of-day" slider, meaning changes in one are perfectly mirrored in the other.

In Pro Mode, the page shows extended orbital data including libration (the apparent rocking of the moon), parallax, the equation of time, and the moon's distance from Earth.

### 6.6 Hijri Calendar Page (`/calendar`)

The Calendar page provides a comprehensive Hijri calendar supporting three calculation engines. Users can instantly toggle between **Astronomical**, **Umm al-Qura**, and **Tabular (Kuwaiti)** dates. 


The page supports dynamic year and month navigation. Each cell renders its exact local moon phase via an inline stylised SVG, and major/minor Islamic events (Ramadan, Eid al-Fitr, Eid al-Adha, Ashura, Mawlid, etc.) are highlighted distinctly on their respective dates.

In Pro Mode, the page shows conjunction times (the exact moment of new moon) and a lunar month length analysis showing the variation in month lengths over the selected year.

### 6.7 Local Horizon View Page (`/horizon`)

The Horizon page simulates the local sky at sunset from any location on Earth. It renders a canvas-based panoramic horizon view showing the silhouette of the landscape, the position of the setting sun, and the position of the crescent moon relative to the sun.

The canvas renders: a gradient sky background (transitioning from deep blue at the top through twilight colours to warm amber at the horizon), a stylised landscape silhouette, the sun disc at its computed azimuth and altitude, the moon disc at its computed position, a dashed arc showing the moon's path across the sky, and an ARCV line showing the angular separation between sun and moon.

The altitude and azimuth readout updates in real time as the user changes the location or date. A city dropdown and custom coordinate input allow precise location selection. A city search filter makes it easy to find any of the 50+ cities in the database.

In Pro Mode, the canvas adds atmosphere refraction annotations, ARCV/DAZ/W measurement lines with labels, and an explanation of how each parameter affects visibility.

### 6.8 Crescent Visibility Archive Page (`/archive`)

The Archive page provides a historical and future record of crescent visibility. Crucially, it features over **1,000 real-world sightings** systematically scraped from the famous Islamic Crescents' Observation Project (ICOP) spanning 1438 AH to 1465 AH.

For each month, the page shows a grid of major cities paired with factual sighting assertions (Seen with naked eye, seen with optical aid, not seen).

The page supports filtering by year and month. Each city cell is colour-coded by visibility zone (A–F) derived from our local calculation algorithms. The visual side-by-side verification between *theory* and *actual crowdsourced report* allows the user to see the predictive strength of the mathematical models.

In Pro Mode, the archive shows q-value data tables alongside the zone classifications, and a methodology comparison panel showing how the Yallop and Odeh criteria differ for each month.

### 6.9 Ramadan Start Predictor Page (`/ramadan`)

The Ramadan page predicts the start date of Ramadan for the next 10 years (1447–1456 AH, approximately 2025–2034 CE). For each year, it shows the predicted Gregorian date range (accounting for the ±1 day uncertainty of crescent sighting), the visibility zone for a selection of major cities, and a visual timeline.

The prediction is based on the Yallop criterion applied to the expected new moon for 1 Ramadan of each year. The city-by-city comparison shows how visibility varies geographically - a crescent that is Zone A (easily visible) in Mecca may be Zone C (optical aid needed) in London due to the different sun-moon geometry at different latitudes.

In Pro Mode, the page shows detailed conjunction times, elongation at sunset, and q-values for each city and year.

### 6.10 About Page (`/about`)

A rich informational page communicating Hilal Vision's mission, platform scope, and scientific foundations to new visitors.

**Sections:**
- **Mission statement** - Explains the Islamic calendar context, why bi-parametric visibility criteria matter, and the platform's role as a scientific instrument (not a religious authority).
- **Who Is It For?** - Three audience cards: Muslim communities (simplified predictions), astronomers/researchers (raw q-values, ICOP data), and Islamic calendar scholars (multi-engine Hijri calendar comparison).
- **Platform Tools** - Clickable card grid for all six tools (Globe, Map, Moon Phase, Hijri Calendar, Horizon, Archive) with descriptions.
- **How We Compare** - Feature comparison table benchmarking Hilal Vision against Moonsighting.com, IslamicFinder, LuneSighting, and HilalMap across 14 dimensions (3D globe, weather overlay, ICOP data, Best-Time calculator, mobile app, push notifications, etc.).
- **Technology** - Non-technical overview of the stack (React, SunCalc, Globe.gl, tRPC, Clerk, Capacitor, Open-Meteo, Sentry).
- **Data Sources & Attributions** - Linked credits to Yallop 1997, Odeh 2004, ICOP (IAC), SunCalc (Agafonkin), Umm al-Qura tables, and Open-Meteo.
- **License & Contact** - All Rights Reserved notice, GitHub link, email contact, and links to Privacy/Terms pages.

**Design:** Stars-field hero section with orbit rings, `.breezy-card` grid layout, gold accent on Hilal Vision column of the comparison table, methodology teaser CTA.

### 6.11 Methodology Page (`/methodology`)

A comprehensive technical reference page written for astronomers, Islamic calendar scholars, and developers who need to understand the mathematical foundations behind every calculation in Hilal Vision.

**Sections:**
1. The Crescent Visibility Problem - Why single-parameter models (age, lag time) are unreliable; the need for bi-parametric polynomial criteria.
2. Yallop (1997) Criterion - Complete q-value derivation, crescent width formula (SD, elongation), Best-Time definition (4/9 × lag time), and full Zone A–F classification table.
3. Odeh (2004) Criterion - V-value formula, dataset differences from Yallop, and four-zone classification table.
4. Triple-Engine Hijri Calendar - Astronomical (SunCalc two-pass conjunction search with 1446 AH epoch), Umm al-Qura (KACST tables via `@umalqura/core`), and Tabular/Kuwaiti (Julian Date arithmetic) engines with their trade-offs.
5. Best-Time-to-Observe Calculator - 5-minute scanning algorithm from sunset to moonset, composite scoring formula (`score = moonAlt × darknessFactor × altFactor`), and viability flag logic.
6. World Visibility Grid - Three resolution levels (8°/900pts, 4°/3,600pts, 2°/14,400pts), Web Worker offloading, LRU texture cache (24 entries, keyed by date+resolution).
7. ICOP Historical Archive - What ICOP is, how 1,000+ records were sourced, and how theory-vs-observation comparison enables model validation.
8. Crowdsourced Telemetry & Validation - Zone F rejection algorithm, Upstash Redis rate limiting (5 req/IP/min), Open-Meteo meteorological enrichment.
9. Atmospheric Refraction - Saemundsson inverse formula with temperature (T°C) and pressure (P hPa) corrections for observatory-grade horizon accuracy.
10. References - Yallop 1997, Odeh 2004, Meeus 1998, SunCalc, ICOP, Umm al-Qura.

**Design:** Fixed Table of Contents sidebar (desktop), `FormulaBlock` monospace display components, coloured zone tables, and anchor-linked headings.

### 6.12 Privacy Policy (`/privacy`)

A GDPR-aware privacy policy covering:
- **Data collected:** GPS coordinates (opt-in, ephemeral), Clerk email/name, sighting reports (stored permanently as public scientific data), Sentry error events (anonymised), IP addresses (Upstash, TTL 60s).
- **Sub-processors table:** Clerk Auth, Upstash Redis, Sentry, Open-Meteo, Vercel - each with purpose and data shared.
- **Cookie policy:** Functional Clerk JWT session cookies only. No tracking or advertising cookies.
- **Retention:** Account data until deletion; sighting reports retained indefinitely; error logs 30 days.
- **User rights:** Access, correction, deletion, export - applicable under GDPR, UK DPA 2018, and CCPA.

### 6.13 Terms of Service (`/terms`)

A clear terms document covering:
- **Acceptable use:** No false sighting reports, no DDoS/rate-limit bypass, no impersonation.
- **User-generated content:** Worldwide, royalty-free, irrevocable licence granted for submitted sighting reports used in the public dataset.
- **Accuracy disclaimer:** Predictions are mathematical estimates, not religious rulings. Not suitable as the sole basis for civic or religious decisions.
- **All Rights Reserved:** Full source code is proprietary. ICOP data and Umm al-Qura tables subject to their original terms.
- **Limitation of liability:** No liability for indirect damages, missed observances, or incorrect predictions.

---

## 7. Performance Architecture

### 7.1 Web Worker Offloading

The visibility grid computation is the most computationally intensive operation in the application. At 2° resolution, it requires 14,400 calls to `computeSunMoonAtSunset()`, each involving trigonometric calculations for sun and moon positions. Running this on the main thread would block the UI for several seconds.

The `useVisibilityTexture` hook offloads this computation to a dedicated Web Worker. The worker receives the date and grid resolution, computes the visibility grid, renders it to a raw RGBA pixel buffer using bilinear interpolation, and returns the buffer to the main thread. The main thread converts the buffer to a PNG data URL using an off-screen canvas and applies it to the globe or map overlay.

### 7.2 Progressive Resolution

The visibility texture uses a two-pass progressive rendering strategy. Pass 1 runs at 8° resolution (900 grid points) and completes in approximately 100ms, providing an immediate preview. Pass 2 runs at 2° resolution (14,400 grid points) and completes in approximately 800ms, replacing the preview with the high-quality result. The `isRefining` state flag allows the UI to show a subtle indicator while the refinement pass is running.

### 7.3 Texture Caching

Computed textures are cached in a `Map<string, TextureResult>` keyed by `"YYYY-M-D-WxH-RES"`. The cache holds up to 24 entries (LRU eviction). This means that navigating back to a previously viewed date does not require recomputation - the cached texture is used immediately. The cache persists for the lifetime of the browser session.

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

### 8.2 tRPC API & Global Rate Limiting

The tRPC router (`server/routers.ts`) exposes authentication and telemetry procedures:

- `auth.me` - Returns the current user session (public procedure)
- `auth.logout` - Clears the session cookie (public procedure)
- `telemetry.submitObservation` - Submits a crescent sighting report (public, but with advanced validation).
- `telemetry.getObservations` - Retrieves sighting reports with pagination (public, default 50 results)
- `archive.getHistoricalData` - Fetches the scraped ICOP sightings dataset.

**Smart Validation:** A key architectural component is the server-side Smart Validation during `submitObservation`. When a physical sighting is claimed, the backend mathematically computes the geometric position of the sun and moon at that precise timestamp and location. If the mathematics dictate that the moon is definitively below the horizon (Zone F), the server fundamentally rejects the claim to preserve crowdsourced data integrity.

**Upstash Redis Rate Limiting:** Global rate limiting is handled by Upstash utilizing a Redis store. Submissions are strictly limited to 5 requests per IP address, averting DDoS payload fatigue and securing the integrity of the data stream.

All astronomical calculations are performed client-side. The telemetry endpoints store crowdsourced sighting data and automatically enrich reports with Open-Meteo weather data (cloud cover, surface pressure, aerosol optical depth).

### 8.3 Authentication

Authentication utilizes **Clerk Auth**, integrating seamlessly with Express on the backend (`@clerk/express`) and leveraging raw standard authentication forms on the frontend. The system manages session validations, JWT decoding, and restricts malicious access securely without custom-built authorization vulnerabilities.

### 8.4 Vercel Deployment

The application is configured for Vercel deployment:

- **Frontend**: Vite builds static assets to `dist/public/`, served from Vercel's CDN.
- **Backend**: The tRPC API runs as a Vercel Node.js serverless function at `api/trpc/[trpc].ts`, wrapping the existing tRPC router with the `@trpc/server/adapters/fetch` adapter.
- **Configuration**: `vercel.json` defines build commands, output directory, and routing rules (API rewrites + SPA fallback).
- **Environment Variables**: `DATABASE_URL` (optional, for telemetry persistence).

---

## 9. Testing

The test suite (`server/astronomy.test.ts`) contains 21 unit tests covering the core astronomical calculation functions. Tests import directly from the production `shared/astronomy.ts` module - not duplicated inline copies - ensuring tests validate the actual production code. Tests are written with Vitest and run with `pnpm test`.

The test suite covers six areas. The **Yallop q-value classification** tests verify that the zone boundaries (A, B, C, D, E, F) are correctly applied for representative q-values and moon altitudes. The **crescent width calculation** tests verify that the W formula produces physically reasonable values (near-zero for small elongation, increasing with elongation, semi-diameter approximately 15 arcminutes at mean lunar distance). The **Hijri calendar conversion** tests verify known date conversions (e.g., 2024-03-10 → Sha'ban/Ramadan 1445 AH). The **Yallop q-value formula** tests verify the polynomial formula against hand-computed values. The **degree/radian conversion** tests verify the utility functions with round-trip identity checks. The **best-time-to-observe** tests verify the observation window calculator returns valid windows with non-negative scores.

**End-to-End (E2E) Testing:** Core application flows (Visibility Toggling, Location Selecting) and asynchronous data resolution (e.g. Best-Time computation) are automated locally utilizing Playwright in chromium environments (`pnpm test:e2e`).

All tests pass as of the current version.

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
| 18 | Auth & Security | Implemented Clerk Auth and Upstash Redis rate limiting |
| 19 | Feature & Mobile | Added ICOP scraped historical data logic, mathematical Zone F sighting rejection, and native mobile Capacitor bridging |
| 20 | UI Consistency | Unified PageHeader component across all tool pages. Fixed Clerk `getAuth` crash for public tRPC endpoints. |
| 21 | Deployment Fixes | Bypassed Vercel serverless limits by moving 160KB ICOP dataset to `client/public/` for static serving. Fixed Vercel SPA catch-all rewrite preventing `/api/trpc` routes from firing. |
| 22 | Design Overhaul | Implemented "Clinical Aerospace" (Light) and "Deep Space" (Dark) themes with refined typography scaling, card padding, and SVG SVG scaling fixes. Elevated visual language to "instrument-grade". |
| 23 | Audit & Code Quality | Comprehensive audit (7.5/10 scorecard). Extracted astronomy engine to `shared/astronomy.ts` (isomorphic). Added `React.lazy` code splitting for 6 pages. Fixed OG image (SVG→PNG), `getObservations` pagination bug (`COUNT(*)`), `robots.txt`. Rewrote test suite (21 tests import production module). Updated Web Worker to import from shared module. |
| 24 | PWA & Monitoring | Hand-written Service Worker (`sw.js`) with CacheFirst/NetworkFirst/StaleWhileRevalidate strategies. PWA manifest + icons. Sentry error monitoring with ErrorBoundary and API error capture. |
| 25 | Location UX | Unified geolocation: all pages auto-detect GPS on mount via `useGeolocation(true)` hook. Created shared `AutoDetectButton` component. Removed ~120 lines of duplicated geolocation code. Red Report Sighting button in navbar. |
| 26 | Map/Globe UX | Fixed Vercel 500 error on cloud cover fetch by reducing Open-Meteo batch size to avoid URL limits. Unified Visibility Map and Cloud Cover toggles directly within the side panel controls for both MapPage and GlobePage. |
| 27 | Informational Pages | Added four new route pages: `/about` (mission, tools, competitor comparison, attributions), `/methodology` (full Yallop/Odeh formula reference, triple-engine calendar, ICOP, refraction), `/privacy` (GDPR-aware policy), `/terms` (acceptable use, All Rights Reserved). Linked in footer nav. All routes lazy-loaded in `App.tsx`. |
| 28 | Vector Render | Refactored MapPage to generate pure mathematical SVG contours from Yallop `q-value` matrix using `d3-contours`. Removed pixelated canvas generation. Fixed Home page routing overlay issue. |
| 29 | Global Pickers | Centralized the Date and Location selection (with Auto-Detect GPS) into the main navigation bar using `GlobalStateContext`. All dashboard modules now sync automatically to a single global source of truth. Removed redundant pickers from individual pages. |
| 30 | Dual Criteria | Added a global Visibility Criterion switch allowing users to evaluate crescent visibility using either the traditional Yallop (1997) q-value or the modern Odeh (2004) v-value across the 3D Globe and 2D Map views simultaneously. |
| 31 | Accessibility & Native UX | Implemented robust Playwright E2E testing framework. Built Cividis-inspired High Contrast color-blind friendly rendering mode for WebGL/SVG artifacts. Injected Open-Meteo elevation tracking to Topographical Refraction horizon dip functions. Formulated strict Capacitor.js SafeArea padding for iOS Dynamic Islands. |
| 32 | SEO & Scientific Precision | Integrated `vite-plugin-sitemap` for automated `sitemap.xml` generation. Injected JSON-LD structured data (`SoftwareApplication` schema) into `SEO.tsx`. Generated AI-crafted OpenGraph preview banner (`og-default.png`). Exported `findNewMoonNear()` and added `nextNewMoonExact` to `MoonPhaseInfo` for exact conjunction times displayed to the second on the Moon Phase Dashboard. Updated dark theme background to `#233342`. |
| 33 | Monetization | Implemented dual-billing architecture for Pro tier: **Stripe Checkout** (Web) and **RevenueCat SDK** (iOS/Android Native) with Clerk `publicMetadata` webhook synchronization. Feature gating on Visibility (Globe), Moon (Sky Dome), Calendar (Astronomical/Tabular engines), Archive (historical years). Built `/support` page with dynamic UI hiding Sadaqah rules for native App Store compliance. |

---

## 11. Monetization & Pro Tier

### 11.1 Strategy

Hilal Vision uses a **soft paywall** model ("Approach C"): all features are visible from Day 1, but deep interaction is gated behind a "Pro" subscription. Free users can see every feature at a glance; the upgrade prompt appears when they try to interact deeply (rotate the globe, dig into the archive, inspect scoring breakdowns).

### 11.2 Technical Architecture

**New files & Webhooks:**
- `api/stripe/checkout.ts`, `api/stripe/webhook.ts` — Serverless functions driving web Stripe subscriptions/donations. Webhooks update `currUser.publicMetadata.isPro`.
- `api/revenuecat/webhook.ts` — Captures Google Play/App Store `INITIAL_PURCHASE` and `EXPIRATION` events to sync native purchases back to the Clerk universe.
- `client/src/contexts/ProTierContext.tsx` — React context acting as the brain. Uses `Capacitor.isNativePlatform()` to fork operations: natively initializes `Purchases.configure()`, while web relies on Clerk `publicMetadata`. Exposes `startCheckout()` and `purchaseNativePackage()`.
- `client/src/components/ProGate.tsx` — Wrapper component rendering a blurred preview with an "Upgrade to Pro" overlay for non-premium users.
- `client/src/components/UpgradeModal.tsx` — Reusable modal fetching localized native packages from the device store if native, or triggering Stripe checkout if web.
- `client/src/pages/SupportPage.tsx` — Support page with Feature Access Matrix, pricing cards, and one-time donation presets. (Donations are programmatically suppressed on Native platforms to satisfy strict App Store non-profit IAP blocking rules).

### 11.3 Feature Access Matrix

| Feature | Free Tier | Pro Tier |
|---------|-----------|----------|
| 2D Visibility Map | ✅ Full access | ✅ Full access |
| 3D Interactive Globe | 🔒 Locked | ✅ Full interactive |
| Moon Phase (Basic) | ✅ Illumination, age, phase | ✅ Full dashboard |
| Sky Dome & Altitude Chart | 🔒 Blurred preview | ✅ Full interactive |
| Ephemeris Data | 🔒 Blurred preview | ✅ Full times |
| Hijri Calendar (Umm al-Qura) | ✅ Full access | ✅ Full access |
| Astronomical & Tabular Engines | 🔒 Locked | ✅ All 3 engines |
| ICOP Archive (Recent) | ✅ 1463-1465 AH | ✅ Full 1438-1465 AH |
| ICOP Archive (Historical) | 🔒 Locked | ✅ 28 years |
| Horizon View | ✅ Full access | ✅ Full access |
| Sighting Reports | ✅ Submit freely | ✅ Submit + Patron badge |
| Push Notifications | ❌ None | ✅ Crescent alerts |
| Ad-Free Experience | Ethical ads | ✅ Fully ad-free |

### 11.4 Pricing

| Plan | Price | Notes |
|------|-------|-------|
| Monthly | $2.99 | Low barrier |
| Annual | $14.99 | Best recurring value (save 58%) |
| Lifetime | $49.99 | One-time "Astronomer" unlock |

### 11.5 Goodwill Layer

- **Sadaqah Jariyah banner** on Home Dashboard — links to `/support`
- **Dedicated Support page** with mission narrative and donation options
- **Patron Badge** (planned) — donors ($10+ one-time) receive a golden crescent icon on sighting reports

### 11.6 Future Monetization (Planned)

| Item | Status | Description |
|------|--------|-------------|
| Push Notifications | ⏳ Planned | Pro-only crescent alerts via Capacitor + FCM/APNs |
| Ethical Ads | ⏳ Planned | Muslim Ad Network below-fold for free tier |
| Mosque Widget | 🔮 Future | Embeddable iframe for mosques ($10-$20/month B2B) |
| Developer API | 🔮 Future | REST API for visibility calculations (tiered pricing) |

*Documentation updated February 25, 2026 (Round 33 - Monetization). For the latest feature status, see `todo.md`.*
