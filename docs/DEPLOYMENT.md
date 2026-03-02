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
git add -u && git commit -m "deploy" && git push

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
  "buildCommand": "npx vite build",
  "outputDirectory": "dist/public",
  "framework": null,
  "crons": [
    { "path": "/api/cron/moonAlerts", "schedule": "0 8 * * *" }
  ],
  "functions": {
    "api/trpc/[trpc].ts":        { "includeFiles": "server/**" },
    "api/stripe/checkout.ts":    { "includeFiles": "server/**" },
    "api/stripe/webhook.ts":     { "includeFiles": "server/**" },
    "api/revenuecat/webhook.ts": { "includeFiles": "server/**" },
    "api/v1/[...path].ts":       { "includeFiles": "server/**" },
    "api/push/send.ts":          { "includeFiles": "server/**" },
    "api/cron/moonAlerts.ts":    { "includeFiles": "server/**" }
  },
  "rewrites": [
    { "source": "/api/stripe/checkout",      "destination": "/api/stripe/checkout" },
    { "source": "/api/stripe/webhook",       "destination": "/api/stripe/webhook" },
    { "source": "/api/revenuecat/webhook",   "destination": "/api/revenuecat/webhook" },
    { "source": "/api/push/send",            "destination": "/api/push/send" },
    { "source": "/api/cron/moonAlerts",      "destination": "/api/cron/moonAlerts" },
    { "source": "/api/trpc/:path*",          "destination": "/api/trpc/[trpc]" },
    { "source": "/api/v1/:path*",            "destination": "/api/v1/[...path]" },
    { "source": "/api/v1",                   "destination": "/api/v1/[...path]" },
    { "source": "/((?!api/).*)",             "destination": "/index.html" }
  ]
}
```

- **Build**: Runs `npx vite build` to generate static assets
- **Output**: Serves from `dist/public/`
- **Functions**: 7 serverless functions — tRPC API, Stripe checkout + webhook, RevenueCat webhook, public REST API v1, push notifications, and Vercel cron
- **Rewrites**: Each `/api/*` route maps to its serverless function; all other routes fall back to `index.html` for SPA routing

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
| `REVENUECAT_WEBHOOK_AUTH`    | Yes      | Bearer token for RevenueCat webhook auth (`api/revenuecat/webhook.ts`) |
| `VITE_REVENUECAT_APPLE_KEY`  | Yes (iOS) | RevenueCat Apple/iOS SDK key (client-side, Vite env var)           |
| `VITE_REVENUECAT_GOOGLE_KEY` | Yes (Android) | RevenueCat Google/Android SDK key (client-side, Vite env var) |
| `FIREBASE_ADMIN_CREDENTIALS` | Yes      | Firebase service account JSON (full JSON string) — required for push notifications |
| `CRON_SECRET`                | Yes      | Shared secret for cron → `api/push/send` auth; sent as `x-cron-secret` header |

> **Stripe webhook endpoint:** `https://moon-dashboard-one.vercel.app/api/stripe/webhook`
> Events to listen for: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`

---

## Push Notifications (Firebase Cloud Messaging)

Push notifications are sent via Firebase Admin SDK (`firebase-admin 13.6.1`).

### Setup

1. Go to [Firebase Console](https://console.firebase.google.com) → your project → **Project Settings** → **Service Accounts** tab
2. Click **Generate new private key** → download the JSON file
3. Paste the **entire JSON content** as a single string into the `FIREBASE_ADMIN_CREDENTIALS` environment variable in Vercel

### Serverless Functions

| Function | Purpose |
|---|---|
| `api/push/send.ts` | FCM broadcast endpoint. Accepts a list of FCM tokens and a notification payload. Sends in 500-token batches and cleans up stale/invalid tokens automatically. Protected by `CRON_SECRET` via `x-cron-secret` header. |
| `api/cron/moonAlerts.ts` | Daily cron job (08:00 UTC). Queries all subscribed FCM tokens from DB and calls `api/push/send` with the appropriate alert. |

### Vercel Cron

The `moonAlerts` cron runs automatically at **08:00 UTC daily** via Vercel Cron (configured in `vercel.json`):

```json
"crons": [{ "path": "/api/cron/moonAlerts", "schedule": "0 8 * * *" }]
```

Alert types sent:
- **29th Hijri night** — crescent watch reminder
- **Full Moon**
- **Blue Moon** (second full moon in a Gregorian month)
- **Lunar Eclipse** — total, partial, or penumbral (from `shared/astronomy.ts:predictLunarEclipse()`)

**To test manually:**
```bash
curl -X POST https://moon-dashboard-one.vercel.app/api/cron/moonAlerts \
  -H "x-cron-secret: <CRON_SECRET>"
```

---

## What Works on Vercel

| Feature                 | Status                            |
| ----------------------- | --------------------------------- |
| All client-side pages   | ✅ Full functionality             |
| Moon phase calculations | ✅ Client-side astronomy-engine   |
| Hijri calendar          | ✅ Conjunction-based, client-side |
| 3D Globe + 2D Map       | ✅ WebGL + Leaflet                |
| tRPC telemetry API      | ✅ Serverless function            |
| Report sighting form    | ✅ Uses tRPC endpoint             |
| Rate limiting           | ✅ Lazy Upstash Redis (cold-start safe) |
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

> **Version Code:** Google Play requires a unique `versionCode` for every AAB upload. **Before every Play Store build**, increment `versionCode` and `versionName` in `android/app/build.gradle`:
> ```groovy
> versionCode 7    // Current is 6 — increment before every upload (6 → 7 → 8...)
> versionName "1.0.6"  // Human-readable version string
> ```
> **Current:** `versionCode 6` / `versionName "1.0.5"` (bumped Round 41)
>
> **Rule: bump versionCode before every `git push` that targets a Play Store AAB build.** The `versionCode` is an integer that must strictly increase. Google Play rejects uploads with a previously used code. Forgetting this causes "Version code X has already been used" errors in Play Console.

> **Capacitor Native URL & CORS:** The Android WebView origin is `https://localhost`. Two things must be true in `client/src/main.tsx`:
> 1. `API_BASE` is set to the absolute production URL via `Capacitor.isNativePlatform()` so tRPC calls go to `https://moon-dashboard-one.vercel.app/api/trpc` instead of resolving to `https://localhost/api/trpc`.
> 2. `credentials` is set to `"omit"` on native. The server uses `Access-Control-Allow-Origin: *`; combining a wildcard origin with `credentials: "include"` is a CORS spec violation — the browser blocks every request before it leaves the device, causing "You appear to be offline" errors for all users on Android. Native auth uses Clerk tokens/headers, not browser cookies, so `"omit"` is correct.
>
> Always run `npx cap sync` before building to bundle the latest frontend code.

### iOS Release Build

1. **Prerequisites:** You must use a macOS machine with **Xcode** installed.
2. **Synchronize Code:**

```bash
npm run build:cap
npx cap sync ios
```

3. **Open Xcode:** `npx cap open ios`
4. **Sync iOS Version** ⚠️ — Before archiving, update the version in Xcode to match Android:
   - Select the **App** target → **General** → **Identity**
   - Set **Version** (MARKETING_VERSION) to match Android `versionName` (e.g. `1.0.5`)
   - Set **Build** (CURRENT_PROJECT_VERSION) to match Android `versionCode` (e.g. `6`)
   - **Current state:** iOS is at `1.0` / build `1`; Android is `1.0.5` / `6`. These must be aligned.
5. **Build Archive:**
   - Ensure the Target is set to "Any iOS Device (arm64)".
   - Go to **Product** > **Archive**.
   - Use the Xcode Organizer to Distribute the App to App Store Connect.

## Troubleshooting

**Build fails**: Ensure `npx vite build` works locally. Check that all `import` paths resolve.

**API returns 404**: Verify `vercel.json` rewrites are correct and `api/trpc/[trpc].ts` exists.

**Tiles not loading**: The Leaflet map requires CARTO CDN access. Ensure no CSP headers block `*.basemaps.cartocdn.com`.
