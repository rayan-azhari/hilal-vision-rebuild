"use client";

import { useAppStore } from "@/store/useAppStore";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
    const { isDarkMode, toggleDarkMode } = useAppStore();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [isDarkMode]);

    if (!mounted) {
        return <div className="p-2 h-10 w-10" />;
    }

    return (
        <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Toggle theme"
        >
            {isDarkMode ? (
                <Sun className="w-5 h-5 text-vis-b" />
            ) : (
                <Moon className="w-5 h-5 text-primary-600" />
            )}
        </button>
    );
}
