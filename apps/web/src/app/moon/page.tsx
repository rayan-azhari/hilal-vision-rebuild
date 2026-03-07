"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, ArrowRight, Clock, Eye } from "lucide-react";
import { getMoonPhaseInfo, computeSunMoonAtSunset } from "@hilal/astronomy";
import { useAppStore } from "@/store/useAppStore";
import * as Astronomy from "astronomy-engine";
import { BreezyDetailCard } from "@/components/BreezyDetailCard";
import { BreezyFullCard } from "@/components/BreezyFullCard";
import { VisibilityDotScale, IlluminationArc, LunarAgeProgress, AzimuthCompass, ElongationVisual, CountdownCircle } from "@/components/BreezyVisuals";
import { SunMoonAltitudeChart } from "@/components/SunMoonAltitudeChart";
import { SkyDomeChart } from "@/components/SkyDomeChart";
import { PhysicsExplanations } from "@/components/PhysicsExplanations";
import { ProGate } from "@/components/ProGate";
import { useTranslation } from "react-i18next";

function formatTime(date: Date | null) {
    if (!date) return "--:--";
    return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

import { MoonIllustration } from "@/components/MoonIllustration";

function PhaseCalendarStrip({ baseDate }: { baseDate: Date }) {
    const days = Array.from({ length: 30 }, (_, i) => {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + i);
        const phaseNormal = Astronomy.MoonPhase(d) / 360.0;
        const illum = Astronomy.Illumination(Astronomy.Body.Moon, d);
        return { date: d, phase: phaseNormal, fraction: illum.phase_fraction };
    });

    const today = new Date();

    return (
        <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-foreground/10 scrollbar-track-transparent">
            {days.map(({ date, phase }, i) => {
                const isToday = date.toDateString() === today.toDateString();
                const r = 12;
                const cx = 14;
                const cy = 14;
                const isWaxing = phase <= 0.5;
                const k = phase * 2;
                const rx = Math.abs(r * Math.cos(Math.PI * k));
                const baseSweep = isWaxing ? 1 : 0;
                let termSweep;
                if (phase <= 0.25) termSweep = 0;
                else if (phase <= 0.5) termSweep = 1;
                else if (phase <= 0.75) termSweep = 0;
                else termSweep = 1;
                const litPath = `M ${cx} ${cy - r} A ${r} ${r} 0 0 ${baseSweep} ${cx} ${cy + r} A ${rx} ${r} 0 0 ${termSweep} ${cx} ${cy - r} Z`;

                return (
                    <div
                        key={i}
                        className="flex flex-col items-center gap-1 flex-shrink-0"
                        style={{ minWidth: "36px" }}
                    >
                        <svg viewBox="0 0 28 28" width={28} height={28} suppressHydrationWarning>
                            <circle cx={cx} cy={cy} r={r} fill="oklch(0.15 0.02 265)" />
                            <path d={litPath} fill="var(--gold)" opacity="0.85" suppressHydrationWarning />
                        </svg>
                        <span
                            className="text-xs"
                            style={{
                                color: isToday ? "var(--gold)" : "var(--muted-foreground)",
                                fontWeight: isToday ? 600 : 400,
                            }}
                        >
                            {date.getDate()}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

export default function MoonPage() {
    const { location, date } = useAppStore();
    const { t } = useTranslation();
    const [moonInfo, setMoonInfo] = useState(() => getMoonPhaseInfo(date));
    const [sunMoon, setSunMoon] = useState(() => computeSunMoonAtSunset(date, location));
    const [countdown, setCountdown] = useState("");

    // SSR-safe default (noon) — updated to current time on client via useEffect
    const [sharedMinutes, setSharedMinutes] = useState(12 * 60);

    // Set sharedMinutes to current time on initial mount (client only)
    useEffect(() => {
        const now = new Date();
        if (now.toDateString() === date.toDateString()) {
            setSharedMinutes(now.getHours() * 60 + now.getMinutes());
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        setMoonInfo(getMoonPhaseInfo(date));
        setSunMoon(computeSunMoonAtSunset(date, location));

        const now = new Date();
        if (now.toDateString() === date.toDateString()) {
            setSharedMinutes(now.getHours() * 60 + now.getMinutes());
        } else {
            setSharedMinutes(12 * 60);
        }
    }, [date, location]);

    useEffect(() => {
        const update = () => {
            const now = new Date();
            const diff = moonInfo.nextNewMoon.getTime() - now.getTime();
            if (diff <= 0) { setCountdown("Right Now"); return; }
            const d = Math.floor(diff / 86400000);
            const h = Math.floor((diff % 86400000) / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setCountdown(`${d}d ${h}h ${m}m ${s}s`);
        };
        update();
        const id = setInterval(update, 1000);
        return () => clearInterval(id);
    }, [moonInfo.nextNewMoon]);

    const phasePercent = moonInfo.phase * 100;

    return (
        <div className="pt-6 pb-16 max-w-7xl mx-auto px-4 border-l border-r border-border/20">

                <div className="flex flex-col mb-12 relative">
                    <div className="absolute top-0 left-0 w-32 h-32 rounded-full blur-[60px] pointer-events-none -translate-x-12 -translate-y-12" style={{ background: "color-mix(in oklch, var(--gold) 5%, transparent)" }} />
                    <div className="z-10 relative">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-foreground/5 border border-border/40 text-xs font-medium text-muted-foreground mb-4">
                            <Moon className="w-3.5 h-3.5" style={{ color: "var(--gold)" }} />
                            <span>Precision Analytics</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-display font-medium tracking-tight mb-3">
                            Lunar <span className="text-muted-foreground italic">Dashboard</span>
                        </h1>
                        <p className="text-muted-foreground max-w-xl text-lg leading-relaxed">
                            Analyze the current phase, illumination, and sky position for {location.name}.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-6 relative z-10">

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <BreezyFullCard
                            title={t("moonPage.sunMoonAltitudeTracker")}
                            icon={<Clock className="w-4 h-4" />}
                            className="h-full"
                        >
                            <div className="p-2 mt-2 w-full h-full flex flex-col justify-center">
                                <SunMoonAltitudeChart date={date} location={location} minutes={sharedMinutes} onMinutesChange={setSharedMinutes} />
                            </div>
                        </BreezyFullCard>

                        <ProGate featureName="Sky Dome">
                            <BreezyFullCard
                                title={t("moonPage.theSkyDome")}
                                icon={<Eye className="w-4 h-4" />}
                                className="h-full"
                            >
                                <div className="p-2 mt-2 w-full h-full flex flex-col justify-center">
                                    <SkyDomeChart date={date} location={location} minutes={sharedMinutes} onMinutesChange={setSharedMinutes} />
                                </div>
                            </BreezyFullCard>
                        </ProGate>
                    </div>

                    {/* Times row (Ephemeris) */}
                    <ProGate featureName="Ephemeris Data">
                        <BreezyFullCard
                            title={t("moonPage.ephemeris")}
                            icon={<Sun />}
                        >
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                                {[
                                    { label: t("moonPage.sunrise"), value: formatTime(sunMoon.sunrise), icon: <Sun className="w-4 h-4" />, color: "#fb923c" },
                                    { label: t("moonPage.sunset"), value: formatTime(sunMoon.sunset), icon: <Sun className="w-4 h-4" />, color: "#f59e0b" },
                                    { label: t("moonPage.moonrise"), value: formatTime(sunMoon.moonrise), icon: <Moon className="w-4 h-4" />, color: "#60a5fa" },
                                    { label: t("moonPage.moonset"), value: formatTime(sunMoon.moonset), icon: <Moon className="w-4 h-4" />, color: "#818cf8" },
                                ].map(({ label, value, icon, color }) => (
                                    <div key={label} className="text-center py-4 px-2 rounded-xl border border-border/30 bg-foreground/5">
                                        <div className="flex justify-center mb-1.5" style={{ color }}>{icon}</div>
                                        <div className="text-xs mb-0.5 text-muted-foreground">{label}</div>
                                        <div className="text-sm font-mono font-semibold text-foreground">{value}</div>
                                    </div>
                                ))}
                            </div>
                        </BreezyFullCard>
                    </ProGate>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Moon illustration */}
                        <div
                            className="breezy-card lg:col-span-1 p-8 flex flex-col items-center justify-center rounded-2xl border border-border/40"
                            style={{ minHeight: "360px" }}
                        >
                            <div
                                style={{ filter: "drop-shadow(0 0 40px oklch(0.78 0.15 75 / 0.35))" }}
                                className="animate-float"
                            >
                                <MoonIllustration phase={moonInfo.phase} size={200} />
                            </div>

                            <div className="mt-6 text-center">
                                <div
                                    className="text-xl font-bold mb-1 font-display text-foreground"
                                >
                                    {moonInfo.phaseName}
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {t("moonPage.illuminatedAndAge", { illum: Math.round(moonInfo.illuminatedFraction * 100), age: (moonInfo.moonAge / 24).toFixed(1) })}
                                </p>
                                <div className="text-sm mb-3 font-arabic" style={{ color: "color-mix(in oklch, var(--gold) 80%, transparent)" }}>
                                    {moonInfo.phaseArabic}
                                </div>

                                {/* Phase progress bar */}
                                <div
                                    className="w-48 h-1.5 rounded-full mx-auto overflow-hidden bg-foreground/5"
                                >
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${phasePercent}%`,
                                            background: "linear-gradient(90deg, var(--gold), var(--gold-glow))",
                                        }}
                                        suppressHydrationWarning
                                    />
                                </div>
                                <div className="text-xs mt-1 text-muted-foreground">
                                    {t("moonPage.throughLunarCycle", { percent: phasePercent.toFixed(1) })}
                                </div>
                            </div>
                        </div>

                        {/* Stats grid */}
                        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                            <BreezyDetailCard
                                title={t("moonPage.illumination")}
                                icon={<Moon />}
                                decorativeVisual={<IlluminationArc illumination={moonInfo.illuminatedFraction * 100} />}
                                primaryValue={Math.round(moonInfo.illuminatedFraction * 100).toString()}
                                primaryUnit="%"
                                statusLabel={moonInfo.phaseName}
                                accentColour="var(--gold)"
                            />
                            <BreezyDetailCard
                                title={t("moonPage.lunarAge")}
                                icon={<Clock />}
                                decorativeVisual={<LunarAgeProgress age={(moonInfo.moonAge / 24)} />}
                                primaryValue={(moonInfo.moonAge / 24).toFixed(1)}
                                primaryUnit={t("moonPage.days")}
                                statusLabel={t("moonPage.phaseAngle", { angle: (moonInfo.phase * 360).toFixed(1) })}
                                accentColour="#60a5fa"
                            />
                            <BreezyDetailCard
                                title={t("moonPage.visibilityCity", { city: location.name })}
                                icon={<Eye />}
                                decorativeVisual={<VisibilityDotScale zone={sunMoon.visibility as "A" | "B" | "C" | "D" | "E" | "F"} />}
                                primaryValue={sunMoon.visibility}
                                primaryUnit={t("moonPage.zone")}
                                statusLabel={t("moonPage.yallopQ", { q: sunMoon.qValue.toFixed(2) })}
                                accentColour={sunMoon.visibility === "A" || sunMoon.visibility === "B" ? "#4ade80" : "#f87171"}
                            />

                            <BreezyDetailCard
                                title={t("moonPage.moonAltitude")}
                                icon={<ArrowRight className="transform -rotate-45" />}
                                decorativeVisual={<AzimuthCompass azimuth={sunMoon.moonAz} />}
                                primaryValue={sunMoon.moonAlt.toFixed(1)}
                                primaryUnit="°"
                                statusLabel={t("moonPage.azimuth", { az: sunMoon.moonAz.toFixed(1) })}
                                accentColour="#4ade80"
                            />
                            <BreezyDetailCard
                                title={t("moonPage.elongation")}
                                icon={<ArrowRight />}
                                decorativeVisual={<ElongationVisual elongation={sunMoon.elongation} />}
                                primaryValue={sunMoon.elongation.toFixed(1)}
                                primaryUnit="°"
                                accentColour="#c084fc"
                            />
                            <BreezyDetailCard
                                title={t("moonPage.nextNewMoon")}
                                icon={<Moon />}
                                decorativeVisual={<CountdownCircle daysLeft={parseInt(countdown.split(' ')[0]) || 0} totalDays={29.53} />}
                                primaryValue={countdown.split(' ')[0] || "0d"}
                                statusLabel={
                                    <div className="flex flex-col items-center leading-tight">
                                        <span>{moonInfo.nextNewMoon.toLocaleDateString("en-GB")}</span>
                                        <span className="text-[10px] opacity-75">{moonInfo.nextNewMoonExact.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                    </div>
                                }
                            />
                        </div>

                        {/* 30-day phase calendar */}
                        <BreezyFullCard
                            title={t("moonPage.thirtyDayPhaseCalendar")}
                            icon={<Clock />}
                            className="lg:col-span-3"
                        >
                            <div className="mt-2 text-foreground">
                                <PhaseCalendarStrip baseDate={date} />
                            </div>
                        </BreezyFullCard>
                    </div>

                    <PhysicsExplanations />

                </div>
        </div>
    );
}
