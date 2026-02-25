# Hilal Vision — Full Audit & Strategic Roadmap

> **Goal**: Make Hilal Vision THE definitive source for Islamic crescent moon sighting — best-in-class visually and scientifically, available on web + Android + iOS.

---

## 1. Current State Scorecard

| Area | Score | Notes |
|------|:-----:|-------|
| **Visual Design** | 10/10 | "Clinical Aerospace" & "Deep Space" themes implemented. Precision typography and component scaling applied. Breezy design elevated to "instrument-grade". |
| **Scientific Accuracy** | 8/10 | Yallop/Odeh criteria solid. Hijri now conjunction-based. Best-time-to-observe engine added. SunCalc is good but not VSOP87. |
| **Data Completeness** | 8/10 | Real ICOP sighting data (1,028+ records, 1440–1446 AH). Cloud cover overlay integrated via Open-Meteo. |
| **Mobile Experience** | 5/10 | Responsive layout works. Capacitor.js configured for Android/iOS builds. No offline or push. |
| **Performance** | 8/10 | Visibility grid offloaded to Web Worker. Smooth 60FPS UI. No SSR. |
| **SEO & Reach** | 5/10 | Dynamic titles added. No structured data, no sitemap, no social cards. |
| **Community** | 4/10 | Sighting form exists with Clerk auth, smart validation (Zone F rejection). No photo uploads. |
| **Backend** | 7/10 | tRPC API works. Clerk auth integrated. Upstash Redis rate limiting. Public endpoints fixed. |

---

## 2. Issues & Gaps

### 🔴 Critical

| # | Issue | Impact |
|---|-------|--------|
| 1 | ~~**No real sighting data**~~ | ✅ Resolved — 1,028+ ICOP records integrated |
| 2 | ~~**No authentication**~~ | ✅ Resolved — Clerk Auth integrated |
| 3 | ~~**In-memory rate limiter**~~ | ✅ Resolved — Upstash Redis distributed rate limiting |
| 4 | ~~**53 unused Radix UI components**~~ | ✅ Resolved — Unused deps removed |
| 5 | ~~**No Web Worker**~~ | ✅ Resolved — Visibility texture computed in Web Worker |

### 🟡 Important

| # | Issue | Impact |
|---|-------|--------|
| 6 | **SunCalc accuracy** — Uses simplified algorithms (~0.3° error). Professional tools use VSOP87/ELP2000 | Borderline cases may classify wrong zone |
| 7 | ~~**No weather/cloud overlay**~~ | ✅ Resolved — Open-Meteo cloud cover overlay on both Map and Globe views |
| 8 | **No push notifications** — Users can't get "Tonight's crescent may be visible!" alerts | Major engagement gap |
| 9 | **No offline support** — PWA manifest exists but no service worker | App is useless without internet |
| 10 | **No photo upload for sightings** — Competitors (LuneSighting) allow photo evidence | Missing community trust feature |
| 11 | **No i18n** — All UI is English-only (only month names have Arabic) | Excludes Arabic/Urdu/Malay speaking majority |

### 🟢 Minor

| # | Issue | Impact |
|---|-------|--------|
| 12 | No social sharing ("Share tonight's crescent visibility for Mecca") | Missed viral growth |
| 13 | No structured data / JSON-LD for Google rich results | Low search visibility |
| 14 | `@aws-sdk/client-s3` in dependencies but never used | Unnecessary bloat |
| 15 | `DashboardPage` and `RamadanPage` routes referenced in docs but not in pages directory | Dead references |

---

## 3. Mobile Strategy — Recommendation: **Capacitor.js**

### Why Not the Alternatives?

| Option | Verdict | Reason |
|--------|---------|--------|
| **PWA only** | ❌ Insufficient | iOS limits push notifications, no app store presence, no GPS background |
| **React Native** | ❌ Overkill | Would require rewriting all 9 pages + Globe.gl + Leaflet in RN components. Massive effort, no WebGL support. |
| **Flutter** | ❌ Wrong stack | Complete rewrite in Dart. No code sharing with existing React codebase. |
| **Capacitor.js** | ✅ Best fit | Wraps existing React + Vite app in native container. Full native API access. Same codebase for web + Android + iOS. |

### Capacitor.js Implementation Plan

```
1. npm install @capacitor/core @capacitor/cli
2. npx cap init "Hilal Vision" "com.hilalvision.app"
3. npx cap add android && npx cap add ios
4. npm run build && npx cap sync
5. npx cap open android  # Opens Android Studio
6. npx cap open ios       # Opens Xcode
```

**Native features you gain immediately:**
- Push notifications (`@capacitor/push-notifications`) — "Crescent may be visible tonight!"
- GPS background tracking (`@capacitor/geolocation`)
- Camera access (`@capacitor/camera`) — for sighting photo uploads
- Haptic feedback (`@capacitor/haptics`)
- App Store / Play Store distribution
- Offline support via Capacitor + Service Worker

**Timeline:** ~2-3 days to get the existing web app running as Android + iOS apps.

---

## 4. Becoming THE Definitive Source

### Scientific Credibility

| Action | Priority | Effort |
|--------|:--------:|:------:|
| **Integrate ICOP database** — 1,000+ real historical sighting records from the Islamic Crescents' Observation Project | 🔴 High | Medium |
| **Upgrade to VSOP87/ELP2000** — Higher-accuracy planetary theory (replace SunCalc for critical calculations) | 🟡 Med | High |
| **Add South African Astronomical Observatory (SAAO) criteria** — Used by many African countries | 🟡 Med | Low |
| **Topocentric correction** — Account for observer's elevation and atmospheric refraction more precisely | 🟡 Med | Medium |
| ~~**Best-time-to-observe calculator**~~ | ✅ Done | ✅ `computeBestObservationTime()` scans sunset→moonset in 5-min steps |
| **Conjunction times** — Show exact new moon (conjunction) time to the second, not just the day | 🔴 High | Low |

### Visual Excellence

| Action | Priority | Effort |
|--------|:--------:|:------:|
| **AR Moon Finder** — Camera-based augmented reality showing where the crescent is in the sky (Capacitor camera) | 🔴 High | High |
| **Animated visibility timeline** — Smooth animation showing how crescent visibility evolves minute-by-minute after sunset | 🔴 High | Medium |
| ~~**Weather overlay on map**~~ | ✅ Done | ✅ Open-Meteo cloud cover on both Map and Globe, independently toggleable |
| **3D crescent rendering** — Replace SVG with WebGL crescent that shows actual earthshine and crater detail | 🟡 Med | High |
| **Comparison mode** — Side-by-side: "What Mecca sees vs what London sees at sunset tonight" | 🟡 Med | Medium |
| **Dark Sky Quality overlay** — Light pollution map for optimal sighting locations | 🟢 Low | Medium |

### Community & Trust

| Action | Priority | Effort |
|--------|:--------:|:------:|
| **Photo sighting reports** — Users upload photos of the crescent they saw (or didn't see) | 🔴 High | Medium |
| **Verified sighter badges** — Mark experienced observers whose reports carry more weight | 🟡 Med | Medium |
| **Scholar endorsements** — Partner with Islamic calendar authorities (FCNA, ECFR, MJC) for official data | 🔴 High | External |
| **Real-time sighting feed** — Live map showing sightings as they come in on the 29th of each month | 🟡 Med | Medium |
| **Multi-language UI** — Arabic, Urdu, Malay, Turkish, French, Indonesian (covers 90% of Muslim world) | 🔴 High | High |

### Reach & Growth

| Action | Priority | Effort |
|--------|:--------:|:------:|
| **App Store presence** (via Capacitor) | 🔴 High | Low |
| **Push notifications** — "Crescent may be visible tonight in your area" | 🔴 High | Medium |
| **SEO structured data** — JSON-LD for Islamic dates, moon phases, events | 🟡 Med | Low |
| **Social sharing** — "Ramadan starts tomorrow in Mecca! 🌙" with OG image cards | 🟡 Med | Low |
| **Embeddable widget** — Let mosques/Islamic websites embed a moon sighting widget | 🟡 Med | Medium |
| **API for developers** — Public REST API for moon visibility data (freemium model) | 🟢 Low | Medium |

---

## 5. Competitive Landscape

| Feature | Hilal Vision | Moonsighting.com | IslamicFinder | LuneSighting | HilalMap |
|---------|:---:|:---:|:---:|:---:|:---:|
| 3D Globe | ✅ | ❌ | ❌ | ❌ | ❌ |
| 2D Visibility Map | ✅ | ✅ | ❌ | ❌ | ✅ |
| Mobile App | ✅ | ❌ | ✅ | ✅ | ❌ |
| Push Notifications | ❌ | ❌ | ✅ | ✅ | ❌ |
| AR Moon Finder | ❌ | ❌ | ❌ | ❌ | ❌ |
| Photo Sightings | ❌ | ❌ | ❌ | ✅ | ❌ |
| Real Sighting Data | ✅ | ✅ | ❌ | ✅ | ❌ |
| Weather Overlay | ✅ | ❌ | ❌ | ❌ | ❌ |
| Multi-Language | ✅ | ❌ | ✅ | ❌ | ❌ |
| Scientific Detail | ✅ | ✅ | ❌ | ❌ | ❌ |
| Animated Timeline | ❌ | ❌ | ❌ | ❌ | ❌ |
| Best-Time Calculator | ✅ | ❌ | ❌ | ❌ | ❌ |

> **Key insight:** No competitor has ALL of: 3D globe, AR, weather overlay, photo sightings, and real ICOP data. Hilal Vision now uniquely owns the weather overlay + best-time calculator combination.

---

## 6. Recommended Execution Order

### Phase 1 — Foundation (1-2 weeks)
- [x] Capacitor.js integration → Android + iOS builds
- [x] Replace in-memory rate limiter with Upstash Redis
- [x] Add auth (Clerk) — needed for sighting identity
- [x] Remove unused dependencies (AWS SDK, unused Radix components)
- [x] Add Web Worker for visibility texture computation

### Phase 2 — Data & Credibility (2-3 weeks)
- [x] ICOP historical sighting database integration
- [x] Weather/cloud overlay on visibility map (Open-Meteo cloud cover)
- [x] Best-time-to-observe calculator
- [ ] Exact conjunction times (to the second)
- [ ] Photo upload for sighting reports

### Phase 3 — Reach & Engagement (2-3 weeks)
- [ ] Push notifications (Capacitor + FCM/APNs)
- [ ] SEO structured data (JSON-LD), sitemap, OG social cards
- [x] Arabic + Urdu i18n (minimum viable)
- [ ] Social sharing with OG image generation
- [ ] Real-time sighting feed on the 29th

### Phase 4 — Visual Differentiation (3-4 weeks)
- [ ] AR Moon Finder (Capacitor camera + WebGL overlay)
- [ ] Animated visibility timeline
- [ ] Comparison mode (Mecca vs London)
- [ ] 3D crescent rendering (WebGL earthshine)
- [ ] Embeddable widget for mosques/websites

### Phase 5 — Advanced Astronomy & Telemetry
Now that the UI is stunning, we upgrade the underlying data and reporting pipeline.
- [ ] **Photo Uploads:** Allowing users to attach photos of the crescent to their sighting reports, integrating with cloud storage (e.g., Firebase Storage or an S3 bucket).
- [ ] **Planetary Theory Upgrade:** Replacing the lightweight SunCalc formulas with ultra-high precision VSOP87/ELP2000 planetary algorithms for observatory-grade accuracy.
- [ ] **Server-Side Grid Precomputation:** Instead of calculating 3,600+ points on the client's Web Worker, we setup a cron job to precompute identical high-res global grids on the backend to allow instant loading on mobile.

### Phase 6 — Deep Mobile Integration (Capacitor)
Leveraging the native capabilities of iOS and Android.
- [ ] **AR Moon Finder:** Using Capacitor camera APIs combined with WebGL/Three.js device-orientation sensors to let users point their phone at the sky and see exactly where the crescent is located relative to their physical horizon.
- [ ] **Malay Language:** Adding Malay (ms) to complete the primary Islamic geographic language targeting in our i18n setup.

---

*Audit completed February 22, 2026. Last updated February 23, 2026 (Visual Design Overhaul completed to 1:1 Pixel-Perfect instrument-grade, including Final 1% UI Refinements).*
