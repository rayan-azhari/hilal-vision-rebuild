# Hilal Vision — 8-Phase Execution Plan
**Created:** February 28, 2026 (Round 40)
**Source:** COMPREHENSIVE_REVIEW_ROUND40.md
**Status tracking:** ✅ Done | 🔄 In Progress | ⏳ Pending

---

## ✅ Phase 1 — Security Hardening (DONE — Round 40)
_Completed before current session._

- [x] CORS shared utility (`api/_cors.ts`) — origin whitelist + preflight handler
- [x] Stripe webhook signature verified with `stripe.webhooks.constructEvent`
- [x] RevenueCat webhook Bearer token validation
- [x] Rate limiting cold-start safety (lazy getter pattern)
- [x] tRPC batch error handler — one error entry per procedure

---

## ✅ Phase 2 — Quality Infrastructure (DONE — Round 40)
_Completed before current session._

- [x] ESLint flat config — strict rules for `server/**`, `api/**`, `client/**`
- [x] CI pipeline (`.github/workflows/ci.yml`) — lint → typecheck → test → build
- [x] `pnpm/action-setup@v4` reads `packageManager` from `package.json`
- [x] `react-hooks/exhaustive-deps` + `rules-of-hooks` only (avoided react-compiler rules)
- [x] `api/_cors.test.ts` — 10 tests for CORS utility
- [x] 89 total unit tests passing

---

## ✅ Phase 3 — Database & Backend Polish (DONE — Round 40, commit 7235b5a)
_Completed this session._

- [x] `drizzle/schema.ts` — indexes on `observation_reports` (userId, createdAt, lat+lng) and `push_tokens` (userId)
- [x] `drizzle/schema.ts` — `stripe_customers` mapping table added
- [x] `server/db.ts` — mysql2 connection pool (connectionLimit: 3, connectTimeout: 10s, idleTimeout: 60s)
- [x] `server/db.ts` — `upsertStripeCustomer()` + `getStripeCustomerByStripeId()` helpers
- [x] `api/stripe/webhook.ts` — write mapping at `checkout.session.completed`; O(1) lookup at cancellation/payment_failed
- [x] `drizzle.config.ts` — `dbCredentials` conditional so `drizzle-kit generate` works without DATABASE_URL
- [x] Migration: `drizzle/0001_closed_christian_walker.sql`

---

## ⏳ Phase 4 — Scientific Accuracy Fixes
_Priority: HIGH — 4 critical algorithm bugs; fast to fix, high correctness impact._

### 4a. Fix Odeh Zone E classification — `shared/astronomy.ts`
The `classifyOdeh()` function never returns `"E"` — any negative V defaults to `"D"`.
Per Odeh (2004), V < -1.64 → Zone E ("not visible").
```typescript
// Current (wrong):
return "D"; // always

// Fix:
if (v < -1.64) return "E";
return "D";
```

### 4b. Validate moonDistKm in crescentWidth — `shared/astronomy.ts`
Add guard before `Math.asin(1737.4 / moonDistKm)`:
```typescript
if (!moonDistKm || moonDistKm <= 1737.4) return { w: 0, sd: 0 };
```

### 4c. Clamp elongation for Math.acos — `shared/astronomy.ts`
```typescript
const cosValue = Math.max(-1, Math.min(1,
    Math.sin(sunPos.altitude) * Math.sin(moonPos.altitude) + ...
));
const elongation = toDeg(Math.acos(cosValue));
```

### 4d. Worker NaN: return explicit error zone — `visibility.worker.ts`
Replace `-1.0` fallback with a clear marker so NaN is distinguishable from Zone E.

### 4e. Public API date range validation — `server/publicApi.ts`
Reject dates outside ±50 years from today with `400 Bad Request`.

### 4f. Document polar latitude exclusion — `shared/astronomy.ts`
Add comment at line 309 explaining the ±80° limit (SunCalc accuracy degrades at extreme latitudes).

### 4g. Add missing astronomy unit tests
- `elongation = 0` (conjunction day)
- Arctic region best-observation-time (no sunset)
- `moonDistKm` at perigee/apogee extremes
- Odeh Zone E: V = -2.0 should return `"E"`

**Files:** `shared/astronomy.ts`, `client/src/workers/visibility.worker.ts`, `server/publicApi.ts`, `server/astronomy.test.ts`, `server/visibility.test.ts`
**Effort:** ~4 hours

---

## ⏳ Phase 5 — Testing Expansion
_Priority: MEDIUM-HIGH — router layer is 0% tested; blocks confident refactoring._

### 5a. tRPC router unit tests
New test files:
- `server/routers/archive.test.ts` — test `getHistoricalData` with mock DB
- `server/routers/weather.test.ts` — test `getCloudGrid` with mock fetch
- `server/routers/notifications.test.ts` — test `saveToken`, `deleteToken`
- `server/appRouter.test.ts` — test `submitObservation` Zone-F rejection logic

Target: 60%+ router coverage (from 0%).

### 5b. Public API integration tests
New file: `api/v1.test.ts` — test `/api/v1/visibility` and `/api/v1/moon-phases` with:
- Valid inputs (known city + date → expected zone)
- Invalid date format → 400
- Out-of-range date → 400
- Missing required params → 422

### 5c. E2E test expansion (`e2e/`)
Add to existing Playwright suite:
- Calendar: assert Ramadan 1445 = March 2024 in Gregorian view
- Pro gating: assert non-pro user sees blur overlay on cloud toggle
- Archive: assert rows load for 1463 AH
- Sighting form: assert Zone-F submission is rejected

### 5d. Add E2E to CI pipeline
Add `pnpm test:e2e` step to `.github/workflows/ci.yml` (separate job, runs after `build`).

**Files:** `server/routers/*.test.ts` (new), `api/v1.test.ts` (new), `e2e/*.spec.ts`, `.github/workflows/ci.yml`
**Effort:** ~1 day

---

## ⏳ Phase 6 — UX Polish & Bug Fixes
_Priority: MEDIUM — affects daily usability and user trust._

### 6a. Fix i18n — either implement or clean up
**Current state:** `useTranslation()` called everywhere; `document.documentElement.dir` set for RTL; but **no translation JSON files exist**. App runs in English-only with broken i18n infrastructure.

**Options (pick one):**
- **Option A (Recommended):** Create `client/src/i18n/en.json`, `ar.json`, `ur.json` with the ~107 keys currently hardcoded in component strings. Wire to `i18next`.
- **Option B:** Remove `useTranslation()` and RTL boilerplate until translation work is scheduled.

### 6b. Sync visibility criterion across Map ↔ Globe
Move Yallop/Odeh selection to a shared context (or `localStorage`) so switching views preserves the choice.

### 6c. Add error boundaries
Wrap `GlobePage`, `MapPage`, `HorizonPage` with `<ErrorBoundary fallback={<ErrorCard />}>` to prevent full-page crash on WebGL/Canvas failure.

### 6d. Fix globe loading state
Extend `isLoading = true` to cover `globe.gl` dynamic import (not just visibility worker computation). Show spinner until both are ready.

### 6e. Remove duplicate resize listener in GlobePage
One of the two identical `useEffect` blocks at lines 306-330 is a memory leak.

### 6f. Add CSP header to vercel.json
```json
{
  "key": "Content-Security-Policy",
  "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self' https:; worker-src 'self' blob:"
}
```

### 6g. RevenueCat log level
Change `LOG_LEVEL.DEBUG` → `LOG_LEVEL.WARNING` in `ProTierContext.tsx`.

### 6h. Archive locked-year tooltip
Add tooltip on lock icon: "Years before 1463 AH · Unlock with Pro".

### 6i. Map click debounce
Add 300ms debounce to map click handler to prevent DEM fetch spam.

**Files:** `client/src/i18n/` (new), `client/src/App.tsx`, `GlobePage.tsx`, `MapPage.tsx`, `client/src/contexts/`, `vercel.json`, `ProTierContext.tsx`, `ArchivePage.tsx`
**Effort:** ~1.5 days

---

## ⏳ Phase 7 — Push Notifications & Community Features
_Priority: MEDIUM — `push_tokens` schema and `notifications` tRPC router exist; just needs FCM wiring._

### 7a. Firebase Cloud Messaging (web push)
- Create `api/push/send.ts` — serverless endpoint to send FCM notifications
- Add FCM vapid key to Vercel env vars
- Update Service Worker (`sw.js`) to handle `push` events and show notifications
- Wire `SightingFeed.tsx` bell icon → proper FCM subscription flow (replace current broken implementation)

### 7b. Capacitor Push (iOS/Android)
- Install `@capacitor/push-notifications`
- Register device token on app launch → `notifications.saveToken` tRPC
- Handle foreground/background notification taps

### 7c. 29th-night crescent alert
- Add cron job (Vercel Cron or GitHub Actions scheduled workflow) that fires on the 29th of each Hijri month
- Sends FCM notification to all subscribed tokens: "Tonight may be the first night of [Month]"
- Include computed visibility score for user's saved location

### 7d. Photo upload for sighting reports
- Add Cloudinary or Vercel Blob storage endpoint (`api/upload/photo.ts`)
- Update `observationReports` schema: add `photoUrl varchar(500)`
- Wire `SightingReportForm.tsx` camera/upload button to upload endpoint
- Display photo thumbnails in `SightingFeed.tsx`

### 7e. Sighting feed real-time refresh control
- Add toggle to pause/resume auto-refresh in `SightingFeed.tsx`
- Show "last updated X seconds ago" instead of silently polling

**Files:** `api/push/send.ts` (new), `client/public/sw.js`, `SightingFeed.tsx`, `SightingReportForm.tsx`, `server/routers/notifications.ts`, `drizzle/schema.ts`, Vercel env vars
**Effort:** ~3 days

---

## ⏳ Phase 8 — Production Hardening & Launch Prep
_Priority: MUST DO BEFORE PUBLIC LAUNCH._

### 8a. Disable pro gate
```typescript
// client/src/contexts/ProTierContext.tsx:51
const TESTING_DISABLE_PRO_GATE = false; // ← flip this
```

### 8b. Fix Stripe checkout userId body fallback (S3)
Remove `userId = body.userId` fallback. Require Clerk token. Return `401` if absent.

### 8c. Public API rate limiting
Add Upstash rate limiting (10 req/min per IP) to `server/publicApi.ts` endpoints.

### 8d. Sync iOS version in Xcode
Set `MARKETING_VERSION = 1.0.4` and `CURRENT_PROJECT_VERSION = 5` in Xcode target settings.

### 8e. Move admin bypass to Clerk metadata
Replace hardcoded `moonsightinglive@gmail.com` check with `user.publicMetadata.isAdmin === true` set via Clerk dashboard.

### 8f. Validate Vite env vars on startup
In `ProTierContext.tsx`, throw (or warn loudly) if `VITE_REVENUECAT_APPLE_KEY` / `VITE_REVENUECAT_GOOGLE_KEY` are empty strings.

### 8g. Google Play Store
- Finalize Data Safety form (camera, location, purchase data)
- Upload screenshots/feature graphic
- Internal Testing → Open Testing → Production

### 8h. Apple App Store
- Update version to 1.0.4 / build 5 in Xcode
- TestFlight internal → external → App Store Connect review

### 8i. Update docs and memory
- Update `MEMORY.md` round number to 40
- Update `HILAL_VISION_DOCUMENTATION.md` with completed work
- Mark completed items in this plan

**Files:** `ProTierContext.tsx`, `api/stripe/checkout.ts`, `server/publicApi.ts`, `ios/App/App.xcodeproj/project.pbxproj`, Xcode, Google Play Console, App Store Connect
**Effort:** ~2 days

---

## Summary Table

| Phase | Title | Status | Priority | Effort |
|-------|-------|--------|----------|--------|
| 1 | Security Hardening | ✅ Done | — | — |
| 2 | Quality Infrastructure | ✅ Done | — | — |
| 3 | Database & Backend Polish | ✅ Done | — | — |
| **4** | **Scientific Accuracy Fixes** | ⏳ Next | 🔴 High | ~4h |
| **5** | **Testing Expansion** | ⏳ | 🟠 High | ~1 day |
| **6** | **UX Polish & Bug Fixes** | ⏳ | 🟠 High | ~1.5 days |
| **7** | **Push Notifications & Community** | ⏳ | 🟡 Medium | ~3 days |
| **8** | **Production Hardening & Launch** | ⏳ | 🔴 Must-do | ~2 days |

**Recommended order:** 4 → 6 → 5 → 7 → 8 (science bugs are fast wins; UX unblocks engagement; tests give confidence before launch)

---

*Plan created by Claude Code — Round 40 — February 28, 2026*
*Source review: docs/COMPREHENSIVE_REVIEW_ROUND40.md*
