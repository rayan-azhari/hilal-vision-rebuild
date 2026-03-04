import React, { useEffect, useRef } from "react";
import { useProTier } from "@/contexts/ProTierContext";
import { X, Crown, Check, Sparkles, Globe, Cloud, Archive, Bell, Loader2, Clock, Wind } from "lucide-react";
import { usePlanSelection } from "@/hooks/usePlanSelection";
import { useTranslation } from "react-i18next";

const PRO_FEATURE_KEYS = [
    { icon: Globe,   key: "globe" },
    { icon: Cloud,   key: "cloud" },
    { icon: Wind,    key: "atmo" },
    { icon: Clock,   key: "bestTime" },
    { icon: Archive, key: "archive" },
    { icon: Bell,    key: "alerts" },
] as const;

const PLAN_IDS = ["monthly", "annual", "lifetime"] as const;
const PLAN_PRICES: Record<string, string> = {
    monthly: "$2.99",
    annual:  "$14.99",
    lifetime: "$49.99",
};
const PLAN_PERIOD_KEYS: Record<string, string> = {
    monthly:  "perMo",
    annual:   "perYr",
    lifetime: "once",
};
const PLAN_SAVINGS_KEYS: Record<string, string | null> = {
    monthly:  null,
    annual:   "save58",
    lifetime: "bestValue",
};

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function UpgradeModal() {
    const { showUpgradeModal, setShowUpgradeModal, checkoutLoading, isPremium, isNative } = useProTier();
    const { nativePackages, handleSelectPlan } = usePlanSelection(() => setShowUpgradeModal(false));
    const { t } = useTranslation();
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    // Focus close button when modal opens
    useEffect(() => {
        if (showUpgradeModal) {
            setTimeout(() => closeButtonRef.current?.focus(), 0);
        }
    }, [showUpgradeModal]);

    // Escape key + focus trap
    useEffect(() => {
        if (!showUpgradeModal) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setShowUpgradeModal(false);
                return;
            }
            if (e.key !== "Tab") return;

            const modal = modalRef.current;
            if (!modal) return;
            const focusable = Array.from(modal.querySelectorAll<HTMLElement>(FOCUSABLE));
            if (focusable.length === 0) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [showUpgradeModal, setShowUpgradeModal]);

    if (!showUpgradeModal) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowUpgradeModal(false)}
                aria-hidden="true"
            />

            {/* Modal */}
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="upgrade-modal-title"
                className="relative w-full max-w-lg rounded-3xl overflow-hidden
        border border-amber-400/20 shadow-2xl shadow-amber-900/20
        bg-[var(--card)]"
            >

                {/* Header */}
                <div className="relative px-8 pt-8 pb-6 text-center
          bg-gradient-to-b from-amber-500/10 to-transparent">
                    <button
                        ref={closeButtonRef}
                        onClick={() => setShowUpgradeModal(false)}
                        aria-label={t("modal.closeModal")}
                        className="absolute top-4 right-4 p-2 rounded-xl
              text-[var(--muted-foreground)] hover:text-[var(--foreground)]
              hover:bg-[var(--secondary)] transition-colors"
                    >
                        <X className="w-5 h-5" aria-hidden="true" />
                    </button>

                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl
            bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30 mb-4">
                        <Crown className="w-8 h-8 text-white" aria-hidden="true" />
                    </div>
                    <h2 id="upgrade-modal-title" className="text-2xl font-semibold text-[var(--foreground)] mb-1">
                        Hilal Vision <span className="text-amber-400">Pro</span>
                    </h2>
                    <p className="text-sm text-[var(--muted-foreground)]">
                        {t("modal.proSubtitle")}
                    </p>
                </div>

                {/* Features */}
                <div className="px-8 py-4 space-y-2.5">
                    {PRO_FEATURE_KEYS.map(({ icon: Icon, key }) => (
                        <div key={key} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center shrink-0">
                                <Icon className="w-4 h-4 text-amber-400" aria-hidden="true" />
                            </div>
                            <span className="text-sm text-[var(--foreground)]">{t(`modal.features.${key}`)}</span>
                            <Check className="w-4 h-4 text-emerald-400 ml-auto shrink-0" aria-hidden="true" />
                        </div>
                    ))}
                </div>

                {/* Plans */}
                <div className="px-8 py-5 grid grid-cols-3 gap-3">
                    {isNative && nativePackages.length === 0 && (
                        <div className="col-span-3 flex items-center justify-center gap-2 py-4 text-xs" style={{ color: "var(--muted-foreground)" }}>
                            <Loader2 className="w-4 h-4 animate-spin text-amber-400" aria-hidden="true" />
                            <span>{t("modal.loadingPrices")}</span>
                        </div>
                    )}
                    {PLAN_IDS.map((planId) => {
                        const savingsKey = PLAN_SAVINGS_KEYS[planId];
                        const periodKey = PLAN_PERIOD_KEYS[planId];

                        // For native, use the real localized price if available
                        let displayPrice = PLAN_PRICES[planId];
                        if (isNative && nativePackages.length > 0) {
                            const nativePkg = nativePackages.find(p => p.identifier.toLowerCase().includes(planId) || p.packageType === planId.toUpperCase());
                            if (nativePkg) {
                                displayPrice = nativePkg.product.priceString;
                            }
                        }

                        return (
                            <button
                                key={planId}
                                onClick={() => handleSelectPlan(planId)}
                                disabled={checkoutLoading || isPremium || (isNative && nativePackages.length === 0)}
                                aria-label={`${t(`modal.plans.${planId}`)} — ${displayPrice} ${t(`modal.plans.${periodKey}`)}`}
                                className={`relative flex flex-col items-center gap-1 p-4 rounded-2xl border
                    transition-all duration-300 cursor-pointer group disabled:opacity-60 disabled:cursor-not-allowed
                    ${planId === "annual"
                                        ? "border-amber-400/40 bg-amber-400/10 shadow-md shadow-amber-500/10"
                                        : "border-[var(--border)] hover:border-amber-400/25 hover:bg-[var(--secondary)]"
                                    }`}
                            >
                                {savingsKey && (
                                    <span className="absolute -top-2.5 px-2 py-0.5 rounded-full text-[10px] font-semibold
                      bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-sm" aria-hidden="true">
                                        {t(`modal.plans.${savingsKey}`)}
                                    </span>
                                )}
                                <span className="text-xs text-[var(--muted-foreground)] font-medium" aria-hidden="true">{t(`modal.plans.${planId}`)}</span>
                                <span className="text-xl font-bold text-[var(--foreground)]" aria-hidden="true">{displayPrice}</span>
                                <span className="text-[10px] text-[var(--muted-foreground)]" aria-hidden="true">{t(`modal.plans.${periodKey}`)}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="px-8 pb-6 pt-2 text-center">
                    {checkoutLoading ? (
                        <div className="flex items-center justify-center gap-2 text-xs text-[var(--muted-foreground)]">
                            <Loader2 className="w-3 h-3 animate-spin text-amber-400" aria-hidden="true" />
                            <span>{isNative ? t("modal.processingPurchase") : t("modal.redirectCheckout")}</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                            <Sparkles className="w-3 h-3 text-amber-400" aria-hidden="true" />
                            <span>{isNative ? t("modal.sadaqahNative") : t("modal.sadaqahStripe")}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
