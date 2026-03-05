import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../trpc";
import { db } from "@hilal/db";
import { observationReports, users } from "@hilal/db/schema";
import { eq, sql, desc } from "drizzle-orm";

export const telemetryRouter = router({
    submitObservation: protectedProcedure
        .input(
            z.object({
                lat: z.number(),
                lng: z.number(),
                observationTime: z.string().datetime(),
                visualSuccess: z.enum(["naked_eye", "optical_aid", "not_seen"]),
                notes: z.string().optional(),
                imageBase64: z.string().optional(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            if (!db) throw new Error("Database not initialized");
            const { lat, lng, observationTime, visualSuccess, notes, imageBase64 } = input;

            // In a real app we would upload imageBase64 to S3/Cloud Storage and save the URL.
            // For now, we'll store null or just a placeholder if provided.
            const imageUrl = imageBase64 ? "uploaded_image_placeholder_url" : null;

            // In Drizzle PostGIS, we use raw SQL to generate the ST_Point geometry
            await db.insert(observationReports).values({
                userId: ctx.userId,
                location: sql`ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)`,
                observationTime: new Date(observationTime),
                visualSuccess,
                notes,
                imageUrl,
            });

            // Increment the user's sighting count (upsert user record if needed)
            const existingUser = await db.query.users.findFirst({
                where: eq(users.clerkId, ctx.userId)
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
                    observerBadge: "Novice"
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

            // In an edge runtime or client we receive the location as a tuple/object.
            // We'll format the return to what the client expects.
            return recent.map((r: any) => ({
                id: r.id,
                userId: r.userId,
                lat: (r.location as any)[1] || 0, // Drizzle PG geometry tuple: [x,y] = [lng,lat] -> note: PostGIS is (lng,lat)
                lng: (r.location as any)[0] || 0,
                observationTime: r.observationTime,
                visualSuccess: r.visualSuccess,
                notes: r.notes,
                imageUrl: r.imageUrl,
                createdAt: r.createdAt
            }));
        }),
});
