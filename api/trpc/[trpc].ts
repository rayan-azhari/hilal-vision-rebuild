import { nodeHTTPRequestHandler } from "@trpc/server/adapters/node-http";
import { appRouter } from "../../server/appRouter.js";
import { createContext } from "../../server/_core/context.js";
import { setCorsHeaders } from "../_cors.js";
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
    // CORS with origin whitelisting
    if (setCorsHeaders(req, res, { allowHeaders: "Content-Type, Authorization" })) return;

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
        // Build one error entry per procedure in the batch.
        // path may be "proc1,proc2" for batched requests; a single-element array
        // for a multi-procedure batch causes "Missing result" on the client side.
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
}
