# Hilal Vision

Hilal Vision is an advanced, cross-platform platform for lunar observation, Hijri calendar tracking, and astronomical data visualization. It is designed to combine centuries of traditional sighting methodology with modern technology, providing accurate localized visibility predictions.

## Architecture & Tech Stack

This repository is structured as a **Turborepo** monorepo, separating the web application, the mobile application, and shared logical packages to maximize code reuse and maintainability.

### Apps
*   **`apps/web`**: The main web application built with **Next.js 15 (App Router)**. Features server-side rendering, edge API routes, and complex WebGL data visualizations (Globe.gl, MapLibre GL).
*   **`apps/mobile`**: The native mobile application powered by **React Native & Expo** (pending implementation).

### Shared Packages
*   **`@hilal/astronomy`**: Pure TypeScript core library holding all mathematical models (Yallop, Odeh criteria, triple-engine Hijri calculations, and atmospheric refraction logic).
*   **`@hilal/db`**: Database schema and queries using **Drizzle ORM** targeting a serverless **Neon PostgreSQL** database (PostGIS enabled).
*   **`@hilal/types`**: Shared Zod validation schemas for cross-platform type safety.
*   **`@hilal/ui`**: Shared design tokens, OKLCH color palettes, and base components following the "Breezy Weather" aesthetic.

## Completed Features (Web)

*   **Astronomy Engine Refactoring**: The monolithic server architecture was dismantled, isolating all heavy math into the standalone `@hilal/astronomy` package.
*   **Hijri Calendar**: A robust, three-mode calendar system (Tabular, Astronomical, Umm al-Qura).
*   **Moon Phases Dashboard**:
    *   Dynamic 3D MoonGlobe visualization.
    *   Interactive Sky Dome Tracker (Azimuth/Altitude radar).
    *   24-hour Sun & Moon Altitude trajectory charts powered by Recharts.
    *   Yallop & Odeh criterion scientific breakdown visualizers.
*   **Crescent Sighting Countries**: Interactive zone map predicting global crescent visibility based on sunset time algorithms.

## Getting Started

### Prerequisites
*   Node.js (v20+)
*   Pnpm (v9+)

### Installation

1.  Clone the repository and install dependencies:
    ```bash
    pnpm install
    ```
2.  Start the development server:
    ```bash
    pnpm run dev
    ```
    This will start the Turbopack build system, spinning up the Next.js web interface at `http://localhost:3000`.

## Testing & Linting

We enforce strict TypeScript standards and run automated ESLint rules to prevent production build failures.

```bash
pnpm run lint
pnpm run build
```

## Future Scope

1.  **Backend Cache Automation**: Implementing Vercel KV with Cron jobs to pre-generate global visibility heatmaps dynamically.
2.  **MDX Migration**: Shifting large static blocks (Methodology, Privacy, About) into markdown-driven pages.
3.  **Expo Mobile Build**: Converting the responsive web features into a true native React Native bundle with offline SQLite caching.
