# Hilal Vision — Subagent Orchestration Playbook

When and how to split migration work across parallel subagents. Using subagents saves time on large tasks but adds coordination overhead — use them only when the work is genuinely parallelizable.

---

## The Decision Rule

**Use parallel subagents when ALL of these are true:**
1. The task touches 2 or more independently-scoped domains (different files, no shared mutable state during migration)
2. Total estimated change is > ~150 lines across those files
3. The domains don't have a strict dependency ordering (i.e., A doesn't need to read B's output to write its code)

**Use a single sequential agent when ANY of these is true:**
- The task is a single hook, component, or router (~150 lines or less)
- Changes must happen in a specific order (e.g., add DB schema → write router → update client hook)
- The task requires reading the output of one step to inform the next

---

## Pattern A: Full Page Migration (Large — 200+ lines)

**When to use:** Porting a complete page from legacy that has no new counterpart: GlobePage, full VisibilityPage with controls, etc.

**Why parallel works:** A page has clearly separable layers — the UI shell, the data hooks, the backend procedures — and each layer lives in different files.

**How to split:**

**Before spawning:** Define the shared interface contracts explicitly. State these in each subagent's prompt so they don't make incompatible assumptions.

```
Interface contracts to agree on before spawning:
- Worker message shape: { qValues: Float32Array, width: number, height: number }
- tRPC procedure: api.dem.getElevation.useQuery({ lat, lng }) → { elevation: number }
- Store selectors: location, date, visibilityCriterion, isDarkMode from useAppStore
```

**Agent A — Page Component + UI:**
```
Task: Create apps/web/src/app/globe/page.tsx (and GlobeClient.tsx)
Source: _legacy/client/src/pages/GlobePage.tsx
Scope: Page structure, layout, Zustand state wiring, ProGate integration,
       UI controls panel, static rendering, "use client" directives.
Interface contracts: [paste the agreed interfaces]
Do NOT write: new tRPC procedures, new hooks (use existing useVisibilityWorker,
              useCloudOverlay, useGeolocation)
```

**Agent B — Hooks/Worker Layer:**
```
Task: Port useAtmosphericData hook to apps/web/src/hooks/useAtmosphericData.ts
      Port archiveMiniMap worker to apps/web/src/workers/archiveMiniMap.worker.ts
Source: _legacy/client/src/hooks/useAtmosphericData.ts
        _legacy/client/src/workers/archiveMiniMap.worker.ts
Scope: Hook implementation, worker implementation, TypeScript types.
Interface contracts: [paste the agreed interfaces]
Do NOT write: page components, tRPC routers
```

**Agent C — Backend Router Additions:**
```
Task: Add dem router to apps/web/src/server/routers/dem.ts
      Register in apps/web/src/server/routers/_app.ts
Source: _legacy/server/appRouter.ts (dem section)
Scope: tRPC procedure, Zod validation, Open-Meteo API call.
Interface contracts: [paste the agreed interfaces]
Do NOT write: frontend components or hooks
```

**Merge Protocol (orchestrator after all agents complete):**
1. Verify no conflicting imports (two agents didn't both define the same type)
2. Verify interface contracts were respected (hook input/output matches what page component expects)
3. Check CI Rules 1–5 compliance across all output files
4. Update `GAP_REGISTRY.md` to mark completed items

---

## Pattern B: Feature Cluster Migration (Medium — 2–3 files, 100–300 lines total)

**When to use:** A cohesive feature that spans a backend query and a frontend display, but isn't a full page.

**Example: Observation Pins on VisibilityMap (G-13 + G-18)**

**Before spawning:** Agree on the tRPC query return type:
```typescript
// telemetry.getRecentObservations returns:
type ObservationPin = {
  lat: number;
  lng: number;
  visualSuccess: "naked_eye" | "optical_aid" | "not_seen";
  observationTime: string; // ISO string
};
```

**Agent A — Backend:**
```
Task: Add getRecentObservations query to apps/web/src/server/routers/telemetry.ts
Scope: tRPC publicProcedure, Zod validation (optional limit param),
       Drizzle query from observation_reports table (PostGIS ST_X, ST_Y to extract lat/lng),
       return type: ObservationPin[]
Return type contract: { lat: number, lng: number, visualSuccess: string, observationTime: string }[]
```

**Agent B — Frontend:**
```
Task: Add observation pins layer to apps/web/src/components/VisibilityMap.tsx
Scope: Call api.telemetry.getRecentObservations.useQuery(),
       render as MapLibre GeoJSON Source + Layer (circle markers, color by visualSuccess),
       click handler showing sighting details popup
Return type expected from backend: [paste the contract above]
```

**Merge Protocol:**
- Check the return type from Agent A matches what Agent B's component expects
- Verify no `any` types in either output
- Test that the map renders without crashing (observation array could be empty)

---

## Pattern C: Single-File Migration (Small — 1–2 files, <150 lines)

**When to use:** A single hook, component, or router that can be handled by one agent sequentially.

**Examples:**
- Port `useAtmosphericData` hook alone (G-05)
- Add `dem` tRPC router alone (G-15)
- Implement `SightingFeed.tsx` (G-12)
- Write `about.mdx` content page (G-10)

**No subagents.** Just execute the task with `MIGRATION_PATTERNS.md` as the guide, run quality gates, update `GAP_REGISTRY.md`.

---

## Template: Subagent Prompt Structure

When spawning a subagent for migration work, always include:

```
You are migrating a feature of the Hilal Vision Islamic moon dashboard from a legacy
Vite/React app to a Next.js 15 Turborepo monorepo.

REPO ROOT: c:\Users\rayan\Desktop\Antigravity workspaces\Moon-dashboard
LEGACY SOURCE: _legacy/
NEW TARGET: apps/web/src/

TASK: [specific task description]
LEGACY FILE(S) TO READ: [list specific files]
NEW FILE(S) TO CREATE/MODIFY: [list specific files]
SCOPE: [what to write]
OUT OF SCOPE: [what NOT to write — important to prevent agents overlapping]

INTERFACE CONTRACTS: [agreed types/shapes that other agents depend on]

CRITICAL RULES (read before writing any code):
1. @hilal/astronomy is the ONLY place for astronomy math — import from there, never duplicate
2. Replace all Context hooks with useAppStore() selectors from @/store/useAppStore
3. Add "use client" to any file that uses Zustand, browser APIs, canvas, or event handlers
4. No explicit `any` types — use `unknown` in catch blocks
5. tRPC import: from "../trpc" (no .js extension)
6. DB import: from "@hilal/db"
7. Always npx pnpm add (never npm install)

WHEN DONE:
- Run conceptual CI checks (would typecheck pass? would lint pass?)
- Confirm no SSR-unsafe code without proper "use client" + dynamic wrapper
- Report what you created and what CI rules you verified
```

---

## Coordination Tips

**State the contracts, don't assume.** The biggest risk with parallel agents is that Agent A and Agent B make incompatible assumptions about the shape of data flowing between them. Before spawning, explicitly define:
- What the tRPC procedure returns
- What the worker posts back
- What store selectors the page reads

**Give each agent a clear boundary.** The `OUT OF SCOPE` field matters — without it, agents overlap and produce conflicting implementations of the same thing.

**The orchestrator is responsible for merge.** After agents report back, the orchestrator (you) must verify:
- No import path conflicts
- No type naming conflicts (two agents both defining `ObservationData` differently)
- CI rules compliance in all produced files
- `GAP_REGISTRY.md` updated

**When in doubt, go sequential.** If you're not sure the work is parallelizable, don't force it. A single well-focused agent is often faster than three parallel agents with a complex merge.
