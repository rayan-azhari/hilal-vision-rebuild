import { systemRouter } from "./_core/systemRouter.js";
import { publicProcedure, router } from "./_core/trpc.js";
import { archiveRouter } from "./routers/archive.js";
import { weatherRouter } from "./routers/weather.js";
import { notificationsRouter } from "./routers/notifications.js";
import { z } from "zod";
import { getDb } from "./db.js";
import { observationReports } from "../drizzle/schema.js";
import { desc, count } from "drizzle-orm";
import { computeSunMoonAtSunset } from "../shared/astronomy.js";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { ENV } from "./_core/env.js";

// ─── Global Redis Rate Limiter ────────────────────────────────────────────────
let ratelimit: Ratelimit | null = null;
if (ENV.upstashRedisRestUrl && ENV.upstashRedisRestToken) {
  const redis = new Redis({
    url: ENV.upstashRedisRestUrl,
    token: ENV.upstashRedisRestToken,
  });
  // Limit to 5 requests per minute per IP
  ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"),
    analytics: true,
  });
} else {
  console.warn("[RateLimiter] Upstash Redis credentials not found. Telemetry endpoint is not rate-limited.");
}

// ─── Router ───────────────────────────────────────────────────────────────────

// Define demRouter from the existing getDem procedure
export const demRouter = router({
  getDem: publicProcedure
    .input(z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }))
    .query(async ({ input }) => {
      try {
        const url = `https://api.open-meteo.com/v1/elevation?latitude=${input.lat}&longitude=${input.lng}`;
        const res = await fetch(url);
        if (!res.ok) return { elevation: 0 };
        const data = (await res.json()) as any;
        return { elevation: data.elevation?.[0] ?? 0 };
      } catch {
        return { elevation: 0 };
      }
    }),
});

export const appRouter = router({
  system: systemRouter,
  archive: archiveRouter,
  weather: weatherRouter,
  notifications: notificationsRouter,
  dem: demRouter, // Added demRouter here
  telemetry: router({
    submitObservation: publicProcedure
      .input(
        z.object({
          lat: z.number().min(-90).max(90),
          lng: z.number().min(-180).max(180),
          observationTime: z.string().max(64),
          temperature: z.number().min(-100).max(70).optional(),
          pressure: z.number().min(800).max(1100).optional(),
          cloudFraction: z.number().min(0).max(100).optional(),
          pm25: z.number().min(0).max(10).optional(),
          visualSuccess: z.enum(["naked_eye", "optical_aid", "not_seen"]),
          notes: z.string().max(1000).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Rate limit by IP using Upstash
        if (ratelimit) {
          const ip =
            ctx.req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ??
            ctx.req.socket.remoteAddress ??
            "unknown";
          const { success } = await ratelimit.limit(ip);
          if (!success) {
            throw new Error("Rate limit exceeded. Please wait before submitting again.");
          }
        }

        const db = await getDb();
        if (!db) {
          throw new Error("Database not available");
        }

        // Validate observation time parses correctly
        const obsDate = new Date(input.observationTime);
        if (isNaN(obsDate.getTime())) {
          throw new Error("Invalid observation time format");
        }

        // Smart Sighting Validation
        // Reject claims of seeing the moon if it is definitively below the horizon or not yet born (Zone F)
        const computedData = computeSunMoonAtSunset(obsDate, { lat: input.lat, lng: input.lng });
        if (input.visualSuccess !== "not_seen" && computedData.visibility === "F") {
          throw new Error("Validation Failed: Astronomical data indicates the moon was below the horizon or not yet born at this location.");
        }

        // Autonomously fetch meteorological snap from Open-Meteo if not provided
        try {
          const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${input.lat}&longitude=${input.lng}&current=temperature_2m,surface_pressure,cloud_cover`;
          const weatherRes = await fetch(weatherUrl);
          if (weatherRes.ok) {
            const data = (await weatherRes.json()) as any;
            if (input.temperature === undefined) input.temperature = data.current?.temperature_2m;
            if (input.pressure === undefined) input.pressure = data.current?.surface_pressure;
            if (input.cloudFraction === undefined) input.cloudFraction = data.current?.cloud_cover;
          }

          const aodUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${input.lat}&longitude=${input.lng}&current=aerosol_optical_depth`;
          const aodRes = await fetch(aodUrl);
          if (aodRes.ok) {
            const aodData = (await aodRes.json()) as any;
            if (input.pm25 === undefined) input.pm25 = aodData.current?.aerosol_optical_depth;
          }
        } catch (err) {
          console.error("Open-Meteo fetch failed during submission:", err);
        }

        await db.insert(observationReports).values({
          userId: ctx.user?.id,
          lat: input.lat.toString(),
          lng: input.lng.toString(),
          observationTime: obsDate,
          temperature: input.temperature?.toString(),
          pressure: input.pressure?.toString(),
          cloudFraction: input.cloudFraction?.toString(),
          pm25: input.pm25?.toString(),
          visualSuccess: input.visualSuccess,
          notes: input.notes,
        });

        return { success: true };
      }),

    getObservations: publicProcedure
      .input(
        z
          .object({
            limit: z.number().min(1).max(100).default(50),
            offset: z.number().min(0).default(0),
          })
          .optional()
      )
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return { data: [], total: 0 };
        const limit = input?.limit ?? 50;
        const offset = input?.offset ?? 0;
        const [data, totalResult] = await Promise.all([
          db
            .select()
            .from(observationReports)
            .orderBy(desc(observationReports.createdAt))
            .limit(limit)
            .offset(offset),
          db
            .select({ total: count() })
            .from(observationReports),
        ]);
        return { data, total: totalResult[0]?.total ?? 0 };
      }),
  }),
  environment: router({
    getDem: publicProcedure
      .input(z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }))
      .query(async ({ input }) => {
        try {
          const url = `https://api.open-meteo.com/v1/elevation?latitude=${input.lat}&longitude=${input.lng}`;
          const res = await fetch(url);
          if (!res.ok) return { elevation: 0 };
          const data = (await res.json()) as any;
          return { elevation: data.elevation?.[0] ?? 0 };
        } catch {
          return { elevation: 0 };
        }
      }),
    getAod: publicProcedure
      .input(z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }))
      .query(async ({ input }) => {
        try {
          const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${input.lat}&longitude=${input.lng}&current=aerosol_optical_depth`;
          const res = await fetch(url);
          if (!res.ok) return { aod: 0.1 };
          const data = (await res.json()) as any;
          return { aod: data.current?.aerosol_optical_depth ?? 0.1 };
        } catch {
          return { aod: 0.1 };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;

