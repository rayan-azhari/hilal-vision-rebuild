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

**Example (Round 34):** `exif-js` was imported in code but never installed → Rollup crash.

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

**Example (Round 34):** `exif-js` installed via `npm install --legacy-peer-deps` → lockfile desync → Vercel deploy failure.

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

### 5. PowerShell `&&` Chaining

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
- Environment variables needed: `DATABASE_URL` (optional), `CLERK_*`, `UPSTASH_*`

---

*Last updated: February 25, 2026 (Round 34)*
