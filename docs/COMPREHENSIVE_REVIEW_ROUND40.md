# Hilal Vision — Comprehensive Project Review
**Date:** February 28, 2026 (Round 40)
**Scope:** Security · UI/UX · Scientific Rigor · User Engagement · Risks
**Verdict:** Best-in-class crescent tool with 4 critical science bugs, a live revenue leak, and an i18n skeleton that has never been connected. All fixable within the 8-phase plan below.

---

## 1. Security Findings

### 🔴 Critical
| # | Issue | File | Impact |
|---|-------|------|--------|
| S1 | `TESTING_DISABLE_PRO_GATE = true` hardcoded | `client/src/contexts/ProTierContext.tsx:51` | 100% revenue loss — every user gets Pro free |
| S2 | Firebase service account JSON present in root | `moontracker-b7a5f-firebase-adminsdk-fbsvc-61ce975044.json` | Full Firebase admin access if file is ever committed/exposed |
| S3 | Stripe checkout falls back to `body.userId` if no Clerk token | `api/stripe/checkout.ts:82-85` | Auth bypass — attacker can attribute payment to any Clerk user ID |

### 🟠 High
| # | Issue | File |
|---|-------|------|
| S4 | RevenueCat `LOG_LEVEL.DEBUG` in production | `ProTierContext.tsx:61` — leaks PII/entitlements to logs |
| S5 | Hardcoded admin email grants Pro bypass | `ProTierContext.tsx:47` — single point of failure if email compromised |
| S6 | Sidebar cookie lacks `Secure; SameSite=Strict` | `client/src/components/ui/sidebar.tsx:85` |
| S7 | Missing `Content-Security-Policy` header | `vercel.json` — XSS unmitigated |

### 🟡 Medium
| # | Issue | File |
|---|-------|------|
| S8 | Public REST API (`/api/v1/visibility`, `/api/v1/moon-phases`) has no rate limiting | `server/publicApi.ts` |
| S9 | RevenueCat webhook: no rate limiting if Bearer token is leaked | `api/revenuecat/webhook.ts` |
| S10 | Clerk token verification: no explicit `aud`/`iss` validation | `api/stripe/checkout.ts:70` — relies on SDK defaults |
| S11 | Service Worker caches API responses without cache invalidation | `client/public/sw.js:63-66` — stale astronomy data risk |
| S12 | Rate limiter never retries after failed cold-start init | `server/appRouter.ts:16-43` — single-init pattern, needs restart to recover |
| S13 | Vite RevenueCat keys default to `""` if missing | `ProTierContext.tsx:67-69` — silent iOS billing failure |

### 🟢 Low
| # | Issue |
|---|-------|
| S14 | Admin bypass not audit-logged |
| S15 | Open-Meteo responses not validated via Zod — silent schema drift |
| S16 | Stripe price IDs not validated on startup |

---

## 2. UI/UX & Engagement Findings

### 🔴 Critical
| # | Issue | File |
|---|-------|------|
| U1 | `TESTING_DISABLE_PRO_GATE = true` — same as S1 | `ProTierContext.tsx:51` |
| U2 | i18n infrastructure exists but **translation files do not exist** — all UI strings are hardcoded English despite `useTranslation()` calls and RTL direction switching | `client/src/` — no `/i18n/` directory with translation JSON |
| U3 | No error boundaries on WebGL/Canvas-heavy pages | `GlobePage.tsx`, `MapPage.tsx`, `HorizonPage.tsx` — one JS error crashes entire page |

### 🟠 High
| # | Issue | File |
|---|-------|------|
| U4 | Duplicate resize listener attached twice | `GlobePage.tsx:306-330` — memory leak |
| U5 | Visibility criterion (Yallop/Odeh) not synced between Map and Globe — switching views resets criterion | `MapPage.tsx` + `GlobePage.tsx` — separate local state |
| U6 | Globe has no loading state during `globe.gl` dynamic import — blank 2-3s before globe appears | `GlobePage.tsx:125, 362` |
| U7 | Photo upload UI exists but no backend — form silently discards photos | `SightingReportForm.tsx` |
| U8 | Archive locked-year UX has no explanation — lock icon on 25 years with no tooltip | `ArchivePage.tsx:261,267` |
| U9 | No push notification opt-in CTA anywhere in the app | — |

### 🟡 Medium
| # | Issue | File |
|---|-------|------|
| U10 | ProGate focus trap missing — user can tab behind blur overlay | `client/src/components/ProGate.tsx` |
| U11 | `BestTimeCard` ProGate blur not properly applied in some states | `MapPage.tsx:701-705`, `GlobePage.tsx:531-535` |
| U12 | Sighting feed auto-refresh every 30s — no user control, battery drain | `SightingFeed.tsx:45-50` |
| U13 | High Contrast mode only applied to Map, not Globe | `GlobePage.tsx` |
| U14 | Calendar no year jump field — can only navigate ±1 year | `CalendarPage.tsx:376-396` |
| U15 | Map click handler not debounced — rapid clicks trigger multiple DEM fetches | `MapPage.tsx:182-211` |
| U16 | SightingReportForm: EXIF extract error shown but doesn't block submission — confusing | `SightingReportForm.tsx:32-70` |
| U17 | No social proof: no "X reports submitted this month" counter or contributor badges | — |

### 🟢 Low / Engagement Gaps
| # | Issue |
|---|-------|
| U18 | No onboarding/tutorial for new users (dense home page with 6 cards) |
| U19 | No email reminder before Ramadan/Eid events |
| U20 | No "Like" or reaction on sighting reports |
| U21 | No SVG/Canvas chart accessibility labels |
| U22 | Calendar doesn't show days relative to real sighting reports |

---

## 3. Scientific Accuracy Findings

### 🔴 Critical — Algorithm Bugs
| # | Issue | File |
|---|-------|------|
| A1 | **Odeh Zone E never returned** — `classifyOdeh()` always returns `"D"` for negative V values; should return `"E"` for V < -1.64. Makes Odeh criterion appear more optimistic than intended | `shared/astronomy.ts:188-194` |
| A2 | **NaN crescent width** — `crescentWidth()` computes `Math.asin(1737.4 / moonDistKm)` without validating `moonDistKm > 1737.4`. Returns NaN silently; worker patches with `-1.0` (misclassifies as E-zone instead of error) | `shared/astronomy.ts:148-153` |
| A3 | **Elongation domain error** — `Math.acos(...)` can receive value slightly outside `[-1, 1]` due to float precision, returning NaN elongation that silently propagates | `shared/astronomy.ts:250-254` |
| A4 | **Polar latitude exclusion undocumented** — grid hard-stops at ±80° with no comment explaining why. Observers above 80°N/S get no data | `shared/astronomy.ts:309` |

### 🟠 High
| # | Issue | File |
|---|-------|------|
| A5 | Public API accepts any date with no range validation — SunCalc degrades badly outside 1900-2100 | `server/publicApi.ts:25-26` |
| A6 | tRPC routers (archive, weather, notifications, appRouter mutations) have **0 unit tests** | `server/routers/` — entire router layer untested |
| A7 | Best observation time edge cases: polar regions where moon never sets, arbitrary 2h fallback undocumented | `shared/astronomy.ts:710-726` |

### 🟡 Medium
| # | Issue | File |
|---|-------|------|
| A8 | Maghrib time hardcoded as +18 minutes — inaccurate at high latitudes (±5-15 min error) | `shared/astronomy.ts:273` |
| A9 | Cloud cover not factored into Yallop/Odeh q-value — Zone A can show with 100% cloud cover | `visibility.worker.ts:104` |
| A10 | Worker NaN fallback to `-1.0` silently maps errors to E-zone | `visibility.worker.ts:59,64` |
| A11 | Hijri timezone handling undocumented — uses local browser timezone for month boundaries | `shared/astronomy.ts:520-564` |
| A12 | Missing tests: Arctic twilight, conjunction at midnight UTC, perigee/apogee extremes | `server/visibility.test.ts` |

### 🟢 Low
| # | Issue |
|---|-------|
| A13 | Formula citations (Yallop 1997, Odeh 2004) lack DOI/PDF links and tested parameter ranges |
| A14 | E2E tests missing: calendar Hijri accuracy assertions, Pro gating, archive retrieval |
| A15 | SunCalc ±0.3° error not surfaced to users as a precision caveat |

---

## 4. Known Pre-Existing Flags (Already Documented)
- `TESTING_DISABLE_PRO_GATE = true` — intentional during dev, **must be `false` for release**
- iOS version `1.0` / `1` out of sync with Android `1.0.4` / `5`
- Push notifications: DB schema exists, FCM/APNs wiring pending
- Photo uploads: form UI exists, no cloud storage backend

---

## 5. Scorecard (Round 40)

| Area | Score | Notes |
|------|:-----:|-------|
| Visual Design | 10/10 | Instrument-grade — no change needed |
| Scientific Accuracy | 6/10 | 4 critical algorithm bugs; Odeh Zone E always wrong |
| Data Completeness | 8/10 | ICOP + Open-Meteo strong; cloud cover not in q-value |
| Mobile Experience | 6/10 | Capacitor + RevenueCat working; no push, no photos |
| Performance | 9/10 | Web Worker + code splitting excellent |
| Security | 6/10 | Strong foundations; userId bypass + missing CSP + pro gate open |
| UI/UX Quality | 7/10 | Beautiful; broken i18n, no error boundaries, state desync |
| Test Coverage | 7/10 | 89 unit tests solid; 0% router coverage |
| Production Readiness | 4/10 | Pro gate open, iOS out of sync, CSP missing |
| Community/Engagement | 4/10 | No push, no photos, no real-time feed |

---

*Report generated by Claude Code — Round 40 — February 28, 2026*
*Cross-referenced with: project_review.md, comprehensive_review.md, AUDIT_REPORT_ROUND39.md, todo.md*
