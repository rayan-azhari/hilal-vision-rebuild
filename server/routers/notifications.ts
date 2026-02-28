import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../_core/trpc.js";
import { z } from "zod";
import { getDb } from "../db.js";
import { pushTokens } from "../../drizzle/schema.js";
import { eq } from "drizzle-orm";

// ─── Rate Limiting ─────────────────────────────────────────────────────────────
// Simple in-memory rate limiter for token registration (10 per IP per minute).
// Prevents an attacker with a valid session from flooding the push_tokens table.
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
        .input(
            z.object({
                token: z.string().min(10),
                deviceType: z.enum(["web", "ios", "android"]).default("web"),
            })
        )
        .mutation(async ({ input, ctx }) => {
            // Rate limit by IP to prevent token table flooding
            const reqAny = ctx.req as any;
            const fwd = typeof reqAny?.headers?.get === "function"
                ? reqAny.headers.get("x-forwarded-for")
                : reqAny?.headers?.["x-forwarded-for"]?.toString();
            const ip = fwd
                ? fwd.split(",").map((s: string) => s.trim()).at(-1) ?? "unknown"
                : reqAny?.socket?.remoteAddress ?? "unknown";

            if (!checkSubscribeRateLimit(ip)) {
                throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many token registration attempts. Please wait." });
            }

            const db = await getDb();
            if (!db) {
                throw new Error("Database not available");
            }

            const userId = ctx.user?.id ?? null;

            try {
                // Upsert logic: If token exists, do nothing or update userId
                // Note: MySQL requires on duplicate key update if using standard inset.
                // For simplicity, we first check if it exists:
                const existing = await db
                    .select()
                    .from(pushTokens)
                    .where(eq(pushTokens.token, input.token))
                    .limit(1);

                if (existing.length === 0) {
                    await db.insert(pushTokens).values({
                        token: input.token,
                        userId: userId,
                        deviceType: input.deviceType,
                    });
                }
                return { success: true };
            } catch (error) {
                console.error("[Push] Failed to save token:", error);
                throw new Error("Failed to save push token", { cause: error });
            }
        }),
});
