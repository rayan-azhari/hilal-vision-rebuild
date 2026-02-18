import { useState, useEffect } from "react";
import { Moon, Sun, ArrowRight, Clock } from "lucide-react";
import { getMoonPhaseInfo, computeSunMoonAtSunset, MAJOR_CITIES, formatTime } from "@/lib/astronomy";
import SunCalc from "suncalc";

function MoonIllustration({ phase, size = 200 }: { phase: number; size?: number }) {
  const r = size / 2 - 4;
  const cx = size / 2;
  const cy = size / 2;

  const isWaxing = phase <= 0.5;
  const normalizedPhase = phase <= 0.5 ? phase * 2 : (phase - 0.5) * 2;
  const k = isWaxing ? normalizedPhase : 1 - normalizedPhase;
  const rx = Math.abs(r * Math.cos(Math.PI * k));
  const sweep = isWaxing ? 1 : 0;

  const litPath = `
    M ${cx} ${cy - r}
    A ${r} ${r} 0 0 1 ${cx} ${cy + r}
    A ${rx} ${r} 0 0 ${sweep} ${cx} ${cy - r}
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
          <stop offset="0%" stopColor="oklch(0.12 0.02 265)" />
          <stop offset="100%" stopColor="oklch(0.08 0.015 265)" />
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
    d.setDate(d.getDate() - 14 + i);
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
        const k = isWaxing ? phase * 2 : 1 - (phase - 0.5) * 2;
        const rx = Math.abs(r * Math.cos(Math.PI * k));
        const sweep = isWaxing ? 1 : 0;
        const litPath = `M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} A ${rx} ${r} 0 0 ${sweep} ${cx} ${cy - r} Z`;

        return (
          <div
            key={i}
            className="flex flex-col items-center gap-1 flex-shrink-0"
            style={{ minWidth: "36px" }}
          >
            <svg viewBox="0 0 28 28" width={28} height={28}>
              <circle cx={cx} cy={cy} r={r} fill="oklch(0.14 0.022 265)" />
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
  const [date, setDate] = useState(() => new Date());
  const [location] = useState(MAJOR_CITIES[0]);
  const [moonInfo, setMoonInfo] = useState(() => getMoonPhaseInfo(new Date()));
  const [sunMoon, setSunMoon] = useState(() => computeSunMoonAtSunset(new Date(), MAJOR_CITIES[0]));
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    setMoonInfo(getMoonPhaseInfo(date));
    setSunMoon(computeSunMoonAtSunset(date, location));
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
      {/* Header */}
      <div
        className="border-b px-6 py-4 flex items-center justify-between"
        style={{ borderColor: "color-mix(in oklch, var(--gold) 12%, transparent)", background: "var(--space-mid)" }}
      >
        <div className="flex items-center gap-3">
          <Moon className="w-5 h-5" style={{ color: "var(--gold)" }} />
          <div>
            <h1 className="text-base font-semibold" style={{ fontFamily: "Cinzel, serif", color: "var(--foreground)" }}>
              Moon Phase Dashboard
            </h1>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              Lunar phase · Illumination · Astronomical data
            </p>
          </div>
        </div>
        <input
          type="date"
          value={dateStr}
          onChange={e => {
            const [y, m, d] = e.target.value.split("-").map(Number);
            setDate(new Date(y, m - 1, d));
          }}
          className="px-3 py-1.5 rounded-lg text-xs"
          style={{
            background: "var(--space-light)",
            border: "1px solid color-mix(in oklch, var(--gold) 20%, transparent)",
            color: "var(--foreground)",
            colorScheme: "dark",
          }}
        />
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Moon illustration */}
          <div
            className="lg:col-span-1 rounded-2xl p-8 flex flex-col items-center justify-center"
            style={{
              background: "radial-gradient(ellipse at center, oklch(0.12 0.03 265) 0%, var(--space-mid) 100%)",
              border: "1px solid color-mix(in oklch, var(--gold) 15%, transparent)",
              minHeight: "360px",
            }}
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
              <div className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                {phasePercent.toFixed(1)}% through lunar cycle
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Illumination",  value: `${moonInfo.illumination}%`,        icon: "🌕", color: "var(--gold)" },
              { label: "Lunar Age",     value: `${moonInfo.age.toFixed(2)} days`,   icon: "📅", color: "#60a5fa" },
              { label: "Moon Altitude", value: `${sunMoon.moonAlt.toFixed(2)}°`,    icon: "📐", color: "#4ade80" },
              { label: "Moon Azimuth",  value: `${sunMoon.moonAz.toFixed(1)}°`,     icon: "🧭", color: "#fb923c" },
              { label: "Elongation",    value: `${sunMoon.elongation.toFixed(2)}°`, icon: "📏", color: "#c084fc" },
              { label: "Phase Angle",   value: `${(moonInfo.phase * 360).toFixed(1)}°`, icon: "🔄", color: "#f472b6" },
            ].map(({ label, value, icon, color }) => (
              <div
                key={label}
                className="rounded-xl p-4"
                style={{
                  background: "var(--space-mid)",
                  border: "1px solid color-mix(in oklch, var(--gold) 10%, transparent)",
                }}
              >
                <div className="text-xl mb-2">{icon}</div>
                <div className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>{label}</div>
                <div className="text-lg font-bold font-mono" style={{ color }}>{value}</div>
              </div>
            ))}

            {/* Times row */}
            <div
              className="col-span-2 md:col-span-3 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4"
              style={{
                background: "var(--space-mid)",
                border: "1px solid color-mix(in oklch, var(--gold) 10%, transparent)",
              }}
            >
              {[
                { label: "Sunrise",  value: formatTime(sunMoon.sunrise),  icon: <Sun className="w-4 h-4" />, color: "#fb923c" },
                { label: "Sunset",   value: formatTime(sunMoon.sunset),   icon: <Sun className="w-4 h-4" />, color: "#f59e0b" },
                { label: "Moonrise", value: formatTime(sunMoon.moonrise), icon: <Moon className="w-4 h-4" />, color: "#60a5fa" },
                { label: "Moonset",  value: formatTime(sunMoon.moonset),  icon: <Moon className="w-4 h-4" />, color: "#818cf8" },
              ].map(({ label, value, icon, color }) => (
                <div key={label} className="text-center">
                  <div className="flex justify-center mb-1" style={{ color }}>{icon}</div>
                  <div className="text-xs mb-0.5" style={{ color: "var(--muted-foreground)" }}>{label}</div>
                  <div className="text-sm font-mono font-semibold" style={{ color: "var(--foreground)" }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Countdown */}
          <div
            className="rounded-2xl p-6 text-center"
            style={{
              background: "var(--space-mid)",
              border: "1px solid color-mix(in oklch, var(--gold) 15%, transparent)",
            }}
          >
            <div className="text-xs mb-2" style={{ color: "var(--muted-foreground)" }}>Next New Moon</div>
            <div
              className="text-2xl font-bold font-mono mb-1"
              style={{ color: "var(--gold)", fontFamily: "Cinzel, serif" }}
            >
              {countdown}
            </div>
            <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              {moonInfo.nextNewMoon.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>

          {/* Next full moon */}
          <div
            className="rounded-2xl p-6 text-center"
            style={{
              background: "var(--space-mid)",
              border: "1px solid color-mix(in oklch, var(--gold) 15%, transparent)",
            }}
          >
            <div className="text-xs mb-2" style={{ color: "var(--muted-foreground)" }}>Next Full Moon</div>
            <div
              className="text-lg font-bold mb-1"
              style={{ fontFamily: "Cinzel, serif", color: "var(--foreground)" }}
            >
              {moonInfo.nextFullMoon.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}
            </div>
            <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              {moonInfo.nextFullMoon.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>

          {/* Crescent visibility for Mecca */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: "var(--space-mid)",
              border: `1px solid color-mix(in oklch, ${sunMoon.visibility === "A" || sunMoon.visibility === "B" ? "#4ade80" : "#f87171"} 20%, transparent)`,
            }}
          >
            <div className="text-xs mb-2" style={{ color: "var(--muted-foreground)" }}>Crescent Visibility (Mecca)</div>
            <div
              className="text-sm font-bold mb-1"
              style={{
                color: sunMoon.visibility === "A" || sunMoon.visibility === "B" ? "#4ade80" : "#f87171",
              }}
            >
              Zone {sunMoon.visibility}
            </div>
            <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              Yallop q = {sunMoon.qValue.toFixed(4)}
            </div>
          </div>

          {/* 30-day phase calendar */}
          <div
            className="lg:col-span-3 rounded-2xl p-6"
            style={{
              background: "var(--space-mid)",
              border: "1px solid color-mix(in oklch, var(--gold) 10%, transparent)",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4" style={{ color: "var(--gold-dim)" }} />
              <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>30-Day Phase Calendar</span>
            </div>
            <PhaseCalendarStrip baseDate={date} />
          </div>
        </div>
      </div>
    </div>
  );
}
