---
description: Pre-push deployment checklist to prevent Vercel build failures
---

# Pre-Push Deployment Checklist

// turbo-all

Before pushing to GitHub (which triggers Vercel deployment), run these steps:

1. Run the production build to catch TypeScript/Rollup errors:
```bash
npm run build
```

2. If you installed any new packages during this session, resync the pnpm lockfile:
```bash
npx pnpm install --no-frozen-lockfile
```

3. Stage all changes including the lockfile:
```bash
git add -A
```

4. Commit with a descriptive message:
```bash
git commit -m "your commit message"
```

5. Push to GitHub:
```bash
git push
```

## Key Rules
- **NEVER** use `npm install <pkg>`. Always use `npx pnpm add <pkg>`.
- Always run `npm run build` before pushing.
- If the build fails with "Failed to resolve import", install the missing package with `npx pnpm add <pkg>`.
- See `docs/DEPLOYMENT_CHECKLIST.md` for the full error reference.
