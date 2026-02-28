import { defineConfig } from "drizzle-kit";

// DATABASE_URL is only required for push/migrate (needs a live DB connection).
// generate only reads the schema file and produces SQL — no connection needed.
export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  ...(process.env.DATABASE_URL ? { dbCredentials: { url: process.env.DATABASE_URL } } : {}),
});
