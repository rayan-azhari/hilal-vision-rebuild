# Hilal Vision — Round 41 Comprehensive Audit & Improvement Plan

**Date:** February 28, 2026
**Audit scope:** Documentation (22 .md files), Frontend (all pages/components/hooks/contexts), Backend (tRPC/Express/serverless), Security, Scientific accuracy, UI/UX, Accessibility, Performance, User engagement

---

## Context

A full multi-disciplinary audit was conducted across the entire Hilal Vision workspace, reviewing it from the perspectives of: frontend/backend developer, security specialist, app designer, astrophysicist, and UX psychologist. The audit identified **70+ actionable issues** across 8 categories, organized below into 8 prioritized phases.

---

## Phase 1 — Critical Security Fixes ✅
**Priority: IMMEDIATE | Effort: 1-2 days | Status: COMPLETE (commit f66a39c)**

### 1a. Delete on-disk Firebase credential files
Two live service account JSON files exist at project root (not in git, but on disk):
- `moontracker-b7a5f-firebase-adminsdk-fbsvc-3951498a52.json`
- `moontracker-b7a5f-firebase-adminsdk-fbsvc-61ce975044.json`

**Action:** Delete both. Credentials already exist as `FIREBASE_ADMIN_CREDENTIALS` Vercel env var.

### 1b. Constant-time secret comparison
Two endpoints use `===` for secret comparison (timing attack vector):
- `api/push/send.ts` — cron secret check
- `api/revenuecat/webhook.ts` — bearer token check

**Fix:** Use `crypto.timingSafeEqual()` with Buffer conversion in both files.

### 1c. Fix IP spoofing in rate limiting
Both `server/appRouter.ts` and `server/publicApi.ts` use `x-forwarded-for.split(",")[0]` — attacker-controlled behind Vercel. Use `.at(-1)` (Vercel-appended IP) instead.

### 1d. Bound LocalRateLimiter Map size
`server/appRouter.ts` — unbounded `Map` grows under DDoS. Cap at 10,000 entries with expired-entry eviction.

### 1e. Rate-limit push token subscription
`server/routers/notifications.ts` — no rate limit on `notifications.subscribe`. Apply same Upstash limiter (5/min/IP) used by observation submission.

### 1f. Validate weather router coordinates
`server/routers/weather.ts` — add `.min(-90).max(90)` / `.min(-180).max(180)` Zod bounds on lat/lng (already done in visibility, missing here).

### 1g. Document admin authorization model
Two parallel admin systems exist: `ownerOpenId` env var (tRPC `adminProcedure`) and `isAdmin` Clerk metadata (client Pro bypass). Audit, clarify, and document in `docs/SECURITY.md`.

---

## Phase 2 — Scientific Accuracy & SunCalc Cleanup
**Priority: HIGH | Effort: 1 day**
**Primary file:** `shared/astronomy.ts`

> **Note (Round 41 update):** The project migrated from SunCalc to `astronomy-engine` (VSOP87/ELP2000-based) in commit `473525d`. This resolved the core position-engine accuracy limitations (item 2e — `findNextPhase` search depth — is now handled by `Astronomy.SearchMoonPhase()` with a 35-day window). However, **4 derived-calculation bugs remain unfixed** and stale SunCalc references appear in code comments and user-facing UI.

### 2a. Fix eclipse prediction algorithm (CRITICAL)
`predictLunarEclipse()` (line ~759) still uses hand-rolled node regression with `M_moon - N` instead of the argument of latitude `F`. Thresholds are also wrong:
- Current: total < 0.5°, partial < 0.9°, penumbral < 1.5°
- Correct: total < 0.47°, partial < 0.99°, penumbral < 1.54°

**Fix:** Replace with `Astronomy.SearchLunarEclipse()` from astronomy-engine — uses the full ELP2000 model and returns typed eclipse results (`total`, `partial`, `penumbral`), eliminating the hand-rolled approximation entirely.
**File:** `shared/astronomy.ts`
**Impact:** Drives push notifications via `api/cron/moonAlerts.ts` — false alerts damage user trust.

### 2b. Fix atmospheric refraction model
Lines ~248–253 apply a fixed 34 arcmin baseline (horizon-only value) then adjust for P/T. At 10° altitude, true refraction is ~5 arcmin not 34. Note: `Astronomy.Horizon()` with `"normal"` mode already handles standard refraction internally; the `refractionDelta` block should compute the altitude-dependent Bennett formula `R = 1.02 / tan(h + 10.3/(h + 5.11))` arcmin, then apply the P/T correction to *that* value, not to a flat 34'.
**File:** `shared/astronomy.ts`

### 2c. Fix Maghrib calculation
Line ~283: `new Date(sunset.getTime() + 18 * 60 * 1000)`. Maghrib in Islamic jurisprudence IS sunset — the +18 min conflates with Isha twilight.
**Decision:** Remove the +18min offset entirely — set `maghrib = sunset`.
**File:** `shared/astronomy.ts`

### 2d. Use precise synodic month constant
Line ~281 in `computeSunMoonAtSunset()`: `moonAge = phaseNormal * 29.53 * 24`. Should be `29.53058867` (already used correctly in `getMoonPhaseInfo()` and `SYNODIC_MS` in the same file). ~45-second cumulative error per month.
**File:** `shared/astronomy.ts`

### ~~2e. Extend findNextPhase search depth~~ — RESOLVED
Replaced by astronomy-engine's `Astronomy.SearchMoonPhase(..., 35)` with 35-day window — sufficient for a full synodic month.

### 2f. Clean up stale SunCalc references
SunCalc has been removed as a dependency but stale text remains in 7 files:
- `shared/astronomy.ts` line ~11 — JSDoc header: *"Uses SunCalc for sun/moon positions"*
- `shared/astronomy.ts` line ~319 — code comment about SunCalc accuracy
- `server/publicApi.ts` lines ~70,73 — code comment + error message mentioning SunCalc
- `client/src/pages/AboutPage.tsx` lines ~43,65,90,92 — UI credit listing SunCalc + link to SunCalc repo
- `client/src/pages/TermsPage.tsx` line ~129 — legal text referencing SunCalc
- `client/src/components/PhysicsExplanations.tsx` line ~155 — UI text about SunCalc
- `client/src/pages/MethodologyPage.tsx` line ~692 — citation referencing SunCalc

**Fix:** Replace all with `astronomy-engine` / VSOP87 / ELP2000 as appropriate. User-facing pages should credit `astronomy-engine` with correct GitHub link.

### 2g. Add unit tests for corrected algorithms
Test eclipse prediction against known dates (Jan 21, 2019 total; Jul 16, 2019 partial; non-eclipse full moons). Test refraction at 0° (~34') and 10° (~5.3'). Test moonAge precision.

---

## Phase 3 — Accessibility & Critical UI Fixes
**Priority: HIGH | Effort: 1.5 days**

### 3a. Fix NotFound.tsx theme clash
Uses hardcoded light-mode classes (`bg-white/80`, `text-slate-900`, `bg-blue-600`) — jarring white page on the app's dark space aesthetic. Restyle with CSS custom properties and app design system.
**File:** `client/src/pages/NotFound.tsx`

### 3b. Fix UpgradeModal accessibility (WCAG 2.1 AA failure)
Missing: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, focus trap, Escape key handler. All required for WCAG compliance.
**File:** `client/src/components/UpgradeModal.tsx`

### 3c. Lower noise-overlay z-index
`z-index: 9999` in `index.css` sits on same layer as modals. Lower to `z-index: 50`.
**File:** `client/src/index.css`

### 3d. Replace alert() with Sonner toasts
4 instances across `ProTierContext.tsx`, `UpgradeModal.tsx`, `SupportPage.tsx`. Sonner (`toast.error()`) already available app-wide.

### 3e. Add keyboard support to language dropdown
No Escape-to-close, no arrow key navigation in `Layout.tsx` language selector.
**File:** `client/src/components/Layout.tsx`

### 3f. Add aria-labels to calendar days, archive locks, canvas elements
- Calendar buttons: `aria-label="{gregorianDate}, {hijriDate}"`
- Archive locks: `<span aria-hidden="true">🔒</span><span class="sr-only">Pro required</span>`
- Canvas (HorizonPage, ArchivePage): `role="img"` + descriptive `aria-label`
**Files:** `CalendarPage.tsx`, `ArchivePage.tsx`, `HorizonPage.tsx`

### 3g. Link form errors via aria-describedby
`SightingReportForm.tsx` — error messages not associated with inputs for screen readers.

---

## Phase 4 — Performance & Code Quality
**Priority: MEDIUM | Effort: 1.5 days**

### 4a. Offload ArchivePage mini-map to Web Worker
`VisibilityMiniMap` runs 945 synchronous astronomy calculations on main thread per month click. Move to a worker (pattern already exists in `useVisibilityWorker`).
**Files:** `client/src/pages/ArchivePage.tsx`, new `client/src/workers/archiveMiniMap.worker.ts`

### 4b. Remove Framer Motion (~130KB)
Only used in `CookieConsent.tsx` for a slide-up animation. Replace with CSS `@keyframes` animation.
**File:** `client/src/components/CookieConsent.tsx`

### 4c. Remove dead exif-js dependency
Still in `package.json` despite replacement with `exifr`. Run `pnpm remove exif-js`.

### 4d. Extract shared PLANS constant + handleSelectPlan hook
Duplicated between `UpgradeModal.tsx` and `SupportPage.tsx`. Extract to `client/src/lib/plans.ts` and `client/src/hooks/usePlanSelection.ts`.

### 4e. Extract shared MoonPhaseSVG component
Moon-drawing SVG algorithm duplicated 6 times across Home, Moon, Calendar, Horizon pages. Extract to `client/src/components/MoonPhaseSVG.tsx`.

### 4f. Extract shared atmospheric fetch hook
Open-Meteo atmospheric data fetch duplicated in `MapPage.tsx` and `GlobePage.tsx`. Create `client/src/hooks/useAtmosphericData.ts`.

### 4g. Remove dead code
- Empty `useEffect` in `HorizonPage.tsx`
- Dead `userId`/`userEmail` fields in checkout body (`ProTierContext.tsx`)
- ~~Dead `findLastNewMoon()` function in `shared/astronomy.ts`~~ — already removed in astronomy-engine migration
- `togglePremium` debug tooltip in nav (title attribute exposes testing intent to users)

---

## Phase 5 — User Engagement Features
**Priority: MEDIUM | Effort: 2-3 days**

### 5a. "Tonight's Prediction" hero widget
Add a `TonightCard` to Home page answering "Can I see the crescent tonight?" — auto-detects location, shows visibility zone badge + sunset/moonset times. Falls back to Mecca.
**Files:** new `client/src/components/TonightCard.tsx`, `client/src/pages/Home.tsx`

### 5b. Persist location to localStorage
`GlobalStateContext` loses location/criterion on refresh. Persist to `localStorage` (not date — users expect "today").
**File:** `client/src/contexts/GlobalStateContext.tsx`

### 5c. .ics calendar export for free users
Add "Add to Calendar" button on `CalendarPage.tsx` generating ICS with predicted 1st-of-month dates.
**Files:** new `client/src/lib/icsExport.ts`, `client/src/pages/CalendarPage.tsx`

### 5d. Improve SightingFeed empty state
Replace bland "No recent sighting reports" with crescent icon + CTA to open report form.
**File:** `client/src/components/SightingFeed.tsx`

### 5e. Native purchase button loading state
Show spinner in plan buttons when `nativePackages.length === 0` instead of silent disabled state.
**File:** `client/src/components/UpgradeModal.tsx`

### 5f. Fix nav active state for /map and /globe aliases
Desktop nav doesn't highlight "Visibility" when on aliased routes.
**File:** `client/src/components/Layout.tsx`

---

## Phase 6 — Documentation Overhaul
**Priority: MEDIUM | Effort: 1 day**

### 6a. Fix license contradiction (LEGAL)
`package.json` says `"MIT"` — all docs say "All Rights Reserved." Change to `"UNLICENSED"` in package.json.

### 6b. Delete superseded root-level docs
Remove: `comprehensive_review.md`, `project_review.md`, `walkthrough.md`, `Critical feedback.md` — all superseded by `docs/` equivalents.

### 6c. Fix README.md
- Remove duplicate items 23-28
- Replace all `npm` commands with `pnpm`
- Update Push Notifications to "Done" and Stripe to "Live"
- Fix broken code block
- Add missing doc links (SECURITY, TESTING, PUBLIC_API_REFERENCE, etc.)

### 6d. Update HILAL_VISION_DOCUMENTATION.md
- Remove ghost `/dashboard` and `/ramadan` routes
- Update DB schema (Section 8.1) with current tables
- Update tRPC procedures (Section 8.2) with current list
- Replace `ProModeContext` → `ProTierContext`
- Add missing routes to table: `/methodology`, `/horizon`, `/support`, `/about`, `/privacy`, `/terms`

### 6e. Update SECURITY.md
- Close resolved Stripe customer ID gap (fixed in Phase 3 of Round 40)
- Fix fail-closed/fail-open contradiction
- Add `FIREBASE_ADMIN_CREDENTIALS`, `CRON_SECRET`, `OWNER_OPEN_ID` to env vars table
- Track S6 (sidebar cookie) and S9 (RevenueCat rate limiting)

### 6f. Update TESTING.md, DEPLOYMENT.md, DEPLOYMENT_CHECKLIST.md, PUBLIC_API_REFERENCE.md
- Add missing test counts
- Add security headers to vercel.json example
- Fix non-sequential error numbering
- Add auth statement and versioning policy to API reference
- Replace `npm`/`git add .` with safe alternatives

### 6g. Remove internal constant from USER_GUIDE.md
`TESTING_DISABLE_PRO_GATE = false` is exposed in user-facing docs — remove.

### 6h. Update todo.md to Round 41

---

## Phase 7 — Testing Expansion
**Priority: MEDIUM | Effort: 1 day | Depends on: Phase 2**

### 7a. Eclipse prediction regression tests
Known dates: Jan 21, 2019 (total), Jul 16, 2019 (partial), Jan 10, 2020 (penumbral), Feb 9, 2020 (none).

### 7b. Atmospheric refraction tests
Verify altitude-dependent refraction: 0° ≈ 34', 10° ≈ 5.3', with P/T correction.

### 7c. ProGate rendering tests
Verify blur overlay renders for free users, children are `aria-hidden`.

### 7d. NotFound page E2E test
Navigate to invalid URL, verify dark-themed 404 renders.

### 7e. Empty state tests
SightingFeed empty state renders CTA when `sightings.length === 0`.

---

## Phase 8 — Cleanup & Remaining Debt
**Priority: LOW | Effort: 0.5 days**

### 8a. Gate togglePremium behind import.meta.env.DEV
Remove from production context interface — accessible via React DevTools.
**File:** `client/src/contexts/ProTierContext.tsx`

### 8b. Bundle Leaflet icons locally
Replace `unpkg.com` CDN URLs with local assets in `client/public/`.
**File:** `client/src/pages/MapPage.tsx`

### 8c. Fix cron hardcoded deployment URL
`api/cron/moonAlerts.ts` hardcodes `moon-dashboard-one.vercel.app`. Use env var or relative URL.

### 8d. iOS version sync (MANUAL)
Set `MARKETING_VERSION = 1.0.4`, `CURRENT_PROJECT_VERSION = 5` in Xcode.

### 8e. Update MEMORY.md with Round 41 status

---

## Execution Order

```
Sprint 1 (Days 1-2):  Phase 1 (Security) + Phase 2 (Science) — independent, parallel
Sprint 2 (Days 3-4):  Phase 3 (Accessibility/UI) + Phase 6 (Docs)
Sprint 3 (Days 5-7):  Phase 4 (Performance) + Phase 7 (Testing)
Sprint 4 (Days 8-10): Phase 5 (Engagement features)
Sprint 5 (Day 11):    Phase 8 (Cleanup)
```

## Verification Plan

After each phase:
1. `pnpm lint` — no new lint errors
2. `pnpm check` — TypeScript compiles cleanly
3. `pnpm test` — all unit tests pass (133+ after Phase 7)
4. `pnpm build` — production build succeeds
5. `pnpm test:e2e` — E2E navigation tests pass
6. Manual smoke test on localhost: Home → Visibility → Moon → Calendar → Archive → Horizon → Support → 404
7. After Phase 1: verify rate limiting with curl (spoofed vs real IP)
8. After Phase 2: verify eclipse prediction against NASA eclipse catalog; confirm no remaining `suncalc` text in codebase search
9. After Phase 3: keyboard-only navigation test through modal flow
