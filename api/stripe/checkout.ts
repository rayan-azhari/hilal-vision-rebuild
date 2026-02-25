import Stripe from "stripe";
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
    // CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "OPTIONS, POST");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.statusCode = 200;
        res.end();
        return;
    }

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

    const { planId, donationAmount, userId, userEmail } = body;
    const origin = req.headers.origin ?? req.headers.referer ?? "https://hilalvision.com";

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
        console.error("[Stripe Checkout]", err);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message ?? "Stripe error" }));
    }
}
