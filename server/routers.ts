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

        await db.insert(observationReports).values({
          userId: ctx.user?.id,
          lat: input.lat.toString(),
          lng: input.lng.toString(),
          observationTime: new Date(input.observationTime),
          temperature: input.temperature?.toString(),
          pressure: input.pressure?.toString(),
          cloudFraction: input.cloudFraction?.toString(),
          pm25: input.pm25?.toString(),
          visualSuccess: input.visualSuccess,
          notes: input.notes,
        });

        return { success: true };
      }),
  }),
  environment: router({
    getDem: publicProcedure
      .input(z.object({ lat: z.number(), lng: z.number() }))
      .query(async ({ input }) => {
        // TODO: Integrate actual SRTM DEM API proxy fetch here
        return { elevation: 0 };
      }),
    getAod: publicProcedure
      .input(z.object({ lat: z.number(), lng: z.number() }))
      .query(async ({ input }) => {
        // TODO: Integrate actual meteorological AOD API proxy fetch here
        return { aod: 0.1 };
      }),
  }),
});

export type AppRouter = typeof appRouter;
