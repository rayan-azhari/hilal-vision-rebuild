import { SEO } from "@/components/SEO";
import { PageHeader } from "@/components/PageHeader";
import { useTranslation } from "react-i18next";
import { FlaskConical, ExternalLink } from "lucide-react";

function SectionDivider() {
    return (
        <div
            className="my-12 h-px"
            style={{
                background:
                    "linear-gradient(to right, transparent, color-mix(in oklch, var(--gold) 20%, transparent), transparent)",
            }}
        />
    );
}

function FormulaBlock({ children }: { children: React.ReactNode }) {
    return (
        <div
            className="my-6 px-5 py-4 rounded-xl font-mono text-sm overflow-x-auto"
            style={{
                background: "var(--space-deep)",
                border: "1px solid color-mix(in oklch, var(--gold) 18%, transparent)",
                color: "var(--gold)",
                lineHeight: "1.8",
            }}
        >
            {children}
        </div>
    );
}

function ZoneTable() {
    const { t } = useTranslation();
    const zones = [
        { zone: "A", range: "q ≥ +0.216", meaning: t("methodology.zoneA_mean"), color: "#4ade80" },
        { zone: "B", range: "−0.014 ≤ q < +0.216", meaning: t("methodology.zoneB_mean"), color: "#facc15" },
        { zone: "C", range: "−0.160 ≤ q < −0.014", meaning: t("methodology.zoneC_mean"), color: "#fb923c" },
        { zone: "D", range: "−0.232 ≤ q < −0.160", meaning: t("methodology.zoneD_mean"), color: "#f87171" },
        { zone: "E", range: "q < −0.232", meaning: t("methodology.zoneE_mean"), color: "#6b7280" },
        { zone: "F", range: "Moon below horizon", meaning: t("methodology.zoneF_mean"), color: "#374151" },
    ];

    return (
        <div className="overflow-x-auto my-6">
            <table className="w-full text-xs border-collapse">
                <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                        <th className="text-left py-2 px-3 font-semibold" style={{ color: "var(--foreground)" }}>{t("methodology.tableH_zone")}</th>
                        <th className="text-left py-2 px-3 font-semibold" style={{ color: "var(--foreground)" }}>{t("methodology.tableH_range")}</th>
                        <th className="text-left py-2 px-3 font-semibold" style={{ color: "var(--foreground)" }}>{t("methodology.tableH_interp")}</th>
                    </tr>
                </thead>
                <tbody>
                    {zones.map(({ zone, range, meaning, color }) => (
                        <tr key={zone} style={{ borderBottom: "1px solid color-mix(in oklch, var(--border) 50%, transparent)" }}>
                            <td className="py-2.5 px-3">
                                <span
                                    className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                                    style={{ background: color, color: zone === "E" || zone === "F" ? "#fff" : "var(--space)" }}
                                >
                                    {zone}
                                </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono" style={{ color: "var(--gold-dim)", whiteSpace: "nowrap" }}>
                                {range}
                            </td>
                            <td className="py-2.5 px-3" style={{ color: "var(--muted-foreground)" }}>
                                {meaning}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function OdehTable() {
    const { t } = useTranslation();
    const zones = [
        { zone: "A", range: "V ≥ +5.65", meaning: t("methodology.odehA_mean"), color: "#4ade80" },
        { zone: "B", range: "+2.00 ≤ V < +5.65", meaning: t("methodology.odehB_mean"), color: "#facc15" },
        { zone: "C", range: "−0.96 ≤ V < +2.00", meaning: t("methodology.odehC_mean"), color: "#fb923c" },
        { zone: "D", range: "V < −0.96", meaning: t("methodology.zoneE_mean"), color: "#6b7280" },
    ];

    return (
        <div className="overflow-x-auto my-6">
            <table className="w-full text-xs border-collapse">
                <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                        <th className="text-left py-2 px-3 font-semibold" style={{ color: "var(--foreground)" }}>{t("methodology.tableH_zone")}</th>
                        <th className="text-left py-2 px-3 font-semibold" style={{ color: "var(--foreground)" }}>{t("methodology.tableH_range2")}</th>
                        <th className="text-left py-2 px-3 font-semibold" style={{ color: "var(--foreground)" }}>{t("methodology.tableH_interp")}</th>
                    </tr>
                </thead>
                <tbody>
                    {zones.map(({ zone, range, meaning, color }) => (
                        <tr key={zone} style={{ borderBottom: "1px solid color-mix(in oklch, var(--border) 50%, transparent)" }}>
                            <td className="py-2.5 px-3">
                                <span
                                    className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                                    style={{ background: color, color: zone === "D" ? "#fff" : "var(--space)" }}
                                >
                                    {zone}
                                </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono" style={{ color: "var(--gold-dim)", whiteSpace: "nowrap" }}>
                                {range}
                            </td>
                            <td className="py-2.5 px-3" style={{ color: "var(--muted-foreground)" }}>
                                {meaning}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
    return (
        <h2
            id={id}
            className="text-2xl font-light mb-4 tracking-wide scroll-mt-24"
            style={{ color: "var(--foreground)" }}
        >
            {children}
        </h2>
    );
}

function SubHeading({ children }: { children: React.ReactNode }) {
    return (
        <h3
            className="text-base font-semibold mb-3 mt-8"
            style={{ color: "var(--foreground)" }}
        >
            {children}
        </h3>
    );
}

function Para({ children }: { children: React.ReactNode }) {
    return (
        <p
            className="text-sm leading-relaxed mb-4"
            style={{ color: "var(--muted-foreground)" }}
        >
            {children}
        </p>
    );
}

const TOC_IDS = ["problem", "yallop", "odeh", "calendar", "besttime", "grid", "icop", "telemetry", "refraction", "export", "refs"];

export default function MethodologyPage() {
    const { t } = useTranslation();
    const TOC = TOC_IDS.map((id, i) => ({ id, label: t(`methodology.toc_${i + 1}`) }));
    return (
        <div className="min-h-screen" style={{ background: "var(--space)" }}>
            <SEO
                title={t("methodology.heroTitle")}
                description={t("methodology.seoDesc")}
                path="/methodology"
            />

            {/* Hero */}
            <section
                className="relative overflow-hidden"
                style={{
                    background:
                        "radial-gradient(ellipse 60% 40% at 50% 0%, oklch(0.11 0.025 300) 0%, var(--space) 70%)",
                    paddingTop: "64px",
                    paddingBottom: "60px",
                }}
            >
                <div className="absolute inset-0 star-field opacity-30 pointer-events-none" />
                <div className="container relative z-10 max-w-3xl">
                    <div className="text-xs mb-4 tracking-wider" style={{ color: "var(--gold-dim)" }}>
                        {t("methodology.heroSubtitle")}
                    </div>
                    <h1
                        className="text-4xl md:text-5xl font-light tracking-tight mb-4 leading-tight"
                        style={{ color: "var(--foreground)" }}
                    >
                        Methodology & Algorithms
                    </h1>
                    <p
                        className="text-base leading-relaxed font-light max-w-xl"
                        style={{ color: "var(--muted-foreground)" }}
                    >
                        A complete technical reference for every algorithm, formula, and data source powering
                        Hilal Vision's astronomical calculations.
                    </p>
                </div>
            </section>

            <div
                className="sticky top-0 z-20 border-b backdrop-blur-sm"
                style={{
                    borderColor: "color-mix(in oklch, var(--gold) 10%, transparent)",
                    background: "color-mix(in oklch, var(--space) 90%, transparent)",
                }}
            >
                <PageHeader
                    icon={<FlaskConical />}
                    title={t("methodology.heroTitle")}
                    subtitle={t("methodology.headerSubtitle")}
                    className="max-w-5xl"
                />
            </div>

            {/* Layout: TOC sidebar + content */}
            <div className="container py-12 flex gap-10 max-w-5xl">

                {/* Sticky TOC (desktop only) */}
                <aside className="hidden lg:block w-56 shrink-0">
                    <div
                        className="sticky top-24 p-4 rounded-xl"
                        style={{
                            background: "var(--space-mid)",
                            border: "1px solid color-mix(in oklch, var(--gold) 10%, transparent)",
                        }}
                    >
                        <div
                            className="text-[11px] font-semibold mb-3 uppercase tracking-widest"
                            style={{ color: "var(--gold-dim)" }}
                        >
                            {t("methodology.toc_title")}
                        </div>
                        <nav className="space-y-1">
                            {TOC.map(({ id, label }) => (
                                <a
                                    key={id}
                                    href={`#${id}`}
                                    className="block text-xs py-1 px-2 rounded transition-colors hover:text-amber-300"
                                    style={{ color: "var(--muted-foreground)" }}
                                >
                                    {label}
                                </a>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Main content */}
                <article className="flex-1 min-w-0">

                    {/* ── 1. The Problem ─────────────────────────────── */}
                    <SectionHeading id="problem">{t("methodology.toc_1")}</SectionHeading>
                    <Para>
                        {t("methodology.s1_p1")}
                    </Para>
                    <Para>
                        {t("methodology.s1_p2")}
                    </Para>

                    <SectionDivider />

                    {/* ── 2. Yallop ───────────────────────────────────── */}
                    <SectionHeading id="yallop">{t("methodology.toc_2")}</SectionHeading>
                    <Para>
                        {t("methodology.s2_intro")}
                    </Para>

                    <SubHeading>{t("methodology.sub_inputParams")}</SubHeading>
                    <Para>
                        {t("methodology.s2_inputDesc")}
                    </Para>
                    <ul
                        className="text-sm mb-4 space-y-1 pl-4"
                        style={{ color: "var(--muted-foreground)", listStyleType: "disc" }}
                    >
                        <li><strong style={{ color: "var(--foreground)" }}>ARCV</strong> - {t("methodology.s2_arcv")}</li>
                        <li><strong style={{ color: "var(--foreground)" }}>W</strong> - {t("methodology.s2_w")}</li>
                    </ul>

                    <SubHeading>{t("methodology.sub_crescentWidth")}</SubHeading>
                    <Para>
                        {t("methodology.s2_cwDesc")}
                    </Para>
                    <FormulaBlock>
                        {`SD = arcsin(1737.4 / moonDist) × 60   [arcminutes]
W  = SD × (1 − cos(elongation))`}
                    </FormulaBlock>
                    <Para>
                        {t("methodology.s2_cwNote")}
                    </Para>

                    <SubHeading>{t("methodology.sub_qValue")}</SubHeading>
                    <FormulaBlock>
                        {`q = (ARCV − (11.8371 − 6.3226·W + 0.7319·W² − 0.1018·W³)) / 10`}
                    </FormulaBlock>
                    <Para>
                        {t("methodology.s2_qDesc")}
                    </Para>

                    <SubHeading>{t("methodology.sub_zoneClass")}</SubHeading>
                    <ZoneTable />
                    <Para>
                        {t("methodology.s2_zoneNote")}
                    </Para>

                    <SectionDivider />

                    {/* ── 3. Odeh ─────────────────────────────────────── */}
                    <SectionHeading id="odeh">{t("methodology.toc_3")}</SectionHeading>
                    <Para>
                        {t("methodology.s3_intro")}
                    </Para>

                    <SubHeading>{t("methodology.sub_vValue")}</SubHeading>
                    <FormulaBlock>
                        {`V = ARCV − (−0.1018·W³ + 0.7319·W² − 6.3226·W + 7.1651)`}
                    </FormulaBlock>
                    <Para>
                        {t("methodology.s3_vDesc")}
                    </Para>

                    <SubHeading>{t("methodology.sub_zoneClass2")}</SubHeading>
                    <OdehTable />
                    <Para>
                        {t("methodology.s3_zoneNote")}
                    </Para>

                    <SectionDivider />

                    {/* ── 4. Hijri Calendar ─────────────────────────────── */}
                    <SectionHeading id="calendar">{t("methodology.toc_4")}</SectionHeading>
                    <Para>
                        {t("methodology.s4_intro")}
                    </Para>

                    <SubHeading>{t("methodology.sub_engine1")}</SubHeading>
                    <Para>
                        {t("methodology.s4_engine1")}
                    </Para>

                    <SubHeading>{t("methodology.sub_engine2")}</SubHeading>
                    <Para>
                        {t("methodology.s4_engine2")}
                    </Para>

                    <SubHeading>{t("methodology.sub_engine3")}</SubHeading>
                    <Para>
                        {t("methodology.s4_engine3")}
                    </Para>



                    <SectionDivider />

                    {/* ── 5. Best Time ─────────────────────────────────── */}
                    <SectionHeading id="besttime">{t("methodology.toc_5")}</SectionHeading>
                    <Para>
                        {t("methodology.s5_intro")}
                    </Para>

                    <SubHeading>{t("methodology.sub_algorithm")}</SubHeading>
                    <Para>
                        {t("methodology.s5_algDesc")}
                    </Para>
                    <ul
                        className="text-sm mb-4 space-y-2 pl-4"
                        style={{ color: "var(--muted-foreground)", listStyleType: "disc" }}
                    >
                        <li>{t("methodology.s5_moonAlt")}</li>
                        <li>{t("methodology.s5_skyDark")}</li>
                        <li>{t("methodology.s5_altFact")}</li>
                    </ul>
                    <FormulaBlock>
                        {`score = moonAlt × darknessFactor × altFactor`}
                    </FormulaBlock>
                    <Para>
                        {t("methodology.s5_scoreDesc")}
                    </Para>

                    <SectionDivider />

                    {/* ── 6. Grid ──────────────────────────────────────── */}
                    <SectionHeading id="grid">{t("methodology.toc_6")}</SectionHeading>
                    <Para>
                        {t("methodology.s6_intro")}
                    </Para>

                    <SubHeading>{t("methodology.sub_resLevels")}</SubHeading>
                    <div className="overflow-x-auto my-4">
                        <table className="w-full text-xs border-collapse">
                            <thead>
                                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                                    <th className="text-left py-2 px-3 font-semibold" style={{ color: "var(--foreground)" }}>{t("methodology.gridTH_res")}</th>
                                    <th className="text-left py-2 px-3 font-semibold" style={{ color: "var(--foreground)" }}>{t("methodology.gridTH_pts")}</th>
                                    <th className="text-left py-2 px-3 font-semibold" style={{ color: "var(--foreground)" }}>{t("methodology.gridTH_use")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ["8°", "900", t("methodology.grid_r1")],
                                    ["4°", "3,600", t("methodology.grid_r2")],
                                    ["2°", "14,400", t("methodology.grid_r3")],
                                ].map(([res, pts, use]) => (
                                    <tr key={res} style={{ borderBottom: "1px solid color-mix(in oklch, var(--border) 50%, transparent)" }}>
                                        <td className="py-2 px-3 font-mono" style={{ color: "var(--gold-dim)" }}>{res}</td>
                                        <td className="py-2 px-3" style={{ color: "var(--muted-foreground)" }}>{pts}</td>
                                        <td className="py-2 px-3" style={{ color: "var(--muted-foreground)" }}>{use}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Para>
                        {t("methodology.s6_worker")}
                    </Para>
                    <Para>
                        {t("methodology.s6_cache")}
                    </Para>

                    <SectionDivider />

                    {/* ── 7. ICOP ──────────────────────────────────────── */}
                    <SectionHeading id="icop">{t("methodology.toc_7")}</SectionHeading>
                    <Para>
                        {t("methodology.s7_p1")}
                    </Para>
                    <Para>
                        {t("methodology.s7_p2")}
                    </Para>

                    <SectionDivider />

                    {/* ── 8. Telemetry ─────────────────────────────────── */}
                    <SectionHeading id="telemetry">{t("methodology.toc_8")}</SectionHeading>
                    <Para>
                        {t("methodology.s8_intro")}
                    </Para>

                    <SubHeading>{t("methodology.sub_zoneFReject")}</SubHeading>
                    <Para>
                        {t("methodology.s8_zoneF")}
                    </Para>

                    <SubHeading>{t("methodology.sub_rateLimit")}</SubHeading>
                    <Para>
                        {t("methodology.s8_rate")}
                    </Para>

                    <SubHeading>{t("methodology.sub_meteoEnrich")}</SubHeading>
                    <Para>
                        {t("methodology.s8_meteo")}
                    </Para>

                    <SectionDivider />

                    {/* ── 9. Refraction ────────────────────────────────── */}
                    <SectionHeading id="refraction">{t("methodology.toc_9")}</SectionHeading>
                    <Para>
                        {t("methodology.s9_intro")}
                    </Para>
                    <Para>
                        {t("methodology.s9_refDesc")}
                    </Para>
                    <FormulaBlock>
                        {`R₀ = 1.02 / tan(h + 10.3 / (h + 5.11))   [arcminutes]
R  = R₀ × (P / 1010) × (283 / (273 + T))`}
                    </FormulaBlock>
                    <Para>
                        {t("methodology.s9_refVars")}
                    </Para>

                    <SubHeading>{t("methodology.sub_atmosOverride")}</SubHeading>
                    <Para>
                        {t("methodology.s9_atmos1")}
                    </Para>
                    <Para>
                        {t("methodology.s9_atmos2")}
                    </Para>
                    <FormulaBlock>
                        {`R_std = 34/60°  (standard near-horizon refraction)
R_true = R_std × (P / 1010) × (283 / (273 + T))
Δrefraction = R_true − R_std`}
                    </FormulaBlock>

                    <SubHeading>{t("methodology.sub_dem")}</SubHeading>
                    <Para>
                        {t("methodology.s9_dem1")}
                    </Para>
                    <FormulaBlock>
                        {`dip = 1.76 × √(elevation)   [arcminutes]`}
                    </FormulaBlock>
                    <Para>
                        {t("methodology.s9_dem2")}
                    </Para>

                    <SectionDivider />

                    {/* ── 10. Data Export & Public API ──────────────── */}
                    <SectionHeading id="export">{t("methodology.toc_10")}</SectionHeading>

                    <SubHeading>{t("methodology.sub_csvJson")}</SubHeading>
                    <Para>
                        {t("methodology.s10_csv")}
                    </Para>

                    <SubHeading>{t("methodology.sub_restApi")}</SubHeading>
                    <Para>
                        {t("methodology.s10_api")}
                    </Para>
                    <div className="overflow-x-auto my-4">
                        <table className="w-full text-xs border-collapse">
                            <thead>
                                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                                    <th className="text-left py-2 px-3 font-semibold" style={{ color: "var(--foreground)" }}>{t("methodology.apiTH_endpoint")}</th>
                                    <th className="text-left py-2 px-3 font-semibold" style={{ color: "var(--foreground)" }}>{t("methodology.apiTH_params")}</th>
                                    <th className="text-left py-2 px-3 font-semibold" style={{ color: "var(--foreground)" }}>{t("methodology.apiTH_returns")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ borderBottom: "1px solid color-mix(in oklch, var(--border) 50%, transparent)" }}>
                                    <td className="py-2 px-3 font-mono" style={{ color: "var(--gold-dim)" }}>/api/v1/visibility</td>
                                    <td className="py-2 px-3" style={{ color: "var(--muted-foreground)" }}>lat, lng, date (ISO)</td>
                                    <td className="py-2 px-3" style={{ color: "var(--muted-foreground)" }}>Visibility zone (A–F), q-value, ARCV, W, elongation</td>
                                </tr>
                                <tr style={{ borderBottom: "1px solid color-mix(in oklch, var(--border) 50%, transparent)" }}>
                                    <td className="py-2 px-3 font-mono" style={{ color: "var(--gold-dim)" }}>/api/v1/moon-phases</td>
                                    <td className="py-2 px-3" style={{ color: "var(--muted-foreground)" }}>lat, lng, date (ISO)</td>
                                    <td className="py-2 px-3" style={{ color: "var(--muted-foreground)" }}>Phase, illumination, age, altitude, azimuth, rise/set times</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <Para>
                        {t("methodology.s10_zodNote")}
                    </Para>

                    <SectionDivider />

                    {/* ── 10. References ───────────────────────────────── */}
                    <SectionHeading id="refs">{t("methodology.toc_11")}</SectionHeading>
                    <div className="space-y-3">
                        {[
                            {
                                author: "Yallop, B.D. (1997)",
                                title: "A Method for Predicting the First Sighting of the New Crescent Moon",
                                pub: "HM Nautical Almanac Office - NAO Technical Note No. 69",
                                href: "https://astronomycenter.net/pdf/yallop_1997.pdf",
                            },
                            {
                                author: "Odeh, M.S. (2004)",
                                title: "New Criterion for Lunar Crescent Visibility",
                                pub: "Experimental Astronomy, 18(1–3): 39–64",
                                href: "https://www.researchgate.net/publication/225099773",
                            },
                            {
                                author: "Meeus, J. (1998)",
                                title: "Astronomical Algorithms, 2nd Edition",
                                pub: "Willmann-Bell - Foundational reference for astronomical algorithms",
                                href: "https://www.willbell.com/math/mc1.htm",
                            },
                            {
                                author: "Cross, D.",
                                title: "astronomy-engine - High precision astronomy algorithms",
                                pub: "JavaScript and C implementations of Novas & JPL DE405",
                                href: "https://github.com/cosinekitty/astronomy",
                            },
                            {
                                author: "International Astronomical Center",
                                title: "Islamic Crescents' Observation Project (ICOP)",
                                pub: "International database of crescent sighting reports since 1998",
                                href: "https://astronomycenter.net/icop.html?l=en",
                            },
                            {
                                author: "Khan, A.A. (2001)",
                                title: "Crescent Sighting Using the Umm al-Qura Calendar in Saudi Arabia",
                                pub: "Astronomy Center Technical Papers",
                                href: "https://astronomycenter.net/pdf/khan_2001.pdf",
                            },
                        ].map(({ author, title, pub, href }) => (
                            <a
                                key={href}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="breezy-card group flex items-start gap-3 cursor-pointer hover:-translate-y-0.5 transition-transform"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span
                                            className="text-xs font-semibold"
                                            style={{ color: "var(--foreground)" }}
                                        >
                                            {author}
                                        </span>
                                        <ExternalLink
                                            className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-60 transition-opacity"
                                            style={{ color: "var(--gold)" }}
                                        />
                                    </div>
                                    <div
                                        className="text-xs italic mb-0.5"
                                        style={{ color: "var(--gold-dim)" }}
                                    >
                                        {title}
                                    </div>
                                    <div
                                        className="text-[11px]"
                                        style={{ color: "var(--muted-foreground)" }}
                                    >
                                        {pub}
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </article>
            </div>
        </div>
    );
}
