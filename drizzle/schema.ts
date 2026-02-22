import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

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
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
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
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ObservationReport = typeof observationReports.$inferSelect;
export type InsertObservationReport = typeof observationReports.$inferInsert;