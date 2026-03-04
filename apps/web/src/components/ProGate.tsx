import { ReactNode } from "react";
import { Crown, Sparkles, ArrowRight } from "lucide-react";

interface ProGateProps {
    children: ReactNode;
    featureName: string;
    fallback?: ReactNode;
    inline?: boolean;
}

export default function ProGate({ children, featureName, fallback, inline }: ProGateProps) {
    // Hardcoded to true for development/rebuild phase
    const isPremium = true;

    if (isPremium) return <>{children}</>;

    if (inline) {
        return (
            <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
          bg-gradient-to-r from-amber-500/15 to-amber-400/10
          border border-amber-400/25 text-amber-400 text-xs font-medium
          hover:border-amber-400/40 hover:from-amber-500/25 hover:to-amber-400/15
          transition-all duration-300 cursor-pointer group"
            >
                <Crown className="w-3 h-3" />
                <span>Pro</span>
            </span>
        );
    }

    return (
        <div className="relative rounded-2xl overflow-hidden">
            <div className="pointer-events-none select-none" aria-hidden="true">
                {fallback || (
                    <div className="filter blur-[6px] opacity-60">
                        {children}
                    </div>
                )}
            </div>

            <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
                <div className="relative z-20 flex flex-col items-center gap-4 p-8 max-w-sm rounded-2xl border border-amber-400/20 bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-xl shadow-2xl shadow-amber-900/10">
                    <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <Crown className="w-7 h-7 text-white" />
                        </div>
                        <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-amber-400 animate-pulse" />
                    </div>

                    <div className="text-center space-y-1.5">
                        <h3 className="text-base font-semibold text-foreground">
                            Unlock {featureName}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Upgrade to Hilal Vision Pro for advanced models, ephemeris data and historical charts.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-medium shadow-md shadow-amber-500/25">
                        <span>Upgrade Now</span>
                        <ArrowRight className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </div>
    );
}
