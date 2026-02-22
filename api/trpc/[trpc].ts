import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../../server/routers";
import type { TrpcContext } from "../../server/_core/context";
import type { IncomingMessage, ServerResponse } from "http";

/**
 * Vercel serverless function handler for tRPC API.
 * Wraps the existing appRouter using the fetch adapter.
 */
export default async function handler(
    req: IncomingMessage & { url: string },
    res: ServerResponse
) {
    // Convert Node.js IncomingMessage to a fetch Request
    const protocol = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers.host || "localhost";
    const url = new URL(req.url!, `${protocol}://${host}`);

    // Read body for non-GET requests
    let body: string | undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
        body = await new Promise<string>((resolve) => {
            let data = "";
            req.on("data", (chunk: Buffer) => (data += chunk.toString()));
            req.on("end", () => resolve(data));
        });
    }

    const fetchReq = new Request(url.toString(), {
        method: req.method,
        headers: Object.entries(req.headers).reduce<Record<string, string>>(
            (acc, [k, v]) => {
                if (v) acc[k] = Array.isArray(v) ? v.join(", ") : v;
                return acc;
            },
            {}
        ),
        body: body || undefined,
    });

    const response = await fetchRequestHandler({
        endpoint: "/api/trpc",
        req: fetchReq,
        router: appRouter,
        createContext: (): TrpcContext => ({
            // Minimal context for serverless. Auth is stubbed until a standard
            // auth provider replaces the Manus OAuth SDK.
            req: {
                headers: Object.fromEntries(
                    Object.entries(req.headers).map(([k, v]) => [
                        k,
                        Array.isArray(v) ? v.join(", ") : v,
                    ])
                ),
                socket: { remoteAddress: req.socket.remoteAddress },
            } as any,
            res: { clearCookie: () => { } } as any,
            user: null,
        }),
    });

    // Write response back to Node.js ServerResponse
    res.statusCode = response.status;
    response.headers.forEach((value, key) => {
        res.setHeader(key, value);
    });
    const responseBody = await response.text();
    res.end(responseBody);
}
