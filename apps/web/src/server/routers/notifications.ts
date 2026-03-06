import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../trpc";
import { pushSubscriptionSchema } from "@hilal/types";
import { pushTokens } from "@hilal/db";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";

// ─── Rate Limiting ─────────────────────────────────────────────────────────────
// Simple in-memory rate limiter for token registration (10 per IP per minute).
// In a serverless Edge environment, this is instance-bound, meaning if it scales
// to multi-instances the limit is per-instance, which is fine for basic flood protection.
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
    subscribe: publicProcedure
        .input(pushSubscriptionSchema)
        .mutation(async ({ input, ctx }) => {
            let ip = "unknown";
            // @ts-expect-error - Assuming req is available in context or we fallback
            if (ctx.req && ctx.req.headers) {
                // @ts-expect-error - Next request types dont officially expose headers
                const forwarded = ctx.req.headers.get("x-forwarded-for");
                if (forwarded) {
                    ip = forwarded.split(",")[0].trim();
                } else {
                    // @ts-expect-error - Next request types dont officially expose headers
                    const real = ctx.req.headers.get("x-real-ip");
                    if (real) ip = real;
                }
            }

            if (!checkSubscribeRateLimit(ip)) {
                throw new TRPCError({
                    code: "TOO_MANY_REQUESTS",
                    message: "Too many token registration attempts. Please wait."
                });
            }

            if (!process.env.DATABASE_URL) {
                console.error("DATABASE_URL missing in notificationsRouter");
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Database connection unavailable"
                });
            }

            const sql = neon(process.env.DATABASE_URL);
            const dbInstance = drizzle(sql);

            // In a real app with Auth, we would extract Clerk userId from ctx
            const userId = null;

            try {
                // Upsert logic: If token exists, do nothing (or we could update the userId/device)
                const existing = await dbInstance
                    .select()
                    .from(pushTokens)
                    .where(eq(pushTokens.token, input.token))
                    .limit(1);

                if (existing.length === 0) {
                    await dbInstance.insert(pushTokens).values({
                        token: input.token,
                        userId: userId,
                        deviceType: input.deviceType,
                    });
                }
                return { success: true };
            } catch (error) {
                console.error("[Push] Failed to save token:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to save push token",
                    cause: error
                });
            }
        }),
});
