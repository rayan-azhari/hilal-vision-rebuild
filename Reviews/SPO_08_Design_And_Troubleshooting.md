# SPO 08: UI/UX Design and Troubleshooting

## Objective
Establish clear guidelines and workflows for UI/UX design, error handling, deterministic problem solving, and documentation updates during the rebuild.

## Context
As the rebuilding process scales across web and mobile platforms, it is critical to have established patterns for how the UI should feel, how errors should be diagnosed (especially in complex astronomical math), and how documentation stays current.

## Instructions
1. **Design System & UI/UX**:
   - Strictly adhere to the "Breezy Weather" aesthetic using OKLCH color palettes defined in `@hilal/ui`.
   - Ensure all interactive elements have immediate feedback states (hover, active, loading).
   - Maintain a mobile-first design philosophy, especially for the complex data visualizations (visibility map, moon phases).
   - Use `shadcn/ui` style composable components for consistency across the web interface.

2. **Deterministic Problem Solving & Self-Correction**:
   - **Stack Trace Analysis**: When debugging issues (e.g., Map rendering logic, data calculation issues in Astronomia/SunCalc), read stack traces carefully. Fix the specific type or logic error and test your changes before concluding a task.
   - **Astronomical Accuracy**: Understand the context of the astronomical data (Yallop/Odeh criteria). Don't make assumptions about lunar visibility parameters without verifying against trusted logic. If a calculation looks wrong, trace the input values backwards to the source.

3. **Troubleshooting & Diagnostics**:
   - Utilize standard logging structures (e.g., Sentry breadcrumbs) for all critical API routes and rendering cycles.
   - When encountering build errors (e.g., Turbo, Vite, Expo), isolate the package failing the build. Do not attempt "shotgun masking" of errors; identify the root cause in the dependency graph.

4. **Update Documentation as You Go**:
   - If you establish new patterns or discover unique edge-cases in the data pipeline, document them immediately in the relevant package's `README.md`.
   - Keep any relevant `todo.md` or tracker files updated as you complete tasks to maintain a clear status of the migration.

## Success Criteria
- The transition of visual assets strictly follows UI guidelines.
- Debugging processes reference specific logs rather than trial-and-error.
- Documentation evolves synchronously with code changes, specifically any new behavior in the math libraries or monorepo structure.
