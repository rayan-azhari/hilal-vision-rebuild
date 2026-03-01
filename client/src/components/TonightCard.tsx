import { useMemo } from "react";
import { Link } from "wouter";
import { Sunset, Moon, Eye, ArrowRight } from "lucide-react";
import { computeSunMoonAtSunset, formatTime, type VisibilityZone } from "@/lib/astronomy";
import { useGlobalState } from "@/contexts/GlobalStateContext";

const ZONE_CONFIG: Record<VisibilityZone, { label: string; color: string; answer: string }> = {
    A: { label: "Easily Visible", color: "#4ade80", answer: "Yes — naked eye" },
    B: { label: "Visible",        color: "#facc15", answer: "Likely visible" },
    C: { label: "Optical Aid",    color: "#fb923c", answer: "Binoculars needed" },
    D: { label: "Telescope Only", color: "#f87171", answer: "Telescope only" },
    E: { label: "Not Visible",    color: "#6b7280", answer: "Not visible tonight" },
    F: { label: "No Data",        color: "#374151", answer: "Below horizon" },
};

export function TonightCard() {
    const { location, date, visibilityCriterion } = useGlobalState();

    const data = useMemo(() => {
        try {
            return computeSunMoonAtSunset(date, { lat: location.lat, lng: location.lng });
        } catch {
            return null;
        }
    }, [date, location.lat, location.lng, visibilityCriterion]);

    if (!data) return null;

    const zone = data.visibility;
    const cfg = ZONE_CONFIG[zone];

    return (
        <div
            className="breezy-card animate-breezy-enter"
            style={{ animationDelay: "0.1s" }}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                    <div className="text-[11px] uppercase font-semibold tracking-wider mb-1" style={{ color: "var(--gold-dim)" }}>
                        Tonight's Prediction · {location.name}
                    </div>
                    <div className="text-lg font-semibold leading-tight" style={{ color: "var(--foreground)" }}>
                        Can you see the crescent?
                    </div>
                </div>
                {/* Zone badge */}
                <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shrink-0"
                    style={{
                        background: `color-mix(in oklch, ${cfg.color} 15%, transparent)`,
                        border: `1px solid color-mix(in oklch, ${cfg.color} 40%, transparent)`,
                        color: cfg.color,
                    }}
                >
                    <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: cfg.color }}
                    />
                    Zone {zone}
                </div>
            </div>

            {/* Answer */}
            <div className="text-2xl font-bold mb-4" style={{ color: cfg.color }}>
                {cfg.answer}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="flex flex-col gap-1 p-2.5 rounded-xl" style={{ background: "var(--space-light)" }}>
                    <div className="flex items-center gap-1">
                        <Sunset className="w-3 h-3" style={{ color: "var(--gold-dim)" }} />
                        <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Sunset</span>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                        {formatTime(data.sunset)}
                    </span>
                </div>

                <div className="flex flex-col gap-1 p-2.5 rounded-xl" style={{ background: "var(--space-light)" }}>
                    <div className="flex items-center gap-1">
                        <Moon className="w-3 h-3" style={{ color: "var(--gold-dim)" }} />
                        <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Moonset</span>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                        {formatTime(data.moonset)}
                    </span>
                </div>

                <div className="flex flex-col gap-1 p-2.5 rounded-xl" style={{ background: "var(--space-light)" }}>
                    <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" style={{ color: "var(--gold-dim)" }} />
                        <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Arc</span>
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
                    View full visibility map
                    <ArrowRight className="w-3 h-3" />
                </div>
            </Link>
        </div>
    );
}
