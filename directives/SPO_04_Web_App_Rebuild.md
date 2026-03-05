# SPO 04: Web App Rebuild

## Objective
Rebuild the web frontend as a Next.js 15 App Router app, migrating the existing React/Vite/tRPC logic to Server Components, Actions, and Route Handlers.

## Context
The legacy web app is an SPA wrapped by Vite, with a monolithic API handler (`api/index.ts`) routing everything via Express. We are decomposing this into highly optimized Next.js 15 concepts while retaining the `Breezy Weather` aesthetic via Tailwind v4.

## Instructions
1. **Next.js Setup**:
   - Create the base layout with `next-themes` and a `Zustand` global store.
   - Install `@clerk/nextjs` for auth instead of the legacy `clerk-react`.
2. **Map & Visuals**:
   - Swap `Leaflet` for `MapLibre GL JS`. Use Next.js client layout wrappers dynamically.
   - Port `Globe.gl` / `Three.js` visualizations safely ensuring no SSR mismatched canvas contexts.
3. **Migrate Route Handlers**:
   - Break apart the monolithic `server/_core/index.ts` API.
   - Create Route Handlers at `apps/web/app/api/...`:
     - `/api/trpc/[trpc]/route.ts` (Keep tRPC for complex read queries)
     - `/api/stripe/checkout/route.ts` (Node Runtime)
     - `/api/stripe/webhook/route.ts` (Node Runtime)
     - `/api/revenuecat/webhook/route.ts` (Node Runtime)
     - `/api/push/send/route.ts` (Node Runtime)
4. **App Pages**:
   - Migrate `/visibility`, `/moon`, `/calendar`, `/dashboard`.
   - Re-implement UI components using `@hilal/ui` design tokens.

## Success Criteria
- MapLibre and Globe render correctly in the Next.js `dashboard` directory.
- Users can authenticate with Clerk via `@clerk/nextjs` (Pages protected natively).
- Isolated API routes execute correctly under `npm run dev` and `npm build`.
