import { ClerkProvider } from "@clerk/clerk-react";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Layout from "./components/Layout";
import { lazy, Suspense } from "react";
import { Sentry } from "@/lib/sentry";

// ─── Lazy-loaded pages (code splitting) ─────────────────────────────────────
// Globe.gl + Three.js + Leaflet + D3 + Recharts are heavy.
// Lazy-loading ensures only the Home page JS ships in the initial bundle.
const Home = lazy(() => import("./pages/Home"));
const VisibilityPage = lazy(() => import("./pages/VisibilityPage"));
const MoonPage = lazy(() => import("./pages/MoonPage"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const HorizonPage = lazy(() => import("./pages/HorizonPage"));
const ArchivePage = lazy(() => import("./pages/ArchivePage"));

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
        <span className="text-sm text-zinc-500 tracking-wide">Loading…</span>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/visibility" component={VisibilityPage} />
          <Route path="/globe" component={VisibilityPage} />
          <Route path="/map" component={VisibilityPage} />
          <Route path="/moon" component={MoonPage} />
          <Route path="/calendar" component={CalendarPage} />
          <Route path="/horizon" component={HorizonPage} />
          <Route path="/archive" component={ArchivePage} />
          <Route path="/404" component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </Layout>
  );
}

function App() {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error }) => (
        <div className="flex items-center justify-center min-h-screen bg-[oklch(0.06_0.02_265)]">
          <div className="text-center p-8 max-w-md">
            <h1 className="text-2xl font-bold text-amber-400 mb-4">Something went wrong</h1>
            <p className="text-zinc-400 mb-6">An unexpected error occurred. Please refresh the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-amber-400/20 border border-amber-400/30 rounded-lg text-amber-400 hover:bg-amber-400/30 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )}
    >
      <HelmetProvider>
        <ErrorBoundary>
          <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
            <ThemeProvider defaultTheme="dark" switchable>
              <TooltipProvider>
                <Toaster
                  theme="dark"
                  toastOptions={{
                    style: {
                      background: "oklch(0.10 0.018 265)",
                      border: "1px solid oklch(0.78 0.15 75 / 0.2)",
                      color: "oklch(0.93 0.01 80)",
                    },
                  }}
                />
                <Router />
              </TooltipProvider>
            </ThemeProvider>
          </ClerkProvider>
        </ErrorBoundary>
      </HelmetProvider>
    </Sentry.ErrorBoundary>
  );
}

export default App;

