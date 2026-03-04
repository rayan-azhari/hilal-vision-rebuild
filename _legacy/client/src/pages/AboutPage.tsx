import { SEO } from "@/components/SEO";
import { PageHeader } from "@/components/PageHeader";
import { Link } from "wouter";
import {
    Info,
    Globe,
    Moon,
    Calendar,
    Archive,
    Compass,
    Map,
    Star,
    FlaskConical,
    Database,
    Shield,
    Smartphone,
    Languages,
    BookOpen,
    ExternalLink,
    Github,
    Mail,
} from "lucide-react";
import { useTranslation } from "react-i18next";
const getTools = (t: any) => [
    {
        href: "/visibility",
        icon: Globe,
        title: t("about.tools_visTitle"),
        desc: t("about.tools_visDesc"),
        color: "#60a5fa",
    },
    {
        href: "/moon",
        icon: Moon,
        title: t("about.tools_moonTitle"),
        desc: t("about.tools_moonDesc"),
        color: "#facc15",
    },
    {
        href: "/calendar",
        icon: Calendar,
        title: t("about.tools_calTitle"),
        desc: t("about.tools_calDesc"),
        color: "#c084fc",
    },
    {
        href: "/horizon",
        icon: Compass,
        title: t("about.tools_horTitle"),
        desc: t("about.tools_horDesc"),
        color: "#fb923c",
    },
    {
        href: "/archive",
        icon: Archive,
        title: t("about.tools_arcTitle"),
        desc: t("about.tools_arcDesc"),
        color: "#94a3b8",
    },
];

const getTech = (t: any) => [
    { icon: Globe, label: "React 19 + Vite 7", desc: t("about.tech_react") },
    { icon: Map, label: "Leaflet + Globe.gl", desc: t("about.tech_leaflet") },
    { icon: FlaskConical, label: "astronomy-engine", desc: t("about.tech_astro") },
    { icon: Database, label: "tRPC + Express + MySQL", desc: t("about.tech_trpc") },
    { icon: Shield, label: "Clerk + Upstash Redis", desc: t("about.tech_clerk") },
    { icon: Smartphone, label: "Capacitor.js", desc: t("about.tech_cap") },
    { icon: Languages, label: "react-i18next", desc: t("about.tech_i18n") },
    { icon: Star, label: "Sentry + PWA", desc: t("about.tech_sentry") },
];

const getCredits = (t: any) => [
    {
        title: t("about.credit_yallopTitle"),
        desc: t("about.credit_yallopDesc"),
        href: "https://astronomycenter.net/pdf/yallop_1997.pdf",
    },
    {
        title: t("about.credit_odehTitle"),
        desc: t("about.credit_odehDesc"),
        href: "https://www.researchgate.net/publication/225099773",
    },
    {
        title: t("about.credit_icopTitle"),
        desc: t("about.credit_icopDesc"),
        href: "https://astronomycenter.net/icop.html?l=en",
    },
    {
        title: t("about.credit_astroTitle"),
        desc: t("about.credit_astroDesc"),
        href: "https://github.com/cosinekitty/astronomy",
    },
    {
        title: t("about.credit_ummTitle"),
        desc: t("about.credit_ummDesc"),
        href: "https://github.com/umalqura/umalqura",
    },
    {
        title: t("about.credit_meteoTitle"),
        desc: t("about.credit_meteoDesc"),
        href: "https://open-meteo.com",
    },
];

export default function AboutPage() {
    const { t, i18n } = useTranslation();
    const TOOLS = getTools(t);
    const TECH = getTech(t);
    const CREDITS = getCredits(t);

    return (
        <div className="min-h-screen" style={{ background: "var(--space)" }}>
            <SEO
                title={t("about.title")}
                description={t("about.description")}
                path="/about"
            />

            {/* Hero */}
            <section
                className="relative overflow-hidden"
                style={{
                    background:
                        "radial-gradient(ellipse 80% 50% at 50% 0%, oklch(0.12 0.03 265) 0%, var(--space) 70%)",
                    paddingTop: "64px",
                    paddingBottom: "80px",
                }}
            >
                <div className="absolute inset-0 star-field opacity-40 pointer-events-none" />
                {/* Orbit rings */}
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border opacity-5 pointer-events-none"
                    style={{ width: "700px", height: "700px", borderColor: "var(--gold)" }}
                />

                <div className="container relative z-10 max-w-3xl">
                    <div
                        className={`text-xs mb-4 uppercase tracking-wider ${i18n.language === 'en' ? 'font-arabic' : ''}`}
                        style={{ color: "var(--gold-dim)" }}
                    >
                        {t("about.headerSubtitle")}
                    </div>
                    <h1
                        className="text-4xl md:text-6xl font-light tracking-tight mb-6 leading-tight"
                        style={{ color: "var(--foreground)" }}
                    >
                        {t("about.heroTitle1")}<br />
                        {t("about.heroTitle2")}
                    </h1>
                    <p
                        className="text-lg leading-relaxed font-light max-w-2xl"
                        style={{ color: "var(--muted-foreground)" }}
                    >
                        {t("about.heroDesc1")}
                        <span className={`px-1 ${i18n.language === 'en' ? 'font-arabic' : ''}`} style={{ color: "var(--gold-dim)" }}>
                            {t("about.heroDesc2")}
                        </span>
                        {t("about.heroDesc3")}
                    </p>
                </div>
            </section>

            {/* Page Header */}
            <div
                className="sticky top-0 z-20 border-b backdrop-blur-sm"
                style={{
                    borderColor: "color-mix(in oklch, var(--gold) 10%, transparent)",
                    background: "color-mix(in oklch, var(--space) 90%, transparent)",
                }}
            >
                <PageHeader
                    icon={<Info />}
                    title={t("about.pageHeaderTitle")}
                    subtitle={t("about.pageHeaderSubtitle")}
                    className="max-w-3xl"
                />
            </div>

            {/* Mission */}
            <section className="py-16 border-b" style={{ borderColor: "var(--border)" }}>
                <div className="container max-w-3xl">
                    <h2
                        className="text-2xl font-light mb-4 tracking-wide"
                        style={{ color: "var(--foreground)" }}
                    >
                        {t("about.missionTitle")}
                    </h2>
                    <div
                        className="prose prose-invert max-w-none space-y-4 text-sm leading-relaxed"
                        style={{ color: "var(--muted-foreground)" }}
                    >
                        <p>
                            {t("about.missionP1")}
                        </p>
                        <p>
                            {t("about.missionP2_1")}
                            <strong style={{ color: "var(--foreground)" }}>
                                {t("about.missionP2_2")}
                            </strong>
                        </p>
                        <p>
                            {t("about.missionP3_1")}
                            <strong style={{ color: "var(--foreground)" }}>{t("about.missionP3_2")}</strong>
                            {t("about.missionP3_3")}
                            <strong style={{ color: "var(--foreground)" }}>{t("about.missionP3_4")}</strong>
                            {t("about.missionP3_5")}
                        </p>
                        <p>
                            {t("about.missionP4")}
                        </p>
                    </div>
                </div>
            </section>

            {/* Who is it for */}
            <section className="py-16 border-b" style={{ borderColor: "var(--border)" }}>
                <div className="container max-w-3xl">
                    <h2
                        className="text-2xl font-light mb-8 tracking-wide"
                        style={{ color: "var(--foreground)" }}
                    >
                        {t("about.whoTitle")}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            {
                                icon: Moon,
                                title: t("about.whoMuslimsTitle"),
                                desc: t("about.whoMuslimsDesc"),
                                color: "#facc15",
                            },
                            {
                                icon: FlaskConical,
                                title: t("about.whoAstroTitle"),
                                desc: t("about.whoAstroDesc"),
                                color: "#60a5fa",
                            },
                            {
                                icon: BookOpen,
                                title: t("about.whoScholarsTitle"),
                                desc: t("about.whoScholarsDesc"),
                                color: "#c084fc",
                            },
                        ].map(({ icon: Icon, title, desc, color }) => (
                            <div
                                key={title}
                                className="breezy-card flex flex-col gap-3"
                            >
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ background: `color-mix(in oklch, ${color} 15%, transparent)` }}
                                >
                                    <Icon className="w-5 h-5" style={{ color }} />
                                </div>
                                <h3
                                    className="text-sm font-semibold"
                                    style={{ color: "var(--foreground)" }}
                                >
                                    {title}
                                </h3>
                                <p
                                    className="text-xs leading-relaxed"
                                    style={{ color: "var(--muted-foreground)" }}
                                >
                                    {desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tools */}
            <section className="py-16 border-b" style={{ borderColor: "var(--border)" }}>
                <div className="container max-w-3xl">
                    <h2
                        className="text-2xl font-light mb-2 tracking-wide"
                        style={{ color: "var(--foreground)" }}
                    >
                        {t("about.toolsTitle")}
                    </h2>
                    <p className="text-sm mb-8" style={{ color: "var(--muted-foreground)" }}>
                        {t("about.toolsDesc")}
                    </p>
                    <div className="space-y-3">
                        {TOOLS.map(({ href, icon: Icon, title, desc, color }) => (
                            <Link key={href} href={href}>
                                <div
                                    className="breezy-card group flex items-start gap-4 cursor-pointer hover:-translate-y-0.5 transition-transform"
                                >
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                                        style={{ background: `color-mix(in oklch, ${color} 15%, transparent)` }}
                                    >
                                        <Icon className="w-5 h-5" style={{ color }} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3
                                                className="text-sm font-semibold"
                                                style={{ color: "var(--foreground)" }}
                                            >
                                                {title}
                                            </h3>
                                            <ExternalLink
                                                className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity"
                                                style={{ color: "var(--gold)" }}
                                            />
                                        </div>
                                        <p
                                            className="text-xs leading-relaxed"
                                            style={{ color: "var(--muted-foreground)" }}
                                        >
                                            {desc}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Technology */}
            <section className="py-16 border-b" style={{ borderColor: "var(--border)" }}>
                <div className="container max-w-3xl">
                    <h2
                        className="text-2xl font-light mb-2 tracking-wide"
                        style={{ color: "var(--foreground)" }}
                    >
                        {t("about.techTitle")}
                    </h2>
                    <p className="text-sm mb-8" style={{ color: "var(--muted-foreground)" }}>
                        {t("about.techDesc")}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {TECH.map(({ icon: Icon, label, desc }) => (
                            <div
                                key={label}
                                className="breezy-card !p-4 flex flex-col gap-2"
                            >
                                <Icon
                                    className="w-4 h-4"
                                    style={{ color: "var(--gold-dim)" }}
                                />
                                <div
                                    className="text-xs font-semibold"
                                    style={{ color: "var(--foreground)" }}
                                >
                                    {label}
                                </div>
                                <div
                                    className="text-[11px] leading-relaxed"
                                    style={{ color: "var(--muted-foreground)" }}
                                >
                                    {desc}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Methodology teaser */}
            <section className="py-16 border-b" style={{ borderColor: "var(--border)" }}>
                <div className="container max-w-3xl">
                    <div
                        className="breezy-card flex flex-col md:flex-row items-start md:items-center gap-6"
                        style={{
                            border: "1px solid color-mix(in oklch, var(--gold) 20%, transparent)",
                            background: "color-mix(in oklch, var(--gold) 3%, var(--space-mid))",
                        }}
                    >
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: "color-mix(in oklch, var(--gold) 12%, transparent)" }}
                        >
                            <FlaskConical className="w-6 h-6" style={{ color: "var(--gold)" }} />
                        </div>
                        <div className="flex-1">
                            <h3
                                className="text-base font-semibold mb-1"
                                style={{ color: "var(--foreground)" }}
                            >
                                {t("about.deepDiveTitle")}
                            </h3>
                            <p
                                className="text-xs leading-relaxed"
                                style={{ color: "var(--muted-foreground)" }}
                            >
                                {t("about.deepDiveDesc")}
                            </p>
                        </div>
                        <Link href="/methodology">
                            <span
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all hover:scale-105"
                                style={{
                                    background: "linear-gradient(135deg, var(--gold-glow), var(--gold))",
                                    color: "var(--space)",
                                }}
                            >
                                {t("about.deepDiveBtn")}
                                <ExternalLink className="w-3.5 h-3.5" />
                            </span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Competitive Landscape */}
            <section className="py-16 border-b" style={{ borderColor: "var(--border)" }}>
                <div className="container max-w-3xl">
                    <h2
                        className="text-2xl font-light mb-2 tracking-wide"
                        style={{ color: "var(--foreground)" }}
                    >
                        {t("about.compareTitle")}
                    </h2>
                    <p className="text-sm mb-8" style={{ color: "var(--muted-foreground)" }}>
                        {t("about.compareDesc")}
                    </p>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs border-collapse">
                            <thead>
                                <tr>
                                    <th
                                        className="text-left py-3 px-3 font-semibold text-xs"
                                        style={{ color: "var(--foreground)", borderBottom: "1px solid var(--border)" }}
                                    >
                                        {t("about.featureLabel")}
                                    </th>
                                    {[
                                        { name: "Hilal Vision", isUs: true },
                                        { name: "Moonsighting.com", isUs: false },
                                        { name: "IslamicFinder", isUs: false },
                                        { name: "LuneSighting", isUs: false },
                                        { name: "HilalMap", isUs: false },
                                    ].map(({ name, isUs }) => (
                                        <th
                                            key={name}
                                            className="text-center py-3 px-2 font-semibold text-[11px]"
                                            style={{
                                                color: isUs ? "var(--gold)" : "var(--muted-foreground)",
                                                borderBottom: "1px solid var(--border)",
                                                minWidth: "80px",
                                            }}
                                        >
                                            {name}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { feature: t("about.feat_3d"), vals: [true, false, false, false, false] },
                                    { feature: t("about.feat_2d"), vals: [true, true, false, false, true] },
                                    { feature: t("about.feat_cloud"), vals: [true, false, false, false, false] },
                                    { feature: t("about.feat_best"), vals: [true, false, false, false, false] },
                                    { feature: t("about.feat_icop"), vals: [true, true, false, true, false] },
                                    { feature: t("about.feat_crowd"), vals: [true, false, false, true, false] },
                                    { feature: t("about.feat_triple"), vals: [true, false, false, false, false] },
                                    { feature: t("about.feat_sci"), vals: [true, true, false, false, false] },
                                    { feature: t("about.feat_app"), vals: [true, false, true, true, false] },
                                    { feature: t("about.feat_push"), vals: [false, false, true, true, false] },
                                    { feature: t("about.feat_photo"), vals: [false, false, false, true, false] },
                                    { feature: t("about.feat_ar"), vals: [false, false, false, false, false] },
                                    { feature: t("about.feat_lang"), vals: [true, false, true, false, false] },
                                    { feature: t("about.feat_anim"), vals: [false, false, false, false, false] },
                                ].map(({ feature, vals }, i) => (
                                    <tr
                                        key={feature}
                                        style={{
                                            background:
                                                i % 2 === 0
                                                    ? "transparent"
                                                    : "color-mix(in oklch, var(--space-mid) 40%, transparent)",
                                            borderBottom: "1px solid color-mix(in oklch, var(--border) 40%, transparent)",
                                        }}
                                    >
                                        <td
                                            className="py-2.5 px-3 text-xs"
                                            style={{ color: "var(--muted-foreground)" }}
                                        >
                                            {feature}
                                        </td>
                                        {vals.map((v, j) => (
                                            <td key={j} className="py-2.5 px-2 text-center">
                                                {j === 0 ? (
                                                    // Hilal Vision column - highlight our ✅ in gold, ❌ in muted
                                                    v ? (
                                                        <span
                                                            className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold"
                                                            style={{
                                                                background: "color-mix(in oklch, var(--gold) 20%, transparent)",
                                                                color: "var(--gold)",
                                                            }}
                                                        >
                                                            ✓
                                                        </span>
                                                    ) : (
                                                        <span
                                                            className="text-[9px] uppercase font-bold tracking-widest whitespace-nowrap"
                                                            style={{ color: "color-mix(in oklch, var(--gold) 60%, transparent)" }}
                                                        >
                                                            {t("about.comingSoon")}
                                                        </span>
                                                    )
                                                ) : v ? (
                                                    <span
                                                        className="text-[13px]"
                                                        style={{ color: "oklch(0.72 0.18 155)" }}
                                                    >
                                                        ✓
                                                    </span>
                                                ) : (
                                                    <span
                                                        className="text-[13px]"
                                                        style={{ color: "color-mix(in oklch, var(--muted-foreground) 35%, transparent)" }}
                                                    >
                                                        -
                                                    </span>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <p
                        className="mt-5 text-xs italic"
                        style={{ color: "var(--muted-foreground)" }}
                    >
                        {t("about.tableNote")}
                    </p>
                </div>
            </section>

            {/* Credits / Attributions */}
            <section className="py-16 border-b" style={{ borderColor: "var(--border)" }}>
                <div className="container max-w-3xl">
                    <h2
                        className="text-2xl font-light mb-2 tracking-wide"
                        style={{ color: "var(--foreground)" }}
                    >
                        {t("about.creditsTitle")}
                    </h2>
                    <p className="text-sm mb-8" style={{ color: "var(--muted-foreground)" }}>
                        {t("about.creditsDesc")}
                    </p>
                    <div className="space-y-3">
                        {CREDITS.map(({ title, desc, href }) => (
                            <a
                                key={href}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="breezy-card group flex items-start gap-3 cursor-pointer hover:-translate-y-0.5 transition-transform"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span
                                            className="text-sm font-medium"
                                            style={{ color: "var(--foreground)" }}
                                        >
                                            {title}
                                        </span>
                                        <ExternalLink
                                            className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity"
                                            style={{ color: "var(--gold)" }}
                                        />
                                    </div>
                                    <p
                                        className="text-xs leading-relaxed"
                                        style={{ color: "var(--muted-foreground)" }}
                                    >
                                        {desc}
                                    </p>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* License & Contact */}
            <section className="py-16">
                <div className="container max-w-3xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* License */}
                        <div className="breezy-card">
                            <h3
                                className="text-sm font-semibold mb-1"
                                style={{ color: "var(--foreground)" }}
                            >
                                {t("about.licenseTitle")}
                            </h3>
                            <p
                                className="text-xs leading-relaxed mb-4"
                                style={{ color: "var(--muted-foreground)" }}
                            >
                                {t("about.licenseDesc")}
                            </p>
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-xs transition-colors"
                                style={{ color: "var(--gold-dim)" }}
                            >
                                <Github className="w-4 h-4" />
                                {t("about.viewGithub")}
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>

                        {/* Contact */}
                        <div className="breezy-card">
                            <h3
                                className="text-sm font-semibold mb-1"
                                style={{ color: "var(--foreground)" }}
                            >
                                {t("about.contactTitle")}
                            </h3>
                            <p
                                className="text-xs leading-relaxed mb-4"
                                style={{ color: "var(--muted-foreground)" }}
                            >
                                {t("about.contactDesc")}
                            </p>
                            <div className="space-y-2">
                                <Link href="/privacy">
                                    <span
                                        className="flex items-center gap-2 text-xs transition-colors cursor-pointer"
                                        style={{ color: "var(--gold-dim)" }}
                                    >
                                        <Shield className="w-4 h-4" />
                                        {t("about.privacyLink")}
                                    </span>
                                </Link>
                                <Link href="/terms">
                                    <span
                                        className="flex items-center gap-2 text-xs transition-colors cursor-pointer"
                                        style={{ color: "var(--gold-dim)" }}
                                    >
                                        <BookOpen className="w-4 h-4" />
                                        {t("about.termsLink")}
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
