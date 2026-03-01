# Hilal Vision — Project TODO

## Current Round: 41 (Mar 2026)

### Round 41 — Comprehensive Audit (8 Phases)

- [x] **Phase 1 — Security:** `crypto.timingSafeEqual()` for secrets, IP spoofing fix, bounded LocalRateLimiter, rate limit on notifications.subscribe, Zod lat/lng bounds in weather router
- [x] **Phase 2 — Scientific Accuracy:** `Astronomy.SearchLunarEclipse()` (replaces hand-rolled node regression), Bennett altitude-dependent refraction, Maghrib = sunset (removed +18 min offset), precise synodic constant (29.53058867), stale SunCalc references replaced with astronomy-engine
- [x] **Phase 3 — Accessibility & UI:** NotFound dark theme, UpgradeModal WCAG 2.1 AA (role/aria-modal/focus trap/Escape), noise z-index lowered, alert()→sonner toasts, language dropdown keyboard nav, aria-labels on calendar/archive/canvas, aria-describedby on form errors
- [x] **Phase 4 — Performance & Code Quality:** ArchivePage mini-map offloaded to Web Worker, Framer Motion removed (CSS keyframes), exif-js removed, usePlanSelection hook, useAtmosphericData hook, dead code pruned
- [x] **Phase 5 — User Engagement:** TonightCard hero widget on Home page, localStorage persistence for location/criterion, .ics calendar export, SightingFeed empty state CTA, nav active state fix for /map & /globe
- [x] **Phase 6 — Documentation:** UNLICENSED license in package.json, removed superseded root docs, README pnpm/test count/doc link fixes, HILAL_VISION_DOCUMENTATION.md ghost routes removed + Round 41 history, SECURITY/TESTING/DEPLOYMENT docs updated
- [ ] **Phase 7 — Testing:** Eclipse prediction regression tests, atmospheric refraction tests, ProGate rendering tests, NotFound dark theme E2E test, SightingFeed empty state tests
- [ ] **Phase 8 — Cleanup:** Gate togglePremium behind DEV flag, bundle Leaflet icons locally, fix cron hardcoded URL to use env var

---

## Completed: Rounds 1–40

### Rounds 1–5: Foundation & Core Features
- [x] Design system (CSS variables, dark theme, Inter + Cinzel + Noto Naskh Arabic)
- [x] Navigation, routing, footer
- [x] Sun/moon position engine (astronomy-engine VSOP87/ELP2000)
- [x] Yallop & Odeh visibility criteria
- [x] Hijri calendar conversion (astronomical + Umm al-Qura + tabular)
- [x] Day/night terminator geometry
- [x] Interactive 3D Globe (globe.gl, WebGL, Three.js overlays)
- [x] Flat 2D Map (Leaflet, CartoDB dark tiles, bilinear canvas overlay)
- [x] Moon Phase Dashboard (SVG crescent, altitude chart, 30-day strip)
- [x] Hijri Calendar Page (3 engines, Islamic events, year navigation)
- [x] Local Horizon View (canvas-based panorama, ARCV annotation)
- [x] Crescent Visibility Archive (1,000+ ICOP records, 1438–1465 AH)
- [x] Web Worker for visibility texture (60FPS main thread)
- [x] Cloud cover overlay (Open-Meteo, globe equirectangular + map Mercator)
- [x] Best-Time-to-Observe calculator (sunset→moonset scan, composite scoring)

### Rounds 10–39: Pro Tier, Payments, Native Mobile, Hardening
- [x] ProTierContext, ProGate, UpgradeModal — full soft paywall system
- [x] 6 gated features: 3D Globe, Cloud Cover, Atmospheric Overrides, Best Time, Sky Dome, Archive years
- [x] Stripe Live mode (monthly $2.99, annual $14.99, lifetime $49.99, donations)
- [x] RevenueCat native billing (iOS App Store + Google Play)
- [x] Clerk Auth (JWT, publicMetadata.isPro, isAdmin, isPatron)
- [x] Android App Bundle signed + Play Store submitted (versionCode 5 / "1.0.4")
- [x] i18n: English, Arabic (RTL), Urdu (RTL) with browser language detection
- [x] SEO: dynamic meta tags, OG/Twitter cards, JSON-LD, sitemap.xml, robots.txt
- [x] PWA: Service Worker (CacheFirst/NetworkFirst/StaleWhileRevalidate)
- [x] Sentry error monitoring (ErrorBoundary, API capture, 20% perf tracing)
- [x] Public REST API (/api/v1/visibility, /api/v1/moon-phases) — Zod validated
- [x] Photo uploads (S3 proxy, exifr EXIF parsing)
- [x] Push Notifications (Firebase Admin, FCM, Vercel cron 08:00 UTC)
- [x] 133 → 144 unit tests across 9 files; 14 Playwright E2E tests
- [x] CORS origin whitelist (api/_cors.ts), security headers, rate limiting
- [x] Admin bypass via Clerk publicMetadata.isAdmin (no hardcoded emails)

---

## Future Backlog

### Mobile & Stores
- [ ] iOS TestFlight → App Store Connect review submission
- [ ] Sync iOS version in Xcode (MARKETING_VERSION = 1.0.4, CURRENT_PROJECT_VERSION = 5)
- [ ] Google Play: finalise Data Safety form, screenshots, store listing

### Features
- [ ] AR Moon Finder (Capacitor camera + device orientation)
- [ ] Malay i18n (4th locale after EN/AR/UR)
- [ ] Tiered Developer API (rate-limited API keys, usage-based pricing)
- [ ] Mosque Widget (embeddable iframe, $10–$20/month B2B)
- [ ] Ethical Ads (Muslim Ad Network, below-fold free tier only)
- [ ] Server-side visibility grid precomputation (cron → Redis cache → instant texture)
