/**
 * POST /api/push/send
 *
 * Broadcasts an FCM push notification to all registered device tokens.
 * Protected by x-cron-secret header — only callable by the cron job or admins.
 *
 * Body: { title: string, body: string, data?: Record<string, string> }
 * Returns: { sent: number, removed: number }
 */
import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { db } from "@hilal/db";
import { pushTokens } from "@hilal/db/schema";
import { inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function safeCompare(a: string, b: string): boolean {
    try {
        const bufA = Buffer.from(a, "utf8");
        const bufB = Buffer.from(b, "utf8");
        if (bufA.length !== bufB.length) return false;
        return timingSafeEqual(bufA, bufB);
    } catch {
        return false;
    }
}

// Lazy firebase-admin init — must NOT be at module top-level
// (Vercel cold starts; credentials may not be available at import time)
let _messagingInstance: Awaited<ReturnType<typeof import("firebase-admin/messaging").getMessaging>> | null = null;

async function getMessaging() {
    if (_messagingInstance) return _messagingInstance;

    const credentials = process.env.FIREBASE_ADMIN_CREDENTIALS;
    if (!credentials) {
        throw new Error("FIREBASE_ADMIN_CREDENTIALS env var is not set");
    }

    const serviceAccount = JSON.parse(credentials) as object;
    const { initializeApp, cert, getApps } = await import("firebase-admin/app");
    const { getMessaging } = await import("firebase-admin/messaging");

    const existingApps = getApps();
    const app = existingApps.length > 0
        ? existingApps[0]!
        : initializeApp({ credential: cert(serviceAccount) });

    _messagingInstance = getMessaging(app);
    return _messagingInstance;
}

const notifSchema = {
    parse(body: unknown): { title: string; body: string; data?: Record<string, string> } {
        if (typeof body !== "object" || body === null) throw new Error("Invalid body");
        const b = body as Record<string, unknown>;
        if (typeof b.title !== "string" || !b.title) throw new Error("Missing title");
        if (typeof b.body !== "string" || !b.body) throw new Error("Missing body");
        return {
            title: b.title,
            body: b.body,
            data: typeof b.data === "object" && b.data !== null
                ? (b.data as Record<string, string>)
                : undefined,
        };
    },
};

export async function POST(req: NextRequest): Promise<NextResponse> {
    // Auth: x-cron-secret must match CRON_SECRET env var
    const cronSecret = process.env.CRON_SECRET;
    const headerSecret = req.headers.get("x-cron-secret") ?? "";

    if (!cronSecret || !safeCompare(headerSecret, cronSecret)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let notification: { title: string; body: string; data?: Record<string, string> };
    try {
        const raw = await req.json() as unknown;
        notification = notifSchema.parse(raw);
    } catch {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    if (!db) {
        return NextResponse.json({ error: "Database not available" }, { status: 503 });
    }

    try {
        // Fetch all tokens
        const rows = await db.select({ token: pushTokens.token }).from(pushTokens);
        if (rows.length === 0) {
            return NextResponse.json({ sent: 0, removed: 0 });
        }

        const messaging = await getMessaging();
        const allTokens = rows.map((r) => r.token);
        const BATCH_SIZE = 500; // FCM multicast limit
        let totalSent = 0;
        const staleTokens: string[] = [];

        for (let i = 0; i < allTokens.length; i += BATCH_SIZE) {
            const batch = allTokens.slice(i, i + BATCH_SIZE);
            const response = await messaging.sendEachForMulticast({
                tokens: batch,
                notification: {
                    title: notification.title,
                    body: notification.body,
                },
                data: notification.data,
                webpush: {
                    notification: {
                        icon: "/icons/icon-192x192.png",
                        badge: "/icons/icon-72x72.png",
                    },
                },
            });

            totalSent += response.successCount;

            // Collect stale tokens (registration-not-found / invalid-registration)
            response.responses.forEach((r, idx) => {
                if (!r.success && r.error) {
                    const code = r.error.code ?? "";
                    if (
                        code === "messaging/registration-token-not-registered" ||
                        code === "messaging/invalid-registration-token"
                    ) {
                        staleTokens.push(batch[idx]!);
                    }
                }
            });
        }

        // Remove stale tokens in bulk
        if (staleTokens.length > 0) {
            await db.delete(pushTokens).where(inArray(pushTokens.token, staleTokens));
        }

        return NextResponse.json({ sent: totalSent, removed: staleTokens.length });
    } catch (err) {
        console.error("[push/send] Error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
