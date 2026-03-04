/**
 * Hilal Vision — Service Worker
 *
 * Caching strategies:
 * - App shell (HTML, CSS, JS): Cache-first with network update
 * - Static assets (images, fonts): Cache-first (long TTL)
 * - API calls (/api/trpc/*): Network-first with cache fallback
 * - Map tiles: Cache-first (30-day TTL)
 * - Weather API: Network-first (30-min cache)
 */

const CACHE_NAME = "hilal-vision-v2";
const STATIC_CACHE = "hilal-static-v1";
const API_CACHE = "hilal-api-v1";
const TILES_CACHE = "hilal-tiles-v1";

// App shell files to precache on install
const APP_SHELL = [
    "/",
    "/manifest.json",
    "/og-default.png",
];

// ─── Install: cache app shell ─────────────────────────────────────────────────
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(APP_SHELL).catch((err) => {
                console.warn("[SW] Failed to precache some resources:", err);
            });
        })
    );
    // Activate immediately without waiting for tabs to close
    self.skipWaiting();
});

// ─── Activate: clean up old caches ───────────────────────────────────────────
self.addEventListener("activate", (event) => {
    const currentCaches = [CACHE_NAME, STATIC_CACHE, API_CACHE, TILES_CACHE];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => !currentCaches.includes(name))
                    .map((name) => caches.delete(name))
            );
        })
    );
    // Take control of all open tabs immediately
    self.clients.claim();
});

// ─── Fetch: route requests to appropriate cache strategy ──────────────────────
self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);

    // Skip non-GET requests
    if (event.request.method !== "GET") return;

    // Skip chrome-extension and other non-http(s) requests
    if (!url.protocol.startsWith("http")) return;

    // API calls: bypass service worker entirely — dynamic data should never
    // be cached or timeout-wrapped. Eliminates synthetic offline errors and
    // superjson format mismatch crashes during Vercel cold starts.
    if (url.pathname.startsWith("/api/")) return;

    // Map tiles: Cache-first
    if (url.hostname.includes("basemaps.cartocdn.com")) {
        event.respondWith(cacheFirst(event.request, TILES_CACHE));
        return;
    }

    // Google Fonts: Cache-first
    if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
        event.respondWith(cacheFirst(event.request, STATIC_CACHE));
        return;
    }

    // Open-Meteo Weather: Network-first (short cache)
    if (url.hostname === "api.open-meteo.com") {
        event.respondWith(networkFirst(event.request, API_CACHE, 15000));
        return;
    }

    // Everything else (app shell, JS, CSS, images): Stale-while-revalidate
    event.respondWith(staleWhileRevalidate(event.request, CACHE_NAME));
});

// ─── Cache strategies ─────────────────────────────────────────────────────────

/** Try cache first; if miss, fetch from network and cache */
async function cacheFirst(request, cacheName) {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        // Offline and not in cache
        return new Response("Offline", { status: 503 });
    }
}

/** Try network first; if timeout/error, fall back to cache */
async function networkFirst(request, cacheName, timeoutMs) {
    try {
        const response = await Promise.race([
            fetch(request),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error("timeout")), timeoutMs)
            ),
        ]);
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        const cached = await caches.match(request);
        if (cached) return cached;

        // Return a valid tRPC batch error so superjson.deserialize() succeeds on the client
        const url = new URL(request.url);
        const isApiCall = url.pathname.startsWith("/api/");

        let body;
        if (isApiCall) {
            let numProcedures = 1;
            if (url.pathname.startsWith("/api/trpc/")) {
                const trpcPath = url.pathname.replace("/api/trpc/", "");
                if (trpcPath) {
                    numProcedures = trpcPath.split(",").length;
                }
            }
            const errorObj = { error: { json: { message: "You appear to be offline. Please check your connection.", code: -32603, data: { code: "INTERNAL_SERVER_ERROR", httpStatus: 503, path: null } } } };
            body = JSON.stringify(Array(numProcedures).fill(errorObj));
        } else {
            body = '{"error":"offline"}';
        }
        return new Response(body, {
            status: 503,
            headers: { "Content-Type": "application/json" },
        });
    }
}

/** Return cached response immediately, update cache in background */
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    // Revalidate in background
    const networkPromise = fetch(request)
        .then((response) => {
            if (response.ok) {
                cache.put(request, response.clone());
            }
            return response;
        })
        .catch(() => null);

    // Return cached version immediately, or wait for network
    return cached || (await networkPromise) || new Response("Offline", { status: 503 });
}
