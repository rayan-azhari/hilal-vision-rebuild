import { createClerkClient } from "@clerk/backend";
import type { IncomingMessage, ServerResponse } from "http";

export const config = {
    api: {
        bodyParser: true,
    },
};

export default async function handler(req: IncomingMessage & { body?: any }, res: ServerResponse) {
    if (req.method !== "POST") {
        res.statusCode = 405;
        res.end(JSON.stringify({ error: "Method not allowed" }));
        return;
    }

    const { clerkSecretKey, revenuecatWebhookAuth } = process.env;

    if (!clerkSecretKey) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: "Clerk key missing" }));
        return;
    }

    // Verify RevenueCat webhook authorization header (fail closed)
    if (!revenuecatWebhookAuth) {
        console.error("[RevenueCat Webhook] REVENUECAT_WEBHOOK_AUTH not configured. Rejecting request.");
        res.statusCode = 503;
        res.end(JSON.stringify({ error: "Webhook auth not configured" }));
        return;
    }

    const authHeader = req.headers["authorization"];
    if (authHeader !== `Bearer ${revenuecatWebhookAuth}`) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
    }

    let body: any;
    try {
        body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    } catch {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Invalid JSON body" }));
        return;
    }

    const event = body.event;
    if (!event) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Missing event object" }));
        return;
    }

    const { type, app_user_id, entitlements } = event;

    console.log(`[RevenueCat Webhook] Received ${type}`);

    if (!app_user_id) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Missing app_user_id" }));
        return;
    }

    const clerk = createClerkClient({ secretKey: clerkSecretKey });

    try {
        switch (type) {
            case "INITIAL_PURCHASE":
            case "RENEWAL":
            case "UNCANCELLATION":
            case "TEST": {
                // Determine if 'pro' entitlement is active
                const hasPro = entitlements && Array.isArray(entitlements) && entitlements.some((e: any) => e.id === "pro");

                if (hasPro || type === "TEST") {
                    await clerk.users.updateUserMetadata(app_user_id, {
                        publicMetadata: {
                            isPro: true,
                            proSource: "revenuecat",
                            proGrantedAt: new Date().toISOString()
                        },
                    });
                    console.log(`[RevenueCat Webhook] Granted Pro`);
                }
                break;
            }

            case "CANCELLATION":
            case "EXPIRATION":
            case "BILLING_ISSUE": {
                // If the only source of Pro is RevenueCat, revoke it. 
                // We should technically check if they still have access, but RC webhook "EXPIRATION" means it's done.
                await clerk.users.updateUserMetadata(app_user_id, {
                    publicMetadata: {
                        isPro: false,
                        proSource: null
                    },
                });
                console.log(`[RevenueCat Webhook] Revoked Pro`);
                break;
            }

            default:
                console.log(`[RevenueCat Webhook] Ignored event type: ${type}`);
        }

        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ success: true }));

    } catch (err: any) {
        console.error(`[RevenueCat Webhook] Error updating Clerk:`, err);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: "Internal server error" }));
    }
}
