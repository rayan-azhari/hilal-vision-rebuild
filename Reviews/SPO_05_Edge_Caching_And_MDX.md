# SPO 05: Edge Caching & MDX

## Objective
Implement edge-computed visibility grids to reduce computation times, and migrate static content components to MDX format.

## Context
Currently, astronomical calculations (V-value, q-value) execute on the client-side for "today's" maps globally, wasting resources. We will compute this server-side via cron and serve from Vercel KV. Additionally, massive 33KB React Components for static text will become MDX files.

## Instructions
1. **Vercel KV Edge Caching**:
   - Create a cron route `apps/web/app/api/cron/visibility/route.ts`.
   - Once an hour, execute `@hilal/astronomy.generateVisibilityGrid()` for today and tomorrow globally at 4° resolution.
   - Store the compressed payload in Vercel KV (Redis) under keys like `vis:YYYY-MM-DD`.
2. **Edge Function Delivery**:
   - Create `apps/web/app/api/visibility/route.ts` using the `edge` runtime.
   - Fetch the grid from KV and return it (cache hit < 50ms). Web clients load this *before* firing up local Web Workers.
3. **MDX Content Migration**:
   - Create `apps/web/content/` holding `.mdx` files for: `about.mdx`, `methodology.mdx`, `privacy.mdx`, `terms.mdx`, `support.mdx`.
   - Setup `next/mdx` or `contentlayer` to compile these into `apps/web/app/(marketing)/[slug]/page.tsx`.

## Success Criteria
- The `/api/visibility` route returns HTTP 200 with the KV JSON payload in < 150ms.
- 33KB legacy `AboutPage.tsx` and `MethodologyPage.tsx` components are fully deleted and served via SSR MDX.
- Web Application footprint shrinks significantly.
