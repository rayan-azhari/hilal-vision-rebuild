"use client";

import "@/i18n"; // side-effect: initializes i18next

export default function I18nProvider({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
