import { Link } from "wouter";
import { Globe, Map, Moon, Calendar, Compass, Archive, ArrowRight, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { getMoonPhaseInfo, gregorianToHijri, formatTime, HIJRI_MONTHS } from "@/lib/astronomy";

const features = [
  {
    href: "/globe",
    icon: Globe,
    title: "3D Globe",
    titleAr: "الكرة الأرضية",
    desc: "Interactive globe with real-time day/night terminator and moon visibility overlay",
    color: "#60a5fa",
  },
  {
    href: "/map",
    icon: Map,
    title: "Visibility Map",
    titleAr: "خريطة الرؤية",
    desc: "Flat world map with time slider showing crescent visibility predictions globally",
    color: "#4ade80",
  },
  {
    href: "/moon",
    icon: Moon,
    title: "Moon Phase",
    titleAr: "أطوار القمر",
    desc: "Current lunar phase, illumination, age, and upcoming moon events",
    color: "#facc15",
  },
  {
    href: "/calendar",
    icon: Calendar,
    title: "Hijri Calendar",
    titleAr: "التقويم الهجري",
    desc: "Islamic calendar with Gregorian comparison and upcoming Islamic dates",
    color: "#c084fc",
  },
  {
    href: "/horizon",
    icon: Compass,
    title: "Horizon View",
    titleAr: "منظر الأفق",
    desc: "Local horizon simulator showing moon position relative to the setting sun",
    color: "#fb923c",
  },
  {
    href: "/archive",
    icon: Archive,
    title: "Archive",
    titleAr: "الأرشيف",
    desc: "Crescent visibility maps for all Islamic months from 1438 to 1465 AH",
    color: "#94a3b8",
  },
];

function MoonSVG({ phase }: { phase: number }) {
  // Draw a crescent/gibbous moon based on phase (0–1)
  const r = 50;
  const cx = 60;
  const cy = 60;

  // Illuminated fraction and direction
  const isWaxing = phase < 0.5;
  const normalizedPhase = phase <= 0.5 ? phase * 2 : (phase - 0.5) * 2;
  const k = isWaxing ? normalizedPhase : 1 - normalizedPhase;

  // Ellipse x-radius for terminator
  const rx = Math.abs(r * Math.cos(Math.PI * k));
  const sweep = isWaxing ? 1 : 0;

  const d = `
    M ${cx} ${cy - r}
    A ${r} ${r} 0 0 1 ${cx} ${cy + r}
    A ${rx} ${r} 0 0 ${sweep} ${cx} ${cy - r}
    Z
  `;

  return (
    <svg viewBox="0 0 120 120" className="w-full h-full">
      {/* Dark side */}
      <circle cx={cx} cy={cy} r={r} fill="oklch(0.14 0.022 265)" />
      {/* Lit side */}
      <path d={d} fill="oklch(0.78 0.15 75)" opacity="0.9" />
      {/* Glow */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="oklch(0.78 0.15 75)" strokeWidth="0.5" opacity="0.4" />
    </svg>
  );
}

export default function Home() {
  const [now] = useState(() => new Date());
  const [moonInfo] = useState(() => getMoonPhaseInfo(now));
  const [hijri] = useState(() => gregorianToHijri(now));

  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "var(--space)" }}>
      {/* Hero */}
      <section
        className="relative min-h-[92vh] flex items-center overflow-hidden"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 0%, oklch(0.12 0.03 265) 0%, var(--space) 70%)",
        }}
      >
        {/* Star field */}
        <div className="absolute inset-0 star-field opacity-60" />

        {/* Decorative orbit rings */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border opacity-5"
          style={{ width: "600px", height: "600px", borderColor: "var(--gold)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border opacity-5"
          style={{ width: "900px", height: "900px", borderColor: "var(--gold)" }}
        />

        {/* Floating moon */}
        <div
          className="absolute right-[8%] top-[15%] w-32 h-32 md:w-48 md:h-48 animate-float opacity-80"
          style={{ filter: "drop-shadow(0 0 30px oklch(0.78 0.15 75 / 0.4))" }}
        >
          <MoonSVG phase={moonInfo.phase} />
        </div>

        <div className="container relative z-10">
          <div className="max-w-3xl">
            {/* Arabic subtitle */}
            <div
              className="text-sm mb-4 font-arabic tracking-wider"
              style={{ color: "var(--gold-dim)" }}
            >
              رؤية الهلال — Islamic Crescent Moon Visibility
            </div>

            <h1
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
              style={{
                fontFamily: "Cinzel, serif",
                background: "linear-gradient(135deg, oklch(0.93 0.01 80) 0%, var(--gold) 50%, oklch(0.93 0.01 80) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Hilal<br />Vision
            </h1>

            <p className="text-lg md:text-xl mb-8 max-w-xl leading-relaxed" style={{ color: "oklch(0.70 0.01 80)" }}>
              A precision astronomical platform for predicting and visualising Islamic crescent moon sightings worldwide — powered by Yallop & Odeh criteria.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/globe">
                <div
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, var(--gold-glow), var(--gold))",
                    color: "var(--space)",
                    boxShadow: "0 0 24px oklch(0.78 0.15 75 / 0.4)",
                  }}
                >
                  <Globe className="w-4 h-4" />
                  Explore Globe
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
              <Link href="/map">
                <div
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-105"
                  style={{
                    background: "color-mix(in oklch, var(--space-light) 80%, transparent)",
                    color: "var(--foreground)",
                    border: "1px solid color-mix(in oklch, var(--gold) 20%, transparent)",
                  }}
                >
                  <Map className="w-4 h-4" />
                  Visibility Map
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32"
          style={{ background: "linear-gradient(to bottom, transparent, var(--space))" }}
        />
      </section>

      {/* Live Status Bar */}
      <section className="py-6 border-y" style={{ borderColor: "color-mix(in oklch, var(--gold) 10%, transparent)", background: "var(--space-mid)" }}>
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Current time */}
            <div className="text-center">
              <div className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>UTC Time</div>
              <div className="text-lg font-mono font-semibold" style={{ color: "var(--gold)" }}>
                {time.toUTCString().slice(17, 25)}
              </div>
            </div>
            {/* Moon phase */}
            <div className="text-center">
              <div className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Moon Phase</div>
              <div className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                {moonInfo.phaseName}
              </div>
              <div className="text-xs" style={{ color: "var(--gold-dim)" }}>{moonInfo.illumination}% illuminated</div>
            </div>
            {/* Hijri date */}
            <div className="text-center">
              <div className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Hijri Date</div>
              <div className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                {hijri.day} {hijri.monthName} {hijri.year} AH
              </div>
              <div className="text-xs font-arabic" style={{ color: "var(--gold-dim)" }}>
                {hijri.day} {hijri.monthNameArabic}
              </div>
            </div>
            {/* Moon age */}
            <div className="text-center">
              <div className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Lunar Age</div>
              <div className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                {moonInfo.age.toFixed(1)} days
              </div>
              <div className="text-xs" style={{ color: "var(--gold-dim)" }}>
                Next new moon: {formatTime(moonInfo.nextNewMoon)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-14">
            <div className="text-xs tracking-widest mb-3 font-arabic" style={{ color: "var(--gold-dim)" }}>
              الميزات
            </div>
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ fontFamily: "Cinzel, serif", color: "var(--foreground)" }}
            >
              Features
            </h2>
            <p className="text-sm max-w-xl mx-auto" style={{ color: "var(--muted-foreground)" }}>
              A complete toolkit for Islamic crescent moon visibility — from global heatmaps to local horizon simulations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ href, icon: Icon, title, titleAr, desc, color }) => (
              <Link key={href} href={href}>
                <div
                  className="group p-6 rounded-2xl h-full transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  style={{
                    background: "var(--space-mid)",
                    border: "1px solid color-mix(in oklch, var(--gold) 10%, transparent)",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = `color-mix(in oklch, ${color} 30%, transparent)`;
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px color-mix(in oklch, ${color} 10%, transparent)`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "color-mix(in oklch, var(--gold) 10%, transparent)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `color-mix(in oklch, ${color} 15%, transparent)` }}
                  >
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <h3 className="text-base font-semibold" style={{ fontFamily: "Cinzel, serif", color: "var(--foreground)" }}>
                      {title}
                    </h3>
                    <span className="text-xs font-arabic" style={{ color: "var(--gold-dim)" }}>{titleAr}</span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{desc}</p>
                  <div
                    className="flex items-center gap-1 mt-4 text-xs font-medium transition-all duration-200 group-hover:gap-2"
                    style={{ color }}
                  >
                    Explore <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Visibility Legend */}
      <section className="py-16 border-t" style={{ borderColor: "color-mix(in oklch, var(--gold) 8%, transparent)" }}>
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "Cinzel, serif", color: "var(--foreground)" }}>
              Visibility Criteria
            </h2>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Based on the Yallop (1997) q-value criterion for naked-eye crescent sighting
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-4xl mx-auto">
            {[
              { zone: "A", label: "Easily Visible", color: "#4ade80", q: "q ≥ +0.216" },
              { zone: "B", label: "Visible",         color: "#facc15", q: "q ≥ −0.014" },
              { zone: "C", label: "Optical Aid",     color: "#fb923c", q: "q ≥ −0.160" },
              { zone: "D", label: "Telescope Only",  color: "#f87171", q: "q ≥ −0.232" },
              { zone: "E", label: "Not Visible",     color: "#6b7280", q: "q < −0.232" },
            ].map(({ zone, label, color, q }) => (
              <div
                key={zone}
                className="p-4 rounded-xl text-center"
                style={{
                  background: `color-mix(in oklch, ${color} 8%, var(--space-mid))`,
                  border: `1px solid color-mix(in oklch, ${color} 25%, transparent)`,
                }}
              >
                <div
                  className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-sm font-bold"
                  style={{ background: color, color: "var(--space)" }}
                >
                  {zone}
                </div>
                <div className="text-xs font-medium mb-1" style={{ color: "var(--foreground)" }}>{label}</div>
                <div className="text-xs font-mono" style={{ color }}>{q}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
