import { Link } from "wouter";
import { SEO } from "@/components/SEO";
import { Globe, Map, Moon, Calendar, Compass, Archive, ArrowRight, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { getMoonPhaseInfo, gregorianToHijri, formatTime, HIJRI_MONTHS } from "@/lib/astronomy";
import { BreezyDetailCard } from "@/components/BreezyDetailCard";
import { BreezyFullCard } from "@/components/BreezyFullCard";
import { MoonArcVisual, VisibilityDotScale, IlluminationArc } from "@/components/BreezyVisuals";
import { ShareButton } from "@/components/ShareButton";
import { SightingFeed } from "@/components/SightingFeed";
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
              رؤية الهلال — Islamic Crescent Moon Visibility
            </div>

            <h1
              className="text-5xl md:text-7xl font-light tracking-tight mb-6 leading-tight"
              style={{ color: "var(--foreground)" }}
            >
              Hilal<br />Vision
            </h1>

            <p className="text-lg md:text-xl mb-8 max-w-xl leading-relaxed font-light mt-4" style={{ color: "var(--muted-foreground)" }}>
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
      <section className="py-6 relative z-10 -mt-8">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Current time */}
            <div className="breezy-card text-center !p-4 !rounded-xl !border-transparent glass-card animate-breezy-enter" style={{ animationDelay: '0.1s' }}>
              <div className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>UTC Time</div>
              <div className="text-lg font-mono font-semibold" style={{ color: "var(--gold)" }}>
                {time.toUTCString().slice(17, 25)}
              </div>
            </div>
            {/* Moon phase */}
            <div className="breezy-card text-center !p-4 !rounded-xl !border-transparent glass-card animate-breezy-enter" style={{ animationDelay: '0.2s' }}>
              <div className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Moon Phase</div>
              <div className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                {moonInfo.phaseName}
              </div>
              <div className="text-[10px]" style={{ color: "var(--gold-dim)" }}>{moonInfo.illumination}% illuminated</div>
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
            {/* Moon age */}
            <div className="breezy-card text-center !p-4 !rounded-xl !border-transparent glass-card animate-breezy-enter" style={{ animationDelay: '0.4s' }}>
              <div className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Lunar Age</div>
              <div className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                {moonInfo.age.toFixed(1)} days
              </div>
              <div className="text-[10px]" style={{ color: "var(--gold-dim)" }}>
                New: {formatTime(moonInfo.nextNewMoon)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tonight's Sky & Details Grid */}
      <section className="py-8">
        <div className="container flex flex-col gap-5">
          <BreezyFullCard
            title="Tonight's Sky (Equator)"
            titleAr="سماء الليلة"
            icon={<Star />}
            className="animate-breezy-enter"
            tabs={[
              { value: 'now', label: 'Now', labelAr: 'الآن' },
              { value: 'forecast', label: 'Forecast', labelAr: 'توقعات' }
            ]}
            activeTab="now"
          >
            <div className="flex flex-col md:flex-row items-center justify-center gap-12 py-6">
              <div className="w-full max-w-[200px]">
                <MoonArcVisual
                  riseTime={null}
                  setTime={null}
                  currentTime={time}
                  altitude={30}
                />
              </div>
              <div className="flex flex-col text-center md:text-left">
                <h3 className="text-2xl font-light mb-1">{moonInfo.phaseName}</h3>
                <p className="text-sm max-w-sm" style={{ color: "var(--muted-foreground)" }}>
                  The moon is currently {moonInfo.illumination}% illuminated and {moonInfo.age.toFixed(1)} days old.
                </p>
              </div>
            </div>
          </BreezyFullCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <BreezyDetailCard
              title="Visibility Zone"
              titleAr="منطقة الرؤية"
              icon={<Map />}
              decorativeVisual={<VisibilityDotScale zone="C" />}
              primaryValue="C"
              statusLabel="Optical Aid Required (Demo)"
              className="animate-breezy-enter"
              expandableContent={
                <div className="flex flex-col gap-6 p-2">
                  <h3 className="text-2xl font-light">The Yallop Criterion (q-value)</h3>
                  <p className="text-sm" style={{ color: "var(--muted-foreground)", lineHeight: "1.6" }}>
                    The `q-value` is a scientific measure designed by astronomer B. D. Yallop in 1997. It evaluates the likelihood of seeing the thin lunar crescent by measuring the <strong style={{ color: "var(--foreground)" }}>Arc of Vision (ARCV)</strong> and the <strong style={{ color: "var(--foreground)" }}>Crescent Width (W)</strong> at the exact moment of sunset. The equation is computed computationally based on observer coordinates and local topology.
                  </p>

                  <div className="relative h-64 w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { name: "Sunset", q: -0.30 },
                        { name: "Maghrib", q: -0.16 },
                        { name: "Dusk", q: 0.10 },
                        { name: "Midnight", q: 0.40 },
                        { name: "Fajr", q: 0.15 },
                        { name: "Sunrise", q: -0.20 }
                      ]}>
                        <XAxis dataKey="name" fontSize={11} stroke="var(--muted-foreground)" />
                        <YAxis hide domain={[-0.4, 0.5]} />
                        <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }} />
                        <Area type="monotone" dataKey="q" stroke="var(--foreground)" fillOpacity={0.1} fill="var(--foreground)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
                    <div className="w-3 h-3 rounded-full" style={{ background: "var(--zone-c)" }} />
                    Zone C: May need optical aid (q &ge; -0.160)
                  </div>
                </div>
              }
            />
            <BreezyDetailCard
              title="Illumination"
              titleAr="الإضاءة"
              icon={<Moon />}
              decorativeVisual={<IlluminationArc illumination={moonInfo.illumination} />}
              primaryValue={moonInfo.illumination}
              primaryUnit="%"
              statusLabel={moonInfo.phaseName}
              className="animate-breezy-enter"
              accentColour="var(--foreground)"
              expandableContent={
                <div className="flex flex-col gap-6 p-2">
                  <h3 className="text-2xl font-light">Lunar Illumination Cycle</h3>
                  <p className="text-sm" style={{ color: "var(--muted-foreground)", lineHeight: "1.6" }}>
                    The moon's phase and illumination percentage are entirely derived from the <strong style={{ color: "var(--foreground)" }}>Phase Angle</strong> between the Sun, the Earth, and the Moon. As the moon progresses through its roughly 29.53-day synodic cycle, the fraction of the sunlit half visible from Earth oscillates.
                  </p>

                  <div className="relative h-64 w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={Array.from({ length: 30 }, (_, i) => ({
                        day: i,
                        illum: Math.round((Math.sin(Math.PI * (i / 15 - 0.5)) + 1) * 50)
                      }))}>
                        <XAxis dataKey="day" fontSize={11} stroke="var(--muted-foreground)" />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }} />
                        <Area type="natural" dataKey="illum" stroke="var(--foreground)" fillOpacity={0.1} fill="var(--foreground)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              }
            />
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
                  <div className="flex items-center gap-3 w-full mb-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `color-mix(in oklch, ${color} 15%, transparent)` }}
                    >
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    <div className="flex-1 flex items-baseline justify-between">
                      <h4 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                        {title}
                      </h4>
                      <span className="text-[10px] font-arabic" style={{ color: "var(--gold-dim)" }}>{titleAr}</span>
                    </div>
                  </div>
                  <p className="text-[11px] leading-relaxed flex-1 mt-1" style={{ color: "var(--muted-foreground)" }}>{desc}</p>
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

      {/* Live Sighting Feed */}
      <section className="container py-16">
        <div className="max-w-2xl mx-auto">
          <SightingFeed />
          <div className="flex justify-center mt-6">
            <ShareButton
              title="Hilal Vision — Islamic Moon Visibility"
              text="Check out the crescent moon visibility predictions on Hilal Vision!"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
