# Hilal Vision User Guide

Welcome to **Hilal Vision**, a precision astronomical platform designed for predicting, tracking, and crowdsourcing Islamic crescent moon sightings worldwide. This guide will walk you through the core features of the dashboard.

## Overview of the Interface

At the top of the screen, you will find the main navigation bar. This bar gives you access to the six primary views of the application, alongside the **Theme Toggle** (Light/Dark mode) and the **Report Sighting** button.

### 1. Home Dashboard (`/`)
The home page acts as your command center.
- **Ephemeris Cards:** Displays the immediate astronomical data (Sunrise, Sighting Probability, etc.).
- **Interactive Deep-Dives:** Any card with a subtle gold glow can be clicked to expand into a detailed scientific overlay. For instance, clicking the "Visibility Zone" card opens a detailed breakdown of the Yallop $q$-values and what the lettered zones (A-F) mean.

### 2. 3D Globe (`/globe`)
An interactive, fluid 3D visualization of the Earth.
- **Terminator Line:** Clearly distinguish between day and night globally.
- **Visibility Overlay:** A colored texture mapped directly onto the globe highlights regions where the crescent moon is visible at sunset today. 
- **Performance:** Rendering is heavily optimized to update smoothly when you change dates in the sidebar. The globe satellite texture dynamically matches your chosen Light or Dark theme.

### 3. Visibility Map (`/map`)
A precise 2D Leaflet map designed for rigorous planning.
- **Heatmap Grid:** Overlaying the map is a grid of Yallop visibility probabilities.
- **Time Controls:** Use the slider in the header to step backwards and forwards in time (up to 24 hours) to see how the mathematical visibility changes.
- **Crowdsourced Data:** If any user has submitted a sighting report, it will appear here as a mapped pin! Green implies "Naked Eye", Blue implies "Optical Aid", and Grey implies the observer attempted but failed to see the moon.

### 4. Moon Phase (`/moon`)
A dedicated dashboard for analyzing the lunar cycle.
- **Sun & Moon Altitude Tracker:** Scroll down to find the interactive Recharts graph. This plots the exact altitude of both the Sun (Yellow) and the Moon (Blue) throughout the current day. Move the slider to see how the celestial bodies track across the sky!
- **Illumination Array:** Click the illumination card to view a sparkline graph of the moon's visibility percentage over the next month.

### 5. Hijri Calendar (`/calendar`)
A reliable converter tool.
- View the current Gregorian month mapped against the corresponding Hijri (Islamic) dates.
- It highlights significant upcoming events based on astronomical probabilities.

### 6. Horizon View (`/horizon`)
A local simulator answering the question: *"Where should I look?"*
- Input your city, and the simulator calculates exactly where the moon is on the horizon relative to the setting sun.

---

## 📡 Crowdsourcing Sighting Reports

Hilal Vision's most powerful feature is its live telemetry. We rely on users around the world to report what they see in the sky to validate our mathematical models.

### How to Submit a Report:
1. Click the golden **"Report Sighting" (+)** button in the top navigation bar.
2. Click **"Auto-detect Location"** to allow your browser to grab your exact GPS coordinates. *(Note: We do not track you; this data is only used to validate the astronomy at your specific geographic location).*
3. Set the **Observation Time**. Ensure this perfectly matches the moment you attempted the sighting.
4. Select your **Observation Result**:
   - **Seen with Naked Eye:** You saw the crescent clearly without any binoculars or telescopes.
   - **Seen with Optical Aid:** You had to use a tool to spot it.
   - **Attempted, but Not Seen:** *This is crucial data!* Negative data helps us define the edge of the visibility curves.
5. Add any relevant **Notes**, such as "Thick clouds in the western sky."
6. Click **Submit Sighting**.

**What happens behind the scenes?**
When you hit submit, our backend servers instantly contact **Open-Meteo's** meteorological APIs to grab the live Cloud Cover percentage, Surface Pressure, and Aerosol Optical Depth (Air Pollution/Smog) at your exact coordinates. We store this environmental data alongside your report to construct a bulletproof dataset for future Machine Learning validation.
