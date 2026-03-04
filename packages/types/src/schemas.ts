import { z } from "zod";

// ─── Shared Geolocation Schemas ───────────────────────────────────────────────

export const coordinatesSchema = z.object({
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
});

// ─── Public API Query Schemas ─────────────────────────────────────────────────

export const visibilityQuerySchema = coordinatesSchema.extend({
    date: z.string().optional(),
});

export const moonPhaseQuerySchema = z.object({
    date: z.string().optional(),
});

// ─── Weather API Schemas ──────────────────────────────────────────────────────

export const cloudGridQuerySchema = z.object({
    date: z.string().max(32),
});

export const localWeatherQuerySchema = coordinatesSchema;

// ─── Archive API Schemas ──────────────────────────────────────────────────────

export const historicalDataQuerySchema = z.object({
    hijriYear: z.number().int().min(1400).max(1500),
    hijriMonth: z.number().int().min(1).max(12),
});

// ─── Notification API Schemas ─────────────────────────────────────────────────

export const pushSubscriptionSchema = z.object({
    token: z.string().min(10),
    deviceType: z.enum(["web", "ios", "android"]).default("web"),
});

// ─── System Health Schemas ────────────────────────────────────────────────────

export const systemHealthSchema = z.object({
    timestamp: z.number().min(0, "timestamp cannot be negative"),
});

// ─── Type Inference Exports ───────────────────────────────────────────────────

export type CoordinatesInput = z.infer<typeof coordinatesSchema>;
export type VisibilityQueryInput = z.infer<typeof visibilityQuerySchema>;
export type MoonPhaseQueryInput = z.infer<typeof moonPhaseQuerySchema>;
export type CloudGridQueryInput = z.infer<typeof cloudGridQuerySchema>;
export type LocalWeatherQueryInput = z.infer<typeof localWeatherQuerySchema>;
export type HistoricalDataQueryInput = z.infer<typeof historicalDataQuerySchema>;
export type PushSubscriptionInput = z.infer<typeof pushSubscriptionSchema>;
export type SystemHealthInput = z.infer<typeof systemHealthSchema>;
