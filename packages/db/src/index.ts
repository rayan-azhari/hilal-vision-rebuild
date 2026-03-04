import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema.js";

function getDbConnection() {
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL must be set in environment to initialize @hilal/db");
    }
    const sql = neon(process.env.DATABASE_URL);
    return drizzle(sql, { schema });
}

export const db = typeof process !== "undefined" && process.env.DATABASE_URL ? getDbConnection() : null;
export * from "./schema.js";
