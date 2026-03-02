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
import { useTranslation } from "react-i18next";

/* ─── Feature Access Matrix ────────────────────────────────────────────── */

const FEATURE_MATRIX: Array<{
    featureKey: string;
    icon: React.ElementType;
    freeKey: string;
    proKey: string;
    freeOk: boolean;
}> = [
        { featureKey: "map2d",           icon: Map,      freeKey: "fullAccess",     proKey: "fullAccess",     freeOk: true },
        { featureKey: "globe3d",          icon: Globe,    freeKey: "locked",         proKey: "fullInteractive", freeOk: false },
        { featureKey: "moonBasic",        icon: Moon,     freeKey: "moonFree",       proKey: "fullDashboard",   freeOk: true },
        { featureKey: "altChart",         icon: Clock,    freeKey: "fullAccess",     proKey: "fullAccess",     freeOk: true },
        { featureKey: "skyDome",          icon: Eye,      freeKey: "blurredPreview", proKey: "fullInteractive", freeOk: false },
        { featureKey: "ephemeris",        icon: Clock,    freeKey: "blurredPreview", proKey: "ephemerisPro",   freeOk: false },
        { featureKey: "hijriUmm",         icon: Calendar, freeKey: "fullAccess",     proKey: "fullAccess",     freeOk: true },
        { featureKey: "astroTabular",     icon: Sparkles, freeKey: "locked",         proKey: "allEngines",     freeOk: false },
        { featureKey: "archiveRecent",    icon: Archive,  freeKey: "archiveFreeTier",proKey: "archiveProTier", freeOk: true },
        { featureKey: "archiveHistorical",icon: Archive,  freeKey: "locked",         proKey: "archiveHistorical",freeOk: false },
        { featureKey: "horizonView",      icon: Compass,  freeKey: "fullAccess",     proKey: "fullAccess",     freeOk: true },
        { featureKey: "sightings",        icon: Star,     freeKey: "sightingFree",   proKey: "sightingPro",    freeOk: true },
        { featureKey: "pushNotif",        icon: Bell,     freeKey: "pushFree",       proKey: "pushPro",        freeOk: false },
        { featureKey: "adFreeExp",        icon: Ban,      freeKey: "adFree",         proKey: "adPro",          freeOk: false },
    ];

/* ─── Pricing Plans ────────────────────────────────────────────────────── */

const PLAN_IDS = ["monthly", "annual", "lifetime"] as const;
const PLAN_PRICES: Record<string, string> = {
    monthly:  "$2.99",
    annual:   "$14.99",
    lifetime: "$49.99",
};
const PLAN_POPULAR: Record<string, boolean> = {
    monthly:  false,
    annual:   true,
    lifetime: false,
};
const PLAN_HAS_SAVINGS: Record<string, boolean> = {
    monthly:  false,
    annual:   true,
    lifetime: true,
};

const WHY_SUPPORT = [
    { icon: Zap,   key: "keepRunning", color: "#fb923c" },
    { icon: Globe, key: "keepAccurate", color: "#60a5fa" },
    { icon: Heart, key: "keepFree",    color: "#f472b6" },
] as const;

/* ─── Page ─────────────────────────────────────────────────────────────── */

export default function SupportPage() {
    const { isPremium, setShowUpgradeModal, startCheckout, checkoutLoading, isNative } = useProTier();
    const { nativePackages, handleSelectPlan } = usePlanSelection();
    const { t } = useTranslation();
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
                    {banner === "pro" && <><PartyPopper className="w-4 h-4" /> {t("support.welcomePro")}</>}
                    {banner === "donated" && <><Heart className="w-4 h-4" /> {t("support.thanksDonation")}</>}
                    {banner === "canceled" && <>{t("support.paymentCancelled")}</>}
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
                            {t("support.sadaqahLabel")}
                        </span>
                    </div>

                    <h1
                        className="text-4xl md:text-5xl font-light tracking-tight mb-6 leading-tight"
                        style={{ color: "var(--foreground)" }}
                    >
                        {t("support.heroTitle")}
                        <br />
                        <span style={{ color: "var(--gold)" }}>{t("support.heroTitleHighlight")}</span>
                    </h1>
                    <p
                        className="text-base leading-relaxed font-light max-w-xl mx-auto mb-8"
                        style={{ color: "var(--muted-foreground)" }}
                    >
                        {t("support.heroDesc")}{" "}
                        <em className="font-arabic" style={{ color: "var(--gold-dim)" }}>{t("support.sadaqahArabic")}</em>{" "}
                        ({t("support.sadaqahMeaning")}).
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
                            {isPremium ? t("support.currentlyPro") : t("support.upgradePro")}
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
                            {t("support.oneTimeDonation")}
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
                        {t("support.whySupport")}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {WHY_SUPPORT.map(({ icon: Icon, key, color }) => (
                            <div key={key} className="breezy-card flex flex-col gap-3">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ background: `color-mix(in oklch, ${color} 15%, transparent)` }}
                                >
                                    <Icon className="w-5 h-5" style={{ color }} />
                                </div>
                                <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                                    {t(`support.${key}`)}
                                </h3>
                                <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                                    {t(`support.${key}Desc`)}
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
                        {t("support.freeVsPro")}
                    </h2>
                    <p className="text-sm mb-8" style={{ color: "var(--muted-foreground)" }}>
                        {t("support.freeVsProDesc")}
                    </p>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs border-collapse">
                            <thead>
                                <tr>
                                    <th
                                        className="text-left py-3 px-3 font-semibold"
                                        style={{ color: "var(--foreground)", borderBottom: "1px solid var(--border)" }}
                                    >
                                        {t("support.tableFeature")}
                                    </th>
                                    <th
                                        className="text-center py-3 px-3 font-semibold"
                                        style={{
                                            color: "var(--muted-foreground)",
                                            borderBottom: "1px solid var(--border)",
                                            minWidth: "120px",
                                        }}
                                    >
                                        {t("support.tableFree")}
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
                                {FEATURE_MATRIX.map(({ featureKey, icon: Icon, freeKey, proKey, freeOk }, i) => (
                                    <tr
                                        key={featureKey}
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
                                                <span style={{ color: "var(--foreground)" }}>
                                                    {t(`support.features.${featureKey}`)}
                                                </span>
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
                                                <span style={{ color: "var(--muted-foreground)" }}>
                                                    {t(`support.access.${freeKey}`)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-3 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <Check className="w-3.5 h-3.5" style={{ color: "var(--gold)" }} />
                                                <span style={{ color: "var(--gold-dim)" }}>
                                                    {t(`support.access.${proKey}`)}
                                                </span>
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
                        {t("support.choosePlan")}
                    </h2>
                    <p className="text-sm mb-10 text-center" style={{ color: "var(--muted-foreground)" }}>
                        {t("support.planSubtitle")}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {PLAN_IDS.map((planId) => {
                            const popular = PLAN_POPULAR[planId];
                            const hasSavings = PLAN_HAS_SAVINGS[planId];

                            let displayPrice = PLAN_PRICES[planId];
                            if (isNative && nativePackages.length > 0) {
                                const nativePkg = nativePackages.find(p => p.identifier.toLowerCase().includes(planId) || p.packageType === planId.toUpperCase());
                                if (nativePkg) {
                                    displayPrice = nativePkg.product.priceString;
                                }
                            }

                            return (
                                <div
                                    key={planId}
                                    className="breezy-card flex flex-col items-center text-center relative overflow-hidden"
                                    style={{
                                        border: popular
                                            ? "1px solid color-mix(in oklch, var(--gold) 40%, transparent)"
                                            : undefined,
                                        background: popular
                                            ? "color-mix(in oklch, var(--gold) 4%, var(--space-mid))"
                                            : undefined,
                                    }}
                                >
                                    {popular && (
                                        <div
                                            className="absolute top-0 left-0 right-0 py-1 text-[10px] font-bold uppercase tracking-widest"
                                            style={{
                                                background: "linear-gradient(135deg, var(--gold-glow), var(--gold))",
                                                color: "var(--space)",
                                            }}
                                        >
                                            {t("support.mostPopular")}
                                        </div>
                                    )}

                                    <div className={popular ? "mt-6" : ""}>
                                        <h3
                                            className="text-base font-semibold mb-1"
                                            style={{ color: "var(--foreground)" }}
                                        >
                                            {t(`support.plans.${planId}.name`)}
                                        </h3>
                                        <div
                                            className="text-3xl font-bold mb-0.5"
                                            style={{ color: popular ? "var(--gold)" : "var(--foreground)" }}
                                        >
                                            {displayPrice}
                                        </div>
                                        <div className="text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>
                                            {t(`support.plans.${planId}.period`)}
                                        </div>
                                        {hasSavings && (
                                            <div
                                                className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mb-3"
                                                style={{
                                                    background: "color-mix(in oklch, var(--gold) 15%, transparent)",
                                                    color: "var(--gold)",
                                                }}
                                            >
                                                {t(`support.plans.${planId}.savings`)}
                                            </div>
                                        )}
                                        <p
                                            className="text-xs mb-4 leading-relaxed"
                                            style={{ color: "var(--muted-foreground)" }}
                                        >
                                            {t(`support.plans.${planId}.desc`)}
                                        </p>
                                        <button
                                            onClick={() => handleSelectPlan(planId)}
                                            disabled={checkoutLoading || isPremium || (isNative && nativePackages.length === 0)}
                                            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            style={
                                                popular
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
                                            {checkoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isPremium ? t("support.activePlan") : t("support.getStarted")}
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
                                {t("support.donationTitle")}
                            </h2>
                            <p
                                className="text-sm font-arabic mb-1"
                                style={{ color: "var(--gold-dim)" }}
                            >
                                {t("support.sadaqahOngoing")}
                            </p>
                            <p
                                className="text-xs leading-relaxed max-w-md mx-auto mb-6"
                                style={{ color: "var(--muted-foreground)" }}
                            >
                                {t("support.donationDesc")}{" "}
                                <strong style={{ color: "var(--gold)" }}>{t("support.goldenCrescent")}</strong>{" "}
                                {t("support.donationPatron")}
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
                                {t("support.secureStripe")}
                            </p>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
