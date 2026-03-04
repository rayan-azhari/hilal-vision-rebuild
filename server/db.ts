import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2";
import { stripeCustomers } from "../drizzle/schema.js";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
// Uses a connection pool with explicit timeouts to avoid serverless cold-start hangs.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const pool = mysql.createPool({
        uri: process.env.DATABASE_URL,
        waitForConnections: true,
        connectionLimit: 3,    // low limit appropriate for serverless
        connectTimeout: 5000,  // 5s — fail fast if DB is unreachable
        idleTimeout: 60000,    // release idle connections after 60s
      });
      _db = drizzle(pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}


// ── Stripe customer mapping ────────────────────────────────────────────────────
// Maps stripeCustomerId → clerkUserId for O(1) subscription revocation.
// Without this, revocation requires paginating all Clerk users (O(n)).

export async function upsertStripeCustomer(clerkUserId: string, stripeCustomerId: string): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert stripe customer: database not available");
    return;
  }
  await db
    .insert(stripeCustomers)
    .values({ clerkUserId, stripeCustomerId })
    .onDuplicateKeyUpdate({ set: { stripeCustomerId, updatedAt: new Date() } });
}

export async function getStripeCustomerByStripeId(
  stripeCustomerId: string
): Promise<{ clerkUserId: string } | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select({ clerkUserId: stripeCustomers.clerkUserId })
    .from(stripeCustomers)
    .where(eq(stripeCustomers.stripeCustomerId, stripeCustomerId))
    .limit(1);
  return result[0];
}
