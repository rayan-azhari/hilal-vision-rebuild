import { useMemo } from "react";
import { Link } from "wouter";
import { Sunset, Moon, Eye, ArrowRight } from "lucide-react";
import { computeSunMoonAtSunset, formatTime, type VisibilityZone } from "@/lib/astronomy";
import { useGlobalState } from "@/contexts/GlobalStateContext";
import { useTranslation } from "react-i18next";

const ZONE_COLORS: Record<VisibilityZone, string> = {
    A: "#4ade80",
    B: "#facc15",
    C: "#fb923c",
    D: "#f87171",
    E: "#9ca3af", // Lighter grey for E to distinguish from F
    F: "#6b7280", // Lighter grey for F to ensure contrast against dark background
};

export function TonightCard() {
    const { location, date, visibilityCriterion } = useGlobalState();
    const { t } = useTranslation();

    const data = useMemo(() => {
        try {
            return computeSunMoonAtSunset(date, { lat: location.lat, lng: location.lng });
        } catch {
            return null;
        }
    }, [date, location.lat, location.lng, visibilityCriterion]);

    if (!data) return null;

    const zone = data.visibility;
    const color = ZONE_COLORS[zone];

    return (
        <div
            className="breezy-card animate-breezy-enter"
            style={{ animationDelay: "0.1s" }}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                    <div className="text-[11px] uppercase font-semibold tracking-wider mb-1" style={{ color: "var(--gold-dim)" }}>
                        {t("tonight.header", { location: location.name })}
                    </div>
                    <div className="text-lg font-semibold leading-tight" style={{ color: "var(--foreground)" }}>
                        {t("tonight.question")}
                    </div>
                </div>
                {/* Zone badge */}
                <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shrink-0"
                    style={{
                        background: `color-mix(in oklch, ${color} 15%, transparent)`,
                        border: `1px solid color-mix(in oklch, ${color} 40%, transparent)`,
                        color,
                    }}
                >
                    <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: color }}
                    />
                    Zone {zone}
                </div>
            </div>

            {/* Answer */}
            <div
                className="text-2xl font-bold mb-4"
                style={{ color: (zone === 'E' || zone === 'F') ? "var(--foreground)" : color }}
            >
                {t(`tonight.zones.${zone}.answer`)}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="flex flex-col gap-1 p-2.5 rounded-xl" style={{ background: "var(--space-light)" }}>
                    <div className="flex items-center gap-1">
                        <Sunset className="w-3 h-3" style={{ color: "var(--gold-dim)" }} />
                        <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>{t("tonight.sunset")}</span>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                        {formatTime(data.sunset)}
                    </span>
                </div>

                <div className="flex flex-col gap-1 p-2.5 rounded-xl" style={{ background: "var(--space-light)" }}>
                    <div className="flex items-center gap-1">
                        <Moon className="w-3 h-3" style={{ color: "var(--gold-dim)" }} />
                        <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>{t("tonight.moonset")}</span>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                        {formatTime(data.moonset)}
                    </span>
                </div>

                <div className="flex flex-col gap-1 p-2.5 rounded-xl" style={{ background: "var(--space-light)" }}>
                    <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" style={{ color: "var(--gold-dim)" }} />
                        <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>{t("tonight.arc")}</span>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                        {data.arcv.toFixed(1)}°
                    </span>
                </div>
            </div>

            {/* CTA */}
            <Link href="/visibility">
                <div
                    className="flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer hover:opacity-80"
                    style={{
                        background: "color-mix(in oklch, var(--gold) 10%, transparent)",
                        border: "1px solid color-mix(in oklch, var(--gold) 20%, transparent)",
                        color: "var(--gold)",
                    }}
                >
                    {t("tonight.viewMap")}
                    <ArrowRight className="w-3 h-3" />
                </div>
            </Link>
        </div>
    );
}
