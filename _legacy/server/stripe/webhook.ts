import { setCorsHeaders } from "../../server/_cors.js";
import Stripe from "stripe";
import { createClerkClient } from "@clerk/backend";
import { upsertStripeCustomer, getStripeCustomerByStripeId } from "../../server/db.js";
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
    } catch {
        console.error("[Stripe Webhook] Signature verification failed");
        res.statusCode = 400;
        res.end("Webhook signature verification failed");
        return;
    }

    // ── Handle events ───────────────────────────────────────────────────────
    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.client_reference_id;
                const meta = session.metadata ?? {};

                console.log(`[Stripe Webhook] checkout.session.completed — type=${meta.type}, plan=${meta.plan}`);

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
                        // Persist stripeCustomerId → clerkUserId mapping for O(1) revocation
                        if (typeof session.customer === "string") {
                            await upsertStripeCustomer(userId, session.customer);
                        }
                        console.log(`[Stripe Webhook] Granted Pro (plan: ${meta.plan})`);
                    } else if (meta.type === "donation" && Number(meta.amount?.replace("$", "")) >= 10) {
                        // $10+ donation → grant Patron badge
                        await clerk.users.updateUserMetadata(userId, {
                            publicMetadata: {
                                isPatron: true,
                                patronSince: new Date().toISOString(),
                            },
                        });
                        console.log(`[Stripe Webhook] Granted Patron badge`);
                    }
                } else {
                    console.warn("[Stripe Webhook] No userId or Clerk key — skipping metadata update");
                }
                break;
            }

            case "customer.subscription.deleted":
            case "invoice.payment_failed": {
                // Subscription cancelled/expired or payment failed — revoke Pro
                const obj = event.data.object as any;
                const customerId = (obj.customer ?? obj.customer_id) as string;

                console.log(`[Stripe Webhook] ${event.type} for Stripe customer`);

                if (clerkSecretKey && customerId) {
                    const clerk = createClerkClient({ secretKey: clerkSecretKey });

                    // O(1) lookup via DB mapping (written at checkout completion)
                    const mapping = await getStripeCustomerByStripeId(customerId);

                    if (mapping) {
                        const user = await clerk.users.getUser(mapping.clerkUserId);
                        const meta = user.publicMetadata as { isPro?: boolean; plan?: string };
                        if (meta?.isPro) {
                            if (meta.plan === "lifetime") {
                                console.log(`[Stripe Webhook] Skipping revocation — user has lifetime plan`);
                            } else {
                                await clerk.users.updateUserMetadata(mapping.clerkUserId, {
                                    publicMetadata: {
                                        isPro: false,
                                        proRevokedAt: new Date().toISOString(),
                                    },
                                });
                                console.log(`[Stripe Webhook] Revoked Pro — subscription ended`);
                            }
                        }
                    } else {
                        // Fallback: paginate Clerk users (legacy customers before DB mapping was added)
                        let found = false;
                        let offset = 0;
                        const PAGE_SIZE = 100;

                        while (!found) {
                            const users = await clerk.users.getUserList({ limit: PAGE_SIZE, offset });
                            if (users.data.length === 0) break;

                            for (const user of users.data) {
                                const meta = user.publicMetadata as any;
                                if (meta?.stripeCustomerId === customerId && meta?.isPro === true) {
                                    if (meta.plan === "lifetime") {
                                        console.log(`[Stripe Webhook] Skipping revocation — user has lifetime plan`);
                                    } else {
                                        await clerk.users.updateUserMetadata(user.id, {
                                            publicMetadata: {
                                                isPro: false,
                                                proRevokedAt: new Date().toISOString(),
                                            },
                                        });
                                        console.log(`[Stripe Webhook] Revoked Pro — subscription ended (legacy lookup)`);
                                    }
                                    found = true;
                                    break;
                                }
                            }

                            if (users.data.length < PAGE_SIZE) break;
                            offset += PAGE_SIZE;
                        }

                        if (!found) {
                            console.warn(`[Stripe Webhook] Could not find Clerk user for Stripe customer`);
                        }
                    }
                }
                break;
            }

            default:
                console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
        }

        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ received: true }));
    } catch (err: any) {
        console.error("[Stripe Webhook] Handler error:", err?.message ?? "unknown");
        res.statusCode = 500;
        res.end("Webhook handler error");
    }
}
