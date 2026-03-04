# SPO 03: Database Migration

## Objective
Migrate the existing TiDB MySQL database to Neon PostgreSQL with Drizzle ORM, integrating PostGIS for spatial queries.

## Context
The legacy application uses MySQL in serverless environments leading to connection pool exhaustion. Neon PostgreSQL natively supports HTTP drivers (`@neondatabase/serverless`) which solves connection exhaustion entirely. PostGIS enables location-based distance queries.

## Instructions
1. **Drizzle Config**: Set up `drizzle.config.ts` in `packages/db`.
2. **Schema Migration**: Map the legacy MySQL schema to PostgreSQL with PostGIS in `packages/db/schema.ts`:
   - `users`: Clerk ID, email, display name, Pro status, Sighting stats.
   - `observations`: Replace lat/lng columns with `location GEOGRAPHY(POINT, 4326)`. Add spatial indexing `CREATE INDEX ON observations USING GIST(location);`.
   - `push_tokens`, `stripe_customers`, `email_signups`.
3. **Data Import/Migration Script**: Create a Node script in `packages/db/scripts/migrate.ts` to convert legacy MySQL data to Postgres if needed, ensuring ICOP records are preserved.
4. **Environment Setup**: Ensure the Neon database URL is exposed across Next.js and worker functions. Set up branch environments.

## Success Criteria
- Drizzle schema correctly maps to PostgreSQL concepts (`GEOGRAPHY(POINT, ...)`).
- `pnpm turbo db:push` command provisions the Neon Postgres instances successfully.
- Tests in `packages/db/__tests__/` can query mock observations with PostGIS distance functions.
