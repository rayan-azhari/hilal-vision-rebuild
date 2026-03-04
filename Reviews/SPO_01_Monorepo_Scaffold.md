# SPO 01: Monorepo Scaffold

## Objective
Set up the Turborepo monorepo structure with `pnpm` workspaces for the Hilal Vision rebuild. This lays the foundation for shared packages between the web and mobile apps.

## Context
The legacy application is a hybrid codebase. We are moving to a structured monorepo containing two dedicated apps: a Next.js 15 web app and an Expo (React Native) mobile app, supported by shared logic packages.

## Instructions
1. Initialize a new `pnpm-workspace.yaml` at the root of the project to map `apps/*` and `packages/*`.
2. Configure `turbo.json` for task caching (`build`, `lint`, `test`, `dev`).
3. Set up the `apps/` directory:
   - Create `apps/web` running Next.js 15 (App Router, Tailwind CSS v4, TypeScript).
   - Create `apps/mobile` running Expo SDK (with Expo Router, TypeScript).
4. Set up the empty `packages/` directory for `astronomy`, `types`, `ui`, and `db`.
5. Update the root `package.json` to configure the workspace dependencies and Turborepo scripts.

## Success Criteria
- Running `pnpm install` at the root successfully links standard workspace packages.
- Running `pnpm turbo build` completes successfully.
- Web and mobile apps boot up via `pnpm turbo dev`.
