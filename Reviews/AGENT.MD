# Hilal Vision Rebuild Orchestration (AGENT.MD)

This document serves as the master orchestration guide for the AI Agent tasked with executing the **Hilal Vision Rebuild** from scratch. The rebuild follows the unified architecture plan (`Reviews/implementation_plan.md`).

## Agent Orchestration Strategy

Due to the size and complexity of this migration, the work is divided into **7 Single Purpose Objectives (SPOs)**. The orchestrating agent must execute these SPOs sequentially. Do not move to the next SPO until all verification steps of the current SPO pass.

### Workflow for the AI Agent
1. Read the `Reviews/implementation_plan.md` to understand the full context.
2. For each SPO listed below, read the corresponding `Reviews/SPO_*.md` file.
3. Follow the instructions in the SPO exactly.
4. Run the required validation tools/tests to verify the SPO is complete.
5. Create a git commit at the end of each successful SPO execution.
6. Proceed to the next SPO.

---

## Breakdown of SPOs

| Sequence | SPO File | Scope |
|:---|:---|:---|
| **SPO 01** | `SPO_01_Monorepo_Scaffold.md` | Monorepo setup (Turborepo, pnpm workspaces, empty apps) |
| **SPO 02** | `SPO_02_Shared_Packages.md` | Extracting `@hilal/astronomy`, `@hilal/types`, `@hilal/db` |
| **SPO 03** | `SPO_03_Database_Migration.md` | Neon PostgreSQL setup, Drizzle schemas, PostGIS |
| **SPO 04** | `SPO_04_Web_App_Rebuild.md` | Next.js 15 App Router, UI components, isolated API routes |
| **SPO 05** | `SPO_05_Edge_Caching_And_MDX.md` | Vercel KV cached grids, Edge API routes, MDX content |
| **SPO 06** | `SPO_06_Mobile_App_Rebuild.md` | React Native (Expo Router), native maps, native SDKs, offline SQLite |
| **SPO 07** | `SPO_07_Telemetry_And_CI.md` | Vercel background functions for async telemetry, Serwist PWA, CI/CD Actions |
| **SPO 08** | `SPO_08_Design_And_Troubleshooting.md` | UI/UX Design, Deterministic problem solving, Troubleshooting, and Documentation |

---

## Tech Stack & Architecture Structure

| Domain | Technology |
|:---|:---|
| **Monorepo** | Turborepo, pnpm workspaces |
| **Frontend We** | Next.js 15 (App Router), Tailwind v4, Zustand |
| **Frontend Mobile** | React Native (Expo Router), NativeWind |
| **Shared Compute** | Pure TS (`@hilal/astronomy`, `@hilal/types`, `@hilal/db`) |
| **Database** | Neon PostgreSQL (Serverless HTTP driver), Drizzle ORM, PostGIS |
| **CI/CD** | GitHub Actions, Vercel Preview/Prod Deployments, EAS (Expo Application Services) |
| **Linting/Formatting** | ESLint (`@eslint/js`), Prettier, TypeScript `tsc`, (No Ruff as we are pure TS, but strict linting enforced) |

### Folder Structure Convention
- `apps/web/`: Next.js frontend code
- `apps/mobile/`: Expo frontend code
- `packages/astronomy/`: Core astronomical math (Yallop/Odeh)
- `packages/db/`: Drizzle schema, instance setup, and migrations
- `packages/ui/`: Design tokens, generic components
- `packages/types/`: Universal Zod schemas

---

## Critical Directives for the Agent

1. **No Capacitor**: We are explicitly moving away from Capacitor to React Native via Expo. Avoid installing any `@capacitor/*` packages.
2. **No TCP MySQL Pooling**: Use only the `@neondatabase/serverless` HTTP driver to prevent connection starvation on Vercel.
3. **Isolate Code**: UI components must rely heavily on `@hilal/ui` and API logic on Server Actions or Route Handlers.
4. **Keep Existing Logic**: The astronomy math and ICOP dataset are scientifically validated. Do not rewrite math algorithms; only refactor structure.

### Deterministic Problem Solving & Self-Correction
- **Analyze Thoroughly**: When debugging issues (e.g., Map rendering logic, data calculation issues in Astronomia/SunCalc), read stack traces carefully. Fix the specific type or logic error and test your changes before concluding a task.
- **Understand Data Context**: Understand the context of the astronomical data (Yallop/Odeh criteria). Don't make assumptions about lunar visibility parameters without verifying against trusted logic.

### Update Documentation as You Go
- **Document Discovery**: If you establish new patterns or discover unique edge-cases in the data pipeline, document them.
- **Living Trackers**: Keep any relevant `todo.md` or tracker files updated as you complete tasks.

### Troubleshooting & Diagnostics
- **Isolate and Reproduce**: Identify exactly which layer (mobile, web, astro, db) is failing before writing fixes.
- **Log Driven**: Use logs and stack traces to inform solutions rather than guessing.
