import { useState, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { Moon, Sun, ArrowRight, Clock, Eye, MapPin } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { getMoonPhaseInfo, computeSunMoonAtSunset, MAJOR_CITIES, formatTime } from "@/lib/astronomy";
import { useGlobalState } from "@/contexts/GlobalStateContext";
import * as SunCalc from "suncalc";
import { BreezyDetailCard } from "@/components/BreezyDetailCard";
import { BreezyFullCard } from "@/components/BreezyFullCard";
import { VisibilityDotScale, IlluminationArc, LunarAgeProgress, AzimuthCompass, ElongationVisual, CountdownCircle } from "@/components/BreezyVisuals";
import { SunMoonAltitudeChart } from "@/components/SunMoonAltitudeChart";
import { SkyDomeChart } from "@/components/SkyDomeChart";
import { PhysicsExplanations } from "@/components/PhysicsExplanations";

function MoonIllustration({ phase, size = 200 }: { phase: number; size?: number }) {
  const r = size / 2 - 4;
  const cx = size / 2;
  const cy = size / 2;

  const isWaxing = phase <= 0.5;
  const k = phase * 2;
  const rx = Math.abs(r * Math.cos(Math.PI * k));
  const baseSweep = isWaxing ? 1 : 0;

  let termSweep;
  if (phase <= 0.25) termSweep = 0;
  else if (phase <= 0.5) termSweep = 1;
  else if (phase <= 0.75) termSweep = 0;
  else termSweep = 1;

  const litPath = `
    M ${cx} ${cy - r}
    A ${r} ${r} 0 0 ${baseSweep} ${cx} ${cy + r}
    A ${rx} ${r} 0 0 ${termSweep} ${cx} ${cy - r}
    Z
  `;

  // Craters for texture
  const craters = [
    { x: cx - r * 0.3, y: cy - r * 0.2, r: r * 0.08 },
    { x: cx + r * 0.15, y: cy + r * 0.3, r: r * 0.06 },
    { x: cx - r * 0.1, y: cy + r * 0.1, r: r * 0.04 },
    { x: cx + r * 0.35, y: cy - r * 0.35, r: r * 0.07 },
    { x: cx - r * 0.4, y: cy + r * 0.4, r: r * 0.05 },
  ];

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      <defs>
        <radialGradient id="moonGlow" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="oklch(0.85 0.15 75)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="oklch(0.65 0.12 75)" stopOpacity="0.7" />
        </radialGradient>
        <radialGradient id="darkSide" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="oklch(0.24 0.03 245)" />
          <stop offset="100%" stopColor="oklch(0.18 0.02 245)" />
        </radialGradient>
        <filter id="moonShadow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <clipPath id="moonClip">
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>

      {/* Outer glow */}
      <circle cx={cx} cy={cy} r={r + 8} fill="none" stroke="oklch(0.78 0.15 75)" strokeWidth="1" opacity="0.1" />
      <circle cx={cx} cy={cy} r={r + 16} fill="none" stroke="oklch(0.78 0.15 75)" strokeWidth="0.5" opacity="0.05" />

      {/* Dark side */}
      <circle cx={cx} cy={cy} r={r} fill="url(#darkSide)" />

      {/* Lit side */}
      <path d={litPath} fill="url(#moonGlow)" clipPath="url(#moonClip)" />

      {/* Craters (on lit side) */}
      <g clipPath="url(#moonClip)" opacity="0.3">
        {craters.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r={c.r} fill="none" stroke="oklch(0.55 0.10 75)" strokeWidth="1" />
        ))}
      </g>

      {/* Terminator line */}
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx < 1 ? 0.5 : rx}
        ry={r}
        fill="none"
        stroke="oklch(0.78 0.15 75)"
        strokeWidth="0.5"
        opacity="0.4"
      />
    </svg>
  );
}

function PhaseCalendarStrip({ baseDate }: { baseDate: Date }) {
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);
    const illum = SunCalc.getMoonIllumination(d);
    return { date: d, phase: illum.phase, fraction: illum.fraction };
  });

  const today = new Date();

  return (
    <div className="flex gap-1 overflow-x-auto pb-2">
      {days.map(({ date, phase, fraction }, i) => {
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
            <svg viewBox="0 0 28 28" width={28} height={28}>
              <circle cx={cx} cy={cy} r={r} fill="#111c24" />
              <path d={litPath} fill="oklch(0.78 0.15 75)" opacity="0.85" />
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
  const { location, date } = useGlobalState();
  const [moonInfo, setMoonInfo] = useState(() => getMoonPhaseInfo(date));
  const [sunMoon, setSunMoon] = useState(() => computeSunMoonAtSunset(date, location));
  const [countdown, setCountdown] = useState("");

  const [sharedMinutes, setSharedMinutes] = useState(() => {
    const now = new Date();
    if (now.toDateString() === date.toDateString()) {
      return now.getHours() * 60 + now.getMinutes();
    }
    return 12 * 60;
  });

  useEffect(() => {
    // document.title managed by <SEO> component
    setMoonInfo(getMoonPhaseInfo(date));
    setSunMoon(computeSunMoonAtSunset(date, location));

    const now = new Date();
    if (now.toDateString() === date.toDateString()) {
      setSharedMinutes(now.getHours() * 60 + now.getMinutes());
    } else {
      setSharedMinutes(12 * 60);
    }
  }, [date, location]);

  // Countdown to next new moon
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const diff = moonInfo.nextNewMoon.getTime() - now.getTime();
      if (diff <= 0) { setCountdown("Now!"); return; }
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

  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  // Phase progress arc
  const phasePercent = moonInfo.phase * 100;

  return (
    <div className="min-h-screen" style={{ background: "var(--space)" }}>
      <SEO
        title={`Moon Phase - ${moonInfo.phaseName} (${moonInfo.illumination}%)`}
        description={`Current lunar phase: ${moonInfo.phaseName}, ${moonInfo.illumination}% illuminated, ${moonInfo.age.toFixed(1)} days old. View lunar data and astronomical details.`}
        path="/moon"
      />
      {/* Header */}
      <PageHeader
        icon={<Moon />}
        title="Moon Phase Dashboard"
        subtitle="Lunar phase · Illumination · Astronomical data"
      />

      <div className="container py-8 flex flex-col gap-6 relative z-10">

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BreezyFullCard
            title="Sun & Moon Altitude Tracker"
            icon={<Clock className="w-4 h-4" />}
            className="animate-breezy-enter h-full"
          >
            <div className="p-2 mt-2 w-full h-full flex flex-col justify-center">
              <SunMoonAltitudeChart date={date} location={location} minutes={sharedMinutes} onMinutesChange={setSharedMinutes} />
            </div>
          </BreezyFullCard>

          <BreezyFullCard
            title="The Sky Dome"
            icon={<Eye className="w-4 h-4" />}
            className="animate-breezy-enter h-full"
          >
            <div className="p-2 mt-2 w-full h-full flex flex-col justify-center">
              <SkyDomeChart date={date} location={location} minutes={sharedMinutes} onMinutesChange={setSharedMinutes} />
            </div>
          </BreezyFullCard>
        </div>

        {/* Times row (Ephemeris) */}
        <BreezyFullCard
          title="Ephemeris"
          icon={<Sun />}
          className="animate-breezy-enter"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            {[
              { label: "Sunrise", value: formatTime(sunMoon.sunrise), icon: <Sun className="w-4 h-4" />, color: "#fb923c" },
              { label: "Sunset", value: formatTime(sunMoon.sunset), icon: <Sun className="w-4 h-4" />, color: "#f59e0b" },
              { label: "Moonrise", value: formatTime(sunMoon.moonrise), icon: <Moon className="w-4 h-4" />, color: "#60a5fa" },
              { label: "Moonset", value: formatTime(sunMoon.moonset), icon: <Moon className="w-4 h-4" />, color: "#818cf8" },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="text-center py-4 px-2 rounded-xl" style={{ background: "var(--card-surface-alt)" }}>
                <div className="flex justify-center mb-1.5" style={{ color }}>{icon}</div>
                <div className="text-xs mb-0.5" style={{ color: "var(--muted-foreground)" }}>{label}</div>
                <div className="text-sm font-mono font-semibold data-text" style={{ color: "var(--foreground)" }}>{value}</div>
              </div>
            ))}
          </div>
        </BreezyFullCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Moon illustration */}
          <div
            className="breezy-card lg:col-span-1 p-8 flex flex-col items-center justify-center animate-breezy-enter"
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
                className="text-xl font-bold mb-1"
                style={{ fontFamily: "Cinzel, serif", color: "var(--foreground)" }}
              >
                {moonInfo.phaseName}
              </div>
              <div className="text-sm font-arabic mb-3" style={{ color: "var(--gold-dim)" }}>
                {moonInfo.phaseArabic}
              </div>

              {/* Phase progress bar */}
              <div
                className="w-48 h-1.5 rounded-full mx-auto overflow-hidden"
                style={{ background: "var(--space-light)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${phasePercent}%`,
                    background: "linear-gradient(90deg, var(--gold-dim), var(--gold-glow))",
                  }}
                />
              </div>
              <div className="text-xs mt-1 data-text" style={{ color: "var(--muted-foreground)" }}>
                {phasePercent.toFixed(1)}% through lunar cycle
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            <BreezyDetailCard
              title="Illumination"
              icon={<Moon />}
              decorativeVisual={<IlluminationArc illumination={moonInfo.illumination} />}
              primaryValue={moonInfo.illumination}
              primaryUnit="%"
              statusLabel={moonInfo.phaseName}
              className="animate-breezy-enter"
              accentColour="var(--gold)"
            />
            <BreezyDetailCard
              title="Lunar Age"
              icon={<Clock />}
              decorativeVisual={<LunarAgeProgress age={moonInfo.age} />}
              primaryValue={moonInfo.age.toFixed(1)}
              primaryUnit="Days"
              statusLabel={`Phase Angle: ${(moonInfo.phase * 360).toFixed(1)}°`}
              className="animate-breezy-enter"
              accentColour="#60a5fa"
            />
            <BreezyDetailCard
              title={`Visibility (${location.name})`}
              icon={<Eye />}
              decorativeVisual={<VisibilityDotScale zone={sunMoon.visibility as any} />}
              primaryValue={sunMoon.visibility}
              primaryUnit="Zone"
              statusLabel={`Yallop q = ${sunMoon.qValue.toFixed(2)}`}
              className="animate-breezy-enter"
              accentColour={sunMoon.visibility === "A" || sunMoon.visibility === "B" ? "#4ade80" : "#f87171"}
            />

            <BreezyDetailCard
              title="Moon Altitude"
              icon={<ArrowRight className="transform -rotate-45" />}
              decorativeVisual={<AzimuthCompass azimuth={sunMoon.moonAz} />}
              primaryValue={sunMoon.moonAlt.toFixed(1)}
              primaryUnit="°"
              statusLabel={`Azimuth: ${sunMoon.moonAz.toFixed(1)}°`}
              className="animate-breezy-enter"
              accentColour="#4ade80"
            />
            <BreezyDetailCard
              title="Elongation"
              icon={<ArrowRight />}
              decorativeVisual={<ElongationVisual elongation={sunMoon.elongation} />}
              primaryValue={sunMoon.elongation.toFixed(1)}
              primaryUnit="°"
              className="animate-breezy-enter"
              accentColour="#c084fc"
            />
            <BreezyDetailCard
              title="Next New Moon"
              icon={<Moon />}
              decorativeVisual={<CountdownCircle daysLeft={parseInt(countdown.split(' ')[0]) || 0} totalDays={29.53} />}
              primaryValue={countdown.split(' ')[0] || "0d"}
              statusLabel={moonInfo.nextNewMoon.toLocaleDateString("en-GB")}
              className="animate-breezy-enter"
            />


          </div>

          {/* 30-day phase calendar */}
          <BreezyFullCard
            title="30-Day Phase Calendar"
            icon={<Clock />}
            className="lg:col-span-3 animate-breezy-enter"
          >
            <div className="mt-2">
              <PhaseCalendarStrip baseDate={date} />
            </div>
          </BreezyFullCard>
        </div>

        {/* Physics Explanations for Pro Users */}
        <PhysicsExplanations />

      </div>
    </div>
  );
}
