"use client";


import { ThemeToggle } from "./ThemeToggle";

import { Moon } from "lucide-react";
import Link from "next/link";

export function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 glass">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center p-1.5 shadow-lg shadow-primary-600/20">
                        <Moon className="w-full h-full text-white" />
                    </div>
                    <span className="font-display font-bold text-xl tracking-tight hidden sm:block">
                        Hilal Vision
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
                    <Link href="/visibility" className="hover:text-primary-500 transition-colors">Moon Visibility</Link>
                    <Link href="/moon" className="hover:text-primary-500 transition-colors">Moon Phases</Link>
                    <Link href="/calendar" className="hover:text-primary-500 transition-colors">Hijri Calendar</Link>
                    <Link href="/archive" className="hover:text-primary-500 transition-colors">Historical Records</Link>
                    <Link href="/weather" className="hover:text-primary-500 transition-colors">Weather</Link>
                </nav>

                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <button className="bg-primary-600 hover:bg-primary-500 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary-600/20">
                        Sign In
                    </button>
                </div>
            </div>
        </header>
    );
}
