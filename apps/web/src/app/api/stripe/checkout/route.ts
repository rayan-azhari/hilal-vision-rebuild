import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2023-10-16" as any,
});

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { planId, donationAmount } = body;

        let line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

        if (planId) {
            // Subscription plans mapping
            const plans: Record<string, string> = {
                monthly: process.env.STRIPE_MONTHLY_PRICE_ID || "price_monthly",
                annual: process.env.STRIPE_ANNUAL_PRICE_ID || "price_annual",
                lifetime: process.env.STRIPE_LIFETIME_PRICE_ID || "price_lifetime",
            };

            const priceId = plans[planId];
            if (!priceId) {
                return new NextResponse("Invalid planId", { status: 400 });
            }

            line_items = [
                {
                    price: priceId,
                    quantity: 1,
                },
            ];
        } else if (donationAmount) {
            // One-time donation mapping (cents)
            line_items = [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: "Hilal Vision Supporter Donation",
                        },
                        unit_amount: parseInt(donationAmount, 10) * 100,
                    },
                    quantity: 1,
                },
            ];
        } else {
            return new NextResponse("Missing planId or donationAmount", { status: 400 });
        }

        const email = user.emailAddresses[0]?.emailAddress;

        const session = await stripe.checkout.sessions.create({
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/visibility?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/visibility?canceled=true`,
            customer_email: email,
            payment_method_types: ["card"],
            mode: planId && planId !== "lifetime" ? "subscription" : "payment",
            billing_address_collection: "auto",
            line_items,
            metadata: {
                userId,
                planId: planId || "donation",
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error("[STRIPE_CHECKOUT]", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}
