import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Moon, Globe, Map, Calendar, Compass, Archive, Home, Sun, PlusCircle } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SightingReportForm } from "./SightingReportForm";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/globe", label: "3D Globe", icon: Globe },
  { href: "/map", label: "Visibility Map", icon: Map },
  { href: "/moon", label: "Moon Phase", icon: Moon },
  { href: "/calendar", label: "Hijri Calendar", icon: Calendar },
  { href: "/horizon", label: "Horizon View", icon: Compass },
  { href: "/archive", label: "Archive", icon: Archive },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--space)" }}>
      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: scrolled ? "oklch(0.05 0.02 265 / 0.96)" : "transparent",
          backdropFilter: scrolled ? "blur(24px) saturate(1.2)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(24px) saturate(1.2)" : "none",
          borderBottom: scrolled ? "1px solid color-mix(in oklch, var(--gold) 12%, transparent)" : "1px solid transparent",
          transition: "all 0.4s ease",
        }}
      >
        <div className="container">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center gap-3 group">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, var(--gold-glow), var(--gold-dim))",
                    boxShadow: "0 0 12px color-mix(in oklch, var(--gold) 40%, transparent)",
                  }}
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                    <path
                      d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5S12.83 18 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c.83 0 1.5-.67 1.5-1.5S12.83 3 12 3z"
                      fill="var(--space)"
                    />
                    <path
                      d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5S12.83 18 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c.83 0 1.5-.67 1.5-1.5S12.83 3 12 3z"
                      fill="var(--space)"
                    />
                  </svg>
                  <span className="text-sm font-bold" style={{ color: "var(--space)", fontFamily: "Cinzel, serif" }}>☽</span>
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
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = location === href;
                return (
                  <Link key={href} href={href}>
                    <div
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-200"
                      style={{
                        color: active ? "var(--gold)" : "var(--muted-foreground)",
                        background: active
                          ? "color-mix(in oklch, var(--gold) 10%, transparent)"
                          : "transparent",
                        border: active
                          ? "1px solid color-mix(in oklch, var(--gold) 20%, transparent)"
                          : "1px solid transparent",
                      }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile menu and Theme toggle */}
            <div className="flex items-center gap-2">
              <Dialog open={reportOpen} onOpenChange={setReportOpen}>
                <DialogTrigger asChild>
                  <button
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: "color-mix(in oklch, var(--gold) 15%, transparent)",
                      color: "var(--gold)",
                      border: "1px solid color-mix(in oklch, var(--gold) 20%, transparent)"
                    }}
                  >
                    <PlusCircle className="w-4 h-4" />
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

              <button
                className="p-2 rounded-lg transition-colors"
                style={{ color: "var(--foreground)" }}
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                className="lg:hidden p-2 rounded-lg"
                style={{ color: "var(--gold)" }}
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div
            className="lg:hidden border-t"
            style={{
              background: "color-mix(in oklch, var(--space) 95%, transparent)",
              borderColor: "color-mix(in oklch, var(--gold) 12%, transparent)",
            }}
          >
            <div className="container py-3 flex flex-col gap-1">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = location === href;
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
      </header>

      {/* Main content */}
      <main className="flex-1 pt-14">
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
            <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              Calculations based on Yallop & Odeh criteria · Astronomical data via SunCalc
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
