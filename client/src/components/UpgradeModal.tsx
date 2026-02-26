import React, { useEffect, useState } from "react";
import { useProTier } from "@/contexts/ProTierContext";
import { X, Crown, Check, Sparkles, Globe, Cloud, Archive, Bell, Loader2, Clock, Wind } from "lucide-react";

const PRO_FEATURES = [
    { icon: Globe, label: "Interactive 3D Globe" },
    { icon: Cloud, label: "Live Cloud Cover Overlay" },
    { icon: Wind, label: "Atmospheric Overrides (Temp, Pressure)" },
    { icon: Clock, label: "Best Time to Observe" },
    { icon: Archive, label: "Full ICOP Archive (1438–1465 AH)" },
    { icon: Bell, label: "Crescent Visibility Alerts (coming soon)" },
];

const PLANS = [
    { id: "monthly", label: "Monthly", price: "$2.99", period: "/mo", savings: null },
    { id: "annual", label: "Annual", price: "$14.99", period: "/yr", savings: "Save 58%" },
    { id: "lifetime", label: "Lifetime", price: "$49.99", period: "once", savings: "Best Value" },
] as const;

export default function UpgradeModal() {
    const { showUpgradeModal, setShowUpgradeModal, startCheckout, checkoutLoading, isPremium, isNative, getNativeOfferings, purchaseNativePackage } = useProTier();
    const [nativePackages, setNativePackages] = useState<any[]>([]);

    useEffect(() => {
        if (showUpgradeModal && isNative) {
            getNativeOfferings().then((offerings) => {
                if (offerings && offerings.availablePackages) {
                    setNativePackages(offerings.availablePackages);
                }
            });
        }
    }, [showUpgradeModal, isNative, getNativeOfferings]);

    if (!showUpgradeModal) return null;

    const handleSelectPlan = async (planId: string) => {
        if (isNative) {
            // Find the RevenueCat package that matches our standard plan IDs
            let pkgToBuy = nativePackages.find(p => p.identifier.toLowerCase().includes(planId));
            if (!pkgToBuy && nativePackages.length > 0) {
                // Fallback map if identifiers differ
                const map: Record<string, string> = { monthly: "MONTHLY", annual: "ANNUAL", lifetime: "LIFETIME" };
                pkgToBuy = nativePackages.find(p => p.packageType === map[planId]);
            }

            if (pkgToBuy) {
                const success = await purchaseNativePackage(pkgToBuy);
                if (success) setShowUpgradeModal(false);
            } else {
                alert("This package is not currently available in the app store.");
            }
        } else {
            // Web Stripe flow
            startCheckout({ planId });
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowUpgradeModal(false)}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg rounded-3xl overflow-hidden
        border border-amber-400/20 shadow-2xl shadow-amber-900/20
        bg-[var(--card)]">

                {/* Header */}
                <div className="relative px-8 pt-8 pb-6 text-center
          bg-gradient-to-b from-amber-500/10 to-transparent">
                    <button
                        onClick={() => setShowUpgradeModal(false)}
                        className="absolute top-4 right-4 p-2 rounded-xl
              text-[var(--muted-foreground)] hover:text-[var(--foreground)]
              hover:bg-[var(--secondary)] transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl
            bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30 mb-4">
                        <Crown className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-1">
                        Hilal Vision <span className="text-amber-400">Pro</span>
                    </h2>
                    <p className="text-sm text-[var(--muted-foreground)]">
                        Observatory-grade tools for serious moon observers
                    </p>
                </div>

                {/* Features */}
                <div className="px-8 py-4 space-y-2.5">
                    {PRO_FEATURES.map(({ icon: Icon, label }) => (
                        <div key={label} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center shrink-0">
                                <Icon className="w-4 h-4 text-amber-400" />
                            </div>
                            <span className="text-sm text-[var(--foreground)]">{label}</span>
                            <Check className="w-4 h-4 text-emerald-400 ml-auto shrink-0" />
                        </div>
                    ))}
                </div>

                {/* Plans */}
                <div className="px-8 py-5 grid grid-cols-3 gap-3">
                    {PLANS.map((plan) => {
                        // For native, use the real localized price if available
                        let displayPrice = plan.price;
                        if (isNative && nativePackages.length > 0) {
                            const nativePkg = nativePackages.find(p => p.identifier.toLowerCase().includes(plan.id) || p.packageType === plan.id.toUpperCase());
                            if (nativePkg) {
                                displayPrice = nativePkg.product.priceString;
                            }
                        }

                        return (
                            <button
                                key={plan.id}
                                onClick={() => handleSelectPlan(plan.id)}
                                disabled={checkoutLoading || isPremium || (isNative && nativePackages.length === 0)}
                                className={`relative flex flex-col items-center gap-1 p-4 rounded-2xl border
                    transition-all duration-300 cursor-pointer group disabled:opacity-60 disabled:cursor-not-allowed
                    ${plan.id === "annual"
                                        ? "border-amber-400/40 bg-amber-400/10 shadow-md shadow-amber-500/10"
                                        : "border-[var(--border)] hover:border-amber-400/25 hover:bg-[var(--secondary)]"
                                    }`}
                            >
                                {plan.savings && (
                                    <span className="absolute -top-2.5 px-2 py-0.5 rounded-full text-[10px] font-semibold
                      bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-sm">
                                        {plan.savings}
                                    </span>
                                )}
                                <span className="text-xs text-[var(--muted-foreground)] font-medium">{plan.label}</span>
                                <span className="text-xl font-bold text-[var(--foreground)]">{displayPrice}</span>
                                <span className="text-[10px] text-[var(--muted-foreground)]">{plan.period}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="px-8 pb-6 pt-2 text-center">
                    {checkoutLoading ? (
                        <div className="flex items-center justify-center gap-2 text-xs text-[var(--muted-foreground)]">
                            <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                            <span>{isNative ? "Processing purchase…" : "Redirecting to checkout…"}</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            <span>Sadaqah Jariyah · Secure checkout via {isNative ? "App Store / Google Play" : "Stripe"}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
