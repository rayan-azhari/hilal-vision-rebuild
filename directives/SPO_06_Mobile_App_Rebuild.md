# SPO 06: Mobile App Rebuild

## Objective
Rebuild the mobile experience from absolute scratch using React Native (Expo Router), abandoning the legacy Capacitor WebView approach.

## Context
This is the most critical and highest-impact change. Capacitor WebViews trigger massive CORS/Auth bugs, drain battery executing heavy WebView JS math, and suffer WebGL context loss. React Native solves all three by building native iOS/Android code.

## Instructions
1. **Expo Setup**:
   - Initialize `apps/mobile` via Expo SDK (Expo Router template).
   - Configure `app.config.ts` for dynamic staging/prod API environments.
2. **Native Auth & Payments**:
   - Implement `@clerk/expo` for native biometric face/touch ID login — no browser redirects.
   - Implement `react-native-purchases` Native SDK to unlock pro features, bypassing the Capacitor bridge.
3. **Map & Globe Native Interfaces**:
   - Swap `Leaflet` for `react-native-maps` (Apple Maps/Google Maps).
   - Swap the web `Globe.gl` for `expo-gl` wrapping `Three.js` purely (single GL context).
4. **Offline First Architecture**:
   - Implement `expo-sqlite` local database mapping the observations table.
   - Build a `Background Sync` service that stores sightings when offline, then pushes to the API sequentially when internet is restored.
   - Pre-computation: pre-generate the next 30 days of standard ephemeris tables and store them as a JSON asset for instant offline AR calculations.

## Success Criteria
- Expo app builds via `expo doctor` securely.
- `@clerk/expo` correctly signs in a user via Apple/Google native flows.
- Map renders natively via `react-native-maps`.
- Flight mode tests prove offline sightings save successfully to `expo-sqlite`.
