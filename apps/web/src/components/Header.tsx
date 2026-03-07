"use client";

import { ThemeToggle } from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import { Moon, Calendar as CalendarIcon, Filter, Menu, X, Eye, Globe2, Compass, Archive as ArchiveIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LocationSearch } from "./LocationSearch";
import { AutoDetectButton } from "./AutoDetectButton";
import { useAppStore } from "@/store/useAppStore";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";

export function Header() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { isLoaded, userId } = useAuth();

    const location = useAppStore((state) => state.location);
    const setLocation = useAppStore((state) => state.setLocation);
    const date = useAppStore((state) => state.date);
    const setDate = useAppStore((state) => state.setDate);
    const criterion = useAppStore((state) => state.visibilityCriterion);
    const setCriterion = useAppStore((state) => state.setVisibilityCriterion);
    const setShowSightingModal = useAppStore((state) => state.setShowSightingModal);

    const navItems = [
        { href: "/visibility", label: "Visibility Map", Icon: Globe2 },
        { href: "/moon", label: "Moon Phase", Icon: Moon },
        { href: "/calendar", label: "Hijri Calendar", Icon: CalendarIcon },
        { href: "/horizon", label: "Horizon View", Icon: Compass },
        { href: "/archive", label: "ICOP Archive", Icon: ArchiveIcon },
        { href: "/support", label: "Support", Icon: null },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-foreground/5 bg-background/80 backdrop-blur-xl">
            <div className="max-w-[1400px] mx-auto px-4 h-16 flex items-center justify-between gap-4">

                {/* Logo & Navigation */}
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center p-1.5 group-hover:scale-105 transition-transform" style={{ background: "color-mix(in oklch, var(--gold) 20%, transparent)", boxShadow: "0 0 8px color-mix(in oklch, var(--gold) 30%, transparent)" }}>
                            <Moon className="w-full h-full" style={{ color: "var(--gold)" }} />
                        </div>
                        <span className="font-display font-bold text-lg tracking-tight hidden lg:block text-foreground">
                            Hilal Vision
                        </span>
                    </Link>

                    <nav className="hidden xl:flex items-center gap-1 bg-foreground/5 p-1 rounded-full border border-foreground/5">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 ${pathname.startsWith(item.href)
                                    ? "bg-primary-500 text-white shadow-md shadow-primary-500/20"
                                    : "text-foreground/70 hover:text-foreground hover:bg-foreground/5"
                                    }`}
                            >
                                {item.Icon && <item.Icon className="w-3 h-3 flex-shrink-0" />}
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Global State Controls (Desktop) */}
                <div className="hidden lg:flex flex-1 max-w-2xl gap-2 items-center justify-end">

                    {/* Location Box */}
                    <div className="flex items-center gap-1 bg-foreground/5 p-1 rounded-2xl border border-foreground/10 flex-1 min-w-0">
                        <div className="flex-1 min-w-0 relative">
                            <LocationSearch
                                selectedCity={location}
                                onSelect={setLocation}
                                className="w-full"
                            />
                        </div>
                        <AutoDetectButton
                            onDetect={setLocation}
                        />
                    </div>

                    {/* Date Picker */}
                    <div className="flex items-center gap-2 bg-foreground/5 p-1 pr-3 rounded-2xl border border-foreground/10 h-10">
                        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-foreground/5 text-foreground/50">
                            <CalendarIcon className="w-4 h-4" />
                        </div>
                        <input
                            type="date"
                            value={date.toISOString().split('T')[0]}
                            onChange={(e) => {
                                if (e.target.value) {
                                    // Preserve local time
                                    const [y, m, d] = e.target.value.split('-').map(Number);
                                    const newDate = new Date(y, m - 1, d, date.getHours(), date.getMinutes(), date.getSeconds());
                                    setDate(newDate);
                                }
                            }}
                            className="bg-transparent text-sm font-medium text-foreground focus:outline-none focus:ring-0 cursor-pointer w-[120px]"
                            style={{ colorScheme: "dark" }} // Ensures standard date picker icon looks decent on dark theme
                        />
                    </div>

                    {/* Criteria Selector */}
                    <div className="flex items-center gap-2 bg-foreground/5 p-1 pr-3 rounded-2xl border border-foreground/10 h-10">
                        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-foreground/5 text-foreground/50">
                            <Filter className="w-4 h-4" />
                        </div>
                        <select
                            value={criterion}
                            onChange={(e) => setCriterion(e.target.value as "yallop" | "odeh")}
                            className="bg-transparent text-sm font-medium text-foreground focus:outline-none cursor-pointer appearance-none w-16"
                        >
                            <option value="yallop" className="bg-background">Yallop</option>
                            <option value="odeh" className="bg-background">Odeh</option>
                        </select>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowSightingModal(true)}
                        className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
                        style={{ background: "var(--accent)", color: "var(--primary-foreground)", boxShadow: "0 0 12px color-mix(in oklch, var(--accent) 40%, transparent)" }}
                    >
                        <Eye className="w-3.5 h-3.5" />
                        I saw it!
                    </button>

                    <LanguageSwitcher />
                    <ThemeToggle />

                    {isLoaded && !userId && (
                        <SignInButton mode="modal">
                            <button className="hidden sm:block px-4 py-2 rounded-xl text-sm font-semibold transition-all" style={{ background: "var(--gold)", color: "var(--primary-foreground)" }}>
                                Sign In
                            </button>
                        </SignInButton>
                    )}

                    {isLoaded && userId && (
                        <UserButton />
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden p-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground transition-colors"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden absolute top-full left-0 w-full glass border-b border-foreground/10 p-4 flex flex-col gap-4 shadow-xl z-50">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-primary-500">Global Settings</label>
                        <div className="flex flex-col gap-2 p-3 bg-foreground/5 rounded-2xl border border-foreground/10">
                            <LocationSearch selectedCity={location} onSelect={(loc) => { setLocation(loc); setMobileMenuOpen(false); }} />
                            <div className="flex items-center gap-2 justify-between">
                                <AutoDetectButton onDetect={(loc) => { setLocation(loc); setMobileMenuOpen(false); }} className="flex-1" />
                                <input
                                    type="date"
                                    value={date.toISOString().split('T')[0]}
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            const [y, m, d] = e.target.value.split('-').map(Number);
                                            setDate(new Date(y, m - 1, d, 12, 0, 0));
                                        }
                                    }}
                                    className="bg-foreground/10 px-3 py-2 rounded-xl text-sm flex-1 font-medium border border-foreground/10"
                                    style={{ colorScheme: "dark" }}
                                />
                            </div>
                            <select
                                value={criterion}
                                onChange={(e) => setCriterion(e.target.value as "yallop" | "odeh")}
                                className="bg-foreground/10 px-3 py-2 rounded-xl text-sm w-full font-medium border border-foreground/10"
                            >
                                <option value="yallop" className="bg-background">Yallop Criterion</option>
                                <option value="odeh" className="bg-background">Odeh Criterion</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-primary-500">Navigation</label>
                        <div className="grid grid-cols-2 gap-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${pathname.startsWith(item.href)
                                        ? "bg-primary-500 text-white"
                                        : "bg-foreground/5 text-foreground hover:bg-foreground/10"
                                        }`}
                                >
                                    {item.Icon && <item.Icon className="w-4 h-4 flex-shrink-0" />}
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => { setShowSightingModal(true); setMobileMenuOpen(false); }}
                        className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg"
                        style={{ background: "var(--accent)", color: "var(--primary-foreground)" }}
                    >
                        <Eye className="w-4 h-4" />
                        I saw it!
                    </button>

                    {isLoaded && !userId && (
                        <SignInButton mode="modal">
                            <button className="w-full py-3 rounded-xl bg-foreground text-background font-bold mt-2">
                                Sign In
                            </button>
                        </SignInButton>
                    )}
                    {isLoaded && userId && (
                        <div className="flex justify-center mt-2">
                            <UserButton />
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}
