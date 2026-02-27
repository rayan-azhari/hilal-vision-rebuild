# Deployment Checklist & Common Errors

A reference for avoiding build and deployment failures. Every item here was learned from a real incident.

---

## Pre-Push Checklist

Run these **before every `git push`**:

```bash
# 1. Full CI pipeline (lint + type-check + unit tests + build)
pnpm ci

# Or individually:
pnpm lint          # ESLint (must pass — no errors)
pnpm check         # TypeScript type check
pnpm test          # Unit tests (89 tests must pass)
pnpm vercel-build  # Vite build check

# 2. Verify pnpm lockfile is in sync (Vercel uses frozen-lockfile by default)
npx pnpm install --no-frozen-lockfile
```

> [!WARNING]
> **Before any public release or Play Store / App Store build, verify `TESTING_DISABLE_PRO_GATE = false` in `client/src/contexts/ProTierContext.tsx`.** When set to `true` (the current dev default), ALL users are treated as Pro/Premium and all paywalls are bypassed. This must be `false` for production monetization to work.

### Security Pre-Release Checklist (Round 40+)

The following must be confirmed before every store submission or major deployment:

- [ ] `TESTING_DISABLE_PRO_GATE = false` in `ProTierContext.tsx`
- [ ] `REVENUECAT_WEBHOOK_AUTH` is set in Vercel environment variables
- [ ] `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` are set (rate limiter fails closed without them)
- [ ] `OWNER_OPEN_ID` is set to the correct Clerk user ID (gates `notifyOwner`)
- [ ] Stripe webhook endpoint is active and `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
- [ ] No API keys or secrets appear in source code or committed `.env` files
- [ ] `pnpm lint` passes with zero errors
- [ ] `pnpm test` shows 89 tests passing

See `docs/SECURITY.md` for the full security reference.

> [!CAUTION]
> **NEVER use `npm install <pkg>` in this project.** It creates `package-lock.json` conflicts and desyncs `pnpm-lock.yaml`. Always use `npx pnpm add <pkg>` (or `npx pnpm add -D <pkg>` for devDependencies).

### Android Play Store — Additional Pre-Build Step

> [!IMPORTANT]
> **If this push is for a Play Store AAB build, you MUST increment the Android version code first.**
>
> Edit `android/app/build.gradle` before building:
> ```groovy
> versionCode 6    // ← always +1 from last upload (current: 5)
> versionName "1.0.5"  // ← bump patch version to match
> ```
>
> Google Play rejects any AAB whose `versionCode` was already used. There is no way to reuse a code — it must strictly increase with every upload. Forgetting this causes the "Version code X has already been used" error in Play Console.
>
> **Current version:** `versionCode 5` / `versionName "1.0.4"` (bumped Round 39)

---

## Known Error Patterns

### 1. Rollup "Failed to resolve import"

**Symptom:**
```
[vite]: Rollup failed to resolve import "some-package" from "client/src/..."
```

**Root Cause:** A package is imported in source code but not listed in `package.json` dependencies.

**Fix:**
```bash
npx pnpm add <missing-package>
```

**Prevention:** After importing any new library, immediately install it with `npx pnpm add`.

**Example (Round 34):** `exif-js` was imported in code but never installed → Rollup crash. (Note: `exif-js` has since been removed and replaced with `exifr` — see Error 6 for context.)

---

### 2. Vercel "pnpm-lock.yaml is not up to date"

**Symptom:**
```
ERR_PNPM_OUTDATED_LOCKFILE  Cannot install with "frozen-lockfile"
because pnpm-lock.yaml is not up to date with package.json
```

**Root Cause:** Dependencies were added/removed using `npm install` instead of `pnpm add`, so `package.json` changed but `pnpm-lock.yaml` was not updated.

**Fix:**
```bash
npx pnpm install --no-frozen-lockfile
git add pnpm-lock.yaml
git commit -m "fix: resync pnpm-lock.yaml"
git push
```

**Prevention:** Always use `npx pnpm add <pkg>` to install. If you accidentally used npm, run `npx pnpm install --no-frozen-lockfile` before pushing.

**Example (Round 34):** `exif-js` installed via `npm install --legacy-peer-deps` → lockfile desync → Vercel deploy failure. (Note: `exif-js` has since been replaced with `exifr`, installed correctly via `npx pnpm add exifr`.)

---

### 3. Duplicate Variable Declarations

**Symptom:**
```
Cannot redeclare block-scoped variable 'showVisibility'
```

**Root Cause:** Copy-paste error introducing two identical `useState` declarations in the same component.

**Fix:** Search for and remove the duplicate declaration.

**Prevention:** After editing component state, search the file for duplicate `const [varName` patterns.

**Example (Round 34):** `GlobePage.tsx` had `const [showVisibility, setShowVisibility] = useState(true)` twice.

---

### 4. Wrong Import Path for tRPC Internals

**Symptom:**
```
Cannot find module './trpc.js' or its corresponding type declarations
```

**Root Cause:** Server-side router files (e.g. `server/demApi.ts`) importing from `./trpc.js` instead of the actual path `./_core/trpc.js`.

**Fix:** Correct the import to match the actual file structure:
```typescript
// ❌ Wrong
import { publicProcedure, router } from "./trpc.js";

// ✅ Correct
import { publicProcedure, router } from "./_core/trpc.js";
```

**Prevention:** Always check `server/_core/` for framework plumbing imports (`trpc.js`, `context.js`, etc.).

---

### 5. tRPC Handler Returns Non-Batch JSON (superjson Parse Error / "Missing result")

**Symptom (Sentry):**
```
TRPCClientError: Unable to transform response from server
TRPCClientError: Unexpected token 'A', "A server e"... is not valid JSON
TRPCClientError: Missing result
```

**Root Cause:** Two related issues in `api/trpc/[trpc].ts`:

1. Catch block returned `{"error":{...}}` — a plain JSON object. tRPC v11 with `httpBatchLink` + `superjson` expects a **JSON array**: `[{"error":{"json":{...}}}]`. Plain object causes `superjson.deserialize()` to fail → "Unable to transform".
2. Catch block always returned a **single-element array**, even for multi-procedure batch requests (URL: `/api/trpc/proc1,proc2`). When a batch of N procedures fails, returning only 1 result means N−1 procedures find no entry → "Missing result".

**Fix:** The catch block must return one error entry **per procedure** in the batch:
```typescript
} catch (err: any) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    // path may be "proc1,proc2" for batched requests
    const procedures = path ? path.split(",") : [""];
    const errorEntry = (proc: string) => ({
        error: {
            json: {
                message: err?.message ?? "Internal server error",
                code: -32603,
                data: { code: "INTERNAL_SERVER_ERROR", httpStatus: 500, path: proc || null }
            }
        }
    });
    res.end(JSON.stringify(procedures.map(errorEntry)));
}
```

**Prevention:** Always return an array with one entry **per procedure** in the batch. Split `path` on commas to get the count. Never return a single-element array for a multi-procedure batch.

**Example (Round 36–38):** Initially no catch → plain text. Then catch returned non-batch JSON → "Unable to transform". Then catch returned single-element array → "Missing result" for extra procedures. Fixed in Round 39.

---

### 9. Vercel Cold-Start Crash from Module-Level Redis Initialization

**Symptom (Sentry):**
```
TRPCClientError: Unexpected token 'A', "A server e"... is not valid JSON
```
(Vercel returns its default plain-text 500 "A server error has occurred" — the serverless function failed before the handler ran.)

**Root Cause:** `server/appRouter.ts` created `@upstash/redis` Redis and `@upstash/ratelimit` Ratelimit instances at **module load time** (top-level `if` block). If Upstash was briefly unreachable during a Vercel cold start, the entire module failed to import, crashing the function before the tRPC handler or catch block could execute.

**Fix:** Defer initialization to a lazy getter function:
```typescript
let _ratelimit: Ratelimit | null = null;
let _ratelimitInitialized = false;

function getRateLimiter(): Ratelimit | null {
  if (_ratelimitInitialized) return _ratelimit;
  _ratelimitInitialized = true;
  try {
    _ratelimit = new Ratelimit({ redis: new Redis({...}), ... });
  } catch (err) {
    console.error("[RateLimiter] Init failed:", err);
    _ratelimit = null;
  }
  return _ratelimit;
}
```

**Prevention:** Never create network-dependent objects (Redis, DB connections, HTTP clients) at module top-level in serverless functions. Use lazy initialization with try-catch.

**Example (Round 38):** `server/appRouter.ts` — module-level `new Redis()` crashed on cold start → Vercel plain-text 500.

---

### 10. Service Worker Offline Fallback Breaks tRPC Client

**Symptom (Sentry — especially Safari):**
```
TRPCClientError: The string did not match the expected pattern.
```

**Root Cause:** `client/public/sw.js` `networkFirst()` returned `{"error":"offline"}` when offline — a plain JSON object, not a tRPC batch array. Safari reports this as "The string did not match the expected pattern" (its JSON structure mismatch error).

**Fix:** Return a valid tRPC batch error for API calls:
```javascript
const isApiCall = new URL(request.url).pathname.startsWith("/api/");
const body = isApiCall
    ? JSON.stringify([{ error: { json: { message: "You appear to be offline.", code: -32603, data: { code: "INTERNAL_SERVER_ERROR", httpStatus: 503, path: null } } } }])
    : '{"error":"offline"}';
```

Also bump `CACHE_NAME` version to propagate the updated SW to existing users.

**Prevention:** Any offline/error fallback response for `/api/` routes must match the tRPC batch format expected by the client.

**Example (Round 38):** `sw.js` — offline fallback broke Safari tRPC parsing.

---

### 11. 3D Globe Cloud Overlay Geographic Offset (~90° Longitude)

**Symptom:**
Cloud cover patterns on the 3D globe appear shifted ~90° in longitude compared to the 2D Leaflet map. Cloud gaps over Europe on 2D appear over the US on 3D.

**Root Cause:** `three-globe` internally applies `globeObj.rotation.y = -Math.PI / 2` to face the Prime Meridian along the Z-axis. The cloud mesh was added via `scene.add(cloudMesh)` (bypassing this rotation), while the visibility overlay used `globe.customLayerData().customThreeObject()` (which inherits the rotation).

**Fix:** Apply the same rotation to the cloud mesh:
```typescript
cloudMesh.rotation.y = -Math.PI / 2; // Match three-globe's internal globe rotation
scene.add(cloudMesh);
```

**Prevention:** Any Three.js mesh added directly to the globe scene must apply `rotation.y = -Math.PI / 2` to align with three-globe's internal coordinate system. Alternatively, use `globe.customLayerData().customThreeObject()` which handles this automatically.

**Example (Round 38):** `GlobePage.tsx` — cloud sphere was unrotated → 90° offset from earth texture.

---

### 12. Cloud Cover Vertical Mismatch (Equirectangular vs Mercator)

**Symptom:**
Cloud patterns align horizontally between 3D globe and 2D map, but are shifted vertically (features appear further north on 2D map).

**Root Cause:** The cloud texture was rendered in equirectangular projection (linear latitude spacing), which is correct for the 3D globe's sphere UV mapping but wrong for Leaflet's Web Mercator tiles. `L.imageOverlay` stretches the equirectangular image into Mercator pixel space, distorting latitude positions.

**Fix:** Added a `projection` parameter to `renderCloudTexture()` in `useCloudOverlay.ts`:
```typescript
if (projection === "mercator") {
    const mercatorY = Math.PI * (1 - 2 * py / H);
    lat = (2 * Math.atan(Math.exp(mercatorY)) - Math.PI / 2) * 180 / Math.PI;
} else {
    lat = 90 - (py / H) * 180; // equirectangular
}
```
GlobePage uses default `"equirectangular"`, MapPage passes `"mercator"`.

**Prevention:** When overlaying equirectangular textures on Mercator maps, always re-project to Mercator first. Sphere-based renderers (Three.js) use equirectangular natively.

**Example (Round 38):** `useCloudOverlay.ts` / `MapPage.tsx` — equirectangular texture on Mercator map → vertical distortion.

---

### 6. `exif-js` Crash on Android Chrome (`ReferenceError: n is not defined`)

**Symptom (Sentry):**
```
ReferenceError: n is not defined
  at V.onload (SightingReportForm.tsx — minified)
```

**Root Cause:** `exif-js` is an unmaintained legacy library (~2014) that creates a hidden `new Image()` element and sets an `.onload` callback. On Android Chrome 145+ with certain JPEG formats (especially from modern phones), this callback crashes with a `ReferenceError` on a minified internal variable. The crash propagates as an unhandled error and takes down the page.

**Fix:** Replace `exif-js` with `exifr`:
```bash
npx pnpm remove exif-js
npx pnpm add exifr
```
`exifr` is Promise-based, actively maintained, and handles GPS + timestamp extraction correctly on all platforms. It returns decimal-degree coordinates directly and `DateTimeOriginal` as a native `Date` object.

**Prevention:** Do not use `exif-js`. Use `exifr` for all EXIF parsing.

**Example (Round 36):** `SightingReportForm.tsx` — user uploaded a phone photo → Android Chrome crash → Sentry report.

---

### 8. Globe Cloud Overlay Renders as Chrome Ball (`MeshPhongMaterial`)

**Symptom:**
Cloud cover layer on the 3D globe looks like a shiny metallic sphere — bright specular highlights on one side, dark shadows on the other, obscuring the earth underneath.

**Root Cause:** `MeshPhongMaterial` is a physically lit material. The scene's directional light (simulating the sun) bounces off the pure-white cloud texture, creating Phong specular highlights. The result is a chrome-ball appearance instead of transparent white clouds.

**Fix:** Switch to `MeshBasicMaterial` with `depthWrite: false`:
```typescript
// ❌ Wrong — physically lit, creates chrome-ball effect
new THREE.MeshPhongMaterial({ map: texture, transparent: true, opacity: 0.9, side: THREE.DoubleSide })

// ✅ Correct — unlit overlay, texture alpha controls transparency
new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 1, depthWrite: false })
```

**Prevention:** For any transparent overlay mesh added to the globe scene (visibility, clouds, etc.) always use `MeshBasicMaterial`. `MeshPhongMaterial` / `MeshStandardMaterial` are for physical objects that should respond to scene lighting.

**Example (Round 37):** `GlobePage.tsx` clouds-layer mesh — `MeshPhongMaterial` → chrome sphere. Fixed by switching to `MeshBasicMaterial + depthWrite: false`.

---

### 13. Android Native "You appear to be offline" (CORS + credentials violation)

**Symptom (Sentry — Android Capacitor app only):**
```
TRPCClientError: You appear to be offline. Please check your connection.
  browser = Chrome Mobile WebView
  url = https://localhost/...
```

**Root Cause:** In the Capacitor Android WebView the page origin is `https://localhost`. When the tRPC client makes cross-origin requests to `https://moon-dashboard-one.vercel.app/api/trpc`, it sends `credentials: "include"`. The server responds with `Access-Control-Allow-Origin: *`. The CORS spec **forbids** wildcard origins with credentialed requests — the browser blocks every request before it leaves the device, producing a `TypeError: Failed to fetch` which tRPC converts to "You appear to be offline."

**Fix:** Use `credentials: "omit"` when running on a native Capacitor platform. Native apps use Clerk token/header auth, not browser session cookies, so omitting credentials loses nothing:
```typescript
// client/src/main.tsx
credentials: Capacitor.isNativePlatform() ? "omit" : "include",
```

**Prevention:** Any cross-origin fetch from a Capacitor WebView (`https://localhost` origin) that targets `Allow-Origin: *` must NOT set `credentials: "include"`. If per-user auth is needed on native, pass the Clerk JWT as an `Authorization` header instead of relying on cookies.

> **Note:** After this fix, a new Android AAB build and Play Store upload is required because `main.tsx` is bundled inside the APK — it is not fetched at runtime from the server.

**Example (Round 39):** Samsung Galaxy S25 (Android 16, Chrome WebView 145) + older device (Chrome WebView 90) — all tRPC calls silently blocked by CORS on launch.

---

### 14. iOS Version Out of Sync with Android

**Symptom:**
App Store Connect rejects the archive or users see `v1.0` on iOS while the Android Play Store shows `v1.0.4`. Inconsistent version display across platforms.

**Root Cause:** The iOS `MARKETING_VERSION` and `CURRENT_PROJECT_VERSION` in `ios/App/App.xcodeproj/project.pbxproj` are not automatically updated when the Android `versionCode`/`versionName` in `android/app/build.gradle` is bumped. They must be updated manually in Xcode.

**Fix:** Before every iOS App Store build, open Xcode (`npx cap open ios`), select the App target, go to **General** → **Identity**, and update:
- **Version** (MARKETING_VERSION) — set to match Android `versionName` (e.g. `1.0.4`)
- **Build** (CURRENT_PROJECT_VERSION) — set to match Android `versionCode` (e.g. `5`)

**Current state:** iOS shows `1.0` / build `1`; Android is `1.0.4` / versionCode `5`. These need to be aligned before the next iOS App Store submission.

**Prevention:** Add "Sync iOS version in Xcode" as a step in your iOS release checklist alongside the Android build step.

---

### 7. PowerShell `&&` Chaining

**Symptom:**
```
The token '&&' is not a valid statement separator in this version.
```

**Root Cause:** PowerShell (Windows) doesn't support `&&` for command chaining like Bash.

**Fix:** Run commands one at a time, or use `cmd /c "cmd1 && cmd2"`.

---

## Package Manager Rules

| Action | Command | Notes |
|--------|---------|-------|
| Add dependency | `npx pnpm add <pkg>` | Updates both `package.json` AND `pnpm-lock.yaml` |
| Add dev dependency | `npx pnpm add -D <pkg>` | Same as above, into `devDependencies` |
| Remove dependency | `npx pnpm remove <pkg>` | Cleans both files |
| Sync lockfile | `npx pnpm install --no-frozen-lockfile` | Use after accidental npm usage |
| **Never do this** | ~~`npm install <pkg>`~~ | Desyncs lockfile, breaks Vercel |

---

## Vercel-Specific Notes

- Vercel auto-detects `pnpm-lock.yaml` and runs `pnpm install` with `--frozen-lockfile`
- The build command is `npx vite build` (configured in `vercel.json`)
- Output directory is `dist/public`
- API routes live in `api/trpc/[trpc].ts` (serverless function)
- ICOP data is served statically from `client/public/` to avoid serverless size limits
- Environment variables needed: `DATABASE_URL` (optional), `CLERK_*`, `UPSTASH_*`, `STRIPE_*`, `REVENUECAT_WEBHOOK_AUTH`

### Stripe Production Config (Live Mode)

| Variable | Description |
|---|---|
| `STRIPE_SECRET_KEY` | Live Stripe secret key — set in Vercel env vars only, **never in `.env` or committed to git** |
| `STRIPE_WEBHOOK_SECRET` | Live webhook signing secret — from Stripe Dashboard → Webhooks |
| `STRIPE_PRICE_MONTHLY` | Live Price ID for monthly plan |
| `STRIPE_PRICE_ANNUAL` | Live Price ID for annual plan |
| `STRIPE_PRICE_LIFETIME` | Live Price ID for lifetime plan |

Webhook endpoint: `https://moon-dashboard-one.vercel.app/api/stripe/webhook`

> **Switching to test mode:** Replace all `STRIPE_*` vars in Vercel with `sk_test_...` equivalents and redeploy.

---

*Last updated: February 27, 2026 (Round 40)*
