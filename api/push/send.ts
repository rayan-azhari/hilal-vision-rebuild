/**
 * POST /api/push/send
 *
 * Broadcasts an FCM push notification to all registered device tokens.
 * Protected by x-cron-secret header — only called by the cron job or admins.
 *
 * Body: { title: string, body: string, data?: Record<string, string> }
 * Returns: { sent: number, removed: number }
 */
import { timingSafeEqual } from "crypto";
import type { IncomingMessage, ServerResponse } from "http";
import { getDb } from "../../server/db.js";
import { pushTokens } from "../../drizzle/schema.js";
import { inArray } from "drizzle-orm";
import { ENV } from "../../server/_core/env.js";
import { setCorsHeaders } from "../_cors.js";

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

// Lazy firebase-admin initialisation — must NOT be at module top-level
// (Vercel cold starts import everything; the credentials may not be available at import time)
let adminApp: any = null;

async function getMessaging() {
    if (adminApp) {
        const { getMessaging: gm } = await import("firebase-admin/messaging");
        return gm(adminApp);
    }

    const credentials = ENV.firebaseAdminCredentials;
    if (!credentials) {
        throw new Error("FIREBASE_ADMIN_CREDENTIALS env var is not set");
    }

    const serviceAccount = JSON.parse(credentials);
    const { initializeApp, cert } = await import("firebase-admin/app");
    const { getMessaging: gm } = await import("firebase-admin/messaging");

    adminApp = initializeApp({ credential: cert(serviceAccount) });
    return gm(adminApp);
}

function getRawBody(req: IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        req.on("data", (chunk: Buffer) => chunks.push(chunk));
        req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
        req.on("error", reject);
    });
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
    if (setCorsHeaders(req, res)) return;

    if (req.method !== "POST") {
        res.statusCode = 405;
        res.end("Method Not Allowed");
        return;
    }

    // Authenticate with shared cron secret
    const secret = (req.headers as any)["x-cron-secret"];
    if (!ENV.cronSecret || !safeCompare(String(secret ?? ""), ENV.cronSecret)) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
    }

    let notification: { title: string; body: string; data?: Record<string, string> };
    try {
        const raw = await getRawBody(req);
        notification = JSON.parse(raw);
        if (!notification.title || !notification.body) throw new Error("Missing title/body");
    } catch {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Invalid request body" }));
        return;
    }

    try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Fetch all tokens
        const rows = await db.select({ token: pushTokens.token }).from(pushTokens);
        if (rows.length === 0) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ sent: 0, removed: 0 }));
            return;
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
                        staleTokens.push(batch[idx]);
                    }
                }
            });
        }

        // Remove stale tokens in bulk
        if (staleTokens.length > 0) {
            await db.delete(pushTokens).where(inArray(pushTokens.token, staleTokens));
        }

        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ sent: totalSent, removed: staleTokens.length }));
    } catch (err) {
        console.error("[push/send] Error:", err);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: "Internal server error" }));
    }
}
