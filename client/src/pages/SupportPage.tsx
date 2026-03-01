import { SEO } from "@/components/SEO";
import { PageHeader } from "@/components/PageHeader";
import { Link, useLocation } from "wouter";
import React, { useEffect, useState } from "react";
import {
    Heart,
    Crown,
    Check,
    X,
    Sparkles,
    Globe,
    Moon,
    Calendar,
    Archive,
    Compass,
    Map,
    Eye,
    Clock,
    Bell,
    Ban,
    Zap,
    Star,
    Loader2,
    PartyPopper,
} from "lucide-react";
import { useProTier } from "@/contexts/ProTierContext";
import { usePlanSelection } from "@/hooks/usePlanSelection";

/* ─── Feature Access Matrix ────────────────────────────────────────────── */

const FEATURE_MATRIX: Array<{
    feature: string;
    icon: React.ElementType;
    free: string;
    pro: string;
    freeOk: boolean;
}> = [
        { feature: "2D Visibility Map", icon: Map, free: "Full access", pro: "Full access", freeOk: true },
        { feature: "3D Interactive Globe", icon: Globe, free: "Locked", pro: "Full interactive", freeOk: false },
        { feature: "Moon Phase (Basic)", icon: Moon, free: "Illumination, age, phase", pro: "Full dashboard", freeOk: true },
        { feature: "Sun & Moon Altitude Chart", icon: Clock, free: "Full access", pro: "Full access", freeOk: true },
        { feature: "Sky Dome", icon: Eye, free: "Blurred preview", pro: "Full interactive", freeOk: false },
        { feature: "Ephemeris Data", icon: Clock, free: "Blurred preview", pro: "Sunrise, sunset, moonrise, moonset", freeOk: false },
        { feature: "Hijri Calendar (Umm al-Qura)", icon: Calendar, free: "Full access", pro: "Full access", freeOk: true },
        { feature: "Astronomical & Tabular Engines", icon: Sparkles, free: "Locked", pro: "All 3 calendar engines", freeOk: false },
        { feature: "ICOP Archive (Recent 3 years)", icon: Archive, free: "1463-1465 AH", pro: "Full 1438-1465 AH", freeOk: true },
        { feature: "ICOP Archive (Historical)", icon: Archive, free: "Locked", pro: "28 years of data", freeOk: false },
        { feature: "Horizon View", icon: Compass, free: "Full access", pro: "Full access", freeOk: true },
        { feature: "Sighting Reports", icon: Star, free: "Submit freely", pro: "Submit + Patron badge", freeOk: true },
        { feature: "Push Notifications", icon: Bell, free: "None", pro: "Crescent alerts", freeOk: false },
        { feature: "Ad-Free Experience", icon: Ban, free: "Ethical ads", pro: "Fully ad-free", freeOk: false },
    ];

/* ─── Pricing Plans ────────────────────────────────────────────────────── */

const PLANS = [
    {
        id: "monthly",
        name: "Monthly",
        price: "$2.99",
        period: "/month",
        desc: "Try Pro with no commitment",
        savings: null,
        popular: false,
    },
    {
        id: "annual",
        name: "Annual",
        price: "$14.99",
        period: "/year",
        desc: "Best recurring value",
        savings: "Save 58%",
        popular: true,
    },
    {
        id: "lifetime",
        name: "Lifetime",
        price: "$49.99",
        period: "one-time",
        desc: "Unlock forever — the Astronomer plan",
        savings: "Best Value",
        popular: false,
    },
];

/* ─── Page ─────────────────────────────────────────────────────────────── */

export default function SupportPage() {
    const { isPremium, setShowUpgradeModal, startCheckout, checkoutLoading, isNative } = useProTier();
    const { nativePackages, handleSelectPlan } = usePlanSelection();
    const [location] = useLocation();

    // Parse success / cancel from Stripe redirect query params
    const params = new URLSearchParams(window.location.search);
    const successType = params.get("success"); // "pro" | "donated"
    const canceled = params.get("canceled") === "true";
    const [banner, setBanner] = useState<"pro" | "donated" | "canceled" | null>(
        successType === "pro" ? "pro" : successType === "donated" ? "donated" : canceled ? "canceled" : null
    );

    // Auto-dismiss banner after 6 seconds
    useEffect(() => {
        if (!banner) return;
        const t = setTimeout(() => setBanner(null), 6000);
        return () => clearTimeout(t);
    }, [banner]);

    return (
        <div className="min-h-screen" style={{ background: "var(--space)" }}>
            <SEO
                title="Support Hilal Vision"
                description="Support Hilal Vision's mission to bridge ancient lunar tradition with modern astronomy. Explore Pro features or contribute as Sadaqah Jariyah."
                path="/support"
            />

            {/* ── Toast banners for Stripe redirect returns ─────────────────── */}
            {banner && (
                <div
                    className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold transition-all"
                    style={{
                        background: banner === "canceled"
                            ? "color-mix(in oklch, var(--space-mid) 90%, transparent)"
                            : "linear-gradient(135deg, var(--gold-glow), var(--gold))",
                        color: banner === "canceled" ? "var(--muted-foreground)" : "var(--space)",
                        border: "1px solid color-mix(in oklch, var(--gold) 30%, transparent)",
                    }}
                >
                    {banner === "pro" && <><PartyPopper className="w-4 h-4" /> Welcome to Hilal Vision Pro! جزاك الله خيراً 🌙</>}
                    {banner === "donated" && <><Heart className="w-4 h-4" /> Thank you for your donation! جزاك الله خيراً 🤲</>}
                    {banner === "canceled" && <>Payment canceled — no charge was made.</>}
                    <button onClick={() => setBanner(null)} className="ml-2 opacity-60 hover:opacity-100">
                        <X className="w-3 h-3" />
                    </button>
                </div>
            )}

            {/* ── Hero ─────────────────────────────────────────────────────── */}
            <section
                className="relative overflow-hidden"
                style={{
                    background:
                        "radial-gradient(ellipse 80% 50% at 50% 0%, oklch(0.15 0.06 75) 0%, var(--space) 70%)",
                    paddingTop: "64px",
                    paddingBottom: "80px",
                }}
            >
                <div className="absolute inset-0 star-field opacity-40 pointer-events-none" />
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border opacity-5 pointer-events-none"
                    style={{ width: "600px", height: "600px", borderColor: "var(--gold)" }}
                />

                <div className="container relative z-10 max-w-3xl text-center">
                    <div
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                        style={{
                            background: "color-mix(in oklch, var(--gold) 10%, transparent)",
                            border: "1px solid color-mix(in oklch, var(--gold) 25%, transparent)",
                        }}
                    >
                        <Heart className="w-4 h-4" style={{ color: "var(--gold)" }} />
                        <span className="text-xs font-semibold" style={{ color: "var(--gold)" }}>
                            صدقة جارية — Sadaqah Jariyah
                        </span>
                    </div>

                    <h1
                        className="text-4xl md:text-5xl font-light tracking-tight mb-6 leading-tight"
                        style={{ color: "var(--foreground)" }}
                    >
                        Help Keep Hilal Vision
                        <br />
                        <span style={{ color: "var(--gold)" }}>Accessible to All</span>
                    </h1>
                    <p
                        className="text-base leading-relaxed font-light max-w-xl mx-auto mb-8"
                        style={{ color: "var(--muted-foreground)" }}
                    >
                        Hilal Vision serves 1.8 billion Muslims who rely on the lunar calendar. Your support —
                        whether through Pro or a one-time contribution — helps keep the platform running,
                        accurate, and ad-free. In the Islamic tradition, supporting beneficial knowledge is
                        considered <em className="font-arabic" style={{ color: "var(--gold-dim)" }}>صدقة جارية</em>{" "}
                        (ongoing charity).
                    </p>

                    <div className="flex flex-wrap justify-center gap-3">
                        <button
                            onClick={() => setShowUpgradeModal(true)}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                            style={{
                                background: "linear-gradient(135deg, var(--gold-glow), var(--gold))",
                                color: "var(--space)",
                            }}
                        >
                            <Crown className="w-4 h-4" />
                            {isPremium ? "You're Pro ✓" : "Upgrade to Pro"}
                        </button>
                        <a
                            href="#donate"
                            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                            style={{
                                background: "color-mix(in oklch, var(--foreground) 8%, transparent)",
                                color: "var(--foreground)",
                                border: "1px solid color-mix(in oklch, var(--border) 50%, transparent)",
                            }}
                        >
                            <Heart className="w-4 h-4" />
                            One-Time Donation
                        </a>
                    </div>
                </div>
            </section>

            {/* ── Page Header ──────────────────────────────────────────────── */}
            <div
                className="sticky top-0 z-20 border-b backdrop-blur-sm"
                style={{
                    borderColor: "color-mix(in oklch, var(--gold) 10%, transparent)",
                    background: "color-mix(in oklch, var(--space) 90%, transparent)",
                }}
            >
                <PageHeader
                    icon={<Heart />}
                    title="Support Hilal Vision"
                    subtitle="Sadaqah Jariyah · Pro Tier · Feature Comparison"
                    className="max-w-3xl"
                />
            </div>

            {/* ── Why Support ──────────────────────────────────────────────── */}
            <section className="py-16 border-b" style={{ borderColor: "var(--border)" }}>
                <div className="container max-w-3xl">
                    <h2
                        className="text-2xl font-light mb-6 tracking-wide"
                        style={{ color: "var(--foreground)" }}
                    >
                        Why Your Support Matters
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            {
                                icon: Zap,
                                title: "Keep It Running",
                                desc: "Server costs, API calls, weather data, and real-time ephemeris computation — science isn't free.",
                                color: "#fb923c",
                            },
                            {
                                icon: Globe,
                                title: "Keep It Accurate",
                                desc: "Continuous calibration against ICOP observations, new criterion research, and multi-engine calendar validation.",
                                color: "#60a5fa",
                            },
                            {
                                icon: Heart,
                                title: "Keep It Ad-Free",
                                desc: "Hilal Vision aims to be a clean, respectful experience. Your support replaces the need for intrusive advertising.",
                                color: "#f472b6",
                            },
                        ].map(({ icon: Icon, title, desc, color }) => (
                            <div key={title} className="breezy-card flex flex-col gap-3">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ background: `color-mix(in oklch, ${color} 15%, transparent)` }}
                                >
                                    <Icon className="w-5 h-5" style={{ color }} />
                                </div>
                                <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                                    {title}
                                </h3>
                                <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                                    {desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Feature Access Matrix ────────────────────────────────────── */}
            <section className="py-16 border-b" style={{ borderColor: "var(--border)" }}>
                <div className="container max-w-3xl">
                    <h2
                        className="text-2xl font-light mb-2 tracking-wide"
                        style={{ color: "var(--foreground)" }}
                    >
                        Free vs. Pro
                    </h2>
                    <p className="text-sm mb-8" style={{ color: "var(--muted-foreground)" }}>
                        Every feature is visible from Day 1. Pro unlocks deeper interaction and advanced tools.
                    </p>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs border-collapse">
                            <thead>
                                <tr>
                                    <th
                                        className="text-left py-3 px-3 font-semibold"
                                        style={{ color: "var(--foreground)", borderBottom: "1px solid var(--border)" }}
                                    >
                                        Feature
                                    </th>
                                    <th
                                        className="text-center py-3 px-3 font-semibold"
                                        style={{
                                            color: "var(--muted-foreground)",
                                            borderBottom: "1px solid var(--border)",
                                            minWidth: "120px",
                                        }}
                                    >
                                        🟢 Free
                                    </th>
                                    <th
                                        className="text-center py-3 px-3 font-semibold"
                                        style={{
                                            color: "var(--gold)",
                                            borderBottom: "1px solid var(--border)",
                                            minWidth: "140px",
                                        }}
                                    >
                                        <span className="inline-flex items-center gap-1">
                                            <Crown className="w-3 h-3" /> Pro
                                        </span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {FEATURE_MATRIX.map(({ feature, icon: Icon, free, pro, freeOk }, i) => (
                                    <tr
                                        key={feature}
                                        style={{
                                            background:
                                                i % 2 === 0
                                                    ? "transparent"
                                                    : "color-mix(in oklch, var(--space-mid) 40%, transparent)",
                                            borderBottom:
                                                "1px solid color-mix(in oklch, var(--border) 40%, transparent)",
                                        }}
                                    >
                                        <td className="py-3 px-3">
                                            <div className="flex items-center gap-2">
                                                <Icon
                                                    className="w-3.5 h-3.5 flex-shrink-0"
                                                    style={{ color: "var(--gold-dim)" }}
                                                />
                                                <span style={{ color: "var(--foreground)" }}>{feature}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-3 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                {freeOk ? (
                                                    <Check className="w-3.5 h-3.5" style={{ color: "oklch(0.72 0.18 155)" }} />
                                                ) : (
                                                    <X
                                                        className="w-3.5 h-3.5"
                                                        style={{
                                                            color: "color-mix(in oklch, var(--muted-foreground) 50%, transparent)",
                                                        }}
                                                    />
                                                )}
                                                <span style={{ color: "var(--muted-foreground)" }}>{free}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-3 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <Check className="w-3.5 h-3.5" style={{ color: "var(--gold)" }} />
                                                <span style={{ color: "var(--gold-dim)" }}>{pro}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* ── Pricing Plans ────────────────────────────────────────────── */}
            <section className="py-16 border-b" style={{ borderColor: "var(--border)" }}>
                <div className="container max-w-3xl">
                    <h2
                        className="text-2xl font-light mb-2 tracking-wide text-center"
                        style={{ color: "var(--foreground)" }}
                    >
                        Choose Your Plan
                    </h2>
                    <p className="text-sm mb-10 text-center" style={{ color: "var(--muted-foreground)" }}>
                        Unlock every feature. Support Islamic astronomy.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {PLANS.map((plan) => {
                            let displayPrice = plan.price;
                            if (isNative && nativePackages.length > 0) {
                                const nativePkg = nativePackages.find(p => p.identifier.toLowerCase().includes(plan.id) || p.packageType === plan.id.toUpperCase());
                                if (nativePkg) {
                                    displayPrice = nativePkg.product.priceString;
                                }
                            }

                            return (
                                <div
                                    key={plan.id}
                                    className="breezy-card flex flex-col items-center text-center relative overflow-hidden"
                                    style={{
                                        border: plan.popular
                                            ? "1px solid color-mix(in oklch, var(--gold) 40%, transparent)"
                                            : undefined,
                                        background: plan.popular
                                            ? "color-mix(in oklch, var(--gold) 4%, var(--space-mid))"
                                            : undefined,
                                    }}
                                >
                                    {plan.popular && (
                                        <div
                                            className="absolute top-0 left-0 right-0 py-1 text-[10px] font-bold uppercase tracking-widest"
                                            style={{
                                                background: "linear-gradient(135deg, var(--gold-glow), var(--gold))",
                                                color: "var(--space)",
                                            }}
                                        >
                                            Most Popular
                                        </div>
                                    )}

                                    <div className={plan.popular ? "mt-6" : ""}>
                                        <h3
                                            className="text-base font-semibold mb-1"
                                            style={{ color: "var(--foreground)" }}
                                        >
                                            {plan.name}
                                        </h3>
                                        <div
                                            className="text-3xl font-bold mb-0.5"
                                            style={{ color: plan.popular ? "var(--gold)" : "var(--foreground)" }}
                                        >
                                            {displayPrice}
                                        </div>
                                        <div className="text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>
                                            {plan.period}
                                        </div>
                                        {plan.savings && (
                                            <div
                                                className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mb-3"
                                                style={{
                                                    background: "color-mix(in oklch, var(--gold) 15%, transparent)",
                                                    color: "var(--gold)",
                                                }}
                                            >
                                                {plan.savings}
                                            </div>
                                        )}
                                        <p
                                            className="text-xs mb-4 leading-relaxed"
                                            style={{ color: "var(--muted-foreground)" }}
                                        >
                                            {plan.desc}
                                        </p>
                                        <button
                                            onClick={() => handleSelectPlan(plan.id)}
                                            disabled={checkoutLoading || isPremium || (isNative && nativePackages.length === 0)}
                                            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            style={
                                                plan.popular
                                                    ? {
                                                        background:
                                                            "linear-gradient(135deg, var(--gold-glow), var(--gold))",
                                                        color: "var(--space)",
                                                    }
                                                    : {
                                                        background:
                                                            "color-mix(in oklch, var(--foreground) 8%, transparent)",
                                                        color: "var(--foreground)",
                                                        border:
                                                            "1px solid color-mix(in oklch, var(--border) 50%, transparent)",
                                                    }
                                            }
                                        >
                                            {checkoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isPremium ? "Active ✓" : "Get Started"}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── Donation / Sadaqah Jariyah ───────────────────────────────── */}
            {/* HIDE on native apps because Apple/Google do not allow physical charity donations via IAP without a registered 501(c)(3) tax ID. */}
            {!isNative && (
                <section id="donate" className="py-16">
                    <div className="container max-w-3xl">
                        <div
                            className="breezy-card text-center"
                            style={{
                                border: "1px solid color-mix(in oklch, var(--gold) 20%, transparent)",
                                background:
                                    "radial-gradient(ellipse 100% 80% at 50% 100%, color-mix(in oklch, var(--gold) 5%, transparent) 0%, var(--space-mid) 80%)",
                            }}
                        >
                            <div
                                className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                                style={{ background: "color-mix(in oklch, var(--gold) 12%, transparent)" }}
                            >
                                <Heart className="w-7 h-7" style={{ color: "var(--gold)" }} />
                            </div>

                            <h2
                                className="text-2xl font-light mb-2"
                                style={{ color: "var(--foreground)" }}
                            >
                                One-Time Donation
                            </h2>
                            <p
                                className="text-sm font-arabic mb-1"
                                style={{ color: "var(--gold-dim)" }}
                            >
                                صدقة جارية — Ongoing Charity
                            </p>
                            <p
                                className="text-xs leading-relaxed max-w-md mx-auto mb-6"
                                style={{ color: "var(--muted-foreground)" }}
                            >
                                Not ready for Pro? A one-time donation of any amount helps cover server costs and
                                keeps Hilal Vision freely accessible to communities worldwide. Donors who give
                                $10+ receive a <strong style={{ color: "var(--gold)" }}>Golden Crescent</strong> patron
                                badge on their sighting reports.
                            </p>

                            <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
                                {["$5", "$10", "$25", "$50"].map((amount) => (
                                    <button
                                        key={amount}
                                        disabled={checkoutLoading}
                                        className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
                                        style={{
                                            background: "color-mix(in oklch, var(--gold) 12%, transparent)",
                                            border:
                                                "1px solid color-mix(in oklch, var(--gold) 30%, transparent)",
                                            color: "var(--gold)",
                                        }}
                                        onClick={() => startCheckout({ donationAmount: amount })}
                                    >
                                        {checkoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : amount}
                                    </button>
                                ))}
                            </div>

                            <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                                Secure payment via Stripe · 🔒 End-to-end encrypted
                            </p>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
