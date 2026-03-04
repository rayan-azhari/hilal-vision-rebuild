import {
    pgTable,
    serial,
    text,
    timestamp,
    varchar,
    integer,
    numeric,
    index,
    geometry,
} from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    clerkId: varchar("clerkId", { length: 64 }).unique(),
    name: text("name"),
    email: varchar("email", { length: 320 }),
    loginMethod: varchar("loginMethod", { length: 64 }),
    role: varchar("role", { length: 20 }).default("user").notNull(),
    observerBadge: varchar("observerBadge", { length: 50 }).default("Novice").notNull(),
    sightingCount: integer("sightingCount").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Telemetry reports for ground-truth observations
export const observationReports = pgTable("observation_reports", {
    id: serial("id").primaryKey(),
    userId: varchar("userId", { length: 255 }), // Clerk userId

    // PostGIS Point geometry for geospatial queries (SRID 4326 = WGS84)
    location: geometry("location", { type: "Point", srid: 4326, mode: "tuple" }).notNull(),

    observationTime: timestamp("observationTime").notNull(),
    temperature: numeric("temperature", { precision: 6, scale: 2 }),
    pressure: numeric("pressure", { precision: 7, scale: 2 }),
    cloudFraction: numeric("cloudFraction", { precision: 5, scale: 2 }),
    pm25: numeric("pm25", { precision: 6, scale: 2 }),
    visualSuccess: varchar("visualSuccess", { length: 50 }).notNull(), // naked_eye, optical_aid, not_seen
    notes: text("notes"),
    imageUrl: varchar("imageUrl", { length: 2048 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
    index("obs_userId_idx").on(table.userId),
    index("obs_createdAt_idx").on(table.createdAt),
    // A standard GIST index would typically go here, but Drizzle pg-core index() handles b-tree.
    // For PostGIS GIST, we often define it via raw SQL in migrations or specific Drizzle flags if supported.
]);

export type ObservationReport = typeof observationReports.$inferSelect;
export type InsertObservationReport = typeof observationReports.$inferInsert;

// Push notification tokens
export const pushTokens = pgTable("push_tokens", {
    id: serial("id").primaryKey(),
    token: varchar("token", { length: 255 }).notNull().unique(),
    userId: varchar("userId", { length: 255 }), // Clerk userId (optional)
    deviceType: varchar("deviceType", { length: 50 }), // 'web', 'ios', 'android'
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => [
    index("push_userId_idx").on(table.userId),
]);

export type PushToken = typeof pushTokens.$inferSelect;
export type InsertPushToken = typeof pushTokens.$inferInsert;

// Maps Stripe customer IDs to Clerk user IDs
export const stripeCustomers = pgTable("stripe_customers", {
    id: serial("id").primaryKey(),
    clerkUserId: varchar("clerkUserId", { length: 255 }).notNull().unique(),
    stripeCustomerId: varchar("stripeCustomerId", { length: 255 }).notNull().unique(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type StripeCustomer = typeof stripeCustomers.$inferSelect;
export type InsertStripeCustomer = typeof stripeCustomers.$inferInsert;

// Waitlist / newsletter signups for Mobile App release or other news
export const emailSignups = pgTable("email_signups", {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 320 }).notNull().unique(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailSignup = typeof emailSignups.$inferSelect;
export type InsertEmailSignup = typeof emailSignups.$inferInsert;
