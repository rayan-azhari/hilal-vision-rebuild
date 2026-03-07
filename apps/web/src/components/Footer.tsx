"use client";

import Link from "next/link";
import { Moon } from "lucide-react";

const PRODUCT_LINKS = [
    { href: "/visibility", label: "Visibility Map" },
    { href: "/moon", label: "Moon Phase" },
    { href: "/calendar", label: "Hijri Calendar" },
    { href: "/horizon", label: "Horizon View" },
    { href: "/archive", label: "ICOP Archive" },
];

const RESOURCE_LINKS = [
    { href: "/about", label: "About" },
    { href: "/methodology", label: "Methodology" },
    { href: "/support", label: "Support Us" },
    { href: "/terms", label: "Terms" },
    { href: "/privacy", label: "Privacy" },
];

export function Footer() {
    return (
        <footer
            className="border-t py-12 px-6"
            style={{
                borderColor: "color-mix(in oklch, var(--gold) 12%, transparent)",
                background: "var(--space-mid)",
            }}
        >
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
                {/* Brand */}
                <div>
                    <Link href="/" className="flex items-center gap-2 mb-4 group">
                        <Moon className="w-5 h-5" style={{ color: "var(--gold)" }} />
                        <span className="font-display font-bold text-lg" style={{ color: "var(--foreground)" }}>
                            Hilal Vision
                        </span>
                    </Link>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                        Advanced lunar visibility predictions and Islamic astronomical analytics for the global community.
                    </p>
                </div>

                {/* Product */}
                <div>
                    <h4
                        className="text-xs font-bold uppercase tracking-widest mb-4"
                        style={{ color: "var(--gold-dim)" }}
                    >
                        Product
                    </h4>
                    <ul className="space-y-2">
                        {PRODUCT_LINKS.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className="text-sm transition-colors hover:underline"
                                    style={{ color: "var(--muted-foreground)" }}
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Resources */}
                <div>
                    <h4
                        className="text-xs font-bold uppercase tracking-widest mb-4"
                        style={{ color: "var(--gold-dim)" }}
                    >
                        Resources
                    </h4>
                    <ul className="space-y-2">
                        {RESOURCE_LINKS.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className="text-sm transition-colors hover:underline"
                                    style={{ color: "var(--muted-foreground)" }}
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div
                className="max-w-7xl mx-auto mt-10 pt-6 border-t flex flex-col md:flex-row items-center justify-between text-xs"
                style={{
                    borderColor: "color-mix(in oklch, var(--gold) 8%, transparent)",
                    color: "var(--muted-foreground)",
                }}
            >
                <span>© {new Date().getFullYear()} Hilal Vision. All rights reserved.</span>
                <span className="mt-2 md:mt-0 font-arabic">صدقة جارية — Sadaqah Jariyah</span>
            </div>
        </footer>
    );
}
