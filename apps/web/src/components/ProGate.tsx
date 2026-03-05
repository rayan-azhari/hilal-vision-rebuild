"use client";

import { useAppStore } from "@/store/useAppStore";
import { Lock, Sparkles } from "lucide-react";

interface ProGateProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    featureName?: string;
}

export function ProGate({ children, fallback, featureName = "This feature" }: ProGateProps) {
    const clerkHasPro = useAppStore((s) => s.clerkHasPro);
    const nativeHasPro = useAppStore((s) => s.nativeHasPro);
    const isAdmin = useAppStore((s) => s.isAdmin);
    const setShowUpgradeModal = useAppStore((s) => s.setShowUpgradeModal);

    const TESTING_DISABLE_PRO_GATE = false;
    const isPremium = TESTING_DISABLE_PRO_GATE || clerkHasPro || nativeHasPro || isAdmin;

    if (isPremium) {
        return <>{children}</>;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    // Default Pro Gate blur overlay
    return (
        <div className="relative group rounded-2xl overflow-hidden w-full h-full min-h-[160px]">
            {/* Blurred background content */}
            <div className="absolute inset-0 filter blur-md opacity-40 select-none pointer-events-none transition-all group-hover:blur-lg">
                {children}
            </div>

            {/* Lock Overlay */}
            <div
                className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
                style={{ background: "color-mix(in oklch, var(--space) 40%, transparent)" }}
            >
                <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-lg"
                    style={{
                        background: "color-mix(in oklch, var(--gold) 15%, transparent)",
                        border: "1px solid color-mix(in oklch, var(--gold) 30%, transparent)",
                        color: "var(--gold)",
                    }}
                >
                    <Lock className="w-5 h-5" />
                </div>
                <h4 className="font-display font-bold text-lg mb-1">{featureName} is Pro</h4>
                <p className="text-sm text-foreground/60 mb-4 max-w-[250px]">
                    Upgrade to Hilal Vision Pro to unlock advanced predictions and features.
                </p>
                <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-transform hover:scale-105 shadow-md"
                    style={{
                        background: "var(--gold)",
                        color: "var(--primary-foreground)",
                        boxShadow: "0 0 16px color-mix(in oklch, var(--gold) 30%, transparent)",
                    }}
                >
                    <Sparkles className="w-4 h-4" />
                    Upgrade to Pro
                </button>
            </div>
        </div>
    );
}
