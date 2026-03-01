import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Moon, Globe, Map, Calendar, Compass, Archive, Home, Sun, PlusCircle, Languages, Crown } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SightingReportForm } from "./SightingReportForm";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { useGlobalState } from "@/contexts/GlobalStateContext";
import { LocationSearch } from "./LocationSearch";
import { AutoDetectButton } from "./AutoDetectButton";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useProTier } from "@/contexts/ProTierContext";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/visibility", label: "Visibility", icon: Globe },
  { href: "/moon", label: "Moon Phase", icon: Moon },
  { href: "/calendar", label: "Hijri Calendar", icon: Calendar },
  { href: "/horizon", label: "Horizon View", icon: Compass },
  { href: "/archive", label: "Archive", icon: Archive },
];

const RTL_LANGS = ["ar", "ur"];
const LANG_OPTIONS = [
  { code: "en", label: "EN", flag: "A" },
  { code: "ar", label: "عر", flag: "ع" },
  { code: "ur", label: "ار", flag: "ا" },
] as const;

export default function Layout({ children }: { children: React.ReactNode }) {
  const [routePath] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { theme, toggleTheme, highContrast, setHighContrast } = useTheme();
  const { t, i18n } = useTranslation();

  const { location, setLocation, date, setDate } = useGlobalState();
  const geo = useGeolocation(true);
  const { isPremium, togglePremium, setShowUpgradeModal } = useProTier();

  // Apply GPS detection result globally
  useEffect(() => {
    if (geo.position) {
      const gpsCity = {
        name: geo.position.name || "GPS Location",
        country: "Current",
        lat: geo.position.lat,
        lng: geo.position.lng,
      };
      setLocation(gpsCity);
    }
  }, [geo.position, setLocation]);

  // Set RTL direction based on language
  useEffect(() => {
    const isRtl = RTL_LANGS.includes(i18n.language);
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--space)" }}>
      {/* Global CSS Noise Overlay */}
      <svg className="noise-overlay" xmlns="http://www.w3.org/2000/svg">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>

      {/* Floating Command Centre Navigation */}
      <div className="fixed left-0 right-0 z-50 flex justify-center pointer-events-none px-4" style={{ top: "calc(1.5rem + env(safe-area-inset-top))" }}>
        <header
          className="pointer-events-auto flex items-center px-2 md:px-3 h-14 rounded-full transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] overflow-hidden"
          style={{
            background: scrolled
              ? "color-mix(in oklch, var(--card) 60%, transparent)"
              : "color-mix(in oklch, var(--card) 20%, transparent)",
            backdropFilter: "blur(24px) saturate(1.2)",
            WebkitBackdropFilter: "blur(24px) saturate(1.2)",
            border: scrolled
              ? "1px solid color-mix(in oklch, var(--border) 50%, transparent)"
              : "1px solid color-mix(in oklch, var(--border) 20%, transparent)",
            boxShadow: scrolled
              ? "0 12px 40px -10px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.05) inset"
              : "none",
            width: "fit-content",
            maxWidth: "calc(100vw - 2rem)"
          }}
        >
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-3 group magnetic cursor-pointer p-1">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, var(--gold-glow), var(--gold-dim))",
                  boxShadow: "0 0 12px color-mix(in oklch, var(--gold) 40%, transparent)",
                }}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
                  <path
                    d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5S12.83 18 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c.83 0 1.5-.67 1.5-1.5S12.83 3 12 3z"
                    fill="var(--space)"
                  />
                  <path
                    d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5S12.83 18 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c.83 0 1.5-.67 1.5-1.5S12.83 3 12 3z"
                    fill="var(--space)"
                  />
                </svg>
                <span className="text-xs font-bold" style={{ color: "var(--space)", fontFamily: "Cinzel, serif" }}>☽</span>
              </div>
              <div>
                <div
                  className="text-base font-semibold leading-none"
                  style={{ fontFamily: "Cinzel, serif", color: "var(--gold)" }}
                >
                  Hilal Vision
                </div>
                <div className="text-xs leading-none mt-0.5" style={{ color: "var(--gold-dim)", fontFamily: "Noto Naskh Arabic, serif" }}>
                  هلال
                </div>
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5 ml-2 mr-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = routePath === href;
              return (
                <Link key={href} href={href}>
                  <div
                    className="flex items-center gap-1 px-2 py-1.5 rounded-full text-[12px] transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] magnetic whitespace-nowrap"
                    style={{
                      color: active ? "var(--foreground)" : "var(--muted-foreground)",
                      background: active
                        ? "color-mix(in oklch, var(--primary) 10%, transparent)"
                        : "transparent",
                      border: active
                        ? "1px solid color-mix(in oklch, var(--primary) 20%, transparent)"
                        : "1px solid transparent",
                      fontWeight: active ? 600 : 500,
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Global Location & Date Selectors */}
          <div className="hidden lg:flex items-center gap-1.5 mr-auto mx-1 flex-1 max-w-[280px]">
            <div className="flex items-center gap-1.5 bg-black/10 px-1 py-1 rounded-xl border border-white/5 w-full">
              <div className="w-full relative min-w-0">
                <LocationSearch
                  selectedCity={location}
                  onSelect={setLocation}
                />
              </div>
              <AutoDetectButton onClick={geo.detect} loading={geo.loading} className="mr-1" />
            </div>

            <input
              type="date"
              value={`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`}
              onChange={e => {
                if (!e.target.value) return;
                const [y, m, d] = e.target.value.split("-").map(Number);
                const newDate = new Date(y, m - 1, d, date.getHours(), date.getMinutes(), date.getSeconds());
                setDate(newDate);
              }}
              className="px-2 py-[7px] min-w-0 rounded-lg text-[12px] font-sans text-center transition-colors"
              style={{
                background: "var(--space-light)",
                border: "1px solid color-mix(in oklch, var(--gold) 20%, transparent)",
                color: "var(--foreground)",
                colorScheme: "dark",
                width: "110px"
              }}
            />
          </div>

          {/* Actions: Theme, Lang, Clerk, Report */}
          <div className="flex items-center gap-0.5 flex-shrink-0">

            {/* Desktop Only Actions */}
            <div className="hidden lg:flex items-center gap-0.5">
              <div className="relative">
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 pointer-events-none">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-400" />
                </span>
                <button
                  onClick={() => setReportOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-medium magnetic transition-colors whitespace-nowrap flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #ef4444, #dc2626)",
                    color: "#fff",
                  }}
                >
                  <PlusCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>I saw the moon!</span>
                </button>
              </div>

              {/* Language Switcher */}
              <div
                className="relative"
                onKeyDown={(e) => {
                  if (e.key === "Escape") setLangOpen(false);
                }}
              >
                <button
                  className="p-1.5 rounded-lg transition-colors flex items-center gap-1"
                  style={{ color: "var(--muted-foreground)" }}
                  onClick={() => setLangOpen(!langOpen)}
                  aria-label="Change language"
                  aria-haspopup="listbox"
                  aria-expanded={langOpen}
                >
                  <Languages className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">{i18n.language}</span>
                </button>
                {langOpen && (
                  <div
                    role="listbox"
                    aria-label="Select language"
                    className="absolute top-full right-0 mt-1 rounded-xl overflow-hidden shadow-xl z-[100]"
                    style={{
                      background: "var(--space-mid)",
                      border: "1px solid color-mix(in oklch, var(--gold) 20%, transparent)",
                      minWidth: "120px",
                    }}
                  >
                    {LANG_OPTIONS.map(({ code, label }, idx) => (
                      <button
                        key={code}
                        role="option"
                        aria-selected={i18n.language === code}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-white/5"
                        style={{
                          color: i18n.language === code ? "var(--gold)" : "var(--foreground)",
                          background: i18n.language === code ? "color-mix(in oklch, var(--gold) 10%, transparent)" : "transparent",
                        }}
                        onClick={() => { i18n.changeLanguage(code); setLangOpen(false); }}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowDown") {
                            e.preventDefault();
                            const next = (e.currentTarget.parentElement?.querySelectorAll("button") ?? [])[idx + 1] as HTMLButtonElement | undefined;
                            next?.focus();
                          } else if (e.key === "ArrowUp") {
                            e.preventDefault();
                            const prev = (e.currentTarget.parentElement?.querySelectorAll("button") ?? [])[idx - 1] as HTMLButtonElement | undefined;
                            prev?.focus();
                          }
                        }}
                      >
                        <span className="font-bold">{label}</span>
                        <span style={{ color: "var(--muted-foreground)" }}>{t(`language.${code}`)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: highContrast ? "var(--gold)" : "var(--foreground)" }}
                onClick={() => setHighContrast(!highContrast)}
                aria-label="Toggle high contrast mode"
                title="High Contrast (Color-Blind) Mode"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a10 10 0 0 0 0 20Z" /></svg>
              </button>

              {/* Pro Badge */}
              <button
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[12px] font-semibold transition-all"
                style={{
                  background: isPremium
                    ? "linear-gradient(135deg, color-mix(in oklch, var(--gold) 25%, transparent), color-mix(in oklch, var(--gold) 15%, transparent))"
                    : "transparent",
                  border: isPremium
                    ? "1px solid color-mix(in oklch, var(--gold) 40%, transparent)"
                    : "1px solid color-mix(in oklch, var(--border) 50%, transparent)",
                  color: isPremium ? "var(--gold)" : "var(--muted-foreground)",
                }}
                onClick={() => isPremium ? togglePremium() : setShowUpgradeModal(true)}
                title={isPremium ? "Pro Active (click to toggle for testing)" : "Upgrade to Pro"}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>{isPremium ? "Pro" : "Upgrade"}</span>
              </button>

              <button
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: "var(--foreground)" }}
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>

            <SignedIn>
              <div className="flex items-center justify-center p-1 rounded-full border border-white/10 mx-1">
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-7 h-7",
                    },
                  }}
                />
              </div>
            </SignedIn>

            <SignedOut>
              <div className="hidden sm:block">
                <SignInButton mode="modal">
                  <button
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all mx-1 whitespace-nowrap flex-shrink-0"
                    style={{
                      background: "color-mix(in oklch, var(--foreground) 10%, transparent)",
                      color: "var(--foreground)",
                    }}
                  >
                    Sign In
                  </button>
                </SignInButton>
              </div>
            </SignedOut>

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-1.5 ml-1 rounded-lg transition-colors flex items-center justify-center flex-shrink-0"
              style={{ color: "var(--foreground)" }}
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Global Dialog for Sighting Form */}
        <Dialog open={reportOpen} onOpenChange={setReportOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Submit Crescent Sighting</DialogTitle>
              <DialogDescription>
                Share your live observation. Environmental conditions will be fetched automatically.
              </DialogDescription>
            </DialogHeader>
            <SightingReportForm onSuccess={() => setReportOpen(false)} />
          </DialogContent>
        </Dialog>

        {/* Mobile Menu Full Screen Overlay Sheet */}
        {mobileOpen && (
          <div
            className="lg:hidden fixed inset-0 z-[70] flex flex-col pointer-events-auto overflow-hidden animate-in slide-in-from-bottom-2 duration-300 ease-out"
            style={{
              background: "color-mix(in oklch, var(--space) 97%, transparent)",
              backdropFilter: "blur(40px) saturate(1.5)",
              WebkitBackdropFilter: "blur(40px) saturate(1.5)",
            }}
          >
            {/* Header */}
            <div className="flex flex-shrink-0 items-center justify-between px-5 border-b border-white/5" style={{ paddingTop: "calc(1.5rem + env(safe-area-inset-top))", paddingBottom: "1.5rem" }}>
              <span className="font-bold text-xl" style={{ fontFamily: "Cinzel, serif", color: "var(--gold)" }}>Hilal Vision</span>
              <button onClick={() => setMobileOpen(false)} className="p-2.5 bg-white/5 rounded-full hover:bg-white/10 transition-colors" style={{ color: "var(--foreground)" }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-8 pb-[calc(6rem+env(safe-area-inset-bottom))]">
              {/* Location & Time Box */}
              <div className="flex flex-col gap-3">
                <label className="text-xs uppercase font-bold tracking-widest pl-1" style={{ color: "var(--gold-dim)" }}>Location & Date</label>
                <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/5 flex flex-col gap-3">
                  <LocationSearch selectedCity={location} onSelect={setLocation} />
                  <div className="flex justify-between items-center gap-2 mt-1">
                    <AutoDetectButton onClick={geo.detect} loading={geo.loading} />
                    <input
                      type="date"
                      value={`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`}
                      onChange={e => {
                        if (!e.target.value) return;
                        const [y, m, d] = e.target.value.split("-").map(Number);
                        const newDate = new Date(y, m - 1, d, date.getHours(), date.getMinutes(), date.getSeconds());
                        setDate(newDate);
                      }}
                      className="px-3 py-2 w-full max-w-[160px] rounded-xl font-medium transition-colors border"
                      style={{
                        background: "color-mix(in oklch, var(--gold) 5%, transparent)",
                        borderColor: "color-mix(in oklch, var(--gold) 20%, transparent)",
                        color: "var(--foreground)",
                        colorScheme: "dark",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="flex flex-col gap-3">
                <label className="text-xs uppercase font-bold tracking-widest pl-1" style={{ color: "var(--gold-dim)" }}>Explore Content</label>
                <div className="p-2 rounded-3xl bg-white/[0.03] border border-white/5 grid grid-cols-1 gap-1">
                  {[
                    { href: "/", label: "Home Base", icon: Home },
                    { href: "/horizon", label: "Horizon Simulator", icon: Compass },
                    { href: "/archive", label: "Observation Archive", icon: Archive },
                  ].map(item => (
                    <Link key={item.href} href={item.href}>
                      <div onClick={() => setMobileOpen(false)} className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[15px] font-medium transition-colors" style={{ color: routePath === item.href ? "var(--space)" : "var(--foreground)", background: routePath === item.href ? "var(--gold)" : "transparent" }}>
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {item.label}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Account */}
              <div className="flex flex-col gap-3">
                <label className="text-xs uppercase font-bold tracking-widest pl-1" style={{ color: "var(--gold-dim)" }}>Account</label>
                <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/5 flex flex-col gap-4">
                  <SignedIn>
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>Manage Profile</span>
                      <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8" } }} />
                    </div>
                  </SignedIn>
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button
                        className="py-3.5 rounded-2xl text-[13px] font-bold transition-colors w-full flex items-center justify-center"
                        style={{ color: "var(--space)", background: "var(--gold)" }}
                        onClick={() => setMobileOpen(false)}
                      >
                        Sign In / Register
                      </button>
                    </SignInButton>
                  </SignedOut>
                </div>
              </div>

              {/* Preferences */}
              <div className="flex flex-col gap-3">
                <label className="text-xs uppercase font-bold tracking-widest pl-1" style={{ color: "var(--gold-dim)" }}>Preferences</label>
                <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/5 flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={toggleTheme} className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-white/5 transition-colors text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>
                      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
                    </button>
                    <button onClick={() => setHighContrast(!highContrast)} className="flex items-center justify-center gap-2 p-3.5 rounded-2xl transition-colors border text-[13px] font-semibold" style={{ background: highContrast ? "color-mix(in oklch, var(--gold) 15%, transparent)" : "var(--space-mid)", color: highContrast ? "var(--gold)" : "var(--foreground)", borderColor: highContrast ? "var(--gold)" : "transparent" }}>
                      <Globe className="w-4 h-4" />
                      <span>Color-Blind</span>
                    </button>
                  </div>

                  {/* Pro Badge */}
                  <button
                    onClick={() => isPremium ? togglePremium() : setShowUpgradeModal(true)}
                    className="flex items-center justify-center gap-2 p-3.5 rounded-2xl transition-colors border text-[13px] font-semibold w-full"
                    style={{
                      background: isPremium
                        ? "color-mix(in oklch, var(--gold) 15%, transparent)"
                        : "var(--space-mid)",
                      color: isPremium ? "var(--gold)" : "var(--foreground)",
                      borderColor: isPremium ? "var(--gold)" : "transparent",
                    }}
                  >
                    <Crown className="w-4 h-4" />
                    <span>{isPremium ? "Pro Active ✓" : "Upgrade to Pro"}</span>
                  </button>

                  <div className="grid grid-cols-3 gap-2">
                    {LANG_OPTIONS.map(opt => (
                      <button key={opt.code} onClick={() => { i18n.changeLanguage(opt.code); setLangOpen(false); }} className="py-2.5 rounded-xl text-sm font-bold transition-colors" style={{ color: i18n.language === opt.code ? "var(--space)" : "var(--foreground)", background: i18n.language === opt.code ? "var(--gold)" : "var(--space-mid)", border: "1px solid color-mix(in oklch, var(--gold) 20%, transparent)" }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] flex items-center justify-between px-3 pt-2 pb-1"
        style={{
          background: "color-mix(in oklch, var(--card) 95%, transparent)",
          backdropFilter: "blur(32px) saturate(1.8)",
          WebkitBackdropFilter: "blur(32px) saturate(1.8)",
          borderTop: "1px solid color-mix(in oklch, var(--border) 40%, transparent)",
          paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))"
        }}
      >
        <Link href="/visibility">
          <div className="flex flex-col items-center gap-1.5 p-2 min-w-[64px] transition-colors" style={{ color: routePath === "/visibility" || routePath === "/map" || routePath === "/globe" ? "var(--gold)" : "var(--muted-foreground)" }}>
            <Map className="w-[22px] h-[22px]" />
            <span className="text-[10px] font-semibold">Map</span>
          </div>
        </Link>
        <Link href="/moon">
          <div className="flex flex-col items-center gap-1.5 p-2 min-w-[64px] transition-colors" style={{ color: routePath === "/moon" ? "var(--gold)" : "var(--muted-foreground)" }}>
            <Moon className="w-[22px] h-[22px]" fill={routePath === "/moon" ? "currentColor" : "none"} />
            <span className="text-[10px] font-semibold">Moon</span>
          </div>
        </Link>

        <div className="relative -top-7 flex flex-col items-center mx-1">
          <div className="relative">
            <span className="absolute inset-0 rounded-[20px] animate-ping bg-red-400/25 pointer-events-none" />
            <button
              onClick={() => setReportOpen(true)}
              className="relative w-14 h-14 rounded-[20px] flex items-center justify-center transition-transform active:scale-90"
              style={{
                background: "linear-gradient(135deg, #ef4444, #b91c1c)",
                color: "#fff",
                boxShadow: "0 8px 25px -4px rgba(239, 68, 68, 0.4), 0 0 0 4px var(--space) inset",
                border: "4px solid var(--space)"
              }}
            >
              <PlusCircle className="w-6 h-6" />
            </button>
          </div>
          <span className="text-[9px] font-semibold mt-1.5" style={{ color: "#ef4444" }}>I saw it!</span>
        </div>

        <Link href="/calendar">
          <div className="flex flex-col items-center gap-1.5 p-2 min-w-[64px] transition-colors" style={{ color: routePath === "/calendar" ? "var(--gold)" : "var(--muted-foreground)" }}>
            <Calendar className="w-[22px] h-[22px]" />
            <span className="text-[10px] font-semibold">Hijri</span>
          </div>
        </Link>

        <button onClick={() => setMobileOpen(true)} className="flex flex-col items-center gap-1.5 p-2 min-w-[64px] transition-colors" style={{ color: mobileOpen ? "var(--gold)" : "var(--muted-foreground)" }}>
          <Menu className="w-[22px] h-[22px]" />
          <span className="text-[10px] font-semibold">Menu</span>
        </button>
      </nav>

      {/* Main content */}
      <main className="flex-1 w-full relative z-10 pt-28">
        {children}
      </main>

      {/* Footer */}
      <footer
        className="border-t py-8 pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-[calc(2rem+env(safe-area-inset-bottom))]"
        style={{
          borderColor: "color-mix(in oklch, var(--gold) 10%, transparent)",
          background: "var(--space-mid)",
        }}
      >
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span style={{ color: "var(--gold)", fontFamily: "Cinzel, serif", fontSize: "0.875rem" }}>
                ☽ Hilal Vision
              </span>
              <span style={{ color: "var(--muted-foreground)", fontSize: "0.75rem" }}>
                - Islamic Crescent Moon Visibility
              </span>
            </div>
            <div className="flex items-center gap-4 flex-wrap justify-center">
              {[
                { href: "/about", label: "About" },
                { href: "/methodology", label: "Methodology" },
                { href: "/support", label: "Support" },
                { href: "/privacy", label: "Privacy" },
                { href: "/terms", label: "Terms" },
              ].map(({ href, label }) => (
                <Link key={href} href={href}>
                  <span
                    className="text-xs transition-colors cursor-pointer hover:text-amber-300"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {label}
                  </span>
                </Link>
              ))}
            </div>
            <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              Yallop & Odeh criteria · All Rights Reserved
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
