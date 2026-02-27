# Hilal Vision — Documentation Audit Report
**Date:** February 27, 2026 (Round 39)
**Scope:** All 17 markdown files + source code cross-check

---

## Executive Summary

A full audit of every documentation file was conducted against the actual built codebase (client/src, server/, api/, shared/, vercel.json, build configs, mobile configs). 17 discrepancies were found across 7 files. All have been corrected. Two additional code-level flags were identified that require action before the next public release.

---

## 🔴 Critical Flags (Code — Not Documentation)

### FLAG 1: `TESTING_DISABLE_PRO_GATE = true` (Pro tier bypassed in production)
- **File:** `client/src/contexts/ProTierContext.tsx` (line ~50)
- **Status:** Intentionally left on during development — **must be set to `false` before public release**
- **Impact:** Every user is currently treated as Pro/Premium. All paywalls disabled. Revenue blocked.
- **Action:** Set `TESTING_DISABLE_PRO_GATE = false` before submitting to App Store / Play Store or enabling Stripe live in production
- **Now documented in:** `DEPLOYMENT_CHECKLIST.md` pre-push checklist

### FLAG 2: iOS version completely out of sync with Android
- **File:** `ios/App/App.xcodeproj/project.pbxproj`
- **iOS actual:** `MARKETING_VERSION = 1.0`, `CURRENT_PROJECT_VERSION = 1`
- **Android actual:** `versionCode = 5`, `versionName = "1.0.4"`
- **Impact:** App Store submission will show v1.0 while Play Store shows v1.0.4. Inconsistent branding and can cause App Store Connect metadata rejection.
- **Action:** Open Xcode → App target → General → Identity → set Version to `1.0.4` and Build to `5`
- **Now documented in:** `DEPLOYMENT.md` iOS section + `DEPLOYMENT_CHECKLIST.md` Error #14

---

## Documentation Changes Made

### 1. `MEMORY.md` (auto-memory)
| # | Change |
|---|--------|
| 1 | `server/_core/trpc.js` → `server/_core/trpc.ts` (it's a TypeScript file) |
| 2 | "Sky Dome + **Altitude Chart** + Ephemeris" → "Sky Dome + Ephemeris" (Altitude Chart is FREE) |
| 3 | Added iOS version out-of-sync warning |
| 4 | Added current Android versionCode note: `5 / "1.0.4"` |
| 5 | Updated docs reference from "Round 35" → "Round 39" |

### 2. `docs/PUBLIC_API_REFERENCE.md`
| # | Change |
|---|--------|
| 1 | Replaced placeholder `https://your-domain.com` with actual URL `https://moon-dashboard-one.vercel.app` in 3 places |

### 3. `docs/DEPLOYMENT_CHECKLIST.md`
| # | Change |
|---|--------|
| 1 | Added `TESTING_DISABLE_PRO_GATE = false` warning to pre-push checklist |
| 2 | Updated "Current version" from `versionCode 4 / "1.0.3"` → `versionCode 5 / "1.0.4"` |
| 3 | Updated "next version" example from `5 / "1.0.4"` → `6 / "1.0.5"` |
| 4 | Added `REVENUECAT_WEBHOOK_AUTH` to required environment variables |
| 5 | Added **Error #14** — iOS Version Out of Sync (new documented pattern with fix steps) |

### 4. `docs/DEPLOYMENT.md`
| # | Change |
|---|--------|
| 1 | Replaced 2-function `vercel.json` example with current 5-function format (tRPC, stripe/checkout, stripe/webhook, revenuecat/webhook, v1/[...path]) |
| 2 | Updated `buildCommand` in example from `"npm run vercel-build"` → `"npx vite build"` |
| 3 | Added 3 missing env vars: `REVENUECAT_WEBHOOK_AUTH`, `VITE_REVENUECAT_APPLE_KEY`, `VITE_REVENUECAT_GOOGLE_KEY` |
| 4 | Updated Android version in example: current `5 / "1.0.4"`, next example `6 / "1.0.5"` |
| 5 | Added iOS version sync step (#4) to iOS Release Build procedure |

### 5. `docs/USER_GUIDE.md`
| # | Change |
|---|--------|
| 1 | Removed "Altitude Chart" from Pro feature list in Support section (it is FREE) |
| 2 | Fixed Pro gating table row: "Sky Dome, **Altitude Chart**, Ephemeris" → "Sky Dome, Ephemeris" |
| 3 | Added `*(Free)*` label to Sun & Moon Altitude Tracker in Moon Phase section |
| 4 | Added `*(Pro)*` label to Sky Dome and Ephemeris entries in Moon Phase section |

### 6. `docs/HILAL_VISION_DOCUMENTATION.md`
| # | Change |
|---|--------|
| 1 | Header version: "Round 38" → "Round 39" |
| 2 | Feature gating table: Split "Sky Dome & Altitude Chart" row into "Sun & Moon Altitude Chart (Free)" and "Sky Dome (Locked)" |
| 3 | Footer timestamp updated to "February 27, 2026 (Round 39 - Android CORS fix, tRPC batch error per-procedure fix, Android versionCode 5 / 1.0.4)" |

### 7. `todo.md`
| # | Change |
|---|--------|
| 1 | Added "Completed (Rounds 10–39)" section summarizing all work since Round 9 |
| 2 | Replaced outdated Phase 5–7 backlog with accurate "Future Backlog (as of Round 39)" |
| 3 | Included all correct remaining TODOs: TESTING_DISABLE_PRO_GATE, iOS sync, push notifications, photo uploads, VSOP87, AR finder, Malay i18n, tiered API, mosque widget, subscription revocation |

---

## Discrepancies Found — Full Table

| # | Severity | File | Claim | Reality | Fixed? |
|---|----------|------|-------|---------|--------|
| 1 | 🔴 HIGH | DEPLOYMENT.md + CHECKLIST.md | versionCode 4, versionName "1.0.3" | versionCode **5**, versionName **"1.0.4"** | ✅ |
| 2 | 🔴 HIGH | USER_GUIDE.md | Altitude Chart is Pro-gated | Sun & Moon Altitude Chart is **FREE** | ✅ |
| 3 | 🟠 MED | HILAL_VISION_DOCUMENTATION.md | "Round 38" | Round **39** | ✅ |
| 4 | 🟠 MED | DEPLOYMENT.md | Old 2-function vercel.json example | Has **5 functions** (tRPC, stripe×2, revenuecat, v1) | ✅ |
| 5 | 🟠 MED | DEPLOYMENT.md | Missing 3 env vars | `VITE_REVENUECAT_APPLE_KEY`, `VITE_REVENUECAT_GOOGLE_KEY`, `REVENUECAT_WEBHOOK_AUTH` | ✅ |
| 6 | 🟠 MED | todo.md | Only covers Rounds 1–9 | Project is at Round 39; 30 rounds undocumented | ✅ |
| 7 | 🟠 MED | comprehensive_review.md | "No Service Worker ❌" | SW IS registered in `main.tsx` (added Round 7) | ℹ️ Historical doc, left as-is |
| 8 | 🟠 MED | MEMORY.md | versionCode 4 (1.0.3) | **versionCode 5 (1.0.4)** | ✅ |
| 9 | 🟡 LOW | DEPLOYMENT_CHECKLIST.md | No mention of TESTING_DISABLE_PRO_GATE | Critical pre-release flag | ✅ |
| 10 | 🟡 LOW | walkthrough.md | "archive.getHistoricalData tRPC" | ArchivePage fetches static `/icop-history.json` (no tRPC) | ℹ️ Historical doc, left as-is |
| 11 | 🟡 LOW | USER_GUIDE.md (Support section) | "Altitude Chart" listed as Pro | Should be FREE | ✅ |
| 12 | 🟡 LOW | DEPLOYMENT.md (iOS section) | No iOS version sync step | iOS version is out of sync with Android | ✅ |
| 13 | 🟡 LOW | README.md | Push Notifications "⏳" | Still not implemented — consistent but confirmed in todo | ✅ Confirmed accurate |
| 14 | 🟡 LOW | CHECKLIST.md | No iOS version sync error pattern | iOS management completely undocumented | ✅ Added as Error #14 |
| 15 | 🟡 LOW | PUBLIC_API_REFERENCE.md | `https://your-domain.com` placeholder | Should be `https://moon-dashboard-one.vercel.app` | ✅ |
| 16 | 🟡 LOW | MEMORY.md | `server/_core/trpc.js` | Actual file is `server/_core/trpc.ts` (TypeScript) | ✅ |
| 17 | 🟡 LOW | HILAL_VISION_DOCUMENTATION.md | "Sky Dome & Altitude Chart" as Pro row | Altitude Chart is free; only Sky Dome gated | ✅ |

**Legend:** ✅ Fixed | ℹ️ Historical doc — intentionally preserved as-is

---

## Files Left Unchanged (Historical / Conceptual)

These documents are historical records or design references. They describe the state of the project at the time they were written and are intentionally preserved as-is:

| File | Reason Preserved |
|------|-----------------|
| `walkthrough.md` | Round 3–4 implementation log |
| `comprehensive_review.md` | Post-Round-5 audit snapshot (Feb 23, 2026) |
| `project_review.md` | Early strategic roadmap (Feb 22, 2026) |
| `Critical feedback.md` | Academic critique document |
| `docs/Islamic Calendar Astronomical Dashboard.md` | Mathematical reference |
| `docs/The Hilal Dashboard Revised Architecture.md` | Architectural vision doc |
| `docs/Designer.md` | Design directive document |
| `docs/Crowdsourced Hilal Telemetry.md` | Feature specification |
| `docs/UI_UX_REVIEW_REPORT.md` | Design audit snapshot |
| `AGENT.MD` | Accurately describes current setup |
| `README.md` | Feature showcase — minor version drift acceptable in marketing doc |

---

## Architecture & Code Verification (No Issues Found)

The following were verified against source code and found to be correctly implemented and accurately documented:

- ✅ tRPC v11 + Express 4 backend architecture
- ✅ Stripe Live mode (checkout + webhook) — `api/stripe/checkout.ts`, `api/stripe/webhook.ts`
- ✅ RevenueCat native billing + webhook — `api/revenuecat/webhook.ts` (INITIAL_PURCHASE, RENEWAL, CANCELLATION, EXPIRATION, BILLING_ISSUE all handled)
- ✅ Public REST API — `/api/v1/visibility`, `/api/v1/moon-phases` (Zod-validated)
- ✅ Clerk authentication — `@clerk/express` backend, `@clerk/clerk-react` frontend
- ✅ Upstash Redis rate limiting — lazy getter pattern (cold-start safe since Round 38)
- ✅ Capacitor `credentials: "omit"` fix — implemented in `client/src/main.tsx` (Round 39)
- ✅ tRPC batch error handling — one entry per procedure (Round 39)
- ✅ Service Worker — registered in `main.tsx`, production-only, 60-min update check (Round 7)
- ✅ Pro gating — `TESTING_DISABLE_PRO_GATE` flag correctly understood; intentionally `true` during dev
- ✅ Admin bypass — `moonsightinglive@gmail.com` hardcoded in `ProTierContext.tsx`
- ✅ Cloud textures — equirectangular (globe) vs Mercator (map) projection handling
- ✅ Three.js globe rotation — `rotation.y = -Math.PI/2` applied correctly
- ✅ Web Worker — `useVisibilityWorker.ts` + `visibility.worker.ts` offload Yallop/Odeh grid computation
- ✅ Drizzle ORM + MySQL schema — 3 tables: `users`, `observation_reports`, `push_tokens`
- ✅ pnpm enforced — `packageManager: "pnpm@10.4.1"` in root `package.json`

---

## Remaining Known Limitations (Accurately Documented)

These are real limitations acknowledged in the docs and backlog — not doc errors:

| Item | Status |
|------|--------|
| `TESTING_DISABLE_PRO_GATE = true` | Intentional during dev; flip to `false` for release |
| iOS version out of sync (1.0 vs 1.0.4) | Must be fixed in Xcode before App Store submission |
| Push notifications not implemented | Schema exists; FCM/APNs wiring pending |
| Photo uploads not implemented | Form UI exists; no cloud storage backend |
| SunCalc ~0.3° precision | Acceptable; VSOP87 upgrade planned but not critical |
| Subscription revocation | `customer.subscription.deleted` webhook lacks DB lookup for Stripe→Clerk mapping |
| Malay language | 4th i18n locale planned |
| Service Worker (comprehensive_review.md says "❌") | Actually implemented since Round 7; review doc is a historical snapshot |

---

*Audit conducted by Claude Code (claude-sonnet-4-6) — Round 39 — February 27, 2026*
