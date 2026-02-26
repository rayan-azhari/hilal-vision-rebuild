import { nodeHTTPRequestHandler } from "@trpc/server/adapters/node-http";
import { appRouter } from "../../server/appRouter.js";
import { createContext } from "../../server/_core/context.js";
import type { IncomingMessage, ServerResponse } from "http";

export const config = {
    api: {
        bodyParser: false, // Required for TRPC node-http adapter to parse the body itself
    },
};

export default async function handler(
    req: IncomingMessage & { url: string; query?: { trpc?: string | string[] } },
    res: ServerResponse
) {
    // Enable CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Request-Method", "*");
    res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST");
    res.setHeader("Access-Control-Allow-Headers", "*");

    if (req.method === "OPTIONS") {
        res.statusCode = 200;
        res.end();
        return;
    }

    // Extract TRPC path from Vercel query or URL
    let path = "";
    if (req.query && req.query.trpc) {
        path = Array.isArray(req.query.trpc) ? req.query.trpc.join("/") : req.query.trpc;
    } else {
        path = req.url.slice(1).split("?")[0].replace(/^api\/trpc\//, "");
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
        res.end(JSON.stringify({ error: { message: err?.message ?? "Internal server error", code: "INTERNAL_SERVER_ERROR" } }));
    }
}
