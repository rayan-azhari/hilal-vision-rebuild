# Hilal Vision — Testing Reference

This document describes the test infrastructure, how to run tests, and what is covered. The test suite was expanded in **Round 40** from 21 to 89 unit tests.

---

## Test Stack

| Tool | Purpose | Config |
|------|---------|--------|
| **Vitest** | Unit tests (server-side, pure functions) | `vitest.config.ts` |
| **Playwright** | End-to-end browser tests | `playwright.config.ts` |
| **ESLint** | Static analysis + code quality | `eslint.config.js` |
| **TypeScript** | Type checking | `tsconfig.json` |

---

## Running Tests

```bash
# Unit tests (fast, no browser, no network)
pnpm test

# Unit tests in watch mode (during development)
npx vitest

# E2E tests (requires dev server running)
pnpm test:e2e

# Full CI pipeline (lint + type-check + unit tests + build)
pnpm ci

# Individual checks
pnpm lint          # ESLint
pnpm lint:fix      # ESLint with auto-fix
pnpm check         # TypeScript type check
pnpm format        # Prettier format all files
pnpm format:check  # Prettier check (no write)
```

---

## Unit Tests (`pnpm test`)

Tests live in `server/**/*.test.ts` and `api/**/*.test.ts` and run in a Node environment via Vitest. No browser, no network requests.

### Test Files

#### `server/astronomy.test.ts` — 21 tests

Original test suite covering the core astronomical primitives:

| Describe block | Tests | What it verifies |
|---|---|---|
| `Yallop q-value classification` | 5 | Zone A/B/C/E/F boundary values |
| `Crescent width calculation` | 3 | Near-zero at small elongation, increases with elong., semi-diam ~15 arcmin |
| `Hijri calendar conversion` | 4 | Known date conversions (Ramadan 1445, Shawwal 1445) |
| `Yallop q-value formula` | 2 | Q increases with ARCV, Q increases with crescent width |
| `Degree/radian conversions` | 3 | 180°=π, π=180°, round-trip identity |
| `Best time to observe` | 4 | Window bounds, bestTime in window, non-negative score, sun below horizon |

#### `server/calendar.test.ts` — 20 tests

All three Islamic calendar engines and cross-engine validation:

| Describe block | Tests | What it verifies |
|---|---|---|
| `Hijri month names` | 4 | HIJRI_MONTHS array has 12 months, correct en/ar/short fields, Muharram/Ramadan names |
| `gregorianToHijri (astronomical engine)` | 5 | Known Ramadan 2024 date, Eid al-Fitr 2024, valid day/month ranges, year range 2020–2030 |
| `Julian Day and Tabular Hijri` | 3 | J2000.0 epoch JD value, known conversion, day always 1–30 |
| `hijriToGregorian` | 2 | Returns valid Date, Muharram 1446 falls in 2024 |
| `Umm al-Qura calendar engine` | 4 | Valid date for today, 29/30 day months, valid month start, all 12 months of 1445 |
| `Cross-engine consistency` | 2 | All 3 engines agree on Hijri year; agree within 1 month for recent dates |

#### `server/visibility.test.ts` — 38 tests

Comprehensive coverage of the visibility computation pipeline:

| Describe block | Tests | What it verifies |
|---|---|---|
| `getSunsetTime` | 3 | Returns Date, Makkah sunset in expected UTC range, London differs from Makkah |
| `computeSunMoonAtSunset` | 5 | All required fields present, sunAlt near 0, valid zone A–F, southern hemisphere, ARCV=moonAlt-sunAlt |
| `Yallop q-value classification (comprehensive)` | 7 | All 6 zone boundaries with exact q-values matching spec, F overrides any q |
| `Odeh v-value classification` | 2 | Zone A at v≥5.65, F when moonAlt≤0 |
| `Yallop Q formula` | 2 | Q increases with ARCV, Q increases with crescent width |
| `Odeh V formula` | 1 | V increases with ARCV |
| `Crescent width (extended)` | 3 | Monotonically increases, sd larger at perigee, zero at zero elongation |
| `getMoonPhaseInfo` | 5 | phaseName string, illuminatedFraction 0–1, phase 0–1, new moon low illumination, phaseArabic present |
| `findNewMoonNear` | 3 | Returns Date, within 15 days of approximation, illumination < 0.03 |
| `computeBestObservationTime (extended)` | 3 | Works for 4 locations, window end ≥ window start, score ≥ 0 |
| `generateVisibilityGrid` | 4 | Non-empty array, each point has lat/lng/zone, Odeh mode works, finer resolution = more points |

#### `api/_cors.test.ts` — 10 tests

CORS origin whitelisting security tests:

| Test | What it verifies |
|---|---|
| Whitelisted origin sets `Access-Control-Allow-Origin` | moonsighting.live gets the header |
| Whitelisted origin sets `Vary: Origin` | Cache differentiation |
| Unknown origin does NOT get the header | evil-site.com is blocked |
| Missing origin does NOT get the header | No-origin requests are blocked |
| Capacitor Android origin allowed | `https://localhost` passes |
| Capacitor iOS origin allowed | `capacitor://localhost` passes |
| Local dev origin allowed | `http://localhost:5173` passes |
| OPTIONS returns true (preflight handled) | 204 response sent |
| Non-OPTIONS returns false | GET continues to handler |
| Vercel preview domain allowed | `moon-dashboard-one.vercel.app` passes |

---

## End-to-End Tests (`pnpm test:e2e`)

E2E tests use Playwright and test the running application in a real Chromium browser. The dev server must be running (`pnpm dev`) unless `CI=true`.

### Test Files

#### `e2e/visibility.spec.ts`

| Test | What it verifies |
|---|---|
| Map Page loads and toggles criteria | Leaflet container visible, Yallop/Odeh toggle works |
| Globe Page loads | Canvas element visible within 15s |

#### `e2e/astronomy.spec.ts`

| Test | What it verifies |
|---|---|
| Best Time to Observe card renders | Side panel shows optimal time data |

#### `e2e/navigation.spec.ts`

| Test | What it verifies |
|---|---|
| Home page loads with heading | Title matches `/Hilal Vision\|Moon/i` |
| Bottom navigation renders | `nav` element visible |
| Map page loads | Leaflet container visible |
| Calendar page loads | Hijri/Calendar text visible |
| Support page loads | Pricing text visible |
| Moon page loads | Moon/Phase/Illumination text visible |
| Mobile viewport (375×812) | Page renders on iPhone X size |
| Tablet viewport (768×1024) | Leaflet map renders on iPad size |
| Dark color scheme | Page renders in dark mode |

---

## Linting (`pnpm lint`)

ESLint flat config (`eslint.config.js`) with:

- **`typescript-eslint`** recommended — catches TypeScript-specific issues
- **`react-hooks`** — enforces Rules of Hooks, exhaustive deps
- **`eslint-config-prettier`** — disables formatting rules that conflict with Prettier
- **Custom rules:**
  - `no-console` warn (off for `server/**` and `api/**` — logging is expected there)
  - `@typescript-eslint/no-explicit-any` warn
  - `@typescript-eslint/no-unused-vars` warn (ignores `_`-prefixed)
  - `eqeqeq` error — enforce `===`
  - `no-eval`, `no-implied-eval`, `no-new-func` error — prevent code injection
  - `no-var` error — enforce `const`/`let`
  - `prefer-const` warn

Ignored: `dist/`, `node_modules/`, `android/`, `ios/`, `client/public/`, `scripts/`, `*.config.*`

---

## CI Pipeline (GitHub Actions)

`.github/workflows/ci.yml` runs on every push and pull request to `main`.

```
push/PR to main
    │
    ├── lint job (pnpm lint)
    ├── typecheck job (pnpm check)
    └── test job (pnpm test)
              │
              └── build job (pnpm vercel-build) ← only runs if all 3 above pass
```

- **Concurrency:** Only one run per branch at a time (previous run cancelled)
- **Node:** 20 LTS
- **pnpm:** 10

---

## Coverage Goals

| Area | Current | Target |
|------|---------|--------|
| Astronomical algorithms (`shared/astronomy.ts`) | ~80% | 90%+ |
| CORS utility (`api/_cors.ts`) | ~95% | ✅ |
| Calendar engines | ~75% | 85%+ |
| tRPC procedures | ~0% | 60%+ (Phase 3) |
| Client components | ~0% | 40%+ (Phase 4) |

---

## Adding New Tests

Unit tests go in `server/**/*.test.ts` or `api/**/*.test.ts`. Use this template:

```typescript
import { describe, it, expect } from "vitest";
import { myFunction } from "../shared/myModule.js";

describe("myFunction", () => {
    it("returns expected result for known input", () => {
        expect(myFunction(input)).toBe(expectedOutput);
    });
});
```

E2E tests go in `e2e/**/*.spec.ts`. Use this template:

```typescript
import { test, expect } from "@playwright/test";

test("my page feature works", async ({ page }) => {
    await page.goto("/my-route");
    await expect(page.locator(".my-element")).toBeVisible({ timeout: 10000 });
});
```

---

*Last updated: February 27, 2026 (Round 40)*
