---
name: hilal-migration
description: >
  Use this skill for any task involving the Hilal Vision migration from the legacy
  Vite/Express app (_legacy/) to the new Next.js 15 Turborepo monorepo (apps/web/,
  packages/). Triggers for audit mode: "what's left to migrate", "assess current state",
  "gap report", "what are the gaps", "migration status", "audit the migration",
  "what hasn't been ported", "what needs doing next", "what's missing from the new app".
  Triggers for migration mode: "migrate X", "port Y component", "implement Z from legacy",
  "add feature from old app", "bring over the [page/hook/router/worker]",
  "complete the GlobePage", "finish the ArchivePage", "port the useAtmosphericData hook".
  Also triggers when asked to implement any feature or page that exists in _legacy/ but
  appears incomplete or missing in apps/web/.
---

# Hilal Vision Migration Orchestration Skill

You are helping migrate the Hilal Vision Islamic moon sighting dashboard from a legacy
Vite/React/MySQL/Capacitor architecture to a Next.js 15 Turborepo monorepo.

**Reference files in this skill directory:**
- `GAP_REGISTRY.md` — Authoritative list of all known migration gaps with status
- `MIGRATION_PATTERNS.md` — How-to for each category (page, hook, worker, router, MDX, API)
- `CI_RULES.md` — 5 permanent CI rules that must pass after every task
- `DOMAIN_KNOWLEDGE.md` — Astronomy invariants, Pro gating, DB rules, CORS, Stripe, i18n
- `SUBAGENT_PLAYBOOK.md` — When/how to use parallel subagents

---

## Section 1: Mode Detection

Classify the incoming request before doing anything else:

**Audit Mode** — user wants to know what is missing/remaining:
- Keywords: "what's left", "what are the gaps", "assess", "audit", "migration status",
  "what hasn't been ported", "what needs doing", "what's missing", "current state",
  "checklist", "overview of remaining work"
- → Follow the Audit Mode Protocol (Section 3)

**Migration Mode** — user wants to execute a specific migration task:
- Keywords: "migrate", "port", "implement from legacy", "bring over", "add the [X] from old app",
  "complete the [page]", "finish porting", naming a specific `_legacy/` path
- → Follow the Migration Mode Protocol (Section 4)

**Ambiguous** — user names a specific feature/page without a clear verb ("what about the GlobePage?"):
- Default to Audit Mode: describe the gap for that specific item (check `GAP_REGISTRY.md`)
- Then ask: "Would you like me to proceed with migrating it?"

**Both** — "audit and then migrate X":
- Run Audit Mode for X first, then proceed directly to Migration Mode for X

---

## Section 2: Project Orientation

**Repo root:** `c:\Users\rayan\Desktop\Antigravity workspaces\Moon-dashboard`

**Key paths:**
```
_legacy/                               ← Legacy Vite/React app (read-only reference)
  client/src/pages/                    ← Legacy pages (source for migration)
  client/src/components/              ← Legacy components
  client/src/hooks/                   ← Legacy hooks
  client/src/workers/                 ← Legacy Web Workers
  server/routers/                     ← Legacy tRPC routers
  shared/astronomy.ts                 ← Legacy astronomy math (do NOT import — use @hilal/astronomy)

apps/web/src/                         ← New Next.js 15 app
  app/                                ← App Router pages
  components/                         ← New components
  hooks/                              ← New hooks
  workers/                            ← New Web Workers
  server/routers/                     ← New tRPC routers
  store/useAppStore.ts                ← Zustand global store (replaces all Contexts)

packages/astronomy/src/               ← @hilal/astronomy — single source of truth for math
packages/db/src/                      ← @hilal/db — Drizzle ORM + Neon PostgreSQL
packages/types/src/                   ← @hilal/types — shared Zod schemas
packages/ui/src/                      ← @hilal/ui — design tokens
```

**The most important rule:** `@hilal/astronomy` is the sole source of truth for all astronomical calculations. Never duplicate math. Never import from `_legacy/shared/astronomy.ts`. Always `import { ... } from "@hilal/astronomy"`.

**Tech migration summary:**
- Wouter routing → Next.js App Router (file-system based)
- React Context providers → Zustand `useAppStore()` selectors
- MySQL + Drizzle → Neon PostgreSQL + Drizzle (same Drizzle API, different schema)
- Leaflet → MapLibre GL JS
- Vite → Next.js 15 + Turbopack
- Express + tRPC → Next.js Route Handlers + tRPC

---

## Section 3: Audit Mode Protocol

**Goal:** Produce an accurate, prioritized gap report.

**Steps:**
1. Read `GAP_REGISTRY.md` first — this is the canonical list of known gaps
2. Optionally scan to verify/update accuracy:
   - `_legacy/client/src/pages/` vs `apps/web/src/app/` → page gaps
   - `_legacy/client/src/hooks/` vs `apps/web/src/hooks/` → hook gaps
   - `_legacy/server/routers/` vs `apps/web/src/server/routers/` → router gaps
   - `_legacy/client/src/workers/` vs `apps/web/src/workers/` → worker gaps
3. If the user asked about a specific item, look it up in `GAP_REGISTRY.md` and give a focused assessment
4. If the user asked for the full picture, produce a prioritized table:

```
| Priority | ID   | Domain     | Gap Description              | Status |
|----------|------|------------|------------------------------|--------|
| High     | G-01 | Pages      | GlobePage dedicated route    | Open   |
| High     | G-02 | Data       | icop-history.json            | Open   |
...
```

5. After the table, summarize: "The highest-priority items blocking production parity are X, Y, Z. The mobile app (G-04) is a separate 2–3 week effort. Want to start on any of these?"

---

## Section 4: Migration Mode Protocol

**Goal:** Execute a specific migration task correctly.

**Steps (always in this order):**

1. **Read the legacy source** — Read the specific legacy file(s) before writing any new code. Understand the full implementation.

2. **Read `MIGRATION_PATTERNS.md`** — Find the pattern for this category (page, hook, worker, router, MDX, API route, DB persistence) and follow it.

3. **Check `DOMAIN_KNOWLEDGE.md`** — Before writing, scan the relevant section:
   - Astronomy math → Section 1 (imports, globe rotation, worker shape)
   - Pro gating → Section 2 (ProGate usage, isPremium formula)
   - Database → Section 3 (Neon driver, PostGIS syntax, jitter)
   - Stripe → Section 4 (runtime, live mode caution)
   - CORS/Android → Section 5 (Capacitor WebView)
   - i18n/pnpm → Section 6

4. **Determine task size** — Estimate lines of new code across files:
   - < 150 lines, 1–2 files → single agent, proceed directly
   - > 150 lines, 2+ independent domains → read `SUBAGENT_PLAYBOOK.md` and spawn parallel agents

5. **Execute the migration** — Write the new code. For a page: read legacy → write new `app/foo/page.tsx` → wire state → port Pro gating → wire i18n.

6. **Run quality gates** (Section 6) — Verify all 9 checkpoints.

7. **Update `GAP_REGISTRY.md`** — Change the status of the completed item from `Open` → `Complete`.

---

## Section 5: Subagent Decision

**Use parallel subagents** when task involves 2+ independently-scoped domains AND total estimated change > ~150 lines.

**Use single-agent** for hooks, single components, single routers, or any task under ~150 lines.

For full pattern details, read `SUBAGENT_PLAYBOOK.md`. It contains:
- Pattern A: Full Page (Large) — page + hooks + router split
- Pattern B: Feature Cluster (Medium) — backend + frontend split
- Pattern C: Single File (Small) — no subagents

Key coordination rule: **define interface contracts before spawning** (worker message shape, tRPC return types, store selectors used).

---

## Section 6: Quality Gates

Run through this checklist after every migration task. Do not skip.

```
[ ] 1. TypeScript: npx pnpm turbo run typecheck — zero new errors
[ ] 2. Lint: npx pnpm turbo run lint — zero new ESLint errors
[ ] 3. No explicit `any`: grep ": any\|as any" in modified files
[ ] 4. SSR safety: any browser API/globe.gl/MapLibre → "use client" + dynamic({ssr:false})
[ ] 5. turbo.json: any new Turbo task declared with dependsOn/inputs/outputs
[ ] 6. New package with lint script: eslint.config.mjs created
[ ] 7. Astronomy imports: no @/lib/astronomy or _legacy imports — only @hilal/astronomy
[ ] 8. Pro gating: if legacy had ProGate/isPremium, new code must too
[ ] 9. i18n: if legacy used useTranslation(), new code must wire it up
[10] GAP_REGISTRY.md updated to mark completed item(s) as Complete
```

For the full CI rules with code examples, read `CI_RULES.md`.

---

## Section 7: High-Priority Migration Queue

Quick reference for the most important open gaps (always verify against `GAP_REGISTRY.md`):

| Priority | ID | Task | Pattern | Size |
|----------|-----|------|---------|------|
| 1 | G-10 | `about.mdx` content page | MDX (Pattern 6) | Small |
| 2 | G-11 | `methodology.mdx` content page | MDX (Pattern 6) | Small |
| 3 | G-09 | DB insertions in `/api/sightings` | DB Persistence (Pattern 8) | Medium |
| 4 | G-12 | `SightingFeed.tsx` full implementation | Component (Pattern 5) | Medium |
| 5 | G-05 | `useAtmosphericData` hook | Hook (Pattern 2) | Small |
| 6 | G-01 | GlobePage (`/globe` route) | Page (Pattern 1) + Subagents A | Large |
| 7 | G-14 | MapControlsPanel + sidebar in VisibilityPage | Component (Pattern 5) | Medium |
| 8 | G-13 | Observation pins on VisibilityMap | Feature Cluster (Subagents B) | Medium |
| 9 | G-07 | FCM push send route | API Route (Pattern 7) | Medium |
| 10 | G-04 | Mobile app (Expo) | Separate 2–3 week effort | Large |
