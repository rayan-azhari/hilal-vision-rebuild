import { nodeHTTPRequestHandler } from "@trpc/server/adapters/node-http";
import { appRouter } from "../server/appRouter.js";
import { createContext } from "../server/_core/context.js";
import { setCorsHeaders } from "../server/_cors.js";
import StripeCheckoutHandler from "../server/stripe/checkout.js";
import StripeWebhookHandler from "../server/stripe/webhook.js";
import RevenueCatWebhookHandler from "../server/revenuecat/webhook.js";
import PushSendHandler from "../server/push/send.js";
import CronMoonAlertsHandler from "../server/cron/moonAlerts.js";
import type { IncomingMessage, ServerResponse } from "http";

// Dynamically import the public API router (Express sub-app)
import express from "express";
import { publicApiRouter } from "../server/publicApi.js";
const v1App = express();
v1App.use(express.json());
v1App.use(express.urlencoded({ extended: true }));
v1App.use("/api/v1", publicApiRouter);

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(
    req: IncomingMessage & { url: string; query?: Record<string, string | string[]> },
    res: ServerResponse
) {
    const url = req.url || "/";

    // ─── tRPC ────────────────────────────────────────────────────────────
    if (url.startsWith("/api/trpc")) {
        // CORS
        if (setCorsHeaders(req, res, { allowHeaders: "Content-Type, Authorization" })) return;

        // Extract tRPC path
        let path: string;
        if (req.query && req.query.trpc) {
            path = Array.isArray(req.query.trpc) ? req.query.trpc.join("/") : req.query.trpc;
        } else {
            path = url.slice(1).split("?")[0].replace(/^api\/trpc\//, "");
        }

        try {
            return await nodeHTTPRequestHandler({
                router: appRouter,
                req,
                res,
                path,
                createContext: createContext as any,
            });
        } catch (err: any) {
            console.error("[tRPC handler] Unhandled error:", err);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            const procedures = path ? path.split(",") : [""];
            const errorEntry = (proc: string) => ({
                error: {
                    json: {
                        message: err?.message ?? "Internal server error",
                        code: -32603,
                        data: { code: "INTERNAL_SERVER_ERROR", httpStatus: 500, path: proc || null }
                    }
                }
            });
            res.end(JSON.stringify(procedures.map(errorEntry)));
        }
        return;
    }

    // ─── REST v1 API ─────────────────────────────────────────────────────
    if (url.startsWith("/api/v1")) {
        return v1App(req as any, res as any);
    }

    // ─── Stripe ──────────────────────────────────────────────────────────
    if (url.startsWith("/api/stripe/checkout")) {
        return StripeCheckoutHandler(req as any, res);
    }
    if (url.startsWith("/api/stripe/webhook")) {
        return StripeWebhookHandler(req as any, res);
    }

    // ─── RevenueCat ──────────────────────────────────────────────────────
    if (url.startsWith("/api/revenuecat/webhook")) {
        return RevenueCatWebhookHandler(req as any, res);
    }

    // ─── Push Notifications ──────────────────────────────────────────────
    if (url.startsWith("/api/push/send")) {
        return PushSendHandler(req as any, res);
    }

    // ─── Cron ────────────────────────────────────────────────────────────
    if (url.startsWith("/api/cron/moonAlerts")) {
        return CronMoonAlertsHandler(req, res);
    }

    // ─── Fallback ────────────────────────────────────────────────────────
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Not found" }));
}
