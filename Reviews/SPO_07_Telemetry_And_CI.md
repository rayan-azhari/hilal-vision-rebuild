# SPO 07: Telemetry, Service Worker, and CI/CD

## Objective
Finalize the reliability envelope of the application by deploying asynchronous telemetry pipelines, automated PWA service workers, and a secure CI/CD pipeline.

## Context
Synchronous external API calls (e.g., Open-Meteo) timeout within Vercel's 10-second window, failing user telemetry submissions. Hand-written service workers break application caching. Deployments need rigorous CI gates before shipping.

## Instructions
1. **Async Telemetry Pipeline**:
   - For `/api/telemetry/submit`, validate inputs with Zod and return `200 OK` instantly to the mobile/web user.
   - Save the record with `enrichment_status: 'pending'`.
   - Dispatch an async event (e.g., Vercel Background Functions, Upstash QStash, or Inngest) to securely contact Open-Meteo.
   - The background function updates the record `enrichment_status: 'enriched'`, ensuring no user request ever "times out".
2. **PWA Automation**:
   - Integrate `next-pwa` or `serwist` into `apps/web/next.config.mjs`.
   - Erase the brittle legacy `sw.js`. Ensure auto-generation handles precaching and dynamic data caching strictly.
3. **CI/CD Pipeline**:
   - Add `.github/workflows/ci.yml`.
   - Steps: `pnpm lint` -> `pnpm turbo build` -> `vitest (Packages)` -> `playwright (Web E2E)` -> `Detox (Mobile Mock tests)`.
   - Configure Neon DB branching to spin up isolated Postgres instances per-PR.

## Success Criteria
- An API POST to `/api/telemetry` responds in < 300ms, with Open-Meteo data filled in the database ~2 seconds later.
- CI pipeline catches breaking TypeScript changes across `packages/*`.
- Serwist `sw.js` generates properly at build time without explicit version caching strings.
