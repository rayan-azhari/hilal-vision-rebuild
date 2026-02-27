import Stripe from "stripe";
import { createClerkClient } from "@clerk/backend";
import { setCorsHeaders } from "../_cors.js";
import type { IncomingMessage, ServerResponse } from "http";

export const config = {
    api: {
        bodyParser: true,
    },
};

const PRICE_MAP: Record<string, string | undefined> = {
    monthly: process.env.STRIPE_PRICE_MONTHLY,
    annual: process.env.STRIPE_PRICE_ANNUAL,
    lifetime: process.env.STRIPE_PRICE_LIFETIME,
};

// Donation amounts in cents
const DONATION_AMOUNTS: Record<string, number> = {
    "$5": 500,
    "$10": 1000,
    "$25": 2500,
    "$50": 5000,
};

export default async function handler(req: IncomingMessage & { body?: any; url?: string }, res: ServerResponse) {
    // CORS with origin whitelisting
    if (setCorsHeaders(req, res, { allowHeaders: "Content-Type, Authorization" })) return;

    if (req.method !== "POST") {
        res.statusCode = 405;
        res.end(JSON.stringify({ error: "Method not allowed" }));
        return;
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: "Stripe not configured" }));
        return;
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2026-01-28.clover" });

    let body: { planId?: string; donationAmount?: string; userId?: string; userEmail?: string };
    try {
        if (typeof req.body === "string") {
            body = JSON.parse(req.body);
        } else {
            body = req.body ?? {};
        }
    } catch {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Invalid JSON body" }));
        return;
    }

    const { planId, donationAmount } = body;

    // Extract userId from Clerk session token (server-side verification)
    let userId: string | undefined;
    let userEmail: string | undefined;
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;
    const authHeader = req.headers.authorization as string | undefined;

    if (clerkSecretKey && authHeader?.startsWith("Bearer ")) {
        try {
            const clerk = createClerkClient({ secretKey: clerkSecretKey });
            const token = authHeader.slice(7);
            const { sub } = await clerk.verifyToken(token);
            if (sub) {
                userId = sub;
                const clerkUser = await clerk.users.getUser(sub);
                userEmail = clerkUser.emailAddresses?.[0]?.emailAddress;
            }
        } catch (err) {
            console.error("[Stripe Checkout] Failed to verify Clerk token");
        }
    }

    // Fallback to body for backwards compatibility (e.g. during migration)
    if (!userId) {
        userId = body.userId;
        userEmail = body.userEmail;
    }

    const origin = req.headers.origin ?? req.headers.referer ?? "https://moonsighting.live";

    try {
        let session: Stripe.Checkout.Session;

        if (donationAmount) {
            // ── One-time donation ───────────────────────────────────────────
            const amountCents = DONATION_AMOUNTS[donationAmount];
            if (!amountCents) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: "Invalid donation amount" }));
                return;
            }

            session = await stripe.checkout.sessions.create({
                mode: "payment",
                line_items: [
                    {
                        price_data: {
                            currency: "usd",
                            product_data: {
                                name: "Hilal Vision — Sadaqah Jariyah",
                                description: "One-time donation to support Islamic astronomy for all. جزاك الله خيراً",
                            },
                            unit_amount: amountCents,
                        },
                        quantity: 1,
                    },
                ],
                client_reference_id: userId ?? undefined,
                customer_email: userEmail ?? undefined,
                metadata: { type: "donation", amount: donationAmount },
                success_url: `${origin}/support?success=donated`,
                cancel_url: `${origin}/support?canceled=true`,
            });
        } else if (planId) {
            // ── Pro subscription or lifetime one-time ───────────────────────
            const priceId = PRICE_MAP[planId];
            if (!priceId) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: `Unknown plan: ${planId}` }));
                return;
            }

            const isLifetime = planId === "lifetime";

            session = await stripe.checkout.sessions.create({
                mode: isLifetime ? "payment" : "subscription",
                line_items: [{ price: priceId, quantity: 1 }],
                client_reference_id: userId ?? undefined,
                customer_email: userEmail ?? undefined,
                metadata: { type: "pro", plan: planId },
                allow_promotion_codes: true,
                success_url: `${origin}/support?success=pro&plan=${planId}`,
                cancel_url: `${origin}/support?canceled=true`,
            });
        } else {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: "Must provide planId or donationAmount" }));
            return;
        }

        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ url: session.url }));
    } catch (err: any) {
        console.error("[Stripe Checkout] Error:", err?.type ?? "unknown", err?.code ?? "");
        res.statusCode = 500;
        res.end(JSON.stringify({ error: "Checkout failed. Please try again." }));
    }
}
