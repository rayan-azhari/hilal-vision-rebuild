import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { observationReports } from "../drizzle/schema";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  telemetry: router({
    submitObservation: publicProcedure
      .input(
        z.object({
          lat: z.number(),
          lng: z.number(),
          observationTime: z.string(),
          temperature: z.number().optional(),
          pressure: z.number().optional(),
          cloudFraction: z.number().optional(),
          pm25: z.number().optional(),
          visualSuccess: z.enum(["naked_eye", "optical_aid", "not_seen"]),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) {
          throw new Error("Database not available");
        }

        // Autonomously fetch meteorological snap from Open-Meteo if not provided
        try {
          const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${input.lat}&longitude=${input.lng}&current=temperature_2m,surface_pressure,cloud_cover`;
          const weatherRes = await fetch(weatherUrl);
          if (weatherRes.ok) {
            const data = await weatherRes.json() as any;
            if (input.temperature === undefined) input.temperature = data.current?.temperature_2m;
            if (input.pressure === undefined) input.pressure = data.current?.surface_pressure;
            if (input.cloudFraction === undefined) input.cloudFraction = data.current?.cloud_cover;
          }

          const aodUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${input.lat}&longitude=${input.lng}&current=aerosol_optical_depth`;
          const aodRes = await fetch(aodUrl);
          if (aodRes.ok) {
            const aodData = await aodRes.json() as any;
            if (input.pm25 === undefined) input.pm25 = aodData.current?.aerosol_optical_depth;
          }
        } catch (err) {
          console.error("Open-Meteo fetch failed during submission:", err);
        }

        await db.insert(observationReports).values({
          userId: ctx.user?.id,
          lat: input.lat.toString(),
          lng: input.lng.toString(),
          observationTime: new Date(input.observationTime),
          temperature: input.temperature?.toString(),
          pressure: input.pressure?.toString(),
          cloudFraction: input.cloudFraction?.toString(),
          pm25: input.pm25?.toString(), // Storing AOD in pm25 column
          visualSuccess: input.visualSuccess,
          notes: input.notes,
        });

        return { success: true };
      }),
    getObservations: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(observationReports);
    }),
  }),
  environment: router({
    getDem: publicProcedure
      .input(z.object({ lat: z.number(), lng: z.number() }))
      .query(async ({ input }) => {
        try {
          const url = `https://api.open-meteo.com/v1/elevation?latitude=${input.lat}&longitude=${input.lng}`;
          const res = await fetch(url);
          if (!res.ok) return { elevation: 0 };
          const data = await res.json() as any;
          return { elevation: data.elevation?.[0] ?? 0 };
        } catch (e) {
          return { elevation: 0 };
        }
      }),
    getAod: publicProcedure
      .input(z.object({ lat: z.number(), lng: z.number() }))
      .query(async ({ input }) => {
        try {
          const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${input.lat}&longitude=${input.lng}&current=aerosol_optical_depth`;
          const res = await fetch(url);
          if (!res.ok) return { aod: 0.1 };
          const data = await res.json() as any;
          return { aod: data.current?.aerosol_optical_depth ?? 0.1 };
        } catch (e) {
          return { aod: 0.1 };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
