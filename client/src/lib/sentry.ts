/**
 * Sentry Error Monitoring - Client-Side Initialization
 *
 * Gracefully initializes Sentry when VITE_SENTRY_DSN is set.
 * Does nothing (zero runtime cost) when DSN is undefined (dev mode).
 *
 * To activate:
 * 1. Create a free Sentry account at https://sentry.io
 * 2. Create a React project and copy the DSN
 * 3. Set VITE_SENTRY_DSN=<your-dsn> in .env
 */

import * as Sentry from "@sentry/react";

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;

export function initSentry(): void {
    if (!SENTRY_DSN) {
        if (import.meta.env.DEV) {
            console.info("[Sentry] No DSN configured - error monitoring disabled");
        }
        return;
    }

    Sentry.init({
        dsn: SENTRY_DSN,
        environment: import.meta.env.MODE,

        // Performance: capture 20% of transactions in production
        tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,

        // Session replay: capture 10% of sessions, 100% of errored sessions
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,

        integrations: [
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration(),
        ],

        // Filter out noisy errors
        ignoreErrors: [
            // Browser extensions
            "ResizeObserver loop",
            "Non-Error exception captured",
            // Network errors (expected offline)
            "Failed to fetch",
            "Load failed",
            "NetworkError",
            // Clerk Adblocker failures
            "Clerk",
            "clerk.browser.js",
            "failed to load script",
        ],

        // Don't send PII
        sendDefaultPii: false,
    });
}

// Re-export Sentry for use in error boundaries
export { Sentry };
