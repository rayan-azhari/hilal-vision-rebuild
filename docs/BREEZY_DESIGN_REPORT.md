# Breezy Weather — Design System Analysis Report

**Prepared for:** Hilal Vision Design Overhaul (Round 10)
**Date:** February 2026
**Source:** [breezy-weather/breezy-weather](https://github.com/breezy-weather/breezy-weather) (9.4k stars)

---

## Executive Summary

Breezy Weather is one of the most visually sophisticated open-source Android weather applications available. Its design is built on three interlocking principles: **Material 3 Expressive** as the foundational design language, **weather-contextual theming** (the entire UI shifts colour palette based on current conditions and time of day), and a **card-based information architecture** that presents dense meteorological data without feeling overwhelming. Understanding this design system in depth is the primary objective of this report, as it informs the Round 10 visual overhaul of Hilal Vision.

---

## 1. Foundation: Material 3 Expressive

The root theme declaration in `app/src/main/res/values/styles.xml` is:

```xml
<style name="BreezyWeatherTheme" parent="Theme.Material3Expressive.DayNight.NoActionBar">
```

**Material 3 Expressive** is the latest evolution of Google's Material Design system, introduced in 2024–2025. It differs from standard Material 3 in several important ways. Where standard Material 3 uses conservative rounded rectangles with a 16dp corner radius, Material 3 Expressive employs organic, variable shapes ranging from 12dp to 28dp. Typography is bolder with more dramatic size jumps between scale levels. The colour system is richer, with more vibrant tonal variation. Motion uses spring physics rather than standard easing curves, giving UI elements a sense of physical weight and personality.

The `DayNight` suffix in the parent theme means the app automatically switches between light and dark colour schemes based on system preference or, in Breezy's case, the actual sunrise and sunset times at the viewed location. `NoActionBar` removes the traditional Android toolbar entirely, enabling the full-bleed immersive header that is the app's most recognisable visual signature.

Two additional window configuration attributes complete the immersive effect:

```xml
<item name="android:statusBarColor">@android:color/transparent</item>
<item name="android:navigationBarColor">@android:color/transparent</item>
```

By making both system bars transparent, the weather background gradient bleeds all the way to the physical edges of the screen — behind the status bar clock at the top and behind the navigation gesture area at the bottom. This is what creates the signature edge-to-edge look that distinguishes Breezy from conventional weather apps.

---

## 2. Colour System

### 2.1 Material 3 Colour Tokens

Breezy Weather defines a complete Material 3 colour scheme in `colors.xml`. The light-mode palette is anchored by a deep blue primary (`#205DAF`) that communicates reliability and precision — appropriate for a scientific data application. The surface colours use an almost-white background (`#FDFBFF`) with a barely perceptible blue tint, which prevents the pure-white harshness while maintaining high contrast for text.

| Token | Value | Role |
|---|---|---|
| `md_theme_primary` | `#205DAF` | Buttons, selected states, key actions |
| `md_theme_primaryContainer` | `#D6E3FF` | Chip backgrounds, tonal surfaces |
| `md_theme_secondary` | teal-blue | Secondary actions |
| `md_theme_secondaryContainer` | `#B1EBFF` | Light cyan surfaces |
| `md_theme_tertiary` | `#775A00` | Warm amber accent |
| `md_theme_tertiaryContainer` | `#FFDF8E` | Light gold surfaces |
| `md_theme_background` | `#FDFBFF` | Page background |
| `md_theme_surface` | `#FDFBFF` | Card surfaces |
| `md_theme_surfaceVariant` | `#DCE1FC` | Lavender-tinted variant surface |

### 2.2 The Custom Card Background

One of the most distinctive and deliberate colour decisions in the entire app is the card background:

```xml
<color name="colorMainCardBackground">#FDF0FF</color>
```

`#FDF0FF` is an extremely subtle **pink-lavender** — almost white but with a warm, slightly magical quality. This is not a standard Material 3 surface colour; it is a custom tint that gives the detail cards a distinctive warmth compared to a pure white or neutral grey background. The effect is subtle enough that most users would not consciously notice it, but it contributes significantly to the app's premium, crafted feel.

### 2.3 Text Colour Hierarchy

The text colour system uses three levels of contrast to establish hierarchy without relying on font weight alone:

| Role | Light Mode | Usage |
|---|---|---|
| Title | `#000000` (pure black) | Card titles, section headings |
| Content | `#666666` (medium grey) | Data values, descriptions |
| Subtitle | `#B2B2B2` (light grey) | Secondary labels, captions, timestamps |
| On weather background | `#FFFFFF` (always white) | All text in the hero header |

The decision to use pure black (`#000000`) for titles rather than a softer near-black is intentional — it maximises contrast against the `#FDF0FF` card background and creates a crisp, precise aesthetic appropriate for scientific data.

### 2.4 Weather Background Gradients

The hero header background changes dynamically based on weather condition and time of day. The system uses dedicated "Implementor" classes for each weather type, each defining its own `themeColor` and animated particle system. The `getBrighterColor()` utility function shifts HSV saturation by +0.25 and value by +0.25 to produce the lighter gradient endpoint from the base colour, ensuring all gradients feel cohesive regardless of weather condition.

| Condition | Implementor | Character |
|---|---|---|
| Clear (day) | `SunImplementor` | Warm golden-to-sky-blue gradient |
| Clear (night) | `MeteorShowerImplementor` | Deep navy with falling meteor particles |
| Cloud / Fog / Haze | `CloudImplementor` | Cool grey-blue gradient |
| Rain / Sleet / Thunderstorm | `RainImplementor` | Dark blue-grey with rain streaks |
| Snow | `SnowImplementor` | Light blue-white with falling snowflakes |
| Hail | `HailImplementor` | Dark grey with bouncing hail particles |
| Wind | `WindImplementor` | Muted blue with horizontal wind streaks |

The app also defines a 5-step gradient scale for the sky palette. The light (daytime) scale progresses through soft teal-cyan tones (`#cfebf0` → `#75becb`), evoking a clear sky. The dark (night-time) scale progresses through deep slate-blue to near-black (`#4b5073` → `#1a1b22`), evoking a night sky. These scales are used for the weather background when no specific weather condition is active.

### 2.5 Data Visualisation Colour Scales

Breezy Weather uses carefully designed colour ramps for all quantitative data. The Air Quality Index uses a 6-step scale from green (`#00e59b`) through yellow, orange, red, pink, to purple (`#9930ff`). The general level scale (used for UV index and similar metrics) uses a 6-step traffic-light progression from green (`#72d572`) to maroon (`#7e0023`). The wind strength scale maps the 13 Beaufort force levels to a colour ramp that transitions from calm blue through green, olive, brown, pink, and purple — a sophisticated encoding that communicates severity intuitively without relying on a simple red-means-danger convention.

---

## 3. Typography

### 3.1 Font Family

Breezy Weather uses the **system default font** (Roboto on Android) throughout. No custom typefaces are imported. This is a deliberate choice: it ensures the app feels native to the platform, loads instantly without font downloads, and benefits from the system's font rendering optimisations. The visual hierarchy is achieved entirely through **size contrast** and **weight variation**, not font variety.

### 3.2 Type Scale

The defining typographic statement of the app is the **140sp main temperature number**. At roughly 3× the size of a normal heading, it creates an immediate focal point that communicates the most important piece of information at a glance. Everything else on the screen is visually subordinate to this number.

| Role | Size | Weight | Usage |
|---|---|---|---|
| Main temperature | 140sp (~8.75rem) | Thin/Light | The giant centred temperature |
| Design title | 48sp (~3rem) | Normal | Section headings in detail views |
| Large title | 20sp (~1.25rem) | Normal | Card titles |
| Title | 16sp (~1rem) | Medium | Sub-section labels |
| Body/Content | 14sp (~0.875rem) | Normal | Data values, descriptions |
| Subtitle | 12sp (~0.75rem) | Normal | Secondary labels, captions |
| Current weather | 23sp (~1.44rem) | Normal | Weather condition text |
| Details name/value | 15sp (~0.94rem) | Normal | Key-value pairs in header |

The thin/light weight for the giant temperature number is another deliberate choice. A bold 140sp number would feel aggressive and heavy; the thin weight makes it feel airy and precise, like a scientific instrument readout.

---

## 4. Layout Architecture

### 4.1 Overall Structure

The main screen is a **single vertical RecyclerView** with heterogeneous card types. There is no traditional navigation bar or tab bar — the entire screen is devoted to weather information. Navigation between locations is handled by horizontal swipe gestures, with a dot indicator showing the current location index. This maximises the amount of weather data visible at any given time.

The structural hierarchy from top to bottom is:

1. **Hero header** (full-bleed gradient): Location name, timestamp, giant temperature, weather condition, and a row of key metrics (feels-like, wind, UV, humidity).
2. **Alert card** (if active): Full-width red/amber warning card immediately below the header.
3. **Precipitation nowcast** (if available): Full-width bar chart showing expected rainfall in the next 60 minutes.
4. **Daily forecast card** (full-width): 7-day forecast with tab chips for Temperature, Air Quality, Wind, and UV.
5. **Hourly forecast card** (full-width): 24-hour forecast with the same tab chip system.
6. **Detail cards** (half-width grid): Pairs of cards covering Humidity, UV Index, Visibility, Pressure, Sun, Moon, Wind, Air Quality, Pollen, and Precipitation.
7. **Footer**: Data source attribution.

### 4.2 The Half-Width Card Grid

The half-width card grid is the most distinctive structural element of Breezy Weather. Rather than presenting all detail data in a single long list, the app groups related metrics spatially in a 2-column grid. Each card is self-contained and roughly square, making them easy to scan at a glance. The grid creates a visual rhythm that makes the page feel organised rather than overwhelming, despite the density of information.

### 4.3 Spacing System

The app uses an 8dp base grid throughout. Standard card padding is 16dp, outer screen margins are 20dp, and the gap between cards is 2dp for tightly related items or 16dp for section separators. Card corner radii follow Material 3 Expressive conventions: settings list items use 28dp (very rounded, "pill-like"), forecast and detail cards use 16dp (standard rounded), and inner elements within cards use 12dp.

---

## 5. Card Design Patterns

### 5.1 The Abstract Card Structure

Every half-size detail card follows the same structural template. A header row contains a small icon, the card title in medium weight, and an optional "Details →" link. Below this is a **decorative visual** — a unique graphical element that encodes the card's primary data. Below the decorative visual is the **giant primary value** (48–80sp, bold), followed by a status sublabel in muted text. Optional secondary information appears at the bottom as small chips or text.

The decorative visual is what makes each card memorable and distinct from the others. Critically, these are not purely decorative elements — each one encodes the card's primary data in a visual form. The arc on the Sun card is the sunrise-to-sunset path. The dot scale on the UV card is the UV index value. The wave shape on the Humidity card evokes the moisture content. This "data as decoration" principle is one of the most sophisticated aspects of Breezy Weather's design.

| Card | Decorative Element | Data Encoded |
|---|---|---|
| Humidity | Wavy water/cloud shape in lavender | Moisture level |
| UV Index | Concentric coloured dots with starburst | UV severity on colour scale |
| Visibility | Cloud silhouette in light purple | Atmospheric clarity |
| Pressure | Circular gauge arc | Pressure value on arc |
| Sun | Dashed orange arc with sun icon | Sun path across sky |
| Moon | Dashed grey arc with moon icon | Moon path across sky |
| Wind | Directional arrow or wind rose | Wind direction and speed |
| Air Quality | Coloured gradient bar | AQI level on colour scale |

### 5.2 The Sun and Moon Cards

The Sun and Moon detail cards are particularly relevant to Hilal Vision. The expanded view features a **semi-circular daylight dome** rendered as a gradient blue arc, with the sun or moon icon positioned along the arc at its current position. The dome shows the total daylight duration centred within it, with golden hour times on the left and right edges and rise/set times below the arc. Colourful gradient bars on the sides represent sky colour transitions throughout the day — orange to purple to blue, evoking the actual colours of the sky at different times.

### 5.3 The Forecast Cards

The full-width forecast cards use a **horizontal tab chip** system at the top. The selected chip is filled with the primary container colour; unselected chips are outlined. Below the chips, the content area shows a horizontal scroll of day or hour columns, each containing a day abbreviation, weather icon, and a **trend line chart** connecting temperature highs and lows. The trend chart is a custom-drawn canvas element — not a standard chart library — which gives it a clean, precise appearance without the visual noise of grid lines or axes.

---

## 6. Animation and Motion System

### 6.1 Weather Background Animations

Each weather condition has a dedicated particle animation system. Clear day shows subtle sun rays and a gentle shimmer. Clear night shows falling meteor shower particles with twinkling stars. Cloudy shows slowly drifting cloud layers at different depths. Rainy shows falling rain streaks with varying opacity and angle. Snowy shows falling snowflakes with parallax depth. Windy shows horizontal wind streaks. Hail shows bouncing hail particles. These animations run on a dedicated `SurfaceView` behind the card list, creating a layered parallax effect as the user scrolls.

### 6.2 Scroll Parallax

As the user scrolls down through the card list, the header background scrolls at a slower rate than the cards, creating a parallax depth effect. The weather animation layer also shifts slightly, reinforcing the sense of depth and making the background feel like a real sky rather than a flat image.

### 6.3 Card Entrance Animations

Cards animate in with a fade + slide-up entrance when the screen first loads or when data refreshes. The stagger delay between cards creates a cascading reveal effect, drawing the eye downward through the content hierarchy.

### 6.4 Tab Chip Transitions

Switching between tabs within a forecast card uses a shared element transition — the selected indicator slides horizontally between chips with spring physics rather than a simple crossfade. This gives the interaction a physical, satisfying quality.

---

## 7. Theme Management System

### 7.1 Multi-Layered Theme Logic

The `ThemeManager` class implements a three-factor theming system. The first factor is the user's explicit preference (Always Light / Always Dark / Follow System). The second factor is the location's current daylight status — is it currently daytime at the viewed location? The third factor is the system-level dark mode state from Android's `UiModeManager`.

The combination of these three factors determines whether the app renders in light or dark mode at any given moment. Crucially, the app can show a light theme at night (if the user prefers it) or a dark theme during the day. The daylight status is used for the weather background gradient independently of the card theme — a user can have dark-mode cards with a daytime sky gradient, or light-mode cards with a night-sky gradient.

### 7.2 Location-Based Day/Night

The weather background gradient transitions between day and night variants based on the `isDaylight` property of the current `Location` model. This is calculated from the location's actual sunrise and sunset times, meaning a user viewing weather for Tokyo while physically in London will see Tokyo's day/night state. This is a subtle but important detail — the app is always showing you the sky at the place you're looking at, not the sky outside your window.

---

## 8. Information Architecture

### 8.1 Data Hierarchy

Breezy Weather presents weather data in a clear priority order that reflects how people actually think about weather. The immediate context (current temperature and condition) comes first and is given the most visual weight. The temporal forecast (what's coming) comes second. Environmental detail (deeper data for specific parameters) comes third. Attribution (data source transparency) comes last.

### 8.2 Progressive Disclosure

The app uses a two-level disclosure model. Level 1 (the main screen) shows a summary value and decorative visual per card. Level 2 (a detail view) shows a full chart, historical data, and explanatory text, accessed by tapping a card or the "Details →" link. This keeps the main screen scannable while making full data accessible without navigating away entirely.

### 8.3 Alert System

Weather alerts appear as full-width red/amber cards immediately below the header, before any forecast data. The alert card uses a soft red background (`#FFB4AB`) with dark red text (`#BA1A1A`), an icon, alert type label, and brief description. Tapping expands the full alert text. The placement — before forecast data — reflects the priority: if there is an active weather warning, that is more important than tomorrow's forecast.

---

## 9. Design Principles

From the codebase and visual analysis, several core design principles govern Breezy Weather's design decisions.

**Data as decoration.** Rather than separating "data" from "decoration," Breezy Weather treats the data itself as the visual element. The arc on the Sun card is the sunrise/sunset data. The dot scale on the UV card is the UV index. There are no purely decorative elements that do not encode information.

**Context-responsive identity.** The app has no fixed colour identity. Its visual appearance is determined by the current weather and time of day at the viewed location. This is a radical departure from conventional app design where brand colours are fixed and unchanging.

**Generous whitespace with information density.** Despite showing a large amount of meteorological data, the app never feels cluttered. This is achieved through the half-size card grid (which groups related data spatially) and generous 16–20dp margins throughout.

**Typography as the primary hierarchy signal.** The 140sp temperature number is so large it creates an immediate visual anchor. Everything else on the screen is subordinate to it. This single typographic decision communicates more about the app's priorities than any colour or layout choice.

**Transparency about data provenance.** The footer always shows the data source. This is a trust-building pattern that is especially important for apps dealing with real-world conditions where accuracy matters.

---

## 10. Web Adaptation Guide for Hilal Vision

When adapting Breezy Weather's design language to Hilal Vision (a web application about Islamic moon visibility), the following translation guide applies.

### 10.1 What Translates Directly

The card-based layout with full-width and half-width cards is directly applicable. The giant primary value typography pattern (e.g., moon age in days, illumination percentage) maps perfectly. The decorative visual per card (arc for moon path, dot scale for visibility quality) can be implemented as SVG or Canvas elements. The colour level system for visibility ratings (Zones A–F) is already implemented in Hilal Vision and aligns with Breezy's AQI colour scale philosophy. The dark navy night-sky palette for the hero background is already in use.

### 10.2 What Needs Web-Specific Adaptation

Android `dp` units translate to CSS `px` at 1:1 ratio at standard density. Android `sp` units translate to CSS `rem` (140sp ≈ 8.75rem). The `RecyclerView` heterogeneous layout maps to CSS Grid with `grid-template-columns: 1fr 1fr` for the half-width card pairs. The `SurfaceView` particle animations can be replicated with CSS animations, Canvas 2D, or WebGL. The parallax scroll effect can be replicated with CSS `background-attachment: fixed` or JavaScript scroll listeners. Material 3 Android components map to shadcn/ui + Tailwind equivalents.

### 10.3 Moon-Specific Colour Palette Recommendation

Based on Breezy's night palette and the specific requirements of a moon visibility application, the following colour palette is recommended:

| Role | Value | Rationale |
|---|---|---|
| Background | `#0D1117` → `#1A1A2E` | Deep navy, evokes night sky |
| Card surface | `#1E1E2E` | Dark purple-navy, like Breezy's `#FDF0FF` but for dark mode |
| Primary accent | `#C4A882` | Warm gold/crescent colour, replaces Breezy's blue primary |
| Secondary accent | `#7B9FD4` | Moonlight blue, replaces Breezy's teal secondary |
| Text on dark | `#E8E8F0` | Cool white, high contrast on dark surfaces |
| Muted text | `#8892A4` | Slate, for secondary labels and captions |
| Zone A (easily visible) | `#4ade80` | Green, matches Breezy's AQI level 1 |
| Zone B (visible) | `#facc15` | Yellow, matches Breezy's AQI level 2 |
| Zone C (optical aid) | `#fb923c` | Orange, matches Breezy's AQI level 3 |
| Zone D (optical only) | `#f87171` | Red, matches Breezy's AQI level 4 |
| Zone E/F (not visible) | `#6b7280` / `#374151` | Grey, matches Breezy's AQI levels 5–6 |

---

## References

- [Breezy Weather GitHub Repository](https://github.com/breezy-weather/breezy-weather)
- [Material 3 Expressive Design System](https://m3.material.io/)
- [Breezy Weather colors.xml](https://raw.githubusercontent.com/breezy-weather/breezy-weather/main/app/src/main/res/values/colors.xml)
- [Breezy Weather styles.xml](https://raw.githubusercontent.com/breezy-weather/breezy-weather/main/app/src/main/res/values/styles.xml)
- [MaterialWeatherThemeDelegate.kt](https://raw.githubusercontent.com/breezy-weather/breezy-weather/main/ui-weather-view/src/main/java/org/breezyweather/ui/theme/weatherView/materialWeatherView/MaterialWeatherThemeDelegate.kt)
