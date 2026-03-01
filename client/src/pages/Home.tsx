import { Link } from "wouter";
import { SEO } from "@/components/SEO";
import { Globe, Map, Moon, Calendar, Compass, Archive, ArrowRight, Star, Heart, Crown } from "lucide-react";
import { useEffect, useState } from "react";
import { getMoonPhaseInfo, gregorianToHijri, formatTime, HIJRI_MONTHS } from "@/lib/astronomy";
import { BreezyDetailCard } from "@/components/BreezyDetailCard";
import { BreezyFullCard } from "@/components/BreezyFullCard";
import { MoonArcVisual, VisibilityDotScale, IlluminationArc } from "@/components/BreezyVisuals";
import { ShareButton } from "@/components/ShareButton";
import { SightingFeed } from "@/components/SightingFeed";
import { TonightCard } from "@/components/TonightCard";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

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
  const isWaxing = phase <= 0.5;
  const k = phase * 2;
  const rx = Math.abs(r * Math.cos(Math.PI * k));
  const baseSweep = isWaxing ? 1 : 0;
  let termSweep;
  if (phase <= 0.25) termSweep = 0;
  else if (phase <= 0.5) termSweep = 1;
  else if (phase <= 0.75) termSweep = 0;
  else termSweep = 1;

  const d = `
    M ${cx} ${cy - r}
    A ${r} ${r} 0 0 ${baseSweep} ${cx} ${cy + r}
    A ${rx} ${r} 0 0 ${termSweep} ${cx} ${cy - r}
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
      <SEO
        title="Home"
        description="Precision Islamic crescent moon visibility predictions with interactive 3D globe, Hijri calendar, and real-time sighting reports. Powered by Yallop & Odeh criteria."
        path="/"
      />
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
              رؤية الهلال - Islamic Crescent Moon Visibility
            </div>

            <h1
              className="text-5xl md:text-7xl font-light tracking-tight mb-6 leading-tight"
              style={{ color: "var(--foreground)" }}
            >
              Hilal<br />Vision
            </h1>

            <p className="text-lg md:text-xl mb-8 max-w-xl leading-relaxed font-light mt-4" style={{ color: "var(--muted-foreground)" }}>
              A precision astronomical platform for predicting and visualising Islamic crescent moon sightings worldwide - powered by Yallop & Odeh criteria.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/visibility"
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, var(--gold-glow), var(--gold))",
                  color: "var(--space)",
                  boxShadow: "0 0 24px oklch(0.78 0.15 75 / 0.4)",
                }}
              >
                <Map className="w-4 h-4" />
                Visibility Map
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/moon"
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-105"
                style={{
                  background: "color-mix(in oklch, var(--space-light) 80%, transparent)",
                  color: "var(--foreground)",
                  border: "1px solid color-mix(in oklch, var(--gold) 20%, transparent)",
                }}
              >
                <Moon className="w-4 h-4" />
                Moon Phases
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
      <section className="py-6 relative z-10 -mt-8">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Moon phase */}
            <div className="breezy-card text-center !p-4 !rounded-xl !border-transparent glass-card animate-breezy-enter" style={{ animationDelay: '0.2s' }}>
              <div className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Moon Phase</div>
              <div className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                {moonInfo.phaseName}
              </div>
              <div className="text-[10px]" style={{ color: "var(--gold-dim)" }}>{Math.round(moonInfo.illuminatedFraction * 100)}% illuminated</div>
            </div>
            {/* Hijri date */}
            <div className="breezy-card text-center !p-4 !rounded-xl !border-transparent glass-card animate-breezy-enter" style={{ animationDelay: '0.3s' }}>
              <div className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Hijri Date</div>
              <div className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                {hijri.day} {hijri.monthName}
              </div>
              <div className="text-[10px] font-arabic" style={{ color: "var(--gold-dim)" }}>
                {hijri.day} {hijri.monthNameArabic} {hijri.year} AH
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Tonight's Prediction */}
      <section className="py-6 relative z-10">
        <div className="container">
          <div className="max-w-lg">
            <TonightCard />
          </div>
        </div>
      </section>

      {/* Feature Cards Navigation */}
      <section className="py-12 border-t mt-4" style={{ borderColor: 'var(--border)' }}>
        <div className="container">
          <h3 className="text-xl font-medium mb-6" style={{ color: "var(--foreground)" }}>
            Explore Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ href, icon: Icon, title, titleAr, desc, color }, i) => (
              <Link key={href} href={href}>
                <div
                  className="breezy-card group h-full flex flex-col items-start cursor-pointer animate-breezy-enter hover:-translate-y-1 transition-transform"
                  style={{ animationDelay: `${0.1 * i}s` }}
                >
                  <div className="flex items-center gap-3.5 w-full mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `color-mix(in oklch, ${color} 15%, transparent)` }}
                    >
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <div className="flex-1 flex items-baseline justify-between">
                      <h4 className="text-base font-medium" style={{ color: "var(--foreground)" }}>
                        {title}
                      </h4>
                      <span className="text-[11px] font-arabic" style={{ color: "var(--gold-dim)" }}>{titleAr}</span>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed flex-1" style={{ color: "var(--muted-foreground)" }}>{desc}</p>
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
            <h2 className="text-2xl font-medium mb-2" style={{ color: "var(--foreground)" }}>
              Visibility Criteria
            </h2>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Based on the Yallop (1997) q-value criterion for naked-eye crescent sighting
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-4xl mx-auto">
            {[
              { zone: "A", label: "Easily Visible", color: "#4ade80", q: "q ≥ +0.216" },
              { zone: "B", label: "Visible", color: "#facc15", q: "q ≥ −0.014" },
              { zone: "C", label: "Optical Aid", color: "#fb923c", q: "q ≥ −0.160" },
              { zone: "D", label: "Telescope Only", color: "#f87171", q: "q ≥ −0.232" },
              { zone: "E", label: "Not Visible", color: "#6b7280", q: "q < −0.232" },
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

      {/* Sadaqah Jariyah Banner */}
      <section className="py-12">
        <div className="container">
          <Link href="/support">
            <div
              className="relative overflow-hidden rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 cursor-pointer group transition-transform hover:-translate-y-0.5"
              style={{
                background: "radial-gradient(ellipse 60% 80% at 20% 50%, color-mix(in oklch, var(--gold) 8%, transparent) 0%, var(--space-mid) 70%)",
                border: "1px solid color-mix(in oklch, var(--gold) 20%, transparent)",
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: "color-mix(in oklch, var(--gold) 12%, transparent)" }}
              >
                <Heart className="w-7 h-7" style={{ color: "var(--gold)" }} />
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="text-xs font-semibold mb-1" style={{ color: "var(--gold)" }}>
                  صدقة جارية — Sadaqah Jariyah
                </div>
                <h3 className="text-base font-medium mb-1" style={{ color: "var(--foreground)" }}>
                  Help keep Hilal Vision accessible and ad-free
                </h3>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  Your support — through Pro or a one-time donation — keeps this platform running for 1.8 billion Muslims worldwide.
                </p>
              </div>
              <div
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all group-hover:scale-105 flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, var(--gold-glow), var(--gold))",
                  color: "var(--space)",
                }}
              >
                <Crown className="w-4 h-4" />
                Support Us
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Live Sighting Feed */}
      <section className="container py-16">
        <div className="max-w-2xl mx-auto">
          <SightingFeed />
          <div className="flex justify-center mt-6">
            <ShareButton
              title="Hilal Vision - Islamic Moon Visibility"
              text="Check out the crescent moon visibility predictions on Hilal Vision!"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
