import type { ServerResponse, IncomingMessage } from "http";

const ALLOWED_ORIGINS = [
    "https://moonsighting.live",
    "https://www.moonsighting.live",
    "https://moon-dashboard-one.vercel.app",
    "https://localhost",          // Capacitor Android WebView
    "capacitor://localhost",     // Capacitor iOS WebView
    "http://localhost:3000",     // Local dev
    "http://localhost:5173",     // Vite dev
];

/**
 * Set CORS headers with origin whitelisting.
 * Returns true if this was a preflight OPTIONS request (caller should return early).
 */
export function setCorsHeaders(
    req: IncomingMessage,
    res: ServerResponse,
    { allowMethods = "OPTIONS, GET, POST", allowHeaders = "Content-Type" } = {}
): boolean {
    const origin = req.headers.origin as string | undefined;

    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Vary", "Origin");
    }
    // If origin is not in the list, we simply don't set the header — browser blocks the request.

    res.setHeader("Access-Control-Allow-Methods", allowMethods);
    res.setHeader("Access-Control-Allow-Headers", allowHeaders);

    if (req.method === "OPTIONS") {
        res.statusCode = 204;
        res.end();
        return true;
    }

    return false;
}
