# Hilal Vision — Full Audit & Strategic Roadmap

> **Goal**: Make Hilal Vision THE definitive source for Islamic crescent moon sighting — best-in-class visually and scientifically, available on web + Android + iOS.

---

## 1. Current State Scorecard

| Area | Score | Notes |
|------|:-----:|-------|
| **Visual Design** | 8/10 | Breezy design is premium. Globe + Map views are impressive. |
| **Scientific Accuracy** | 7/10 | Yallop/Odeh criteria solid. Hijri now conjunction-based. SunCalc is good but not VSOP87. |
| **Data Completeness** | 5/10 | No real sighting data (ICOP/ICOUK). Archive is synthetic. No cloud cover on map. |
| **Mobile Experience** | 4/10 | Responsive layout works, but no app store presence, no offline, no push notifications. |
| **Performance** | 6/10 | Visibility grid is heavy (3,600 SunCalc calls per render). No Web Worker. No SSR. |
| **SEO & Reach** | 5/10 | Dynamic titles added. No structured data, no sitemap, no social cards. |
| **Community** | 3/10 | Sighting form exists but no moderation, no photo uploads, no verification workflow. |
| **Backend** | 4/10 | tRPC API works. No auth (Manus removed). In-memory rate limit resets on restart. |

---

## 2. Issues & Gaps

### 🔴 Critical

| # | Issue | Impact |
|---|-------|--------|
| 1 | **No real sighting data** — Archive page generates synthetic data, not actual ICOP/ICOUK records | Undermines credibility as "THE source" |
| 2 | **No authentication** — Manus OAuth removed, nothing replaced | Can't identify sighting reporters, no moderation |
| 3 | **In-memory rate limiter** — Resets on every Vercel cold start | Effectively no rate limiting in production |
| 4 | **53 unused Radix UI components** — Only ~5 are actually used (Dialog, Select, Dropdown, Tooltip, Slot) | 500KB+ bundle bloat |
| 5 | **No Web Worker** — Visibility texture computed on main thread; blocks UI for 2-4 seconds | Poor UX on mobile devices |

### 🟡 Important

| # | Issue | Impact |
|---|-------|--------|
| 6 | **SunCalc accuracy** — Uses simplified algorithms (~0.3° error). Professional tools use VSOP87/ELP2000 | Borderline cases may classify wrong zone |
| 7 | **No weather/cloud overlay** — Users can't tell if skies are clear for sighting tonight | Missing critical real-world factor |
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
| **Best-time-to-observe calculator** — Given location, compute the exact minute window when crescent is most likely visible | 🔴 High | Medium |
| **Conjunction times** — Show exact new moon (conjunction) time to the second, not just the day | 🔴 High | Low |

### Visual Excellence

| Action | Priority | Effort |
|--------|:--------:|:------:|
| **AR Moon Finder** — Camera-based augmented reality showing where the crescent is in the sky (Capacitor camera) | 🔴 High | High |
| **Animated visibility timeline** — Smooth animation showing how crescent visibility evolves minute-by-minute after sunset | 🔴 High | Medium |
| **Weather overlay on map** — Cloud cover layer from Open-Meteo showing where skies are clear tonight | 🔴 High | Medium |
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
| Mobile App | ❌ | ❌ | ✅ | ✅ | ❌ |
| Push Notifications | ❌ | ❌ | ✅ | ✅ | ❌ |
| AR Moon Finder | ❌ | ❌ | ❌ | ❌ | ❌ |
| Photo Sightings | ❌ | ❌ | ❌ | ✅ | ❌ |
| Real Sighting Data | ❌ | ✅ | ❌ | ✅ | ❌ |
| Weather Overlay | ❌ | ❌ | ❌ | ❌ | ❌ |
| Multi-Language | ❌ | ❌ | ✅ | ❌ | ❌ |
| Scientific Detail | ✅ | ✅ | ❌ | ❌ | ❌ |
| Animated Timeline | ❌ | ❌ | ❌ | ❌ | ❌ |
| Best-Time Calculator | ❌ | ❌ | ❌ | ❌ | ❌ |

> **Key insight:** No competitor has ALL of: 3D globe, AR, weather overlay, photo sightings, and real ICOP data. That's the gap Hilal Vision should own.

---

## 6. Recommended Execution Order

### Phase 1 — Foundation (1-2 weeks)
- [ ] Capacitor.js integration → Android + iOS builds
- [ ] Replace in-memory rate limiter with Upstash Redis
- [ ] Add auth (Clerk or Auth.js) — needed for sighting identity
- [ ] Remove unused dependencies (AWS SDK, unused Radix components)
- [ ] Add Web Worker for visibility texture computation

### Phase 2 — Data & Credibility (2-3 weeks)
- [ ] ICOP historical sighting database integration
- [ ] Weather/cloud overlay on visibility map (Open-Meteo cloud cover)
- [ ] Best-time-to-observe calculator
- [ ] Exact conjunction times (to the second)
- [ ] Photo upload for sighting reports

### Phase 3 — Reach & Engagement (2-3 weeks)
- [ ] Push notifications (Capacitor + FCM/APNs)
- [ ] SEO structured data (JSON-LD), sitemap, OG social cards
- [ ] Arabic + Urdu i18n (minimum viable)
- [ ] Social sharing with OG image generation
- [ ] Real-time sighting feed on the 29th

### Phase 4 — Visual Differentiation (3-4 weeks)
- [ ] AR Moon Finder (Capacitor camera + WebGL overlay)
- [ ] Animated visibility timeline
- [ ] Comparison mode (Mecca vs London)
- [ ] 3D crescent rendering (WebGL earthshine)
- [ ] Embeddable widget for mosques/websites

---

*Audit completed February 22, 2026.*
