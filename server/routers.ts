import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { observationReports } from "../drizzle/schema";
import { desc } from "drizzle-orm";

// ─── Simple in-memory rate limiter ────────────────────────────────────────────
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5; // 5 submissions per minute per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) return false;
  recent.push(now);
  rateLimitMap.set(ip, recent);
  return true;
}

// Periodic cleanup of stale rate-limit entries
setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of rateLimitMap.entries()) {
    const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (recent.length === 0) rateLimitMap.delete(ip);
    else rateLimitMap.set(ip, recent);
  }
}, 120_000);

// ─── Router ───────────────────────────────────────────────────────────────────

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
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
        // Rate limit by IP
        const ip =
          ctx.req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ??
          ctx.req.socket.remoteAddress ??
          "unknown";
        if (!checkRateLimit(ip)) {
          throw new Error("Rate limit exceeded. Please wait before submitting again.");
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
        const data = await db
          .select()
          .from(observationReports)
          .orderBy(desc(observationReports.createdAt))
          .limit(limit)
          .offset(offset);
        return { data, total: data.length };
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

