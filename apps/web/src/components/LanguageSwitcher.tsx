"use client";

import { useTranslation } from "react-i18next";
import { useEffect } from "react";

const LANGUAGES = [
    { code: "en", label: "EN", dir: "ltr" },
    { code: "ar", label: "عربي", dir: "rtl" },
    { code: "ur", label: "اردو", dir: "rtl" },
] as const;

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();

    useEffect(() => {
        const lang = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0];
        document.documentElement.dir = lang.dir;
        document.documentElement.lang = lang.code;
    }, [i18n.language]);

    const handleChange = (code: string) => {
        i18n.changeLanguage(code);
        localStorage.setItem("hilal-lang", code);
    };

    return (
        <div className="flex items-center gap-0.5 rounded-xl p-0.5" style={{ background: "color-mix(in oklch, var(--space-mid) 80%, transparent)", border: "1px solid color-mix(in oklch, var(--gold) 12%, transparent)" }}>
            {LANGUAGES.map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => handleChange(lang.code)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all"
                    suppressHydrationWarning
                    style={
                        i18n.language === lang.code
                            ? { background: "color-mix(in oklch, var(--gold) 20%, transparent)", color: "var(--gold)", boxShadow: "0 0 6px color-mix(in oklch, var(--gold) 20%, transparent)" }
                            : { color: "var(--muted-foreground)" }
                    }
                >
                    {lang.label}
                </button>
            ))}
        </div>
    );
}
