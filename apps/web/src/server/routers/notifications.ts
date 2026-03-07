import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../trpc";
import { pushSubscriptionSchema } from "@hilal/types";
import { db, eq, pushTokens } from "@hilal/db";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { z } from "zod";

// ─── Rate Limiting ─────────────────────────────────────────────────────────────
// Simple in-memory rate limiter for token registration (10 per IP per minute).
// In a serverless environment this is instance-bound, which is fine for basic flood protection.
const subscribeRateCache = new Map<string, { count: number; resetTime: number }>();

function checkSubscribeRateLimit(ip: string): boolean {
    const now = Date.now();
    const windowMs = 60 * 1000;
    const maxPerWindow = 10;

    // Evict expired entries when cache grows large
    if (subscribeRateCache.size > 5000) {
        subscribeRateCache.forEach((v, k) => {
            if (now > v.resetTime) subscribeRateCache.delete(k);
        });
    }

    const record = subscribeRateCache.get(ip);
    if (!record || now > record.resetTime) {
        subscribeRateCache.set(ip, { count: 1, resetTime: now + windowMs });
        return true;
    }
    if (record.count >= maxPerWindow) return false;
    record.count += 1;
    return true;
}

export const notificationsRouter = router({
    /**
     * Subscribe a device to push notifications by registering its FCM token.
     * Anonymous subscriptions are allowed — userId is linked if the user is signed in.
     */
    subscribe: publicProcedure
        .input(pushSubscriptionSchema)
        .mutation(async ({ input }) => {
            // Clerk userId is optional — anonymous subscriptions are valid
            const { userId } = await auth();

            // Rate limit by IP via Next.js headers()
            const reqHeaders = await headers();
            const forwarded = reqHeaders.get("x-forwarded-for");
            const real = reqHeaders.get("x-real-ip");
            const ip = forwarded?.split(",")[0].trim() ?? real ?? "unknown";

            if (!checkSubscribeRateLimit(ip)) {
                throw new TRPCError({
                    code: "TOO_MANY_REQUESTS",
                    message: "Too many token registration attempts. Please wait.",
                });
            }

            if (!db) {
                console.error("DATABASE_URL missing in notificationsRouter.subscribe");
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Database connection unavailable",
                });
            }

            try {
                const existing = await db
                    .select()
                    .from(pushTokens)
                    .where(eq(pushTokens.token, input.token))
                    .limit(1);

                if (existing.length === 0) {
                    await db.insert(pushTokens).values({
                        token: input.token,
                        userId: userId ?? null,
                        deviceType: input.deviceType,
                    });
                } else if (userId && !existing[0].userId) {
                    // Upgrade anonymous token to link it with the now-authenticated user
                    await db
                        .update(pushTokens)
                        .set({ userId })
                        .where(eq(pushTokens.token, input.token));
                }

                return { success: true };
            } catch (error) {
                console.error("[Push] Failed to save token:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to save push token",
                    cause: error,
                });
            }
        }),

    /**
     * Unsubscribe a device by deleting its FCM token.
     * Called when the user explicitly opts out of notifications.
     */
    unsubscribe: publicProcedure
        .input(z.object({ token: z.string().min(10) }))
        .mutation(async ({ input }) => {
            if (!db) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Database connection unavailable",
                });
            }

            try {
                await db
                    .delete(pushTokens)
                    .where(eq(pushTokens.token, input.token));
                return { success: true };
            } catch (error) {
                console.error("[Push] Failed to remove token:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to remove push token",
                    cause: error,
                });
            }
        }),
});
