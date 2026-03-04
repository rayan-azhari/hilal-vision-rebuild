import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Clerk user ID — the canonical identifier coming from Clerk auth. */
  clerkId: varchar("clerkId", { length: 64 }).unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  observerBadge: mysqlEnum("observerBadge", ["Novice", "Tracker", "Astronomer", "Master"]).default("Novice").notNull(),
  sightingCount: int("sightingCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Telemetry reports for ground-truth observations
export const observationReports = mysqlTable("observation_reports", {
  id: int("id").autoincrement().primaryKey(),
  userId: varchar("userId", { length: 255 }), // Clerk userId
  lat: decimal("lat", { precision: 10, scale: 7 }).notNull(),
  lng: decimal("lng", { precision: 10, scale: 7 }).notNull(),
  observationTime: timestamp("observationTime").notNull(),
  temperature: decimal("temperature", { precision: 6, scale: 2 }),
  pressure: decimal("pressure", { precision: 7, scale: 2 }),
  cloudFraction: decimal("cloudFraction", { precision: 5, scale: 2 }),
  pm25: decimal("pm25", { precision: 6, scale: 2 }),
  visualSuccess: mysqlEnum("visualSuccess", ["naked_eye", "optical_aid", "not_seen"]).notNull(),
  notes: text("notes"),
  imageUrl: varchar("imageUrl", { length: 2048 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("obs_userId_idx").on(table.userId),
  index("obs_createdAt_idx").on(table.createdAt),
  index("obs_lat_lng_idx").on(table.lat, table.lng),
]);

export type ObservationReport = typeof observationReports.$inferSelect;
export type InsertObservationReport = typeof observationReports.$inferInsert;

// Push notification tokens
export const pushTokens = mysqlTable("push_tokens", {
  id: int("id").autoincrement().primaryKey(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  userId: varchar("userId", { length: 255 }), // Clerk userId (optional, for anonymous subs)
  deviceType: varchar("deviceType", { length: 50 }), // 'web', 'ios', 'android'
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("push_userId_idx").on(table.userId),
]);

export type PushToken = typeof pushTokens.$inferSelect;
export type InsertPushToken = typeof pushTokens.$inferInsert;

// Maps Stripe customer IDs to Clerk user IDs for O(1) subscription revocation.
// Written at checkout completion; read at cancellation/payment_failed webhook.
export const stripeCustomers = mysqlTable("stripe_customers", {
  id: int("id").autoincrement().primaryKey(),
  clerkUserId: varchar("clerkUserId", { length: 255 }).notNull().unique(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StripeCustomer = typeof stripeCustomers.$inferSelect;
export type InsertStripeCustomer = typeof stripeCustomers.$inferInsert;

// Waitlist / newsletter signups for Mobile App release or other news
export const emailSignups = mysqlTable("email_signups", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailSignup = typeof emailSignups.$inferSelect;
export type InsertEmailSignup = typeof emailSignups.$inferInsert;
