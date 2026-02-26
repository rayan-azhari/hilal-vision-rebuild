# Vercel Deployment Guide

## Architecture

Hilal Vision deploys to Vercel as a **hybrid application**:

| Layer    | Technology          | Vercel Hosting                                     |
| -------- | ------------------- | -------------------------------------------------- |
| Frontend | React 19 + Vite     | Static build → CDN (`dist/public/`)                |
| API      | tRPC + Express      | Node.js serverless function (`api/trpc/[trpc].ts`) |
| Database | Drizzle ORM + MySQL | External (optional - only needed for telemetry)    |

## Quick Start

```bash
# 1. Push to GitHub
git add . && git commit -m "deploy" && git push

# 2. Import at https://vercel.com/new
#    Vercel auto-detects settings from vercel.json

# 3. Set environment variables in Vercel UI:
#    DATABASE_URL - MySQL connection string
#    UPSTASH_REDIS_REST_URL - Upstash Redis URL
#    UPSTASH_REDIS_REST_TOKEN - Upstash Redis Token
#    CLERK_SECRET_KEY - Clerk backend secret
#    VITE_CLERK_PUBLISHABLE_KEY - Clerk frontend key
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

| Script         | Command                     | Purpose                                |
| -------------- | --------------------------- | -------------------------------------- |
| `dev`          | `tsx server/_core/index.ts` | Local development (Express + Vite HMR) |
| `build`        | `vite build`                | Production build                       |
| `vercel-build` | `npx vite build`            | Vercel-specific build (uses npx)       |

## Environment Variables

| Variable                     | Required | Description                                                           |
| ---------------------------- | -------- | --------------------------------------------------------------------- |
| `DATABASE_URL`               | No       | MySQL connection string. Without it, telemetry data is not persisted. |
| `NODE_ENV`                   | Auto     | Set to `production` by Vercel                                         |
| `UPSTASH_REDIS_REST_URL`     | Yes      | Upstash Redis connection URL                                          |
| `UPSTASH_REDIS_REST_TOKEN`   | Yes      | Upstash Redis token                                                   |
| `CLERK_SECRET_KEY`           | Yes      | Backend secret                                                        |
| `VITE_CLERK_PUBLISHABLE_KEY` | Yes      | Frontend public key                                                   |
| `STRIPE_SECRET_KEY`          | Yes      | Stripe secret key (`sk_live_...` for production, `sk_test_...` for test) |
| `STRIPE_WEBHOOK_SECRET`      | Yes      | Stripe webhook signing secret (`whsec_...`) — from Stripe Dashboard → Developers → Webhooks |
| `STRIPE_PRICE_MONTHLY`       | Yes      | Stripe Price ID for the monthly Pro plan (`price_...`)               |
| `STRIPE_PRICE_ANNUAL`        | Yes      | Stripe Price ID for the annual Pro plan (`price_...`)                |
| `STRIPE_PRICE_LIFETIME`      | Yes      | Stripe Price ID for the lifetime Pro plan (`price_...`)              |

> **Stripe webhook endpoint:** `https://moon-dashboard-one.vercel.app/api/stripe/webhook`
> Events to listen for: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`

## What Works on Vercel

| Feature                 | Status                            |
| ----------------------- | --------------------------------- |
| All client-side pages   | ✅ Full functionality             |
| Moon phase calculations | ✅ Client-side SunCalc            |
| Hijri calendar          | ✅ Conjunction-based, client-side |
| 3D Globe + 2D Map       | ✅ WebGL + Leaflet                |
| tRPC telemetry API      | ✅ Serverless function            |
| Report sighting form    | ✅ Uses tRPC endpoint             |
| Rate limiting           | ✅ Distributed Upstash Redis      |
| Authentication          | ✅ Clerk Auth                     |
| Stripe Payments (Pro)   | ✅ Live mode active               |
| One-time Donations      | ✅ Live mode active               |

---

## Native Mobile Deployment (Capacitor)

Hilal Vision is configured to be packaged natively for iOS and Android using Capacitor.

### Android Release Build

1. **Prerequisites:** Install Android Studio and set `ANDROID_HOME` in your environment.
2. **Synchronize Code:**

```bash
npm run build:cap
npx cap sync android
```

3. **Open Android Studio:** Run the following command in terminal:

```bash
npx cap open android
```

4. **Generate App Bundle (.aab):** Follow these UI steps exactly in Android Studio:
   - Wait for Gradle to finish syncing (progress bar at bottom).
   - Click **Build** > **Generate Signed Bundle / APK...** from the top menu.
   - Select **Android App Bundle** and click **Next**.
   - Under _Key store path_, browse to `android/app/hilalvision.keystore`.
   - Enter the passwords (default `hilal123` / alias: `hilalvision`).
   - Click **Next**, select the **release** build variant, and click **Finish**.
5. The Android Studio build will run. When finished, a popup will say "Locate" - clicking this will reveal the `.aab` file located in `android/app/build/outputs/bundle/release/` ready for Play Console submission.

### iOS Release Build

1. **Prerequisites:** You must use a macOS machine with **Xcode** installed.
2. **Synchronize Code:**

```bash
npm run build:cap
npx cap sync ios
```

3. **Open Xcode:** `npx cap open ios`
4. **Build Archive:**
   - Ensure the Target is set to "Any iOS Device (arm64)".
   - Go to **Product** > **Archive**.
   - Use the Xcode Organizer to Distribute the App to App Store Connect.

## Troubleshooting

**Build fails**: Ensure `npx vite build` works locally. Check that all `import` paths resolve.

**API returns 404**: Verify `vercel.json` rewrites are correct and `api/trpc/[trpc].ts` exists.

**Tiles not loading**: The Leaflet map requires CARTO CDN access. Ensure no CSP headers block `*.basemaps.cartocdn.com`.
