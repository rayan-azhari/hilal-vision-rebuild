import { publicProcedure, router } from "../_core/trpc.js";
import { z } from "zod";
import { getDb } from "../db.js";
import { pushTokens } from "../../drizzle/schema.js";
import { eq } from "drizzle-orm";

export const notificationsRouter = router({
    subscribe: publicProcedure
        .input(
            z.object({
                token: z.string().min(10),
                deviceType: z.enum(["web", "ios", "android"]).default("web"),
            })
        )
        .mutation(async ({ input, ctx }) => {
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
                throw new Error("Failed to save push token");
            }
        }),
});
