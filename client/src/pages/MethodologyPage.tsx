import { SEO } from "@/components/SEO";
import { PageHeader } from "@/components/PageHeader";
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
    const zones = [
        { zone: "A", range: "q ≥ +0.216", meaning: "Easily visible with naked eye", color: "#4ade80" },
        { zone: "B", range: "−0.014 ≤ q < +0.216", meaning: "Visible under perfect conditions", color: "#facc15" },
        { zone: "C", range: "−0.160 ≤ q < −0.014", meaning: "Binoculars may be needed to find crescent", color: "#fb923c" },
        { zone: "D", range: "−0.232 ≤ q < −0.160", meaning: "Visible only with telescope", color: "#f87171" },
        { zone: "E", range: "q < −0.232", meaning: "Not visible even with optical aid", color: "#6b7280" },
        { zone: "F", range: "Moon below horizon", meaning: "Impossible - below horizon at sunset", color: "#374151" },
    ];

    return (
        <div className="overflow-x-auto my-6">
            <table className="w-full text-xs border-collapse">
                <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                        <th className="text-left py-2 px-3 font-semibold" style={{ color: "var(--foreground)" }}>Zone</th>
                        <th className="text-left py-2 px-3 font-semibold" style={{ color: "var(--foreground)" }}>q-value Range</th>
                        <th className="text-left py-2 px-3 font-semibold" style={{ color: "var(--foreground)" }}>Interpretation</th>
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
    const zones = [
        { zone: "A", range: "V ≥ +5.65", meaning: "Visible by naked eye", color: "#4ade80" },
        { zone: "B", range: "+2.00 ≤ V < +5.65", meaning: "Visible by optical aid; possibly naked eye", color: "#facc15" },
        { zone: "C", range: "−0.96 ≤ V < +2.00", meaning: "Visible by optical aid only", color: "#fb923c" },
        { zone: "D", range: "V < −0.96", meaning: "Not visible even with optical aid", color: "#6b7280" },
    ];

    return (
        <div className="overflow-x-auto my-6">
            <table className="w-full text-xs border-collapse">
                <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                        <th className="text-left py-2 px-3 font-semibold" style={{ color: "var(--foreground)" }}>Zone</th>
                        <th className="text-left py-2 px-3 font-semibold" style={{ color: "var(--foreground)" }}>V-value Range</th>
                        <th className="text-left py-2 px-3 font-semibold" style={{ color: "var(--foreground)" }}>Interpretation</th>
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

const TOC = [
    { id: "problem", label: "1. The Crescent Visibility Problem" },
    { id: "yallop", label: "2. Yallop (1997) Criterion" },
    { id: "odeh", label: "3. Odeh (2004) Criterion" },
    { id: "calendar", label: "4. Triple-Engine Hijri Calendar" },
    { id: "besttime", label: "5. Best-Time-to-Observe Calculator" },
    { id: "grid", label: "6. World Visibility Grid" },
    { id: "icop", label: "7. ICOP Archive" },
    { id: "telemetry", label: "8. Crowdsourced Telemetry & Validation" },
    { id: "refraction", label: "9. Atmospheric Refraction & DEM" },
    { id: "export", label: "10. Data Export & Public API" },
    { id: "refs", label: "11. References" },
];

export default function MethodologyPage() {
    return (
        <div className="min-h-screen" style={{ background: "var(--space)" }}>
            <SEO
                title="Methodology"
                description="Technical methodology behind Hilal Vision - Yallop & Odeh criteria, triple-engine Hijri calendar, Best-Time-to-Observe algorithm, ICOP archive, and atmospheric refraction physics."
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
                        Scientific Documentation - علم الفلك
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
                    title="Methodology"
                    subtitle="Algorithms, formulas, and data sources"
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
                            Contents
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
                    <SectionHeading id="problem">1. The Crescent Visibility Problem</SectionHeading>
                    <Para>
                        The Islamic lunar calendar begins each month with the physical sighting of the new
                        crescent moon (<span className="font-arabic" style={{ color: "var(--gold-dim)" }}>الهلال</span>)
                        at sunset. At the moment of astronomical conjunction - when the Sun and Moon share the
                        same geocentric ecliptic longitude - the moon is entirely invisible from Earth. Visibility
                        only becomes possible as the moon moves away from the Sun's glare, forming a thin illuminated
                        sliver.
                    </Para>
                    <Para>
                        Whether that sliver is actually observable depends on a complex interplay of geometry,
                        atmospheric physics, and the observer's location on Earth. Simple single-parameter models
                        based solely on moon age or lag time are historically unreliable. A moon that is 24 hours
                        old may be invisible if its ecliptic latitude is unfavourable, while a younger moon at a
                        high latiude may be easily seen. Modern predictive engines therefore rely on bi-parametric
                        polynomial criteria that combine altitude and crescent width.
                    </Para>

                    <SectionDivider />

                    {/* ── 2. Yallop ───────────────────────────────────── */}
                    <SectionHeading id="yallop">2. Yallop (1997) Criterion</SectionHeading>
                    <Para>
                        The <strong style={{ color: "var(--foreground)" }}>Yallop criterion</strong> was developed
                        by B.D. Yallop of HM Nautical Almanac Office in 1997 and is the primary visibility
                        classification used throughout Hilal Vision. It is widely adopted by Islamic calendar
                        authorities in the UK, Malaysia, and internationally.
                    </Para>

                    <SubHeading>Input Parameters</SubHeading>
                    <Para>
                        Two parameters are computed at the "Best Time" - approximately 4/9ths of the lag time
                        (duration between sunset and moonset) after sunset:
                    </Para>
                    <ul
                        className="text-sm mb-4 space-y-1 pl-4"
                        style={{ color: "var(--muted-foreground)", listStyleType: "disc" }}
                    >
                        <li>
                            <strong style={{ color: "var(--foreground)" }}>ARCV</strong> - Arc of Vision: the
                            moon's altitude above the horizon minus the sun's altitude at the moment of evaluation
                            (degrees).
                        </li>
                        <li>
                            <strong style={{ color: "var(--foreground)" }}>W</strong> - Topocentric Crescent Width:
                            the width of the illuminated crescent in arcminutes.
                        </li>
                    </ul>

                    <SubHeading>Crescent Width Formula</SubHeading>
                    <Para>
                        The crescent width W is derived from the moon's angular semi-diameter SD and its elongation
                        from the Sun:
                    </Para>
                    <FormulaBlock>
                        {`SD = arcsin(1737.4 / moonDist) × 60   [arcminutes]
W  = SD × (1 − cos(elongation))`}
                    </FormulaBlock>
                    <Para>
                        Where <code>moonDist</code> is the geocentric lunar distance in kilometres. The
                        semi-diameter at mean distance is approximately 15.5 arcminutes.
                    </Para>

                    <SubHeading>q-value Formula</SubHeading>
                    <FormulaBlock>
                        {`q = (ARCV − (11.8371 − 6.3226·W + 0.7319·W² − 0.1018·W³)) / 10`}
                    </FormulaBlock>
                    <Para>
                        The polynomial <code>(11.8371 − 6.3226·W + 0.7319·W² − 0.1018·W³)</code> models the
                        minimum ARCV required for a crescent of width W to be visible. The q-value represents
                        how far above or below this threshold the actual ARCV falls.
                    </Para>

                    <SubHeading>Visibility Zone Classification</SubHeading>
                    <ZoneTable />
                    <Para>
                        Zones C and D often represent the most significant points of contention in traditional
                        sighting committees, where the difference between naked-eye and optical-aid sighting
                        determines when a country declares the start of a month.
                    </Para>

                    <SectionDivider />

                    {/* ── 3. Odeh ─────────────────────────────────────── */}
                    <SectionHeading id="odeh">3. Odeh (2004) Criterion</SectionHeading>
                    <Para>
                        The <strong style={{ color: "var(--foreground)" }}>Odeh criterion</strong> was developed
                        by Mohammad Odeh in 2004 as a refinement based on a larger dataset of 737 sightings, many
                        collected through the Islamic Crescents' Observation Project (ICOP). It is displayed in
                        Pro Mode as a secondary classification to cross-validate borderline predictions.
                    </Para>

                    <SubHeading>V-value Formula</SubHeading>
                    <FormulaBlock>
                        {`V = ARCV − (−0.1018·W³ + 0.7319·W² − 6.3226·W + 7.1651)`}
                    </FormulaBlock>
                    <Para>
                        The Odeh criterion uses airless topocentric ARCV values - stripping away refraction during
                        the initial calculation phase to provide a standardised geometric baseline before
                        atmospheric corrections are applied.
                    </Para>

                    <SubHeading>Zone Classification</SubHeading>
                    <OdehTable />
                    <Para>
                        In regions where Yallop and Odeh diverge, the map may mark borderline areas as
                        uncertain - acknowledging that local variations in atmospheric transparency and observer
                        eye sensitivity become the dominant factors.
                    </Para>

                    <SectionDivider />

                    {/* ── 4. Hijri Calendar ─────────────────────────────── */}
                    <SectionHeading id="calendar">4. Triple-Engine Hijri Calendar</SectionHeading>
                    <Para>
                        The Hijri Calendar page supports three distinct calculation engines that each represent
                        a fundamentally different philosophy of Islamic timekeeping.
                    </Para>

                    <SubHeading>Engine 1 - Astronomical (astronomy-engine)</SubHeading>
                    <Para>
                        Uses a conjunction-based algorithm to detect the physical new moon. The
                        function <code style={{ color: "var(--gold-dim)" }}>findNewMoonNear()</code> employs a
                        two-pass search using astronomy-engine's phase computations:
                        a coarse 6-hour sweep followed by a 30-minute fine sweep to locate the phase minimum.
                        Months are counted relative to an epoch of 1 Muharram 1446 AH ≈ 7 July 2024. This
                        represents true physical reality and may differ from civic calendars by ±1 day.
                    </Para>

                    <SubHeading>Engine 2 - Umm al-Qura</SubHeading>
                    <Para>
                        The official civic calendar of Saudi Arabia, used for administrative and religious
                        announcements. Powered by the pre-computed KACST tables via the{" "}
                        <code style={{ color: "var(--gold-dim)" }}>@umalqura/core</code> package. Since 1423 AH
                        (2002 CE), the Umm al-Qura calendar requires two conditions: the geocentric conjunction
                        must occur before sunset in Mecca, and the moon must set after the sun in Mecca. This
                        means the calendar does not require actual naked-eye visibility - in roughly 75% of cases
                        where it starts a month, the crescent is too thin to be seen without instruments.
                    </Para>

                    <SubHeading>Engine 3 - Tabular (Kuwaiti)</SubHeading>
                    <Para>
                        The standard arithmetic approximation widely used in software applications. Implemented
                        via Julian Date conversions (<code style={{ color: "var(--gold-dim)" }}>gregorianToJD</code>,{" "}
                        <code style={{ color: "var(--gold-dim)" }}>jdToHijri</code>). Uses the Kuwaiti algorithm
                        which provides a practical, deterministic date without requiring any astronomical
                        computation. Fastest to compute and most portable, but least physically accurate.
                    </Para>



                    <SectionDivider />

                    {/* ── 5. Best Time ─────────────────────────────────── */}
                    <SectionHeading id="besttime">5. Best-Time-to-Observe Calculator</SectionHeading>
                    <Para>
                        The <code style={{ color: "var(--gold-dim)" }}>computeBestObservationTime(date, location)</code> function
                        determines the optimal time window for crescent moon observation at any location on Earth.
                    </Para>

                    <SubHeading>Algorithm</SubHeading>
                    <Para>
                        The function scans from <strong style={{ color: "var(--foreground)" }}>sunset</strong> to{" "}
                        <strong style={{ color: "var(--foreground)" }}>moonset</strong> (or sunset + 2 hours if
                        moonset is unavailable or before sunset) in <strong style={{ color: "var(--foreground)" }}>5-minute steps</strong>.
                        At each step it evaluates three factors:
                    </Para>
                    <ul
                        className="text-sm mb-4 space-y-2 pl-4"
                        style={{ color: "var(--muted-foreground)", listStyleType: "disc" }}
                    >
                        <li>
                            <strong style={{ color: "var(--foreground)" }}>Moon altitude</strong> - must be above
                            the horizon (&gt; 0°). Penalised heavily for very low altitudes where atmospheric
                            extinction increases airmass ∝ 1/sin(alt).
                        </li>
                        <li>
                            <strong style={{ color: "var(--foreground)" }}>Sky darkness factor</strong> - scores
                            the twilight level: 1.0 (astronomical twilight, sun &lt; −12°), 0.8 (nautical, sun &lt;
                            −6°), 0.5 (civil, sun &lt; 0°), 0.1 (day).
                        </li>
                        <li>
                            <strong style={{ color: "var(--foreground)" }}>Altitude factor</strong> - penalises
                            very low altitudes where atmospheric extinction is highest.
                        </li>
                    </ul>
                    <FormulaBlock>
                        {`score = moonAlt × darknessFactor × altFactor`}
                    </FormulaBlock>
                    <Para>
                        The time step with the highest composite score is returned as the optimal observation
                        moment, along with the full window, moon/sun altitudes, and a{" "}
                        <code style={{ color: "var(--gold-dim)" }}>viable</code> flag indicating whether any
                        valid observation window exists on that date.
                    </Para>

                    <SectionDivider />

                    {/* ── 6. Grid ──────────────────────────────────────── */}
                    <SectionHeading id="grid">6. World Visibility Grid</SectionHeading>
                    <Para>
                        The <code style={{ color: "var(--gold-dim)" }}>generateVisibilityGrid()</code> function
                        computes crescent visibility for a regular latitude/longitude grid covering the entire
                        Earth's surface.
                    </Para>

                    <SubHeading>Resolution Levels</SubHeading>
                    <div className="overflow-x-auto my-4">
                        <table className="w-full text-xs border-collapse">
                            <thead>
                                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                                    <th className="text-left py-2 px-3 font-semibold" style={{ color: "var(--foreground)" }}>Resolution</th>
                                    <th className="text-left py-2 px-3 font-semibold" style={{ color: "var(--foreground)" }}>Grid Points</th>
                                    <th className="text-left py-2 px-3 font-semibold" style={{ color: "var(--foreground)" }}>Use Case</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ["8°", "900", "Preview pass (~100ms) - immediate visual feedback"],
                                    ["4°", "3,600", "Standard pass - default map rendering"],
                                    ["2°", "14,400", "High-quality pass (~800ms) - full detail"],
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
                        The computation is entirely offloaded to a{" "}
                        <strong style={{ color: "var(--foreground)" }}>Web Worker</strong>, ensuring the UI
                        remains at 60 FPS during the expensive calculation. The worker uses a two-pass progressive
                        rendering strategy: an immediate 8° preview, replaced by the 2° high-fidelity pass
                        approximately 800ms later.
                    </Para>
                    <Para>
                        Computed textures are cached in an LRU map keyed by{" "}
                        <code style={{ color: "var(--gold-dim)" }}>"YYYY-M-D-WxH-RES"</code> (24-entry cache),
                        so navigating back to a previously viewed date requires no recomputation.
                    </Para>

                    <SectionDivider />

                    {/* ── 7. ICOP ──────────────────────────────────────── */}
                    <SectionHeading id="icop">7. ICOP Historical Archive</SectionHeading>
                    <Para>
                        The <strong style={{ color: "var(--foreground)" }}>Islamic Crescents' Observation Project
                            (ICOP)</strong> is an international initiative maintained by the International
                        Astronomical Center (IAC) that has collected crowdsourced lunar sighting reports since
                        1998. Hilal Vision's Archive page features over{" "}
                        <strong style={{ color: "var(--foreground)" }}>1,000 authentic sighting records</strong>{" "}
                        spanning 1438–1465 AH, making it one of the most comprehensive public datasets of
                        verified crescent observations.
                    </Para>
                    <Para>
                        These real-world sightings serve as empirical ground truth against which Hilal Vision's
                        theoretical Yallop/Odeh predictions can be validated. The side-by-side comparison - theory
                        versus actual crowdsourced report - allows users to assess the predictive power of the
                        mathematical models and understand why borderline (Zone C/D) predictions sometimes
                        disagree with physical reality.
                    </Para>

                    <SectionDivider />

                    {/* ── 8. Telemetry ─────────────────────────────────── */}
                    <SectionHeading id="telemetry">8. Crowdsourced Telemetry & Smart Validation</SectionHeading>
                    <Para>
                        Hilal Vision allows authenticated users to submit real-time crescent sighting reports
                        that are stored in a MySQL database and displayed on the live map.
                    </Para>

                    <SubHeading>Smart Zone F Rejection</SubHeading>
                    <Para>
                        A key architectural safeguard: when a physical sighting is claimed, the backend
                        mathematically computes the geometric position of the sun and moon at the precise
                        submitted timestamp and location. If the mathematics determine that the moon is
                        definitively below the horizon (Zone F), the server rejects the payload - preventing
                        malicious or erroneous data from corrupting the crowdsourced dataset.
                    </Para>

                    <SubHeading>Rate Limiting</SubHeading>
                    <Para>
                        Submissions are protected by{" "}
                        <strong style={{ color: "var(--foreground)" }}>Upstash Redis</strong> sliding window
                        rate limiting - a maximum of 5 reports per IP address per minute. This prevents
                        DDoS attacks and preserves data integrity during high-traffic periods (e.g. the eve of
                        Ramadan).
                    </Para>

                    <SubHeading>Meteorological Enrichment</SubHeading>
                    <Para>
                        Each submitted report is automatically enriched with real-time meteorological data from
                        Open-Meteo - including cloud cover percentage, surface pressure, and aerosol optical
                        depth at the observer's exact coordinates. This ancillary data enables future sightability
                        score modeling that combines astronomical prediction with atmospheric conditions.
                    </Para>

                    <SectionDivider />

                    {/* ── 9. Refraction ────────────────────────────────── */}
                    <SectionHeading id="refraction">9. Atmospheric Refraction & DEM Integration</SectionHeading>
                    <Para>
                        Atmospheric refraction is the bending of light as it passes through layers of air with
                        increasing density near Earth's surface. At the horizon, this effect reaches approximately{" "}
                        <strong style={{ color: "var(--foreground)" }}>34 arcminutes</strong> - enough to make the
                        sun or moon appear fully above the horizon when they are geometrically below it.
                    </Para>
                    <Para>
                        The Horizon View page models refraction using Saemundsson's inverse formula, correcting
                        for local temperature and atmospheric pressure:
                    </Para>
                    <FormulaBlock>
                        {`R₀ = 1.02 / tan(h + 10.3 / (h + 5.11))   [arcminutes]
R  = R₀ × (P / 1010) × (283 / (273 + T))`}
                    </FormulaBlock>
                    <Para>
                        Where <code>h</code> is the apparent altitude in degrees, <code>P</code> is atmospheric
                        pressure in hPa, and <code>T</code> is temperature in Celsius. Real-time P and T values
                        are fetched from Open-Meteo's forecast API. Without this correction, the simulated moon
                        would appear lower than its physically observed position - particularly critical for
                        near-horizon sightings.
                    </Para>

                    <SubHeading>Atmospheric Overrides</SubHeading>
                    <Para>
                        Both the 2D Map and 3D Globe pages feature a collapsible{" "}
                        <strong style={{ color: "var(--foreground)" }}>Atmospheric Overrides</strong> panel.
                        Users can manually set temperature (°C), pressure (hPa), and observer elevation (m),
                        or toggle <strong style={{ color: "var(--foreground)" }}>Auto-fetch</strong> to pull
                        real-time values from Open-Meteo's weather API based on the selected location.
                    </Para>
                    <Para>
                        These parameters feed into the refraction correction formula. The delta between
                        standard refraction (10°C, 1010 hPa) and the corrected refraction is applied to
                        both sun and moon altitude calculations:
                    </Para>
                    <FormulaBlock>
                        {`R_std = 34/60°  (standard near-horizon refraction)
R_true = R_std × (P / 1010) × (283 / (273 + T))
Δrefraction = R_true − R_std`}
                    </FormulaBlock>

                    <SubHeading>Digital Elevation Model (DEM)</SubHeading>
                    <Para>
                        The application integrates the{" "}
                        <strong style={{ color: "var(--foreground)" }}>Open-Meteo Elevation API</strong> to
                        fetch the true terrain elevation at any clicked point. This provides accurate horizon
                        dip calculations via the formula:
                    </Para>
                    <FormulaBlock>
                        {`dip = 1.76 × √(elevation)   [arcminutes]`}
                    </FormulaBlock>
                    <Para>
                        A DEM tRPC endpoint (<code style={{ color: "var(--gold-dim)" }}>dem.getDem</code>)
                        queries the Open-Meteo Elevation API, caching results and returning the terrain
                        elevation in meters above sea level. This elevation is displayed in the
                        enhanced map click tooltip and factored into all sun/moon altitude calculations.
                    </Para>

                    <SectionDivider />

                    {/* ── 10. Data Export & Public API ──────────────── */}
                    <SectionHeading id="export">10. Data Export & Public API</SectionHeading>

                    <SubHeading>CSV & JSON Export</SubHeading>
                    <Para>
                        The Archive page provides one-click export buttons for both{" "}
                        <strong style={{ color: "var(--foreground)" }}>ICOP observation data</strong> (City,
                        Country, Result, Optical Aid) and{" "}
                        <strong style={{ color: "var(--foreground)" }}>computed visibility tables</strong> (City,
                        Country, Zone, Q-Value). The Live Sighting Feed widget also includes a download
                        button with CSV and JSON options for exporting crowdsourced sighting reports.
                    </Para>

                    <SubHeading>Public REST API</SubHeading>
                    <Para>
                        Hilal Vision exposes standalone Express REST endpoints for programmatic access to
                        astronomical data:
                    </Para>
                    <div className="overflow-x-auto my-4">
                        <table className="w-full text-xs border-collapse">
                            <thead>
                                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                                    <th className="text-left py-2 px-3 font-semibold" style={{ color: "var(--foreground)" }}>Endpoint</th>
                                    <th className="text-left py-2 px-3 font-semibold" style={{ color: "var(--foreground)" }}>Parameters</th>
                                    <th className="text-left py-2 px-3 font-semibold" style={{ color: "var(--foreground)" }}>Returns</th>
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
                        All inputs are validated with Zod schemas. Invalid or out-of-range parameters return
                        structured error responses with descriptive messages.
                    </Para>

                    <SectionDivider />

                    {/* ── 10. References ───────────────────────────────── */}
                    <SectionHeading id="refs">11. References</SectionHeading>
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
