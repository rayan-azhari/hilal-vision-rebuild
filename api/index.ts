import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../server/appRouter.js";
import { createContext } from "../server/_core/context.js";
import { publicApiRouter } from "../server/publicApi.js";
import StripeCheckoutHandler from "../server/stripe/checkout.js";
import StripeWebhookHandler from "../server/stripe/webhook.js";
import RevenueCatWebhookHandler from "../server/revenuecat/webhook.js";
import PushSendHandler from "../server/push/send.js";
import CronMoonAlertsHandler from "../server/cron/moonAlerts.js";

const app = express();

// Configure body parser with reasonable size limit
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// tRPC API
app.use(
    "/api/trpc",
    createExpressMiddleware({
        router: appRouter,
        createContext: createContext as any,
    })
);

// REST v1 API
app.use("/api/v1", publicApiRouter);

// Raw webhooks / standalone routes
app.all("/api/stripe/checkout", StripeCheckoutHandler as any);
app.all("/api/stripe/webhook", StripeWebhookHandler as any);
app.all("/api/revenuecat/webhook", RevenueCatWebhookHandler as any);
app.all("/api/push/send", PushSendHandler as any);
app.all("/api/cron/moonAlerts", CronMoonAlertsHandler as any);

export default app;
