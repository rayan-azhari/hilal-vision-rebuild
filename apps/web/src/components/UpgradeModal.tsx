"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { X, Crown, Check, Loader2, Sparkles, Map, Cloud } from "lucide-react";
import { toast } from "sonner";
import { useAuth, useClerk } from "@clerk/nextjs";

export function UpgradeModal() {
    const show = useAppStore((s) => s.showUpgradeModal);
    const setShow = useAppStore((s) => s.setShowUpgradeModal);
    const checkoutLoading = useAppStore((s) => s.checkoutLoading);
    const setCheckoutLoading = useAppStore((s) => s.setCheckoutLoading);

    // Auth for initiating checkout
    const { userId, getToken } = useAuth();
    const { openSignIn } = useClerk();

    const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual" | "lifetime">("annual");

    if (!show) return null;

    const handleCheckout = async () => {
        if (!userId) {
            setShow(false);
            openSignIn({ fallbackRedirectUrl: window.location.href });
            return;
        }

        setCheckoutLoading(true);
        try {
            const token = await getToken();
            const res = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ planId: selectedPlan }),
            });

            if (!res.ok) throw new Error("Checkout failed");

            const { url } = await res.json();
            if (url) window.location.href = url;
        } catch (err: any) {
            toast.error("Could not start checkout", { description: err.message });
            setCheckoutLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 backdrop-blur-md"
                style={{ background: "color-mix(in oklch, var(--space) 60%, transparent)" }}
                onClick={() => setShow(false)}
            />

            <div className="relative w-full max-w-lg bg-card border border-foreground/10 rounded-2xl shadow-2xl overflow-hidden animate-breezy-enter">
                <button
                    onClick={() => setShow(false)}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-foreground/5 text-foreground/50 hover:text-foreground transition-colors z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                <div
                    className="p-8 text-center border-b border-foreground/5"
                    style={{ background: "linear-gradient(135deg, color-mix(in oklch, var(--gold) 8%, transparent), color-mix(in oklch, var(--space-mid) 100%, transparent))" }}
                >
                    <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                        style={{ background: "var(--gold)", color: "var(--primary-foreground)" }}
                    >
                        <Crown className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-display font-bold mb-2">Hilal Vision Pro</h2>
                    <p className="text-sm text-foreground/70 max-w-[280px] mx-auto">
                        Unlock high-resolution visibility maps, 3D globes, and cloud cover overlays.
                    </p>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        {[
                            { id: "monthly", label: "Monthly", price: "$2.99", period: "/mo" },
                            { id: "annual", label: "Annual", price: "$14.99", period: "/yr", badge: "Save 58%" },
                            { id: "lifetime", label: "Lifetime", price: "$49.99", period: " once", badge: "Best Value" },
                        ].map((plan) => (
                            <button
                                key={plan.id}
                                onClick={() => setSelectedPlan(plan.id as any)}
                                className="relative flex flex-col items-center p-3 rounded-xl border-2 transition-all cursor-pointer text-left"
                                style={{
                                    borderColor: selectedPlan === plan.id ? "var(--gold)" : "var(--border)",
                                    background: selectedPlan === plan.id ? "color-mix(in oklch, var(--gold) 5%, transparent)" : "transparent"
                                }}
                            >
                                {plan.badge && (
                                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-bold whitespace-nowrap shadow-sm"
                                        style={{ background: "var(--gold)", color: "var(--primary-foreground)" }}
                                    >
                                        {plan.badge}
                                    </div>
                                )}
                                <span className="text-xs font-semibold text-foreground/60 mb-1">{plan.label}</span>
                                <span className="text-lg font-bold text-foreground leading-none">{plan.price}</span>
                                <span className="text-[10px] text-foreground/40 mt-1">{plan.period}</span>
                            </button>
                        ))}
                    </div>

                    <div className="space-y-3 mb-8">
                        {[
                            { icon: Sparkles, text: "High-resolution visibility contours" },
                            { icon: Map, text: "Interactive 3D Moon Globe" },
                            { icon: Cloud, text: "Live global cloud cover overlays" },
                        ].map((feature, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                                    style={{ background: "color-mix(in oklch, var(--gold) 15%, transparent)", color: "var(--gold)" }}
                                >
                                    <Check className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-sm font-medium text-foreground/80">{feature.text}</span>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleCheckout}
                        disabled={checkoutLoading}
                        className="w-full flex items-center justify-center p-3 rounded-xl font-bold transition-all hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:hover:scale-100"
                        style={{ background: "var(--gold)", color: "var(--primary-foreground)" }}
                    >
                        {checkoutLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            "Continue to Checkout"
                        )}
                    </button>
                    <p className="text-[11px] text-center text-foreground/40 mt-3">
                        Secure payment processing by Stripe. Cancel anytime.
                    </p>
                </div>
            </div>
        </div>
    );
}
