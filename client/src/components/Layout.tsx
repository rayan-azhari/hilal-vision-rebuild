import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Moon, Globe, Map, Calendar, Compass, Archive, Home, Sun, PlusCircle, Languages } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SightingReportForm } from "./SightingReportForm";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { useGlobalState } from "@/contexts/GlobalStateContext";
import { LocationSearch } from "./LocationSearch";
import { AutoDetectButton } from "./AutoDetectButton";
import { useGeolocation } from "@/hooks/useGeolocation";

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
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();

  const { location, setLocation, date, setDate } = useGlobalState();
  const geo = useGeolocation(true);

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
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
        <header
          className="pointer-events-auto flex items-center justify-between px-2 md:px-4 h-14 rounded-full transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
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
            width: "100%",
            maxWidth: "900px"
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
          <nav className="hidden lg:flex items-center gap-1.5 ml-4 mr-2">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = routePath === href;
              return (
                <Link key={href} href={href}>
                  <div
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[13px] transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] magnetic"
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
          <div className="hidden lg:flex items-center gap-2 mr-auto mx-2 flex-1 max-w-[340px]">
            <div className="flex items-center gap-2 bg-black/10 px-1 py-1 rounded-xl border border-white/5 w-full">
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
              className="px-2 py-[7px] min-w-0 rounded-lg text-[13px] font-sans text-center transition-colors"
              style={{
                background: "var(--space-light)",
                border: "1px solid color-mix(in oklch, var(--gold) 20%, transparent)",
                color: "var(--foreground)",
                colorScheme: "dark",
                width: "125px"
              }}
            />
          </div>

          {/* Actions: Theme, Lang, Clerk, Report */}
          <div className="flex items-center gap-1 md:gap-2">
            <Dialog open={reportOpen} onOpenChange={setReportOpen}>
              <DialogTrigger asChild>
                <button
                  className="flex items-center gap-1.5 px-3 md:px-4 py-1.5 rounded-full text-[13px] font-medium magnetic transition-colors whitespace-nowrap flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #ef4444, #dc2626)",
                    color: "#fff",
                  }}
                >
                  <PlusCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Report Sighting</span>
                </button>
              </DialogTrigger>
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

            {/* Language Switcher */}
            <div className="relative">
              <button
                className="p-1.5 rounded-lg transition-colors flex items-center gap-1"
                style={{ color: "var(--muted-foreground)" }}
                onClick={() => setLangOpen(!langOpen)}
                aria-label="Change language"
              >
                <Languages className="w-4 h-4" />
                <span className="text-xs font-bold uppercase">{i18n.language}</span>
              </button>
              {langOpen && (
                <div
                  className="absolute top-full right-0 mt-1 rounded-xl overflow-hidden shadow-xl z-[100]"
                  style={{
                    background: "var(--space-mid)",
                    border: "1px solid color-mix(in oklch, var(--gold) 20%, transparent)",
                    minWidth: "120px",
                  }}
                >
                  {LANG_OPTIONS.map(({ code, label }) => (
                    <button
                      key={code}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-white/5"
                      style={{
                        color: i18n.language === code ? "var(--gold)" : "var(--foreground)",
                        background: i18n.language === code ? "color-mix(in oklch, var(--gold) 10%, transparent)" : "transparent",
                      }}
                      onClick={() => { i18n.changeLanguage(code); setLangOpen(false); }}
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
              style={{ color: "var(--foreground)" }}
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <SignedIn>
              <div className="flex items-center justify-center p-1 rounded-full border border-white/10 ml-1">
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
              <SignInButton mode="modal">
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ml-1 whitespace-nowrap flex-shrink-0"
                  style={{
                    background: "color-mix(in oklch, var(--foreground) 10%, transparent)",
                    color: "var(--foreground)",
                  }}
                >
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>

            <button
              className="lg:hidden p-1.5 rounded-lg"
              style={{ color: "var(--gold)" }}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Nav — positioned BELOW the header pill */}
        {mobileOpen && (
          <div
            className="lg:hidden pointer-events-auto mt-2 rounded-2xl border flex flex-col"
            style={{
              background: "color-mix(in oklch, var(--space) 95%, transparent)",
              backdropFilter: "blur(24px) saturate(1.2)",
              WebkitBackdropFilter: "blur(24px) saturate(1.2)",
              borderColor: "color-mix(in oklch, var(--gold) 20%, transparent)",
              boxShadow: "0 12px 40px -10px rgba(0,0,0,0.3)",
              maxWidth: "900px",
              width: "100%",
            }}
          >
            <div className="py-2 px-3 flex flex-col gap-2 border-b border-white/5">
              <label className="text-xs uppercase text-[var(--gold-dim)] font-bold ml-1">Settings</label>
              <div className="flex flex-col gap-2">
                <LocationSearch
                  selectedCity={location}
                  onSelect={setLocation}
                />
                <div className="flex justify-between items-center gap-2">
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
                    className="px-2 py-[7px] w-full max-w-[140px] rounded-lg text-[13px] font-sans text-center transition-colors"
                    style={{
                      background: "var(--space-light)",
                      border: "1px solid color-mix(in oklch, var(--gold) 20%, transparent)",
                      color: "var(--foreground)",
                      colorScheme: "dark",
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="py-2 px-2 flex flex-col gap-1">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = routePath === href;
                return (
                  <Link key={href} href={href}>
                    <div
                      className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all"
                      style={{
                        color: active ? "var(--gold)" : "var(--muted-foreground)",
                        background: active
                          ? "color-mix(in oklch, var(--gold) 8%, transparent)"
                          : "transparent",
                      }}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <main className="flex-1 w-full relative z-10 pt-28">
        {children}
      </main>

      {/* Footer */}
      <footer
        className="border-t py-8"
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
                — Islamic Crescent Moon Visibility
              </span>
            </div>
            <div className="flex items-center gap-4 flex-wrap justify-center">
              {[
                { href: "/about", label: "About" },
                { href: "/methodology", label: "Methodology" },
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
              Yallop & Odeh criteria · MIT License
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
