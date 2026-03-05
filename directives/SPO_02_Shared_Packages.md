# SPO 02: Shared Packages Extraction

## Objective
Extract core shared domains (Astronomy, Types, Database, UI) from the legacy application into isolated monorepo packages.

## Context
Currently, `shared/astronomy.ts` is an 843+ line monolith, and types are scattered. We need clean, testable local packages consumed by both frontend apps.

## Instructions
1. **`@hilal/astronomy`**: 
   - Move existing math logic into `packages/astronomy/src/`.
   - Split the monolith into separate files: `yallop.ts`, `odeh.ts`, `hijri.ts`, `grid.ts`, `refraction.ts`, `bestTime.ts`, `terminator.ts`.
   - Create a barrel `index.ts` file. 
   - Ensure the package has zero DOM or Node.js runtime dependencies. Set up `vitest` and port the 144 astronomy tests here.
2. **`@hilal/types`**:
   - Extract Zod schemas representing shared concepts (user schemas, observation records, etc.) into `packages/types/src/schemas.ts`.
3. **`@hilal/ui`**:
   - Set up design tokens (colors, spacing, typography) using OKLCH and the "Breezy Weather" aesthetic.
4. **`@hilal/db`**:
   - Set up the foundation for Drizzle ORM in `packages/db`. Include a `package.json` for `@neondatabase/serverless` and `drizzle-orm`. (Schema to be detailed in SPO 03).

## Success Criteria
- All 144 astronomy tests pass in `@hilal/astronomy` via `vitest`.
- The packages export types cleanly.
- `apps/web` and `apps/mobile` can import from `@hilal/astronomy` and `@hilal/types` without typescript errors.
