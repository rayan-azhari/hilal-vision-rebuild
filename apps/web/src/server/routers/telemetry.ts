import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "../trpc";
import { db, eq, sql, desc, observationReports, users } from "@hilal/db";
import { computeSunMoonAtSunset } from "@hilal/astronomy";

// ─── In-memory rate limiter (5 submissions / min / userId) ───────────────────
// Resets on cold start; replace with Upstash when @upstash/ratelimit is added.
const _rateMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, maxReqs = 5, windowMs = 60_000): boolean {
    const now = Date.now();
    // Evict stale entries to prevent unbounded growth
    if (_rateMap.size > 5_000) {
        _rateMap.forEach((v, k) => { if (now > v.resetAt) _rateMap.delete(k); });
    }
    const record = _rateMap.get(key);
    if (!record || now > record.resetAt) {
        _rateMap.set(key, { count: 1, resetAt: now + windowMs });
        return true;
    }
    if (record.count >= maxReqs) return false;
    record.count += 1;
    return true;
}

// ─── Open-Meteo response shapes ───────────────────────────────────────────────
interface WeatherCurrent {
    temperature_2m?: number;
    surface_pressure?: number;
    cloud_cover?: number;
}
interface AodCurrent {
    aerosol_optical_depth?: number;
}

const fetchJson = (url: string): Promise<unknown> =>
    fetch(url, { signal: AbortSignal.timeout(2000) }).then((r) => (r.ok ? r.json() : null));

// ─── Router ───────────────────────────────────────────────────────────────────
export const telemetryRouter = router({
    submitObservation: protectedProcedure
        .input(
            z.object({
                lat: z.number().min(-90).max(90),
                lng: z.number().min(-180).max(180),
                observationTime: z.string().datetime(),
                visualSuccess: z.enum(["naked_eye", "optical_aid", "not_seen"]),
                notes: z.string().max(1000).optional(),
                imageBase64: z.string().optional(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not initialized" });

            // Rate limit by userId
            if (!checkRateLimit(ctx.userId)) {
                throw new TRPCError({
                    code: "TOO_MANY_REQUESTS",
                    message: "Rate limit exceeded. Please wait before submitting again.",
                });
            }

            const { lat, lng, observationTime, visualSuccess, notes } = input;
            const obsDate = new Date(observationTime);
            if (isNaN(obsDate.getTime())) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid observation time format" });
            }

            // ── Zone F rejection ─────────────────────────────────────────────
            // Refuse claimed sightings when the moon is definitively below the horizon.
            if (visualSuccess !== "not_seen") {
                const computed = computeSunMoonAtSunset(obsDate, { lat, lng });
                if (computed.visibility === "F") {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message:
                            "Validation failed: astronomical data indicates the moon was below the horizon at this location and time.",
                    });
                }
            }

            // ── Open-Meteo meteorological enrichment (best-effort, 2s timeout) ──
            let temperature: number | undefined;
            let pressure: number | undefined;
            let cloudFraction: number | undefined;
            let pm25: number | undefined;
            try {
                const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,surface_pressure,cloud_cover`;
                const aodUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=aerosol_optical_depth`;

                const [weatherRes, aodRes] = await Promise.allSettled([
                    fetchJson(weatherUrl),
                    fetchJson(aodUrl),
                ]);

                if (weatherRes.status === "fulfilled" && weatherRes.value != null) {
                    const d = weatherRes.value as { current?: WeatherCurrent };
                    temperature = d.current?.temperature_2m;
                    pressure = d.current?.surface_pressure;
                    cloudFraction = d.current?.cloud_cover;
                }
                if (aodRes.status === "fulfilled" && aodRes.value != null) {
                    const d = aodRes.value as { current?: AodCurrent };
                    pm25 = d.current?.aerosol_optical_depth;
                }
            } catch {
                // Enrichment failure is non-fatal — proceed without it
            }

            // ── Privacy jitter (~1.1 km displacement before storage) ─────────
            const jitteredLat = lat + (Math.random() - 0.5) * 0.02;
            const jitteredLng = lng + (Math.random() - 0.5) * 0.02;

            await db.insert(observationReports).values({
                userId: ctx.userId,
                location: sql`ST_SetSRID(ST_MakePoint(${jitteredLng}, ${jitteredLat}), 4326)`,
                observationTime: obsDate,
                visualSuccess,
                notes,
                imageUrl: null,
                temperature: temperature?.toString(),
                pressure: pressure?.toString(),
                cloudFraction: cloudFraction?.toString(),
                pm25: pm25?.toString(),
            });

            // ── Increment sighting count (upsert user record) ─────────────────
            const existingUser = await db.query.users.findFirst({
                where: eq(users.clerkId, ctx.userId),
            });
            if (existingUser) {
                await db.update(users)
                    .set({ sightingCount: existingUser.sightingCount + 1 })
                    .where(eq(users.clerkId, ctx.userId));
            } else {
                await db.insert(users).values({
                    clerkId: ctx.userId,
                    role: "user",
                    sightingCount: 1,
                    observerBadge: "Novice",
                });
            }

            return { success: true };
        }),

    getRecentObservations: publicProcedure
        .query(async () => {
            if (!db) return [];
            const recent = await db.query.observationReports.findMany({
                orderBy: [desc(observationReports.createdAt)],
                limit: 50,
            });
            return recent.map((r) => ({
                id: r.id,
                userId: r.userId,
                // PostGIS geometry tuple is [lng, lat] — swap for client consumption
                lat: (r.location as [number, number])[1] ?? 0,
                lng: (r.location as [number, number])[0] ?? 0,
                observationTime: r.observationTime,
                visualSuccess: r.visualSuccess,
                notes: r.notes,
                imageUrl: r.imageUrl,
                createdAt: r.createdAt,
            }));
        }),
});
