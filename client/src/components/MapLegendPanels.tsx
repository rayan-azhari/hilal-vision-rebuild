import { Info } from "lucide-react";
import { VISIBILITY_LABELS, type VisibilityZone } from "@/lib/astronomy";

interface MapLegendPanelsProps {
    visibilityCriterion: "yallop" | "odeh";
    highContrast: boolean;
    zoneColors: Record<VisibilityZone, string>;
    highContrastZoneColors: Record<VisibilityZone, string>;
    effectiveDate: Date;
}

export function MapInfoPanel({ visibilityCriterion, highContrast, zoneColors, highContrastZoneColors }: Omit<MapLegendPanelsProps, 'effectiveDate'>) {
    return (
        <div className="breezy-card p-4 animate-breezy-enter" style={{ animationDelay: "50ms" }}>
            <div className="flex items-center gap-1.5 mb-4">
                <Info className="w-4 h-4" style={{ color: "var(--gold)" }} />
                <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>How to Read This Map</span>
            </div>

            <div className="space-y-4">
                <div>
                    <h4 className="text-xs font-bold mb-1.5" style={{ color: "var(--gold-dim)" }}>1. Composite of Sunsets</h4>
                    <p className="text-[11px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                        The map does not show a simultaneous snapshot. Instead, it calculates the moon's visibility at the <strong style={{ color: "var(--foreground)" }}>exact local time of sunset</strong> for every point on Earth.
                        Because sunset sweeps from East to West over 24 hours, the map is a mosaic of those individual sunset moments stitched together.
                    </p>
                    <p className="text-[11px] leading-relaxed mt-2" style={{ color: "var(--muted-foreground)" }}>
                        If the world is green (Zone A) today, it broadly means: when the sun sets in Australia, the moon is easily visible. Hours later when the sun sets in the Middle East, it's visible. And later in the Americas, it's still visible.
                    </p>
                </div>

                <div>
                    <h4 className="text-xs font-bold mb-1.5" style={{ color: "var(--gold-dim)" }}>2. What the Color Zones Mean</h4>
                    <p className="text-[11px] leading-relaxed mb-2" style={{ color: "var(--muted-foreground)" }}>
                        Based on the <strong style={{ color: "var(--gold)" }}>{visibilityCriterion === "yallop" ? "Yallop (1997)" : "Odeh (2004)"}</strong> criterion, representing the probability of sighting at local sunset:
                    </p>

                    <div className="space-y-3">
                        {(["A", "B", "C", "D", "E", "F"] as VisibilityZone[]).map(zone => (
                            <div key={zone} className="flex items-start gap-2.5">
                                <div
                                    className="w-3.5 h-3.5 rounded-sm flex-shrink-0 mt-0.5"
                                    style={{ background: highContrast ? highContrastZoneColors[zone] : zoneColors[zone] }}
                                />
                                <div>
                                    <div className="text-[11px] font-bold leading-tight" style={{ color: "var(--foreground)" }}>
                                        Zone {zone}: {VISIBILITY_LABELS[zone].label}
                                    </div>
                                    <div className="text-[10px] leading-snug mt-0.5 opacity-80" style={{ color: "var(--muted-foreground)" }}>
                                        {VISIBILITY_LABELS[zone].desc}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-3 rounded-lg text-[11px] leading-relaxed text-center font-medium" style={{ background: "color-mix(in oklch, var(--gold) 10%, transparent)", color: "var(--gold)", border: "1px solid color-mix(in oklch, var(--gold) 20%, transparent)" }}>
                    "If I stand at this location today, what are my chances of seeing the new moon when the sun sets here locally?"
                </div>
            </div>
        </div>
    );
}

export function MapTimePanel({ effectiveDate }: Pick<MapLegendPanelsProps, 'effectiveDate'>) {
    return (
        <div className="breezy-card p-4 animate-breezy-enter" style={{ animationDelay: "100ms" }}>
            <div className="text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>Showing</div>
            <div className="text-sm font-semibold" style={{ color: "var(--gold)" }}>
                {effectiveDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </div>
            <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                {effectiveDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} local
            </div>
        </div>
    );
}

export function MapCrowdsourceLegend() {
    return (
        <div className="breezy-card p-4 animate-breezy-enter" style={{ animationDelay: "150ms" }}>
            <div className="text-xs font-medium mb-3" style={{ color: "var(--muted-foreground)" }}>
                Crowdsourced Sightings
            </div>
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full border border-black dark:border-white shadow-sm" style={{ background: "#4ade80" }} />
                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Naked Eye</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full border border-black dark:border-white shadow-sm" style={{ background: "#60a5fa" }} />
                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Optical Aid</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full border border-black dark:border-white shadow-sm" style={{ background: "#9ca3af" }} />
                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Attempted, Not Seen</span>
                </div>
            </div>
        </div>
    );
}
