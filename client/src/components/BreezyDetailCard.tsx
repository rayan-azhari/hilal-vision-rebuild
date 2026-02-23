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
    expandableContent?: ReactNode;
}

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export function BreezyDetailCard({
    icon, title, titleAr, decorativeVisual,
    primaryValue, primaryUnit, statusLabel, statusColour,
    detailsHref, className, accentColour = "var(--gold)",
    expandableContent,
}: BreezyDetailCardProps) {
    const cardContent = (
        <div
            className={`breezy-card flex flex-col gap-3 ${className ?? ""}`}
            onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor =
                    `color-mix(in oklch, ${accentColour} 30%, transparent)`;
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "";
            }}
        >
            {/* Header row */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <span style={{ color: accentColour }} className="w-4 h-4 flex items-center justify-center shrink-0 [&>svg]:w-full [&>svg]:h-full">{icon}</span>
                    <span className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
                        {title}
                    </span>
                    {titleAr && (
                        <span className="text-[10px] font-arabic" style={{ color: "var(--gold-subtle)" }}>
                            {titleAr}
                        </span>
                    )}
                </div>
                {detailsHref && (
                    <a
                        href={detailsHref}
                        className="text-[10px] flex items-center gap-0.5 transition-colors"
                        style={{ color: "var(--gold-dim)" }}
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
                    className="text-3xl sm:text-4xl font-light leading-none tracking-tight"
                    style={{ color: "var(--foreground)" }}
                >
                    {primaryValue}
                </span>
                {primaryUnit && (
                    <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
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

    if (expandableContent) {
        return (
            <Dialog>
                <DialogTrigger asChild>
                    <div className="cursor-pointer group">{cardContent}</div>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" style={{
                    background: "var(--card)",
                    border: "1px solid color-mix(in oklch, var(--gold) 20%, transparent)",
                }}>
                    {expandableContent}
                </DialogContent>
            </Dialog>
        );
    }

    return cardContent;
}
