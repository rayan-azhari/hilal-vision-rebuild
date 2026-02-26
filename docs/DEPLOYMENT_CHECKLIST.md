# Deployment Checklist & Common Errors

A reference for avoiding build and deployment failures. Every item here was learned from a real incident.

---

## Pre-Push Checklist

Run these **before every `git push`**:

```bash
# 1. Build check (catches TypeScript errors, missing imports, Rollup failures)
npm run build

# 2. Verify pnpm lockfile is in sync (Vercel uses frozen-lockfile by default)
npx pnpm install --no-frozen-lockfile
```

> [!CAUTION]
> **NEVER use `npm install <pkg>` in this project.** It creates `package-lock.json` conflicts and desyncs `pnpm-lock.yaml`. Always use `npx pnpm add <pkg>` (or `npx pnpm add -D <pkg>` for devDependencies).

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

### 5. tRPC Handler Returns Plain Text (JSON Parse Error)

**Symptom (Sentry):**
```
TRPCClientError: Unexpected token 'A', "A server e"... is not valid JSON
```

**Root Cause:** `api/trpc/[trpc].ts` had no `try/catch` around `nodeHTTPRequestHandler`. When the handler threw an unhandled exception, Vercel returned the plain-text string `"A server error occurred"` instead of JSON, breaking the tRPC client's parser.

**Fix:** Wrap `nodeHTTPRequestHandler` in a try/catch that responds with a JSON error body:
```typescript
try {
    return await nodeHTTPRequestHandler({ ... });
} catch (err: any) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: { message: err?.message ?? "Internal server error", code: "INTERNAL_SERVER_ERROR" } }));
}
```

**Prevention:** Always ensure the tRPC serverless handler has an outer try/catch. Vercel's default fallback is not JSON-compatible.

**Example (Round 36):** `api/trpc/[trpc].ts` — missing error handler → Sentry crash on `/visibility` route.

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
- Environment variables needed: `DATABASE_URL` (optional), `CLERK_*`, `UPSTASH_*`, `STRIPE_*`

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

*Last updated: February 26, 2026 (Round 37)*
