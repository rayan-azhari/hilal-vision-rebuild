"use client";

import { ReactNode } from "react";

interface BreezyDetailCardProps {
    icon: ReactNode;
    title: string;
    titleAr?: string;
    decorativeVisual?: ReactNode;
    primaryValue: ReactNode;
    primaryUnit?: string;
    statusLabel?: ReactNode;
    statusColour?: string;
    detailsHref?: string;
    className?: string;
    accentColour?: string;
}

export function BreezyDetailCard({
    icon, title, titleAr, decorativeVisual,
    primaryValue, primaryUnit, statusLabel, statusColour,
    detailsHref, className, accentColour = "#C1A87D",
}: BreezyDetailCardProps) {
    return (
        <div
            className={`breezy-card flex flex-col gap-3 transition-colors duration-300 ${className ?? ""}`}
            style={{
                background: "oklch(0.10 0.018 265)",
                border: "1px solid color-mix(in oklch, var(--border) 40%, transparent)",
                borderRadius: "1rem",
                padding: "1.25rem",
            }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor =
                    `color-mix(in oklch, ${accentColour} 30%, transparent)`;
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "color-mix(in oklch, var(--border) 40%, transparent)";
            }}
        >
            {/* Header row */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <span style={{ color: accentColour }} className="w-4 h-4 flex items-center justify-center shrink-0 [&>svg]:w-full [&>svg]:h-full">{icon}</span>
                    <span className="text-xs font-medium text-muted-foreground">
                        {title}
                    </span>
                    {titleAr && (
                        <span className="text-[10px] font-arabic text-[#C1A87D]/70">
                            {titleAr}
                        </span>
                    )}
                </div>
                {detailsHref && (
                    <a
                        href={detailsHref}
                        className="text-[10px] flex items-center gap-0.5 transition-colors text-[#C1A87D]/50 hover:text-[#C1A87D]"
                    >
                        Details <span>→</span>
                    </a>
                )}
            </div>

            {/* Decorative visual - encodes the data */}
            <div className="flex-1 flex items-center justify-center min-h-[80px]">
                {decorativeVisual}
            </div>

            {/* Giant primary value */}
            <div className="flex items-baseline gap-1 mt-1">
                <span
                    className="text-3xl sm:text-4xl font-light leading-none tracking-tight text-foreground"
                >
                    {primaryValue}
                </span>
                {primaryUnit && (
                    <span className="text-sm text-muted-foreground">
                        {primaryUnit}
                    </span>
                )}
            </div>

            {/* Status label */}
            <div
                className="text-xs leading-snug"
                style={{ color: statusColour ?? "var(--muted-foreground)" }}
            >
                {statusLabel}
            </div>
        </div>
    );
}
