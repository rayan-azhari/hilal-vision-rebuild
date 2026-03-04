import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import * as dotenv from "dotenv";

dotenv.config();

async function runMigration() {
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is not set");
    }

    console.log("⏳ Running migrations...");
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql);

    try {
        await migrate(db, { migrationsFolder: "./migrations" });
        console.log("✅ Migrations completed successfully");
    } catch (error) {
        console.error("❌ Migration failed", error);
        process.exit(1);
    }
}

runMigration();
