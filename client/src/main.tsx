// Initialize error monitoring first (before any other imports)
import { initSentry, Sentry } from "@/lib/sentry";
initSentry();

import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { Capacitor } from "@capacitor/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import "leaflet/dist/leaflet.css";
import "./index.css";
import "@/lib/i18n";

// On native (Android/iOS) the WebView origin is capacitor://localhost,
// so relative URLs like /api/trpc would resolve to https://localhost/api/trpc.
// Use the absolute production URL instead.
const API_BASE = Capacitor.isNativePlatform()
  ? "https://moon-dashboard-one.vercel.app"
  : "";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevents serverless function invocation spikes when users switch tabs
      retry: (failureCount, error) => {
        // Retry transient server errors (non-JSON 500s) up to 2 times
        if (error instanceof TRPCClientError && error.message.includes("is not valid JSON")) {
          return failureCount < 2;
        }
        return false;
      },
    },
  },
});

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  // On native, navigate to the Hosted URL so the user can sign in.
  // On web, redirect to root so the modal triggers.
  window.location.href = Capacitor.isNativePlatform() ? "https://moon-dashboard-one.vercel.app" : "/";
};

const isTransientServerError = (err: unknown) =>
  err instanceof TRPCClientError && (
    err.message.includes("is not valid JSON") ||
    err.message.includes("Server error") ||
    err.message.includes("INTERNAL_SERVER_ERROR")
  );

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    if (!isTransientServerError(error)) Sentry.captureException(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    Sentry.captureException(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${API_BASE}/api/trpc`,
      transformer: superjson,
      async fetch(input, init) {
        // Native WebView origin is https://localhost, which is cross-origin vs the
        // Vercel API. "include" + "Allow-Origin: *" is a CORS violation that causes
        // every request to fail with "You appear to be offline". Native auth goes
        // through Clerk tokens/headers, not browser cookies, so "omit" is correct.
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: Capacitor.isNativePlatform() ? "omit" : "include",
        });
        // NOTE: Non-JSON error wrapping (for Vercel cold-start HTML 500s) is handled
        // server-side in api/index.ts catch block. Do NOT re-wrap here — doing so
        // creates a second location that must match superjson's expected format.
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);

// Register service worker for offline support (production only)
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.info("[SW] Registered, scope:", reg.scope);
        // Check for updates every 60 minutes
        setInterval(() => reg.update(), 60 * 60 * 1000);
      })
      .catch((err) => console.warn("[SW] Registration failed:", err));
  });
}
