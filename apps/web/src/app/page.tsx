"use client";

import { Calendar, Map, Activity, ArrowRight, Smartphone, Heart, Crown, Moon } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useState } from "react";
import { getMoonPhaseInfo, gregorianToHijri } from "@hilal/astronomy";

const MoonIllustration = dynamic(
  () => import("@/components/MoonIllustration").then((m) => m.MoonIllustration),
  { ssr: false }
);

const FEATURE_DEFS = [
  { href: "/visibility", icon: Map, key: "visibilityMap", title: "Global Visibility Map", desc: "Interactive charts powered by Yallop and Odeh criteria." },
  { href: "/moon", icon: Moon, key: "moonPhase", title: "Moon Phases", desc: "Track exact illumination and moon age." },
  { href: "/calendar", icon: Calendar, key: "calendar", title: "Hijri Calendar", desc: "Conjunction-aware calendar aligning astronomy with tradition." },
];

const ZONE_LEGEND = [
  { zone: "A", color: "var(--zone-a)", q: "q ≥ +0.216", label: "Easily visible" },
  { zone: "B", color: "var(--zone-b)", q: "q ≥ −0.014", label: "Visible under perfect conditions" },
  { zone: "C", color: "var(--zone-c)", q: "q ≥ −0.160", label: "May need optical aid" },
  { zone: "D", color: "var(--zone-d)", q: "q ≥ −0.232", label: "Optical aid required" },
  { zone: "E", color: "var(--zone-e)", q: "q < −0.232", label: "Not visible" },
];

export default function Home() {
  // Always show TODAY's moon phase — store date may be set to a different date
  // for visibility calculations and must not affect the home page display.
  // useState initializer runs once per mount, safe from hydration issues
  // because moon phase / Hijri date won't change within a single server→client cycle.
  const [moonInfo] = useState(() => getMoonPhaseInfo(new Date()));
  const [hijri] = useState(() => gregorianToHijri(new Date()));

  return (
    <div className="relative">

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Glow behind globe */}
        <div className="absolute top-1/2 right-10 -translate-y-1/2 w-[500px] h-[500px] opacity-20 pointer-events-none rounded-full blur-3xl hidden lg:block" style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)" }} />

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">

          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-8 animate-fade-in">
              <Activity className="w-4 h-4" />
              <span>Lunar Tracking Reimagined</span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent leading-tight">
              Observe the Moon, <br />
              <span className="text-primary-400">Master the Calendar.</span>
            </h1>

            <p className="max-w-2xl mx-auto lg:mx-0 text-lg text-foreground/60 mb-10 leading-relaxed">
              AI-powered crescent visibility predictions, hyper-local weather conditions,
              and a precise Hijri calendar system built for the modern Muslim community.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <Link href="/visibility" className="px-8 py-4 rounded-2xl bg-primary-600 text-white font-bold text-lg hover:bg-primary-500 transition-all hover:scale-105 shadow-xl shadow-primary-600/20">
                Check Local Visibility
              </Link>
              <Link href="/moon" className="px-8 py-4 rounded-2xl glass font-bold text-lg hover:bg-foreground/5 transition-all text-foreground border border-foreground/10">
                Track Moon Phases
              </Link>
            </div>
          </div>

          {/* Actual Moon Illustration Replacement */}
          <div className="flex-1 w-full max-w-[500px] aspect-square relative z-10 hidden lg:flex items-center justify-center">
            <div
              style={{ filter: "drop-shadow(0 0 40px oklch(0.78 0.15 75 / 0.35))" }}
              className="animate-float"
            >
              <MoonIllustration phase={moonInfo.phase} size={300} />
            </div>
          </div>

        </div>
      </section>

      {/* Live Status Bar */}
      <section className="py-6 relative z-10 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl glass border border-foreground/10 text-center animate-breezy-enter" style={{ animationDelay: '0.2s' }}>
            <div className="text-xs mb-1 text-foreground/60 uppercase tracking-widest font-bold">Current Moon Phase</div>
            <div className="text-lg font-medium text-foreground mb-1">
              {moonInfo.phaseName}
            </div>
            <div className="text-sm text-gold">
              {Math.round(moonInfo.illuminatedFraction * 100)}% Illuminated
            </div>
          </div>
          <div className="p-4 rounded-2xl glass border border-foreground/10 text-center animate-breezy-enter" style={{ animationDelay: '0.3s' }}>
            <div className="text-xs mb-1 text-foreground/60 uppercase tracking-widest font-bold">Hijri Date</div>
            <div className="text-lg font-medium text-foreground mb-1">
              {hijri.day} {hijri.monthName}
            </div>
            <div className="text-sm font-arabic text-gold">
              {hijri.day} {hijri.monthNameArabic} {hijri.year} AH
            </div>
          </div>
        </div>
      </section>

      {/* Feature Navigation Grid */}
      <section className="py-20 px-4 border-t border-foreground/5 bg-foreground/[0.02]">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gold text-center mb-10">
            Explore Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURE_DEFS.map(({ href, icon: Icon, title, desc }) => (
              <Link key={href} href={href}>
                <div className="p-8 rounded-3xl glass hover:border-primary-500/30 transition-all group h-full flex flex-col items-center text-center cursor-pointer border border-foreground/5 bg-background/50 hover:bg-foreground/5">
                  <div className="w-16 h-16 rounded-2xl bg-foreground/5 border border-foreground/10 flex items-center justify-center text-foreground mb-6 group-hover:scale-110 transition-transform shadow-sm">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 font-display text-foreground">{title}</h3>
                  <p className="text-foreground/60 leading-relaxed text-sm">
                    {desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Visibility Legend */}
      <section className="py-20 px-4 border-t border-foreground/5 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">
              Understanding Visibility Criteria
            </h2>
            <p className="text-foreground/60 max-w-2xl mx-auto">
              Hilal Vision maps are colored based on the standard astronomical criteria for crescent visibility (Yallop/Odeh). Here is what the zone colors mean:
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {ZONE_LEGEND.map(({ zone, color, label, q }) => (
              <div
                key={zone}
                className="p-5 rounded-2xl text-center border shadow-sm transition-transform hover:-translate-y-1"
                style={{
                  background: `color-mix(in oklch, ${color} 5%, transparent)`,
                  borderColor: `color-mix(in oklch, ${color} 20%, transparent)`,
                }}
              >
                <div
                  className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center text-lg font-bold shadow-md"
                  style={{ background: color, color: "var(--primary-foreground)" }}
                >
                  {zone}
                </div>
                <div className="text-sm font-semibold text-foreground mb-1 leading-tight">
                  {label}
                </div>
                <div className="text-xs font-mono opacity-60">
                  {q}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile App Waitlist Teaser */}
      <section className="py-20 px-4 border-t border-foreground/5 bg-foreground/[0.02]">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl p-10 md:p-16 flex flex-col items-center text-center shadow-2xl glass border border-foreground/10 group">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 dark:to-white/5 pointer-events-none" />

            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-8 shadow-xl bg-gradient-to-br from-primary-400 to-primary-600 text-white transform group-hover:scale-110 transition-transform duration-500">
              <Smartphone className="w-10 h-10" />
            </div>

            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Take Hilal Vision Anywhere
            </h2>
            <p className="text-lg text-foreground/60 mb-10 max-w-xl mx-auto leading-relaxed">
              The world&apos;s most advanced Islamic crescent visibility tools in your pocket. Mobile apps coming to iOS and Android.
            </p>

            {/* App Store Coming Soon Badges */}
            <div className="flex flex-wrap justify-center gap-4 opacity-70 grayscale hover:grayscale-0 transition-all duration-300">
              <div className="flex items-center gap-3 px-6 py-3 rounded-2xl border border-foreground/20 bg-foreground text-background shadow-lg hover:bg-foreground/90 cursor-not-allowed">
                <svg viewBox="0 0 384 512" className="w-7 h-7 fill-current">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.3 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.3zM286 98c16-19.4 26.6-46 23.6-72.3-21.7 1-49 14.1-65.7 32.7-14.7 16-27.2 43.1-23.7 68.8 24.4 1.9 49.8-9.8 65.8-29.2z" />
                </svg>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] leading-none uppercase font-bold opacity-80">Coming Soon</span>
                  <span className="text-lg font-bold leading-tight">App Store</span>
                </div>
              </div>

              <div className="flex items-center gap-3 px-6 py-3 rounded-2xl border border-foreground/20 bg-foreground text-background shadow-lg hover:bg-foreground/90 cursor-not-allowed">
                <svg viewBox="0 0 512 512" className="w-7 h-7 block">
                  <path fill="#4caf50" d="M34.9 31.8c-3.1 3.3-4.9 8.2-4.9 14.9v418.6c0 6.7 1.8 11.6 4.9 14.9l.4.4 233.1-233.3v-2.3l-233.1-233.3-.4.2z" />
                  <path fill="#ffc107" d="M346.9 344L268.4 265.5v-18.9l78.5-78.5 1.1-.6 93.3 53c26.6 15.1 26.6 39.8 0 55l-94.4 53.5z" />
                  <path fill="#f44336" d="M268.4 265.6L34.9 499.1c9.4 10 24.6 10.6 42.1.7l270-155.6-78.6-78.6z" />
                  <path fill="#2196f3" d="M268.4 246.5l78.5 78.5 270-155.6c-17.5-9.9-32.8-9.3-42.1.7zL268.4 246.5z" />
                </svg>
                <div className="flex flex-col text-left justify-center pl-1">
                  <span className="text-[10px] leading-none uppercase font-bold opacity-80">Coming Soon</span>
                  <span className="text-lg font-bold leading-tight tracking-tight">Google Play</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sadaqah Jariyah Banner */}
      <section className="py-20 px-4 border-t border-foreground/5 bg-background">
        <div className="max-w-4xl mx-auto">
          <Link href="/support">
            <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 cursor-pointer group transition-transform hover:-translate-y-1 shadow-lg border" style={{ borderColor: 'color-mix(in oklch, var(--gold) 20%, transparent)', background: 'linear-gradient(135deg, color-mix(in oklch, var(--gold) 5%, transparent), transparent)' }}>

              <div className="w-20 h-20 rounded-3xl flex items-center justify-center flex-shrink-0 shadow-inner" style={{ background: "color-mix(in oklch, var(--gold) 15%, transparent)" }}>
                <Heart className="w-10 h-10" style={{ color: "var(--gold)" }} />
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="text-sm font-bold uppercase tracking-widest mb-2" style={{ color: "var(--gold)" }}>
                  Sadaqah Jariyah
                </div>
                <h3 className="text-2xl font-display font-bold text-foreground mb-3">
                  Support the continuous development of Hilal Vision
                </h3>
                <p className="text-foreground/70 leading-relaxed max-w-xl">
                  Help us keep these tools free and accessible for the Ummah. Your contribution supports server costs, API fees, and continuous astronomical research.
                </p>
              </div>

              <div className="flex items-center gap-2 px-6 py-4 rounded-2xl font-bold whitespace-nowrap transition-all group-hover:scale-105 flex-shrink-0 shadow-xl" style={{ background: "var(--gold)", color: "var(--primary-foreground)" }}>
                <Crown className="w-5 h-5" />
                Support Us
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </Link>
        </div>
      </section>

    </div>
  );
}
