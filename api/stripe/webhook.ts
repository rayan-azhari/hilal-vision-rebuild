import Stripe from "stripe";
import { createClerkClient } from "@clerk/backend";
import type { IncomingMessage, ServerResponse } from "http";

// Webhook MUST have bodyParser disabled — Stripe validates the raw body signature
export const config = {
    api: {
        bodyParser: false,
    },
};

/** Read the raw request body as a Buffer */
function getRawBody(req: IncomingMessage): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        req.on("data", (chunk: Buffer) => chunks.push(chunk));
        req.on("end", () => resolve(Buffer.concat(chunks)));
        req.on("error", reject);
    });
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
    if (req.method !== "POST") {
        res.statusCode = 405;
        res.end("Method not allowed");
        return;
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;

    if (!stripeKey || !webhookSecret) {
        console.error("[Stripe Webhook] Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET");
        res.statusCode = 500;
        res.end("Stripe not configured");
        return;
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2026-01-28.clover" });

    // Verify signature
    const sig = req.headers["stripe-signature"];
    if (!sig) {
        res.statusCode = 400;
        res.end("No stripe-signature header");
        return;
    }

    let event: Stripe.Event;
    try {
        const rawBody = await getRawBody(req);
        event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err: any) {
        console.error("[Stripe Webhook] Signature verification failed:", err.message);
        res.statusCode = 400;
        res.end(`Webhook signature error: ${err.message}`);
        return;
    }

    // ── Handle events ───────────────────────────────────────────────────────
    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.client_reference_id;
                const meta = session.metadata ?? {};

                console.log(`[Stripe Webhook] checkout.session.completed — userId=${userId}, type=${meta.type}, plan=${meta.plan}`);

                if (userId && clerkSecretKey) {
                    const clerk = createClerkClient({ secretKey: clerkSecretKey });

                    if (meta.type === "pro") {
                        // Grant Pro access in Clerk metadata
                        await clerk.users.updateUserMetadata(userId, {
                            publicMetadata: {
                                isPro: true,
                                plan: meta.plan ?? "lifetime",
                                stripeCustomerId: session.customer as string | undefined,
                                proGrantedAt: new Date().toISOString(),
                            },
                        });
                        console.log(`[Stripe Webhook] Granted Pro to Clerk user ${userId} (plan: ${meta.plan})`);
                    } else if (meta.type === "donation" && Number(meta.amount?.replace("$", "")) >= 10) {
                        // $10+ donation → grant Patron badge
                        await clerk.users.updateUserMetadata(userId, {
                            publicMetadata: {
                                isPatron: true,
                                patronSince: new Date().toISOString(),
                            },
                        });
                        console.log(`[Stripe Webhook] Granted Patron badge to Clerk user ${userId}`);
                    }
                } else {
                    console.warn("[Stripe Webhook] No userId or Clerk key — skipping metadata update");
                }
                break;
            }

            case "customer.subscription.deleted": {
                // Subscription cancelled / expired
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                console.log(`[Stripe Webhook] Subscription deleted for customer ${customerId}`);

                if (clerkSecretKey) {
                    const clerk = createClerkClient({ secretKey: clerkSecretKey });
                    // Find user by stripeCustomerId in publicMetadata
                    const users = await clerk.users.getUserList({ limit: 1 });
                    // Note: In production you'd store a userId→customerId mapping in DB for efficient lookup.
                    // For now, if you have a small user base, iterate. Better: store in DB at checkout time.
                    console.warn(
                        `[Stripe Webhook] Subscription deleted for Stripe customer ${customerId}. ` +
                        `Revocation requires stripeCustomerId->clerkUserId lookup. Implement DB mapping for production.`
                    );
                }
                break;
            }

            case "invoice.payment_failed": {
                const invoice = event.data.object as Stripe.Invoice;
                console.warn(`[Stripe Webhook] Payment failed for customer ${invoice.customer}`);
                // Same caveat as above — needs customer→clerk user mapping
                break;
            }

            default:
                console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
        }

        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ received: true }));
    } catch (err: any) {
        console.error("[Stripe Webhook] Handler error:", err);
        res.statusCode = 500;
        res.end("Webhook handler error");
    }
}
