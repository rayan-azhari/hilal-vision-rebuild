# Hilal Vision — Architecture Reference

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                        Client                           │
│  Next.js App Router (React 19, Turbopack)               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │
│  │Visibility│ │   Moon   │ │ Calendar │ │  Archive   │ │
│  │   Map    │ │  Phase   │ │  (3-eng) │ │  (ICOP)    │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬───────┘ │
│       │             │            │             │         │
│  ┌────▼─────────────▼────────────▼─────────────▼──────┐ │
│  │              Zustand Store (useAppStore)            │ │
│  │  location · date · criterion · theme · proTier     │ │
│  └────────────────────┬───────────────────────────────┘ │
│                       │ tRPC client                     │
└───────────────────────┼─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│                    Server (Edge)                        │
│  ┌────────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ tRPC Router    │  │ Stripe API   │  │ Clerk Auth  │ │
│  │ (telemetry,    │  │ Routes       │  │ Middleware   │ │
│  │  app)          │  │              │  │             │ │
│  └───────┬────────┘  └──────┬───────┘  └──────┬──────┘ │
│          │                  │                  │        │
│  ┌───────▼──────────────────▼──────────────────▼──────┐ │
│  │              @hilal/db (Drizzle ORM)               │ │
│  │         Neon PostgreSQL + PostGIS                   │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Package Dependency Graph

```
@hilal/astronomy  ←  (no internal deps, only astronomy-engine)
       ↑
apps/web          →  @hilal/astronomy (visibility workers, moon calcs)
       ↓
@hilal/db         ←  apps/web server routes (tRPC, Stripe webhooks)
@hilal/types      ←  shared Zod schemas
```

## Key Data Flows

### 1. Visibility Map Rendering
```
User selects date/location → Zustand store updates
  → useVisibilityWorker spawns Web Worker
  → Worker imports @hilal/astronomy, computes grid
  → Returns Float32Array of q-values per lat/lng cell
  → d3-contour generates GeoJSON polygons per zone
  → MapLibre renders GeoJSON as fill layers with zone colors
```

### 2. Observation Submission
```
User clicks "I saw it!" → SightingModal opens
  → ObservationForm collects lat/lng/time/visual/photo
  → EXIF parser (exifr) extracts GPS from photo metadata
  → tRPC mutation (telemetry.submitObservation)
  → protectedProcedure validates Clerk session
  → Drizzle inserts into observation_reports (PostGIS point)
  → User sighting count incremented
```

### 3. Auth + Pro Tier
```
User signs in via Clerk → middleware.ts validates session
  → ProTierSync reads user.publicMetadata.isPro
  → Writes to Zustand store (isPro, isPatron, isAdmin)
  → ProGate components conditionally render premium features
  → UpgradeModal triggers Stripe Checkout session
  → Stripe webhook updates Clerk metadata on payment
```

## File Structure (apps/web)

```
src/
├── app/                     # Next.js App Router pages
│   ├── (marketing)/         # About, Methodology (MDX)
│   ├── api/                 # Route handlers
│   │   ├── stripe/          # checkout + webhook
│   │   └── trpc/            # tRPC handler
│   ├── archive/             # ICOP archive page
│   ├── calendar/            # Hijri calendar page
│   ├── horizon/             # Horizon view page
│   ├── moon/                # Moon phase dashboard
│   ├── privacy/             # Privacy policy
│   ├── support/             # Support/donate page
│   ├── terms/               # Terms of service
│   ├── visibility/          # Visibility map page
│   ├── globals.css          # Design system (OKLCH themes)
│   ├── layout.tsx           # Root layout (Clerk, i18n, modals)
│   └── page.tsx             # Home page
├── components/              # React components
│   ├── Header.tsx           # Global nav with "I saw it!" button
│   ├── Footer.tsx           # Site footer
│   ├── ObservationForm.tsx  # Sighting report form
│   ├── SightingModal.tsx    # Modal wrapper for ObservationForm
│   ├── VisibilityMap.tsx    # MapLibre visibility heatmap
│   ├── UpgradeModal.tsx     # Stripe checkout modal
│   ├── ProGate.tsx          # Premium feature wrapper
│   └── ...                  # Other UI components
├── hooks/                   # Custom React hooks
│   └── useGeolocation.ts    # Browser geolocation API
├── i18n.ts                  # i18next configuration
├── locales/                 # Translation files (en/ar/ur)
├── server/                  # tRPC server setup
│   ├── trpc.ts              # Router/procedure definitions
│   └── routers/
│       ├── _app.ts          # Root router
│       └── telemetry.ts     # Observation CRUD
├── store/
│   └── useAppStore.ts       # Zustand global store
└── workers/
    └── visibility.worker.ts # Web Worker for heavy math
```

## Design System Tokens

Both themes use OKLCH color space for perceptual uniformity:

| Token | Dark (Deep Space) | Light (Clinical Aerospace) |
|:---|:---|:---|
| `--background` | `oklch(0.35 0.03 245)` | `oklch(0.99 0.0 0)` |
| `--foreground` | `oklch(0.98 0.01 250)` | `oklch(0.20 0.0 0)` |
| `--gold` | `oklch(0.75 0.16 80)` | `oklch(0.72 0.16 80)` |
| `--accent` | `oklch(0.60 0.12 245)` | `oklch(0.60 0.12 245)` |
| `--zone-a` | `oklch(0.72 0.20 145)` | `oklch(0.55 0.15 145)` |

## Security Model

1. **Route protection** — Clerk middleware in `middleware.ts`
2. **API auth** — tRPC `protectedProcedure` validates `ctx.userId`
3. **Webhook verification** — Stripe signature validation
4. **Content Security** — No user HTML rendering, all data sanitized via Zod

## Deployment

- **Hosting**: Vercel (auto-deploy from `main` branch)
- **Database**: Neon PostgreSQL (serverless, connection pooling built-in)
- **CDN**: Vercel Edge Network
- **Domains**: Configure in Vercel dashboard
