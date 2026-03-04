import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-background">
          <div className="flex flex-col items-center w-full max-w-2xl p-8">
            <AlertTriangle
              size={48}
              className="text-destructive mb-6 flex-shrink-0"
            />

            {this.state.error?.message?.includes("Clerk") || this.state.error?.message?.includes("clerk.browser.js") ? (
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-amber-500 mb-2">Authentication Blocked</h2>
                <p className="text-muted-foreground">
                  Our authentication service (Clerk) could not be loaded. This is usually caused by an <strong>ad-blocker</strong>, privacy extension, or network firewall.
                </p>
                <p className="text-muted-foreground mt-2">
                  Please disable your ad-blocker for <strong>moonsighting.live</strong> and reload the page to continue.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-xl mb-4">An unexpected error occurred.</h2>
                <div className="p-4 w-full rounded bg-muted overflow-auto mb-6">
                  <pre className="text-sm text-muted-foreground whitespace-break-spaces">
                    {this.state.error?.stack}
                  </pre>
                </div>
              </>
            )}

            <button
              onClick={() => window.location.reload()}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                "bg-primary text-primary-foreground",
                "hover:opacity-90 cursor-pointer"
              )}
            >
              <RotateCcw size={16} />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
