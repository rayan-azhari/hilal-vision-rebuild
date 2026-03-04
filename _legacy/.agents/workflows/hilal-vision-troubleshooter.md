---
name: hilal-vision-troubleshooter
description: "Use this skill whenever the user is having trouble with the Hilal Vision (Moon-dashboard) development server, Vercel deployments, or debugging hangs during `npm run dev` or `pnpm dev`. Trigger it if the user mentions Vercel timeout errors (like FUNCTION_INVOCATION_FAILED), Drizzle ORM database connection limits, Vite silent server hangs, or Capacitor cross-platform build issues. "
---

# Hilal Vision Troubleshooter

A specialized skill for diagnosing and fixing issues in the Moon-dashboard (Hilal Vision) codebase. The project is a hybrid React 19/Vite + Node/Express tRPC application deployed on Vercel. 

## 1. Package Manager Constraints
**CRITICAL:** This project strictly uses `pnpm`. Running `npm install` will break the Vercel build because it relies on `pnpm-lock.yaml`. 
- **Symptom:** Vercel deployment fails during the install phase.
- **Fix:** If `package-lock.json` was accidentally created, delete it and run `npx pnpm install --no-frozen-lockfile` to regenerate the `pnpm-lock.yaml`.

## 2. Dev Server Silent Hangs
The command `pnpm dev` (which runs `tsx watch server/_core/index.ts`) will often hang silently without printing `Server running on http://localhost:3000` if the Vite middleware throws an unhandled promise rejection or if the Database connection pool hangs on initialization.
- **Symptom:** Terminal shows `cross-env NODE_ENV=development tsx watch server/_core/index.ts` and then nothing else happens, and `localhost:5000` or `3000` returns ERR_CONNECTION_REFUSED.
- **Troubleshooting Steps:**
  1. Check `.env` and `.env.local` for required variables: `DATABASE_URL` (needed even if fallback is acceptable, bad format can cause MySQL parser to hang) and `UPSTASH_REDIS_REST_URL`.
  2. Inspect `server/_core/vite.ts` and ensure `createViteServer` isn't throwing an error.
  3. Inspect `server/db.ts` to ensure the `mysql2` connection pool has `connectTimeout` correctly set (e.g., 5000ms) so it fails fast instead of hanging the process for 60+ seconds.

## 3. Vercel Serverless Timeouts (`FUNCTION_INVOCATION_FAILED`)
Vercel serverless functions have a strict 10-second execution limit. 
- **Symptom:** Sentry reports `TRPCClientError / FUNCTION_INVOCATION_FAILED` usually triggering on `api/trpc/[trpc].ts`.
- **Primary Causes & Fixes:**
  1. **Database Spikes:** When users switch tabs, React Query's `refetchOnWindowFocus` can spam the DB. Set this to `false` for heavy queries (like `telemetry.getObservations`).
  2. **External API Calls:** Sequential `await fetch()` calls to third parties (like Open-Meteo) easily exceed 10s. Wrap fetches in `Promise.allSettled()` and use an `AbortSignal.timeout(2000)` to fail gracefully rather than crashing the function.
  3. **Cold Starts:** MySQL pool exhaustions. Ensure `server/db.ts` uses a low `connectionLimit: 3`.

## 4. UI Rendering and Overflow Issues
- **Symptom:** Side panels on Map/Globe pages can't be scrolled, or scrollbars are missing.
- **Fix:** Remove `height: "100%"` from flexbox children. Use `min-h-0` on flex containers to allow children to compute scrolling heights natively (`overflow-y-auto`). Remove global `overflow-hidden` constraints on mobile wrappers.
- **Symptom:** Crescent visibility map overlay (green parabolic boundary) renders discontinuously. 
- **Fix:** Web workers generating map textures must normalize the `startOfDay` calculation against the local longitude's UTC offset, rather than relying on the client browser's local timezone.

## 5. Capacitor & Native Builds
- **Symptom:** "You appear to be offline" on Android.
- **Cause:** AndroidWebView origin is `https://localhost`. Making requests to Vercel with `credentials: "include"` violates CORS when the server responds with `Access-Control-Allow-Origin: *`.
- **Fix:** Ensure native clients use `credentials: "omit"` in tRPC links.

By following these diagnostic paths, you can resolve the most common architectural issues in Hilal Vision.
