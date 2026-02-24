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

const TOOLS = [
    {
        href: "/visibility",
        icon: Globe,
        title: "3D Globe & Visibility Map",
        desc: "Interactive WebGL globe and 2D Leaflet map showing crescent visibility zones worldwide using Yallop q-values. Includes real-time cloud cover overlay and Best-Time-to-Observe calculator.",
        color: "#60a5fa",
    },
    {
        href: "/moon",
        icon: Moon,
        title: "Moon Phase Dashboard",
        desc: "Current lunar phase, illumination, age, Sun & Moon altitude chart, 30-day phase calendar strip, and Yallop/Danjon methodology charts.",
        color: "#facc15",
    },
    {
        href: "/calendar",
        icon: Calendar,
        title: "Hijri Calendar",
        desc: "Triple-engine calendar supporting Astronomical (SunCalc), Umm al-Qura (KACST), and Tabular algorithms. Includes a 'Compare to Heavens' divergence overlay.",
        color: "#c084fc",
    },
    {
        href: "/horizon",
        icon: Compass,
        title: "Horizon View",
        desc: "Local horizon simulator showing the crescent moon's position relative to the setting sun, with ARCV and DAZ annotations.",
        color: "#fb923c",
    },
    {
        href: "/archive",
        icon: Archive,
        title: "ICOP Archive",
        desc: "1,000+ authentic historical crescent sighting records from the Islamic Crescents' Observation Project (ICOP), spanning 1438–1465 AH.",
        color: "#94a3b8",
    },
];

const TECH = [
    { icon: Globe, label: "React 19 + Vite 7", desc: "Frontend framework and build tool" },
    { icon: Map, label: "Leaflet + Globe.gl", desc: "2D map and 3D WebGL globe" },
    { icon: FlaskConical, label: "SunCalc", desc: "Sun & moon position algorithms (Jean Meeus)" },
    { icon: Database, label: "tRPC + Express + MySQL", desc: "Type-safe API and database layer (Drizzle ORM)" },
    { icon: Shield, label: "Clerk + Upstash Redis", desc: "Authentication and rate limiting" },
    { icon: Smartphone, label: "Capacitor.js", desc: "Native iOS & Android packaging" },
    { icon: Languages, label: "react-i18next", desc: "English, Arabic (العربية), and Urdu (اردو)" },
    { icon: Star, label: "Sentry + PWA", desc: "Error monitoring and offline service worker" },
];

const CREDITS = [
    {
        title: "Yallop (1997) Criterion",
        desc: "B.D. Yallop, HM Nautical Almanac Office - foundational q-value crescent visibility formula.",
        href: "https://astronomycenter.net/pdf/yallop_1997.pdf",
    },
    {
        title: "Odeh (2004) Criterion",
        desc: "Mohammad Odeh - V-value refinement trained on 737 ICOP sighting observations.",
        href: "https://www.researchgate.net/publication/225099773",
    },
    {
        title: "Islamic Crescents' Observation Project (ICOP)",
        desc: "International Astronomical Center - over 1,000 historical crescent sighting records used in the Archive.",
        href: "https://astronomycenter.net/icop.html?l=en",
    },
    {
        title: "SunCalc by Vladimir Agafonkin",
        desc: "JavaScript library implementing Jean Meeus's astronomical algorithms for sun and moon positions.",
        href: "https://github.com/mourner/suncalc",
    },
    {
        title: "Umm al-Qura Calendar (@umalqura/core)",
        desc: "KACST pre-computed tables for the official Saudi Arabian civic Hijri calendar.",
        href: "https://github.com/umalqura/umalqura",
    },
    {
        title: "Open-Meteo",
        desc: "Free, open-source weather API providing real-time cloud cover data.",
        href: "https://open-meteo.com",
    },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen" style={{ background: "var(--space)" }}>
            <SEO
                title="About"
                description="About Hilal Vision - a precision astronomical platform for predicting Islamic crescent moon sightings worldwide using Yallop & Odeh criteria."
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
                        className="text-xs mb-4 font-arabic tracking-wider"
                        style={{ color: "var(--gold-dim)" }}
                    >
                        رؤية الهلال - About Hilal Vision
                    </div>
                    <h1
                        className="text-4xl md:text-6xl font-light tracking-tight mb-6 leading-tight"
                        style={{ color: "var(--foreground)" }}
                    >
                        Bridging Ancient Tradition<br />
                        with Modern Astronomy
                    </h1>
                    <p
                        className="text-lg leading-relaxed font-light max-w-2xl"
                        style={{ color: "var(--muted-foreground)" }}
                    >
                        Hilal Vision is a precision astronomical web platform dedicated to predicting and
                        visualising Islamic crescent moon (
                        <span className="font-arabic" style={{ color: "var(--gold-dim)" }}>
                            هلال
                        </span>
                        ) sightings worldwide. It is built for the 1.8 billion Muslims who rely on the lunar
                        calendar for religious observances, and for the astronomers and scholars who study it.
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
                    title="About Hilal Vision"
                    subtitle="Mission, tools, technology & attributions"
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
                        Our Mission
                    </h2>
                    <div
                        className="prose prose-invert max-w-none space-y-4 text-sm leading-relaxed"
                        style={{ color: "var(--muted-foreground)" }}
                    >
                        <p>
                            The Islamic lunar calendar is one of humanity's oldest scientific traditions - the
                            beginning of each sacred month has been determined by the physical sighting of the new
                            crescent moon for over 1,400 years. Yet in the modern world, this practice is
                            fragmented: different countries announce the start of Ramadan on different days, and
                            communities lack transparent, data-driven tools to understand why.
                        </p>
                        <p>
                            Hilal Vision exists to answer one question with the precision it deserves:{" "}
                            <strong style={{ color: "var(--foreground)" }}>
                                "Will the new crescent moon be visible tonight from my location - and why?"
                            </strong>
                        </p>
                        <p>
                            We implement the internationally recognised{" "}
                            <strong style={{ color: "var(--foreground)" }}>Yallop (1997)</strong> and{" "}
                            <strong style={{ color: "var(--foreground)" }}>Odeh (2004)</strong> visibility
                            criteria - the same standards used by Islamic calendar authorities in the UK, Malaysia,
                            and the international astronomical community - and present the results with the visual
                            clarity and interactivity that a 21st-century audience expects.
                        </p>
                        <p>
                            This platform is not a religious authority. It is a scientific instrument. It presents
                            mathematical predictions, historical data, and comparative calendrical analysis
                            side-by-side, empowering individuals and communities to engage critically and
                            transparently with Islamic timekeeping.
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
                        Who Is It For?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            {
                                icon: Moon,
                                title: "Muslim Communities",
                                desc: "Get a clear, location-specific prediction for crescent visibility before Ramadan, Eid, and every new Hijri month - without jargon.",
                                color: "#facc15",
                            },
                            {
                                icon: FlaskConical,
                                title: "Astronomers & Researchers",
                                desc: "Access raw q-values, ARCV/DAZ parameters, Odeh V-values, and the full ICOP historical dataset for validation and research.",
                                color: "#60a5fa",
                            },
                            {
                                icon: BookOpen,
                                title: "Islamic Calendar Scholars",
                                desc: "Compare Astronomical, Umm al-Qura, and Tabular Hijri calendars side-by-side. Understand exactly where and why civic calendars diverge from physical astronomy.",
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
                        Platform Tools
                    </h2>
                    <p className="text-sm mb-8" style={{ color: "var(--muted-foreground)" }}>
                        Six dedicated tools, each engineered for a specific aspect of lunar astronomy.
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
                        Technology
                    </h2>
                    <p className="text-sm mb-8" style={{ color: "var(--muted-foreground)" }}>
                        Built with modern web technologies for performance, accuracy, and global reach.
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
                                Deep Dive: Scientific Methodology
                            </h3>
                            <p
                                className="text-xs leading-relaxed"
                                style={{ color: "var(--muted-foreground)" }}
                            >
                                Read the full technical documentation - Yallop and Odeh criteria derivations,
                                triple-engine Hijri calendar algorithms, the Best-Time-to-Observe scoring function,
                                atmospheric refraction physics, and ICOP data sourcing.
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
                                Read Methodology
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
                        How We Compare
                    </h2>
                    <p className="text-sm mb-8" style={{ color: "var(--muted-foreground)" }}>
                        No competitor combines all of: 3D globe, weather overlay, real ICOP data, and a
                        Best-Time-to-Observe engine. Hilal Vision uniquely owns this combination.
                    </p>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs border-collapse">
                            <thead>
                                <tr>
                                    <th
                                        className="text-left py-3 px-3 font-semibold text-xs"
                                        style={{ color: "var(--foreground)", borderBottom: "1px solid var(--border)" }}
                                    >
                                        Feature
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
                                    { feature: "3D Interactive Globe", vals: [true, false, false, false, false] },
                                    { feature: "2D Visibility Map", vals: [true, true, false, false, true] },
                                    { feature: "Weather / Cloud Overlay", vals: [true, false, false, false, false] },
                                    { feature: "Best-Time Calculator", vals: [true, false, false, false, false] },
                                    { feature: "Real ICOP Sighting Data", vals: [true, true, false, true, false] },
                                    { feature: "Crowdsourced Reports", vals: [true, false, false, true, false] },
                                    { feature: "Triple-Engine Hijri Cal.", vals: [true, false, false, false, false] },
                                    { feature: "Scientific Detail (q/V)", vals: [true, true, false, false, false] },
                                    { feature: "Mobile App", vals: [false, false, true, true, false] },
                                    { feature: "Push Notifications", vals: [false, false, true, true, false] },
                                    { feature: "Photo Sightings", vals: [false, false, false, true, false] },
                                    { feature: "AR Moon Finder", vals: [false, false, false, false, false] },
                                    { feature: "Multi-Language", vals: [true, false, true, false, false] },
                                    { feature: "Animated Timeline", vals: [false, false, false, false, false] },
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
                                                            className="text-[13px]"
                                                            style={{ color: "color-mix(in oklch, var(--muted-foreground) 40%, transparent)" }}
                                                        >
                                                            -
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
                        Table reflects publicly available features as of February 2026. ✓ = available, - = not
                        available.
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
                        Data Sources & Attributions
                    </h2>
                    <p className="text-sm mb-8" style={{ color: "var(--muted-foreground)" }}>
                        Hilal Vision stands on the shoulders of decades of peer-reviewed astronomical research.
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
                                Proprietary Software
                            </h3>
                            <p
                                className="text-xs leading-relaxed mb-4"
                                style={{ color: "var(--muted-foreground)" }}
                            >
                                Hilal Vision is proprietary software. All rights are reserved. The source code is closed-source and protected by copyright law.
                            </p>
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-xs transition-colors"
                                style={{ color: "var(--gold-dim)" }}
                            >
                                <Github className="w-4 h-4" />
                                View on GitHub
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>

                        {/* Contact */}
                        <div className="breezy-card">
                            <h3
                                className="text-sm font-semibold mb-1"
                                style={{ color: "var(--foreground)" }}
                            >
                                Contact & Feedback
                            </h3>
                            <p
                                className="text-xs leading-relaxed mb-4"
                                style={{ color: "var(--muted-foreground)" }}
                            >
                                Found a bug, have a question about the methodology, or want to contribute sighting
                                data? We welcome feedback from the astronomical and Islamic community.
                            </p>
                            <div className="space-y-2">
                                <Link href="/privacy">
                                    <span
                                        className="flex items-center gap-2 text-xs transition-colors cursor-pointer"
                                        style={{ color: "var(--gold-dim)" }}
                                    >
                                        <Shield className="w-4 h-4" />
                                        Privacy Policy
                                    </span>
                                </Link>
                                <Link href="/terms">
                                    <span
                                        className="flex items-center gap-2 text-xs transition-colors cursor-pointer"
                                        style={{ color: "var(--gold-dim)" }}
                                    >
                                        <BookOpen className="w-4 h-4" />
                                        Terms of Service
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
