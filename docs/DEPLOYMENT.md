# Vercel Deployment Guide

## Architecture

Hilal Vision deploys to Vercel as a **hybrid application**:

| Layer | Technology | Vercel Hosting |
|-------|-----------|---------------|
| Frontend | React 19 + Vite | Static build → CDN (`dist/public/`) |
| API | tRPC + Express | Node.js serverless function (`api/trpc/[trpc].ts`) |
| Database | Drizzle ORM + MySQL | External (optional — only needed for telemetry) |

## Quick Start

```bash
# 1. Push to GitHub
git add . && git commit -m "deploy" && git push

# 2. Import at https://vercel.com/new
#    Vercel auto-detects settings from vercel.json

# 3. (Optional) Set environment variables:
#    DATABASE_URL — MySQL connection string for telemetry persistence
```

## Configuration Files

### `vercel.json`

```json
{
  "buildCommand": "npm run vercel-build",
  "outputDirectory": "dist/public",
  "rewrites": [
    { "source": "/api/trpc/:path*", "destination": "/api/trpc" },
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

- **Build**: Runs `npx vite build` to generate static assets
- **Output**: Serves from `dist/public/`
- **Rewrites**: Routes `/api/trpc/*` to the serverless function; all other routes fall back to `index.html` for SPA routing

### `api/trpc/[trpc].ts`

The serverless function wraps the existing tRPC router using `@trpc/server/adapters/fetch`. It:
- Converts the incoming request to a fetch `Request`
- Passes it through `fetchRequestHandler` with the tRPC router
- Forwards request headers (for rate limiting by IP)
- Runs on the Node.js runtime

### `package.json` Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `tsx server/_core/index.ts` | Local development (Express + Vite HMR) |
| `build` | `vite build` | Production build |
| `vercel-build` | `npx vite build` | Vercel-specific build (uses npx) |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | No | MySQL connection string. Without it, telemetry data is not persisted. |
| `NODE_ENV` | Auto | Set to `production` by Vercel |

## What Works on Vercel

| Feature | Status |
|---------|--------|
| All client-side pages | ✅ Full functionality |
| Moon phase calculations | ✅ Client-side SunCalc |
| Hijri calendar | ✅ Conjunction-based, client-side |
| 3D Globe + 2D Map | ✅ WebGL + Leaflet |
| tRPC telemetry API | ✅ Serverless function |
| Report sighting form | ✅ Uses tRPC endpoint |
| Rate limiting | ✅ In-memory (per function invocation) |

## What Does NOT Work

| Feature | Reason | Fix |
|---------|--------|-----|
| Authentication (OAuth) | Manus SDK is platform-specific | Replace with Clerk, NextAuth, or Auth.js |
| Persistent rate limiting | In-memory store resets per invocation | Use Vercel KV or Upstash Redis |

## Troubleshooting

**Build fails**: Ensure `npx vite build` works locally. Check that all `import` paths resolve.

**API returns 404**: Verify `vercel.json` rewrites are correct and `api/trpc/[trpc].ts` exists.

**Tiles not loading**: The Leaflet map requires CARTO CDN access. Ensure no CSP headers block `*.basemaps.cartocdn.com`.
