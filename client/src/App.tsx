import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import GlobePage from "./pages/GlobePage";
import MapPage from "./pages/MapPage";
import MoonPage from "./pages/MoonPage";
import CalendarPage from "./pages/CalendarPage";
import HorizonPage from "./pages/HorizonPage";
import ArchivePage from "./pages/ArchivePage";
import Layout from "./components/Layout";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/globe" component={GlobePage} />
        <Route path="/map" component={MapPage} />
        <Route path="/moon" component={MoonPage} />
        <Route path="/calendar" component={CalendarPage} />
        <Route path="/horizon" component={HorizonPage} />
        <Route path="/archive" component={ArchivePage} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default App;
