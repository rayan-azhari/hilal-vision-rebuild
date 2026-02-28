# Hilal Vision — Security Reference

This document records all security decisions, fixes, and guidelines for the Hilal Vision project. All critical security fixes were implemented in **Round 40**.

---

## Security Architecture Overview

| Layer | Mechanism | Status |
|---|---|---|
| Authentication | Clerk Auth (JWT-based sessions) | ✅ Active |
| Authorization | tRPC middleware (`protectedProcedure`, `adminProcedure`) | ✅ Active |
| CORS | Origin whitelist via `api/_cors.ts` | ✅ Fixed (Round 40) |
| Payments | Stripe webhook signature verification | ✅ Active |
| Native Payments | RevenueCat webhook Bearer auth (fail-closed) | ✅ Fixed (Round 40) |
| Rate Limiting | Upstash Redis sliding window — 5 req/min (tRPC), 10 req/min (public API) | ✅ Fixed (Round 40) |
| Security Headers | `vercel.json` HTTP headers + CSP | ✅ Active (Round 40) |
| Pro Tier Gate | `TESTING_DISABLE_PRO_GATE = false` | ✅ Production (Phase 8a) |

---

## CORS Policy (`api/_cors.ts`)

All API endpoints use a shared CORS helper that validates the `Origin` header against a whitelist. If the origin is not in the list, no `Access-Control-Allow-Origin` header is set — the browser blocks the request.

**Allowed origins:**
```
https://moonsighting.live
https://www.moonsighting.live
https://moon-dashboard-one.vercel.app
https://localhost           ← Capacitor Android WebView
capacitor://localhost       ← Capacitor iOS WebView
http://localhost:3000       ← Local dev (Express)
http://localhost:5173       ← Local dev (Vite)
```

**To add a new origin** (e.g. a custom domain): edit the `ALLOWED_ORIGINS` array in `api/_cors.ts`.

**Why not wildcard (`*`)?**
A wildcard origin, combined with `credentials: "include"`, violates the CORS spec and is rejected by all browsers. Even without credentials, a wildcard on payment endpoints enables CSRF attacks from arbitrary third-party websites.

---

## Authentication & Authorization

### User Authentication (Clerk)

All authenticated tRPC procedures use the `protectedProcedure` middleware in `server/_core/trpc.ts`. This calls `getAuth(req)` (Clerk's Express adapter) and throws `UNAUTHORIZED` if no valid session token is present.

### Admin Authorization

The `adminProcedure` middleware extends `protectedProcedure` with an additional check against `ENV.ownerOpenId` (set via the `OWNER_OPEN_ID` environment variable). Any authenticated user who is not the owner receives `FORBIDDEN`.

Currently gated behind `adminProcedure`:
- `system.notifyOwner` — sends push notifications to the owner

### Stripe Checkout — Server-Side User Identity

The Stripe checkout endpoint (`api/stripe/checkout.ts`) verifies the caller's identity using the Clerk session token from the `Authorization: Bearer <token>` header. The userId is **not** trusted from the request body. The client sends the token via `useAuth().getToken()`.

If the Clerk token is missing for a subscription plan, the endpoint returns **401 Unauthorized**. The `userId` body fallback was removed in Phase 8b. Anonymous donations (no `planId`) are still permitted without authentication.

---

## Payment Security

### Stripe Webhook (`api/stripe/webhook.ts`)

| Check | Implementation |
|---|---|
| Signature verification | `stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)` — rejects any request with invalid signature |
| Raw body | `bodyParser: false` — raw Buffer used for signature verification |
| Subscription revocation | `customer.subscription.deleted` + `invoice.payment_failed` → searches Clerk users by `stripeCustomerId` → revokes `isPro` |
| Lifetime plan protection | Revocation is skipped if `meta.plan === "lifetime"` |
| PII in logs | Sanitized — no userId, customerId, or email in log output |

**Subscription Lifecycle Flow:**
1. User pays → `checkout.session.completed` → `isPro: true` + `stripeCustomerId` stored in Clerk `publicMetadata`
2. User cancels → `customer.subscription.deleted` → webhook searches Clerk users by `stripeCustomerId` → `isPro: false`
3. Payment fails → `invoice.payment_failed` → same revocation flow

> **Note:** The user search is a full Clerk user list pagination (100 per page). For large user bases, migrate to a DB table mapping `stripeCustomerId → clerkUserId` at checkout time.

### RevenueCat Webhook (`api/revenuecat/webhook.ts`)

The webhook requires a `Bearer` token in the `Authorization` header matching the `REVENUECAT_WEBHOOK_AUTH` environment variable.

**Fail-closed:** If `REVENUECAT_WEBHOOK_AUTH` is not set, the endpoint returns **503 Service Unavailable** and rejects all requests. This prevents an unconfigured endpoint from granting arbitrary Pro access.

---

## Rate Limiting

Two rate-limiting layers are active:

**tRPC (`telemetry.submitObservation`):** 5 requests per minute per IP. Fail-closed — throws if Upstash credentials are absent.

**Public REST API (`/api/v1/*`):** 10 requests per minute per IP (sliding window). Fail-open — skipped gracefully if Upstash credentials are absent (allows local dev without Upstash). Returns `429 Too Many Requests` with headers:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

Both use Upstash Redis + `@upstash/ratelimit`. Required environment variables:
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

---

## Security Headers

Set globally via `vercel.json` for all routes (`/(.*)`):

| Header | Value | Purpose |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | Prevents MIME-type sniffing attacks |
| `X-Frame-Options` | `DENY` | Prevents clickjacking via `<iframe>` embedding |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limits referrer leakage on cross-origin navigation |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(self)` | Restricts browser feature access to first-party only |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Enforces HTTPS for 2 years, eligible for HSTS preload list |
| `Content-Security-Policy` | See below | Restricts script/style/font/frame sources — implemented Phase 6f, tuned Phase 8 |

### Content Security Policy

The following CSP is active in `vercel.json`:

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data: blob: https:;
connect-src 'self' https:;
worker-src 'self' blob:;
frame-src https://*.clerk.accounts.dev;
frame-ancestors 'none'
```

- `https://*.clerk.accounts.dev` is required in `script-src` and `frame-src` — Clerk loads `clerk.browser.js` dynamically from this CDN and renders the sign-in modal in an iframe.
- `https://fonts.googleapis.com` is required in `style-src` — Google Fonts stylesheets.
- `https://fonts.gstatic.com` is required in `font-src` — Google Fonts webfont files.
- `frame-ancestors 'none'` prevents this app from being embedded in any external iframe (clickjacking prevention, supplements `X-Frame-Options: DENY`).

---

## Environment Variables Security

- **Never commit secrets** to git or `.env` files in the repository. All secrets are set exclusively via Vercel environment variables.
- The `.gitignore` excludes `.env`, `.env.*`, and `*.key` files.
- Webhook secrets (`STRIPE_WEBHOOK_SECRET`, `REVENUECAT_WEBHOOK_AUTH`) are rotated through Stripe/RevenueCat dashboards if compromised.

**Required secrets for production:**

| Variable | Service | Notes |
|---|---|---|
| `CLERK_SECRET_KEY` | Clerk | Backend API key |
| `CLERK_PUBLISHABLE_KEY` | Clerk | Frontend public key |
| `OWNER_OPEN_ID` | Custom | Clerk user ID of admin — gates `adminProcedure` |
| `STRIPE_SECRET_KEY` | Stripe | Live mode (`sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe | Live webhook signing secret |
| `STRIPE_PRICE_MONTHLY` | Stripe | Live Price ID |
| `STRIPE_PRICE_ANNUAL` | Stripe | Live Price ID |
| `STRIPE_PRICE_LIFETIME` | Stripe | Live Price ID |
| `REVENUECAT_WEBHOOK_AUTH` | RevenueCat | Bearer token for native webhook |
| `UPSTASH_REDIS_REST_URL` | Upstash | Rate limiter (required — fail-closed) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash | Rate limiter (required — fail-closed) |
| `DATABASE_URL` | TiDB/MySQL | Optional — telemetry storage |

---

## Pre-Release Security Checklist

Before every public release or App Store / Play Store build:

- [x] `TESTING_DISABLE_PRO_GATE = false` in `ProTierContext.tsx` ✅ done — Phase 8a
- [ ] `REVENUECAT_WEBHOOK_AUTH` set in Vercel env vars
- [ ] `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` set in Vercel env vars
- [ ] `OWNER_OPEN_ID` set to correct Clerk user ID
- [ ] Stripe webhook endpoint registered and `STRIPE_WEBHOOK_SECRET` matches
- [ ] No secrets in source code or committed `.env` files
- [ ] Run `pnpm lint` — no errors
- [ ] Run `pnpm test` — all 133 tests pass
- [x] CSP header active in `vercel.json` ✅ done — Phase 6f / Phase 8 bugfix
- [ ] Admin account has `{ "isAdmin": true }` in Clerk Dashboard public metadata (hardcoded email bypass removed — Phase 8e)

---

## Known Remaining Gaps (Future Work)

| # | Item | Priority |
|---|------|----------|
| 1 | Stripe customer ID → Clerk user ID mapping in DB (for O(1) revocation) | High |
| 2 | Webhook event deduplication (prevent double-grant on retry) | High |
| 3 | OWASP ZAP scan against staging environment | Medium |

---

*Last updated: February 28, 2026 (Round 40 — all phases complete)*
