import React, { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useProTier } from "@/contexts/ProTierContext";
import { Crown, Sparkles, ArrowRight } from "lucide-react";

interface ProGateProps {
    /** Content shown to Pro users */
    children: ReactNode;
    /** Short label for what this feature is, e.g. "3D Globe Interaction" */
    featureName: string;
    /** Optional: content to show free users instead of default blur overlay */
    fallback?: ReactNode;
    /** If true, show a compact inline badge instead of the full overlay */
    inline?: boolean;
}

/**
 * ProGate — Soft paywall wrapper.
 *
 * Wraps premium content. Free users see a blurred preview with an upgrade prompt.
 * Pro users see the content normally.
 */
export default function ProGate({ children, featureName, fallback, inline }: ProGateProps) {
    const { t } = useTranslation();
    const { isPremium, setShowUpgradeModal } = useProTier();

    if (isPremium) return <>{children}</>;

    // ── Inline mode: small badge next to a label ──────────────────────────
    if (inline) {
        return (
            <span
                onClick={(e) => {
                    e.stopPropagation();
                    setShowUpgradeModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
          bg-gradient-to-r from-amber-500/15 to-amber-400/10
          border border-amber-400/25 text-amber-400 text-xs font-medium
          hover:border-amber-400/40 hover:from-amber-500/25 hover:to-amber-400/15
          transition-all duration-300 cursor-pointer group"
            >
                <Crown className="w-3 h-3" />
                <span>{t("proGate.pro")}</span>
            </span>
        );
    }

    // ── Full overlay mode ─────────────────────────────────────────────────
    return (
        <div className="relative rounded-2xl overflow-hidden">
            {/* Blurred preview of the actual content */}
            <div className="pointer-events-none select-none" aria-hidden="true">
                {fallback || (
                    <div className="filter blur-[6px] opacity-60">
                        {children}
                    </div>
                )}
            </div>

            {/* Upgrade overlay */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
                <div
                    className="absolute inset-0
            bg-gradient-to-t from-[var(--background)] via-[var(--background)]/80 to-transparent"
                />
                <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="relative z-20 flex flex-col items-center gap-4 p-8 max-w-sm
            rounded-2xl border border-amber-400/20
            bg-gradient-to-br from-[var(--card)]/95 to-[var(--card)]/80
            backdrop-blur-xl shadow-2xl shadow-amber-900/10
            hover:border-amber-400/40 hover:shadow-amber-900/20
            transition-all duration-500 group cursor-pointer"
                >
                    {/* Icon */}
                    <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600
              flex items-center justify-center shadow-lg shadow-amber-500/20
              group-hover:shadow-amber-500/40 transition-shadow duration-500">
                            <Crown className="w-7 h-7 text-white" />
                        </div>
                        <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-amber-400 animate-pulse" />
                    </div>

                    {/* Text */}
                    <div className="text-center space-y-1.5">
                        <h3 className="text-base font-semibold text-[var(--foreground)]">
                            {t("proGate.unlock", { featureName })}
                        </h3>
                        <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                            {t("proGate.upgradeDesc1")} <span className="text-amber-400 font-medium">{t("proGate.hilalVisionPro")}</span> {t("proGate.upgradeDesc2")}
                        </p>
                    </div>

                    {/* CTA */}
                    <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl
            bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-medium
            group-hover:from-amber-400 group-hover:to-amber-500
            transition-all duration-300 shadow-md shadow-amber-500/25">
                        <span>{t("proGate.upgradeButton")}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>

                    {/* Price hint */}
                    <p className="text-xs text-[var(--muted-foreground)]">
                        {t("proGate.priceHint")}
                    </p>
                </button>
            </div>
        </div>
    );
}
