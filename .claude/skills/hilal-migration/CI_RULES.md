# Hilal Vision — Permanent CI Rules

These 5 rules were established after repeated CI failures. Check all of them before completing any migration task. Source: `plan_audit_report.md` (commit `a7cd074`).

---

## Rule 1: Every Package with `"lint"` Script MUST Have `eslint.config.mjs`

**When to check:** Any time you add a new package under `packages/` OR add a `"lint": "eslint ."` script to an existing package's `package.json`.

**What the violation looks like:** CI fails with `ELIFECYCLE` error when running `pnpm turbo run lint`. ESLint 9+ requires a flat config file — it no longer accepts `.eslintrc.*` or implicit config inheritance.

**Fix pattern:** Create `eslint.config.mjs` in the package root:

```js
// packages/<name>/eslint.config.mjs
import js from "@eslint/js";
export default [js.configs.recommended, { rules: { "no-unused-vars": "warn" } }];
```

And add to the package's `devDependencies`:

```json
{
  "@eslint/js": "^9.0.0",
  "eslint": "^9.0.0"
}
```

**Already fixed in:** `@hilal/ui`, `@hilal/db`, `@hilal/astronomy`, `@hilal/types` (commit `5cd39a8`).

---

## Rule 2: All Turbo Tasks Run in CI Must Be Declared in `turbo.json`

**When to check:** Any time you introduce a new `pnpm turbo run <task>` call in CI (`.github/workflows/ci.yml`) OR add a new `"scripts"` entry to any workspace `package.json` that will be run by Turbo.

**What the violation looks like:** `turbo run typecheck` fails silently or the task is skipped — packages run their scripts independently without Turbo's dependency graph, causing out-of-order execution.

**Fix pattern:** Add to `turbo.json` at the repo root:

```json
{
  "tasks": {
    "typecheck": {
      "dependsOn": ["^typecheck"],
      "inputs": ["src/**/*.ts", "src/**/*.tsx", "tsconfig.json"],
      "outputs": [],
      "cache": true
    }
  }
}
```

Key fields:
- `dependsOn: ["^typecheck"]` — run upstream packages first (e.g., `@hilal/astronomy` before `apps/web`)
- `inputs` — what file changes invalidate the cache
- `outputs` — artifacts produced (empty for typecheck/lint)
- `cache: true` — safe to cache for CI speed

---

## Rule 3: SSR-Unsafe Components MUST Use `"use client"` + `dynamic({ssr: false})`

**When to check:** Any time you create or modify a component that uses: `globe.gl`, `maplibre-gl`, `three` (Three.js), `leaflet`, `canvas`, `window`, `document`, `navigator`, `localStorage`, `sessionStorage`, or any Zustand hook.

**What the violation looks like:** Build fails with `ReferenceError: window is not defined` or `ReferenceError: document is not defined` at SSR time. Or: hydration mismatch warnings in the browser console.

**The two-step fix pattern:**

Step 1 — Create `FooClient.tsx` with the actual implementation:
```tsx
// apps/web/src/components/FooClient.tsx
"use client";

import { useEffect, useRef } from "react";

export default function FooClient() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // globe.gl / MapLibre / canvas initialization goes here
    // Safe because useEffect only runs in the browser
  }, []);

  return <div ref={ref} className="w-full h-full" />;
}
```

Step 2 — Create `Foo.tsx` as a wrapper that uses `next/dynamic`:
```tsx
// apps/web/src/components/Foo.tsx
import dynamic from "next/dynamic";

const FooClient = dynamic(() => import("./FooClient"), {
  ssr: false,
  loading: () => <div className="w-full h-full animate-pulse bg-white/5" />,
});

export default function Foo() {
  return <FooClient />;
}
```

**Components already using this pattern (don't add dynamic wrapper again):**
- `MoonGlobe.tsx` + `MoonGlobeClient.tsx`
- `VisibilityMap.tsx` (uses `"use client"` directly with Maplibre)

**Zustand hooks note:** Any component that calls `useAppStore()` needs `"use client"` at the top. It does NOT need `dynamic({ssr:false})` unless it also uses browser-only APIs.

---

## Rule 4: Astronomical SVG Paths Need `suppressHydrationWarning`

**When to check:** Any SVG element whose `d` attribute, `cx`, `cy`, `r`, or transform values are computed from `astronomy-engine` calculations.

**Why it happens:** `astronomy-engine` computes slightly different floating-point values between the Node.js SSR pass and the browser due to environment differences. React sees a mismatch between server-rendered and client-rendered SVG `d` attributes and throws hydration warnings.

**Fix:**

```tsx
<svg
  viewBox="0 0 200 200"
  suppressHydrationWarning  // ← add this
>
  <path d={computedAstronomicalPath} suppressHydrationWarning />
</svg>
```

**Already handled in these components (do not add again):**
- Visibility worker + d3 contours
- Cloud overlay hook
- BestTimeCard
- Horizon page canvas (full 413-line canvas, not SVG — no suppression needed, canvas avoids this entirely)

**When NOT to use:** Don't scatter `suppressHydrationWarning` everywhere as a fix for non-astronomy mismatches. It should only appear on SVG elements that genuinely receive astronomy-engine float values.

---

## Rule 5: No Explicit `any` Types

**When to check:** After every migration task, grep modified files for `: any` and `as any`.

```bash
grep -n ": any\|as any" apps/web/src/path/to/file.tsx
```

**What the violation looks like:** TypeScript CI fails with `Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)`.

**Fix patterns:**

**Pattern A — Caught errors:**
```typescript
// ❌ Wrong
catch (error: any) {
  console.error(error.message);
}

// ✅ Correct
catch (error: unknown) {
  const msg = error instanceof Error ? error.message : String(error);
  console.error(msg);
}
```

**Pattern B — External library typing gaps:**
```typescript
// ❌ Wrong
const globe = globeRef.current as any;
globe.pointsData(data);

// ✅ Correct — use @ts-expect-error with explanation
// @ts-expect-error: globe.gl types don't expose pointsData in v2.45 public API
globeRef.current.pointsData(data);
```

**Pattern C — Type assertions through unknown:**
```typescript
// ❌ Wrong
const data = response as any as MyType;

// ✅ Correct
const data = response as unknown as MyType;
// (use sparingly — prefer proper typing when possible)
```

**Pattern D — Generic functions:**
```typescript
// ❌ Wrong
function processData(data: any) { ... }

// ✅ Correct
function processData<T>(data: T) { ... }
// or
function processData(data: unknown) { ... }
```

---

## Pre-Commit Checklist

Before finishing any migration task, run through these in order:

```
[ ] 1. npx pnpm turbo run typecheck     → Zero new TypeScript errors
[ ] 2. npx pnpm turbo run lint          → Zero ESLint errors
[ ] 3. grep ": any\|as any" <files>    → No explicit any (or justified @ts-expect-error)
[ ] 4. SSR check: browser APIs?        → "use client" + dynamic({ssr:false}) if needed
[ ] 5. New turbo task?                 → Declared in turbo.json
[ ] 6. New package with lint script?   → eslint.config.mjs created
[ ] 7. Astronomy SVG paths?            → suppressHydrationWarning on <svg>
```
