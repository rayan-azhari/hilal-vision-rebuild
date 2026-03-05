import { NextResponse } from "next/server";
import Stripe from "stripe";
import { clerkClient } from "@clerk/nextjs/server";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    // @ts-expect-error - The Stripe SDK's types may require a newer API version string than "2023-10-16", but this version is known to work with the codebase.
    apiVersion: "2023-10-16",
});

export async function POST(req: Request) {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET || ""
        );
    } catch (error: unknown) {
        return new NextResponse(`Webhook Error: ${error instanceof Error ? error.message : "Unknown error"}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    // Retrieve userId mapped to the checkout session
    const userId = session?.metadata?.userId;

    if (!userId) {
        return new NextResponse("Webhook error: Missing metadata", { status: 400 });
    }

    try {
        const clerk = await clerkClient();

        switch (event.type) {
            case "checkout.session.completed":
                const amountTotal = session.amount_total || 0;
                const isProPlan = ["monthly", "annual", "lifetime"].includes(
                    session.metadata?.planId || ""
                );

                // Donations > $10 unlock `isPatron`
                const isPatron = !isProPlan && amountTotal >= 1000;

                let publicMetadata: Record<string, unknown> = {};

                if (isProPlan) {
                    publicMetadata = { ...publicMetadata, isPro: true };
                }

                if (isPatron) {
                    publicMetadata = { ...publicMetadata, isPatron: true };
                }

                if (Object.keys(publicMetadata).length > 0) {
                    await clerk.users.updateUserMetadata(userId, {
                        publicMetadata,
                    });
                }
                break;

            case "customer.subscription.deleted":
                // Revoke Pro status when subscription is canceled/expired
                // We would actually fetch the user metadata and merge it,
                // but since Pro is the only subscription type, we just set it false
                await clerk.users.updateUserMetadata(userId, {
                    publicMetadata: {
                        isPro: false,
                    },
                });
                break;

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        return new NextResponse("Webhook received successfully", { status: 200 });

    } catch (error: unknown) {
        console.error("[STRIPE_WEBHOOK]", error);
        return new NextResponse(`Webhook handler failed: ${error instanceof Error ? error.message : "Unknown error"}`, { status: 500 });
    }
}
