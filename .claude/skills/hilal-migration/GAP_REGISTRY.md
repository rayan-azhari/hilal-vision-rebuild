# Hilal Vision — Migration Gap Registry

**Last updated:** 2026-03-07 (G-10, G-11, G-09, G-18, G-05, G-12, G-14, G-13, G-07, G-15, G-24, G-25, G-02, G-03, G-21, G-23 complete)
**Source of truth:** Update this file whenever a gap is opened, closed, or re-prioritized.

Statuses: `Open` | `In Progress` | `Complete` | `Blocked`

---

## High Priority — Blocks Full Feature Parity

| ID | Domain | Gap Description | Legacy Source | New Target | Status |
|----|--------|-----------------|---------------|------------|--------|
| G-01 | Pages | GlobePage as a dedicated `/globe` route (465 lines legacy) — full 3D globe with atmosphere, day/night terminator, cloud overlay, atmospheric overrides, zone texture | `_legacy/client/src/pages/GlobePage.tsx` | `apps/web/src/app/globe/page.tsx` — MISSING | Open |
| G-02 | Data | `icop-history.json` — 1,000+ ICOP historical crescent observations. Archive page fetches this but the file doesn't exist | `_legacy/` ICOP scraper (Cheerio) | `apps/web/public/icop-history.json` — 14 months, 1028 records (1440/9–1446/10). Static snapshot; no live ICOP API exists. | Complete |
| G-03 | Workers | `archiveMiniMap.worker.ts` — renders visibility mini-map for the Archive page | `_legacy/client/src/workers/archiveMiniMap.worker.ts` | `apps/web/src/app/archive/page.tsx` — inline canvas component (Turbopack worker incompatibility; 966 pts synced on main thread) | Complete |
| G-04 | Mobile | Entire mobile app (Expo Router + React Native) — not started. Capacitor wrapping the legacy Vite app is the current mobile strategy | `_legacy/android/`, `_legacy/ios/`, Capacitor config | `apps/mobile/` — NOT STARTED | Open |
| G-05 | Hooks | `useAtmosphericData` — manages temp/pressure/elevation overrides + auto-fetch from Open-Meteo elevation API | `_legacy/client/src/hooks/useAtmosphericData.ts` | `apps/web/src/hooks/useAtmosphericData.ts` | Complete |
| G-06 | API | S3/R2 image upload pipeline — photo upload for sighting reports is a placeholder | `_legacy/` image handling | `apps/web/src/app/api/` — placeholder only | Open |
| G-07 | API | FCM push send route + cron alerts | `_legacy/api/push/send.ts`, `_legacy/server/cron/moonAlerts.ts` | `apps/web/src/app/api/push/send/route.ts` + `apps/web/src/app/api/cron/moon-alerts/route.ts` | Complete |
| G-08 | Payments | RevenueCat native billing — React Native purchases integration for iOS/Android Pro tier | `_legacy/client/src/contexts/ProTierContext.tsx` (RevenueCat block) | No `@revenuecat/purchases-react-native` in any package | Blocked (needs mobile app first) |
| G-09 | Backend | DB insertions in `/api/sightings` — currently mocked, not persisted to Neon | `_legacy/server/appRouter.ts` → `submitObservation` | `apps/web/src/app/api/sightings/route.ts` + `apps/web/src/server/routers/telemetry.ts` | Complete |
| G-10 | Pages | About page (`/about`) — MDX content page | `_legacy/client/src/pages/AboutPage.tsx` | `apps/web/content/about.mdx` | Complete |
| G-11 | Pages | Methodology page (`/methodology`) — scientific reference (Yallop q-value, Odeh V-formula, Hijri calendar engines) | `_legacy/client/src/pages/MethodologyPage.tsx` | `apps/web/content/methodology.mdx` | Complete |

---

## Medium Priority — Feature Gaps

| ID | Domain | Gap Description | Legacy Source | New Target | Status |
|----|--------|-----------------|---------------|------------|--------|
| G-12 | Components | `SightingFeed.tsx` full implementation — live feed of recent user observations with CSV/JSON export, push subscribe CTA (317 lines in legacy) | `_legacy/client/src/components/SightingFeed.tsx` | `apps/web/src/components/SightingFeed.tsx` | Complete |
| G-13 | Map | Observation pins on VisibilityMap — crowdsourced sighting pins on the 2D map | `_legacy/client/src/pages/VisibilityPage.tsx` | `apps/web/src/components/VisibilityMap.tsx` — no pins | Complete |
| G-14 | Map | MapControlsPanel + atmospheric overrides sidebar in VisibilityPage — criterion toggle, hour offset slider, temp/pressure overrides, best time panel | `_legacy/client/src/components/MapControlsPanel.tsx`, `MapLegendPanels.tsx` | `apps/web/src/app/visibility/page.tsx` — sidebar missing | Complete |
| G-15 | Backend | `dem` tRPC router — Digital Elevation Model queries via Open-Meteo elevation API | `_legacy/server/appRouter.ts` → `dem` | `apps/web/src/server/routers/dem.ts` | Complete |
| G-16 | API | Public REST API v1 with rate limiting — `/api/v1/visibility` and `/api/v1/moon-phases` | `_legacy/server/publicApi.ts` | `apps/web/src/app/api/visibility/route.ts` — partial | Open |
| G-17 | Backend | Vercel KV visibility grid cron — hourly pre-computation of global visibility grids | `_legacy/server/cron/` | `apps/web/src/app/api/cron/visibility/route.ts` — scaffold only | Open |
| G-18 | Backend | `telemetry.getRecentObservations` tRPC query — fetch recent public sightings for feed and map pins | `_legacy/server/appRouter.ts` | `apps/web/src/server/routers/telemetry.ts` | Complete |
| G-19 | i18n | Missing translation keys for CalendarPage, ArchivePage, HorizonPage, GlobePage, MapPage, MoonPage | `_legacy/client/src/locales/{en,ar,ur}/common.json` | `apps/web/src/locales/` — these page sections missing | Open |
| G-20 | UI | Light theme cross-page polish — dark mode is well-implemented; light mode needs review across all pages | All legacy pages | All `apps/web/src/app/` pages | Open |
| G-21 | Auth | Clerk Sign In button conditional rendering — needs verification that auth state shows correctly | `_legacy/client/src/components/Layout.tsx` | `apps/web/src/components/Header.tsx` | Complete |
| G-22 | Backend | Email signup endpoint — waitlist/newsletter registration | `_legacy/drizzle/schema.ts` `emailSignups` table | Not in new API routes | Open |
| G-23 | UI | Moon color consistency — `var(--gold)` must be used wherever a moon/crescent is displayed | `_legacy/` consistent use of gold | `apps/web/src/components/MoonIllustration.tsx` already correct; `BreezyDetailCard`, `BreezyFullCard`, `moon/page.tsx` all fixed | Complete |
| G-24 | UI | Main page moon phase — home page moon illustration must reflect actual current moon phase | `_legacy/client/src/pages/Home.tsx` | `apps/web/src/app/page.tsx` | Complete |
| G-25 | Map | Visibility map auto-location — 2D map should default to detected location if geolocation is enabled | `_legacy/client/src/pages/MapPage.tsx` | `apps/web/src/components/VisibilityMap.tsx` | Complete |
| G-26 | Backend | Push notifications tRPC router — subscribe/unsubscribe for FCM tokens | `_legacy/server/routers/notifications.ts` | `apps/web/src/server/routers/notifications.ts` — partial | Open |

---

## Low Priority / Future Roadmap

| ID | Domain | Gap Description | Status |
|----|--------|-----------------|--------|
| G-27 | Testing | E2E Playwright test expansion — currently 19 tests, needs coverage for Pro gating, sighting flow, archive | Open |
| G-28 | i18n | Malay (4th locale) | Open |
| G-29 | Mobile | AR Moon Finder — camera + device orientation (post-mobile-app-launch) | Open |
| G-30 | API | Tiered Developer API — rate tiers, API key management | Open |
| G-31 | Mobile | iOS version sync — MARKETING_VERSION=1.0.5, CURRENT_PROJECT_VERSION=6 in Xcode (manual) | Open |

---

## Completed Gaps

| ID | Domain | Description | Completed |
|----|--------|-------------|-----------|
| — | Monorepo | Turborepo + pnpm scaffold | Round 41 |
| — | Packages | `@hilal/astronomy`, `@hilal/db`, `@hilal/types`, `@hilal/ui` extracted | Round 41 |
| — | DB | MySQL → Neon PostgreSQL schema + Drizzle ORM | Round 41 |
| — | Auth | Clerk integration, Sign In, publicMetadata.isPro | Round 41 |
| — | Payments | Stripe checkout + webhook → Clerk isPro sync | Round 41 |
| — | Pro | ProGate, UpgradeModal, 6 gated features | Round 41 |
| — | Map | MapLibre 2D visibility map + contour overlays | Round 41 |
| — | Worker | `visibility.worker.ts` — Mercator projection, 1024×512 texture | Round 41 |
| — | Hooks | `useVisibilityWorker`, `useCloudOverlay`, `useGeolocation` | Round 41 |
| — | Pages | Moon, Calendar, Archive, Horizon pages (core) | Round 41 |
| — | i18n | EN, AR, UR translations for home/nav/common/zones/phases/tonight/feed/modal/support | Round 41 |
| — | PWA | Serwist service worker, CacheFirst/NetworkFirst strategies | Round 41 |
| — | CI | 5 permanent CI rules established, ESLint configs per package | Round 41 |
| — | Forms | ObservationForm (EXIF GPS, tRPC mutation), SightingModal | Round 41 |
