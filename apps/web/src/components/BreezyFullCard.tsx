"use client";

import { ReactNode } from "react";

export interface TabType {
    value: string;
    label: string;
    labelAr?: string;
}

interface BreezyFullCardProps {
    icon?: ReactNode;
    title: string;
    titleAr?: string;
    tabs?: TabType[];
    activeTab?: string;
    onTabChange?: (value: string) => void;
    children: ReactNode;
    className?: string;
}

export function BreezyFullCard({
    icon, title, titleAr, tabs, activeTab, onTabChange, children, className,
}: BreezyFullCardProps) {
    return (
        <div
            className={`breezy-card-full p-6 rounded-2xl ${className ?? ""}`}
            style={{
                background: "var(--card)",
                border: "1px solid color-mix(in oklch, var(--border) 40%, transparent)",
            }}
        >
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                    {icon && (
                        <span className="w-4 h-4 flex items-center justify-center shrink-0 [&>svg]:w-full [&>svg]:h-full" style={{ color: "color-mix(in oklch, var(--gold) 50%, transparent)" }}>{icon}</span>
                    )}
                    <span className="text-sm font-medium text-foreground">
                        {title}
                    </span>
                    {titleAr && (
                        <span className="text-xs font-arabic" style={{ color: "color-mix(in oklch, var(--gold) 70%, transparent)" }}>
                            {titleAr}
                        </span>
                    )}
                </div>

                {/* Tab chips */}
                {tabs && tabs.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {tabs.map(tab => (
                            <button
                                key={tab.value}
                                className="text-xs px-3 py-1.5 rounded-full transition-colors border"
                                style={activeTab === tab.value ? {
                                    background: "color-mix(in oklch, var(--gold) 20%, transparent)",
                                    color: "var(--gold)",
                                    borderColor: "color-mix(in oklch, var(--gold) 40%, transparent)",
                                } : {
                                    background: "color-mix(in oklch, var(--foreground) 5%, transparent)",
                                    color: "var(--muted-foreground)",
                                    borderColor: "transparent",
                                }}
                                onClick={() => onTabChange?.(tab.value)}
                            >
                                {tab.label}
                                {tab.labelAr && (
                                    <span className="font-arabic text-[9px] ml-1.5 opacity-80">{tab.labelAr}</span>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="w-full relative">
                {children}
            </div>
        </div>
    );
}
