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

## ✅ Phase 5 — Testing Expansion (DONE — Round 40, commit ff32f7a)
_Completed this session._

- [x] `server/_core/trpc.ts` — export `createCallerFactory`
- [x] `server/routers/archive.test.ts` — 7 tests (pure in-memory icopData)
- [x] `server/routers/weather.test.ts` — 4 tests (fetch mock, cache, error fallback)
- [x] `server/routers/notifications.test.ts` — 4 tests (DB upsert dedup, null DB, short token)
- [x] `server/appRouter.test.ts` — 5 tests (Zone-F rejection, rate limit, vi.hoisted)
- [x] `server/publicApi.ts` — refactored to named exports (visibilityHandler, moonPhasesHandler)
- [x] `server/publicApi.test.ts` — 11 tests (mock req/res factory)
- [x] `e2e/features.spec.ts` — 2 E2E scenarios (Calendar Hijri months, Archive ICOP data)
- [x] `playwright.config.ts` — PORT=5173 env var for CI webServer
- [x] `.github/workflows/ci.yml` — e2e job added (needs: build)
- **Result:** 102 → 133 unit tests; 5-job CI pipeline (lint→typecheck→test→build→e2e)

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

### 6j. Best Time to Observe — richer weather conditions _(user-requested)_
**Current state:** `BestTimeCard.tsx` already shows cloud cover + temperature from `getLocalWeather`, but weather is informational only and doesn't influence the algorithm.

**Add to `server/routers/weather.ts → getLocalWeather()`:**
- `relative_humidity_2m` — high humidity = poor atmospheric seeing
- `wind_speed_10m` — turbulence indicator
- `visibility` — meteorological visibility in meters (fog/haze detection)

**Add to `BestTimeCard.tsx`:**
- Composite **Conditions Score** (0–100) from all 4 weather factors, colour-coded green/amber/red
- Warning banner when `conditionsScore < 30`: _"Poor weather tonight — viewing may be impaired"_

**Files:** `server/routers/weather.ts`, `client/src/components/BestTimeCard.tsx`

### 6k. Countdown to Ramadan, Eid al-Fitr, Eid al-Adha _(user-requested)_
New component `client/src/components/IslamicCountdown.tsx`:
- Uses existing `getUmmAlQuraMonthStart(year, month)` from `shared/astronomy.ts` to get Gregorian date of each event
- Shows 3 cards: Ramadan (month 9 day 1), Eid al-Fitr (month 10 day 1), Eid al-Adha (month 12 day 10)
- Days-remaining label: "X days away" / "Tomorrow" / "Today!"
- Auto-advances to next Hijri year once event has passed
- Added to `CalendarPage.tsx` above the month grid, no Pro gate

**Files:** `client/src/components/IslamicCountdown.tsx` (new), `client/src/pages/CalendarPage.tsx`

### 6l. Fix visibility layer misalignment on 2D map and 3D globe _(user-reported bug, HIGH priority)_
**Root causes:**
1. **3D globe (confirmed):** Visibility overlay `Three.js` mesh does not apply `rotation.y = -Math.PI/2`, unlike the cloud overlay mesh which correctly does so at `GlobePage.tsx:277`. This shifts the entire green zone ~90° east of the correct position.
2. **2D map + 3D globe (grid offset):** Grid points in `visibility.worker.ts` are sampled at cell **corners** (top-left), not centers. Shifting by `+0.5` per axis centers each sample point in its cell, correcting ~1.5–2° of drift depending on resolution.

**Fixes:**
- `client/src/pages/GlobePage.tsx` — after creating `overlayMesh`, add `overlayMesh.rotation.y = -Math.PI / 2;`
- `client/src/workers/visibility.worker.ts` — shift `py → py + 0.5` and `px → px + 0.5` before lat/lng computation (both Mercator and equirectangular branches)

**Files:** `client/src/pages/GlobePage.tsx`, `client/src/workers/visibility.worker.ts`

**Files:** `client/src/i18n/` (new), `client/src/App.tsx`, `GlobePage.tsx`, `MapPage.tsx`, `client/src/contexts/`, `vercel.json`, `ProTierContext.tsx`, `ArchivePage.tsx`, `client/src/components/BestTimeCard.tsx`, `server/routers/weather.ts`, `client/src/components/IslamicCountdown.tsx` (new), `client/src/workers/visibility.worker.ts`
**Effort:** ~2 days

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

### 7f. Moon event notifications — Full Moon, Blue Moon, Lunar Eclipse _(user-requested)_
**Infrastructure needed first:** Firebase Admin SDK on server, `FIREBASE_SERVICE_ACCOUNT_JSON` env var, Vercel Cron.

**7f-i. Full Moon alert**
- Daily cron `api/cron/moonAlerts.ts` at 08:00 UTC
- If `getMoonPhaseInfo(today).nextFullMoon` is today → send FCM to all subscribed push tokens
- Message: _"🌕 Full Moon tonight — crescent season ends, next Hilal in ~15 days"_

**7f-ii. Blue Moon alert**
- Blue moon = second full moon in the same Gregorian calendar month
- Detect by finding the previous full moon (walk back ~29 days from `nextFullMoon`) and checking if it's in the same calendar month
- Message: _"🌕 Blue Moon tonight! Two full moons in one month"_

**7f-iii. Lunar Eclipse (basic detection)**
- Lunar eclipses occur at full moon when the Moon is near a node
- New function `predictLunarEclipse(fullMoonDate: Date): 'none' | 'penumbral' | 'partial' | 'total'` in `shared/astronomy.ts`
- Detection: check Moon's ecliptic latitude at full moon — within ±1.5° → penumbral, ±0.9° → partial, ±0.5° → total
- Message: _"🌑 Lunar Eclipse tonight — [type] shadow on the Moon"_

**Note:** Solar eclipses are out of scope (require path-of-totality computation).

**Files:** `api/cron/moonAlerts.ts` (new), `shared/astronomy.ts` (add `predictLunarEclipse`), `vercel.json` (cron config), `server/routers/notifications.ts` (sendNotification helper), Vercel env: `FIREBASE_SERVICE_ACCOUNT_JSON`

**Files:** `api/push/send.ts` (new), `client/public/sw.js`, `SightingFeed.tsx`, `SightingReportForm.tsx`, `server/routers/notifications.ts`, `drizzle/schema.ts`, Vercel env vars, `api/cron/moonAlerts.ts` (new), `shared/astronomy.ts`
**Effort:** ~4 days

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
| 4 | Scientific Accuracy Fixes | ✅ Done | — | — |
| 5 | Testing Expansion | ✅ Done | — | — |
| **6** | **UX Polish & Bug Fixes** (+6j weather, 6k countdown, 6l alignment fix) | ⏳ Next | 🔴 High | ~2 days |
| **7** | **Push Notifications & Community** (+7f moon events) | ⏳ | 🟡 Medium | ~4 days |
| **8** | **Production Hardening & Launch** | ⏳ | 🔴 Must-do | ~2 days |

**Recommended order:** 6 → 7 → 8 (6l alignment fix is highest priority; countdown and weather are fast wins; notifications before launch)

---

*Plan created by Claude Code — Round 40 — February 28, 2026*
*Source review: docs/COMPREHENSIVE_REVIEW_ROUND40.md*
