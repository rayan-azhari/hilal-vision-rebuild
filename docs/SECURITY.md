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
| Rate Limiting | Upstash Redis sliding window (5 req/min, fail-closed) | ✅ Fixed (Round 40) |
| Security Headers | `vercel.json` HTTP headers | ✅ Added (Round 40) |
| Pro Tier Gate | `TESTING_DISABLE_PRO_GATE` flag — **must be `false` for release** | ⚠️ Intentionally off during dev |

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

If the Clerk token is missing or invalid, the endpoint falls back to the body-supplied `userId` for backwards compatibility during the migration window. This fallback will be removed once the token-based flow is confirmed stable.

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

Observation submissions (`telemetry.submitObservation`) are rate-limited to **5 requests per minute per IP** using Upstash Redis + `@upstash/ratelimit` sliding window.

**Fail-closed:** If Upstash credentials (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`) are not set, the endpoint **throws** rather than accepting unbounded submissions.

Required environment variables:
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

> **Note:** A Content Security Policy (CSP) is not yet set — this would require careful enumeration of all CDN and inline script sources (Clerk, Sentry, Globe.gl, etc.). Recommended as a future hardening step.

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

- [ ] `TESTING_DISABLE_PRO_GATE = false` in `client/src/contexts/ProTierContext.tsx`
- [ ] `REVENUECAT_WEBHOOK_AUTH` set in Vercel env vars
- [ ] `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` set in Vercel env vars
- [ ] `OWNER_OPEN_ID` set to correct Clerk user ID
- [ ] Stripe webhook endpoint registered and `STRIPE_WEBHOOK_SECRET` matches
- [ ] No secrets in source code or committed `.env` files
- [ ] Run `pnpm lint` — no `no-eval` or `eqeqeq` errors
- [ ] Run `pnpm test` — all 89 tests pass

---

## Known Remaining Gaps (Future Work)

| # | Item | Priority |
|---|------|----------|
| 1 | Stripe customer ID → Clerk user ID mapping in DB (for O(1) revocation) | High |
| 2 | Webhook event deduplication (prevent double-grant on retry) | High |
| 3 | Content Security Policy (CSP) header | Medium |
| 4 | No rate limiting on public REST API `/api/v1/*` | Medium |
| 5 | OWASP ZAP scan against staging environment | Medium |

---

*Last updated: February 27, 2026 (Round 40)*
