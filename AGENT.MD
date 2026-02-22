# Agent Instructions

> This file is mirrored across CLAUDE.md, AGENTS.md, and GEMINI.md so the same instructions load in any AI environment.

Welcome to the **Moon-dashboard (Hilal Vision)** project. You are operating within a modern, full-stack web application built for lunar visibility analysis, astronomy, and mapping. 

## Tech Stack Overview

- **Frontend:** React 19, Vite, Tailwind CSS (v4), Radix UI components, Framer Motion, wouter
- **Mapping & Scientific Viz:** Leaflet (react-leaflet), Globe.gl, Three.js, D3, SunCalc, Astronomia
- **Backend:** Node.js, Express, tRPC
- **Database:** Drizzle ORM
- **State & Data Fetching:** React Query (@tanstack/react-query)
- **Package Manager:** pnpm

## File Organization & Responsibilities

- `client/` - Frontend React application. Contains UI components, pages, and client-side logic.
- `server/` - Backend Node/Express application. API routes, tRPC routers, and server-side processing.
- `shared/` - Shared code between frontend and backend (e.g., Zod schemas, shared types).
- `drizzle/` - Database migrations, schema definitions, and related configuration.

## Operating Principles

**1. Maintain the Stack Architecture**
- **Type Safety Pipeline:** Use tRPC for API communication between the client and server to preserve end-to-end type safety.
- **Styling UI:** Rely on Tailwind CSS, Radix UI components, and the **Breezy Weather Design System**. Ensure components are responsive, accessible, and maintain a high-quality visual standard using `.breezy-card` and `.breezy-chip` paradigms.
- **Validations:** Use Zod for input validation and schema definitions in the `shared/` directory to keep both frontend and backend synchronized.

**2. Focus on Visual Excellence & Performance**
- Lunar data visualization requires high precision. Ensure that interactive maps (Leaflet/Globe.gl) and charts render flawlessly and perform well with large data sets.
- The UI should feel premium, dynamic, and scientifically accurate. Leverage the dark-tint surface tokens (`oklch(0.095 0.025 280)`) and data-driven SVG visuals (like `MoonArcVisual` or `VisibilityDotScale`) to match the Breezy conversion guide.

**3. Deterministic Problem Solving & Self-Correction**
- When debugging issues (e.g., Map rendering logic, data calculation issues in Astronomia/SunCalc), read stack traces carefully. Fix the specific type or logic error and test your changes before concluding a task.
- Understand the context of the astronomical data (Yallop/Odeh criteria). Don't make assumptions about lunar visibility parameters without verifying against trusted logic.

**4. Evolving Architecture & Telemetry Pipeline**
- The project is evolving to support field observations and ML-based predictions. 
- Backend changes should eventually support Drizzle ORM schemas for telemetry ingestion (`observation_reports`) and proxying DEM (elevation) and AOD (aerosol optical depth) data.

**5. Update Documentation as You Go**
- If you establish new patterns or discover unique edge-cases in the data pipeline, document them.
- Keep any relevant `todo.md` or tracker files updated as you complete tasks.

## Summary

You are building a sophisticated, scientific Web Dashboard for lunar visibility. Prioritize seamless integration of the React frontend with the Node backend through tRPC, ensure robust type safety with Drizzle and Zod, and deliver a visually stunning, premium user experience utilizing the Breezy Design System. Lay the groundwork for the upcoming hub-and-spoke telemetry architecture to ingest ground-truth field observations.