# 🌙 Hilal Vision

**Advanced lunar visibility predictions and Islamic astronomical analytics for the global community.**

Hilal Vision is a precision astronomical web platform for predicting and visualising Islamic crescent moon (هلال) sightings worldwide. It implements the internationally recognised Yallop (1997) and Odeh (2004) visibility criteria, presenting the results with visual clarity and interactivity.

---

## Architecture

**Turborepo** monorepo with shared packages for maximum code reuse across web and future mobile.

```
hilal-vision/
├── apps/
│   └── web/              → Next.js 15 (App Router) web application
├── packages/
│   ├── astronomy/        → @hilal/astronomy — Pure TS math (Yallop, Odeh, Hijri)
│   ├── db/               → @hilal/db — Drizzle ORM + Neon PostgreSQL + PostGIS
│   ├── types/            → @hilal/types — Shared Zod schemas
│   └── ui/               → @hilal/ui — Design tokens & shared components
├── _legacy/              → Archived legacy codebase (Read-only reference)
├── directives/           → SPO build directives for rebuild orchestration
├── turbo.json            → Turborepo pipeline config
└── pnpm-workspace.yaml   → pnpm workspace definition
```

## Tech Stack

| Layer | Technology |
|:---|:---|
| **Framework** | Next.js 15 (App Router, Turbopack) |
| **Styling** | Tailwind CSS v4, OKLCH color system, `@custom-variant` dark mode |
| **State** | Zustand (persisted to `localStorage`) |
| **API** | tRPC v11 (fetchRequestHandler, JSON transport) |
| **Auth** | Clerk (`@clerk/nextjs`) — middleware-protected routes |
| **Payments** | Stripe (Checkout Sessions + Webhooks) |
| **Database** | Neon PostgreSQL (serverless HTTP driver), Drizzle ORM, PostGIS |
| **Maps** | MapLibre GL JS (visibility heatmaps via GeoJSON layers) |
| **Astronomy** | `astronomy-engine` (VSOP87/ELP2000), custom Yallop/Odeh implementations |
| **i18n** | `react-i18next` (EN, AR, UR with RTL support) |
| **Monorepo** | Turborepo, pnpm workspaces |

## Features

### Implemented ✅
- **Global Visibility Map** — Interactive MapLibre heatmap with Yallop/Odeh zone overlays, cloud cover toggle (Pro), and best-time-to-observe calculator
- **Moon Phase Dashboard** — Real-time illumination, age, altitude/azimuth charts, 3D MoonGlobe, Sky Dome tracker, and scientific methodology visualizers
- **Hijri Calendar** — Triple-engine system (Astronomical, Umm al-Qura, Tabular) with Islamic event tracking
- **Horizon View** — Local sunset/moonset horizon simulator with ARCV/DAZ annotations
- **ICOP Archive** — 1,000+ historical crescent sighting records (1438–1465 AH)
- **Crowdsourced Sightings** — "I saw it!" report form with EXIF GPS extraction, PostGIS storage, and tRPC telemetry router
- **Authentication** — Clerk sign-in/sign-up with Pro tier syncing to Zustand
- **Payments** — Stripe checkout (Monthly/Annual/Lifetime) with webhook-driven Pro activation
- **Pro Feature Gating** — `ProGate` component wraps premium features (cloud overlay, archive years)
- **Dark/Light Themes** — Full OKLCH dual-theme system with class-based switching
- **Multi-language** — English, Arabic (العربية), Urdu (اردو) with RTL layout support
- **Content Pages** — About, Methodology, Terms, Privacy, Support Us

### Remaining for Production 🔧
- **Translation completeness** — Arabic and Urdu locale files need full translation pass
- **Image upload pipeline** — Wire S3/Cloudflare R2 for observation photo storage (currently placeholder)
- **Database migrations** — Run `drizzle-kit push` against production Neon instance
- **Push notifications** — Wire `pushTokens` schema to web push subscription
- **Mobile app** — React Native (Expo Router) port using shared `@hilal/astronomy` package
- **Vercel KV caching** — Pre-generate daily visibility grids via cron jobs
- **E2E testing** — Playwright test suite for critical user flows

## Environment Variables

```env
# Database
DATABASE_URL=              # Neon PostgreSQL connection string

# Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Payments
STRIPE_SECRET_KEY=
STRIPE_MONTHLY_PRICE_ID=
STRIPE_ANNUAL_PRICE_ID=
STRIPE_LIFETIME_PRICE_ID=
STRIPE_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_APP_URL=       # e.g. https://hilalvision.com
```

## Getting Started

### Prerequisites
- Node.js v20+
- pnpm v9+

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm run dev
```

Starts the Next.js dev server at `http://localhost:3000` via Turbopack.

### Database

```bash
cd packages/db
pnpm db:push       # Push schema to Neon
pnpm db:studio     # Open Drizzle Studio
```

### Build & Lint

```bash
pnpm run build     # Production build
pnpm run lint      # ESLint across all packages
```

## Project Architecture Deep Dive

### Astronomy Engine (`@hilal/astronomy`)

Pure TypeScript package with zero runtime dependencies beyond `astronomy-engine`. Contains:
- **Yallop criterion** — q-value calculation from ARCV and crescent width
- **Odeh criterion** — V-value refinement trained on 737 ICOP observations
- **Hijri calendar** — Three independent engines (Astronomical conjunction, Umm al-Qura KACST tables, Tabular/Kuwaiti)
- **Best-time-to-observe** — Scoring function combining moon altitude, sun depression, and atmospheric conditions

### Database (`@hilal/db`)

Drizzle ORM schema with PostGIS support:
- `users` — Clerk-linked user profiles with observer badges and sighting counts
- `observation_reports` — Crowdsourced sighting data with PostGIS `Point` geometry
- `push_tokens` — Web push notification subscriptions
- `stripe_customers` — Stripe ↔ Clerk ID mapping

### State Management

Zustand store (`useAppStore`) manages:
- Global location, date, and visibility criterion
- Dark mode preference (persisted)
- Pro/Patron/Admin tier flags (synced from Clerk metadata)
- UI modal states (upgrade, sighting report)

### Authentication Flow

1. Clerk middleware protects routes defined in `middleware.ts`
2. `ProTierSync` component reads Clerk `publicMetadata` → writes to Zustand
3. tRPC `protectedProcedure` enforces auth via Clerk's `auth()` middleware
4. Stripe webhooks update Clerk metadata on payment events

### Design System

The "Deep Space" dark theme and "Clinical Aerospace" light theme use OKLCH color space throughout:
- CSS custom properties defined in `globals.css` (`:root` for light, `.dark` for dark)
- Tailwind v4 `@custom-variant dark` for class-based switching
- Inline `<script>` in `layout.tsx` prevents FOUC by reading persisted theme before paint

---

*صدقة جارية — Sadaqah Jariyah*
