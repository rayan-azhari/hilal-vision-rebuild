import { Info } from "lucide-react";
import { useTranslation, Trans } from "react-i18next";
import { VISIBILITY_LABELS, YALLOP_ZONE_LABELS, ODEH_ZONE_LABELS, type VisibilityZone } from "@/lib/astronomy";

interface MapLegendPanelsProps {
    visibilityCriterion: "yallop" | "odeh";
    highContrast: boolean;
    zoneColors: Record<VisibilityZone, string>;
    highContrastZoneColors: Record<VisibilityZone, string>;
    effectiveDate: Date;
}

export function MapInfoPanel({ visibilityCriterion, highContrast, zoneColors, highContrastZoneColors }: Omit<MapLegendPanelsProps, 'effectiveDate'>) {
    const { t } = useTranslation();
    return (
        <div className="breezy-card p-4 animate-breezy-enter" style={{ animationDelay: "50ms" }}>
            <div className="flex items-center gap-1.5 mb-4">
                <Info className="w-4 h-4" style={{ color: "var(--gold)" }} />
                <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{t("mapLegend.title")}</span>
            </div>

            <div className="space-y-4">
                <div>
                    <h4 className="text-xs font-bold mb-1.5" style={{ color: "var(--gold-dim)" }}>{t("mapLegend.composite")}</h4>
                    <p className="text-[11px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                        <Trans i18nKey="mapLegend.compositeDesc1">
                            The map does not show a simultaneous snapshot. Instead, it calculates the moon's visibility at the <strong style={{ color: "var(--foreground)" }}>exact local time of sunset</strong> for every point on Earth.
                            Because sunset sweeps from East to West over 24 hours, the map is a mosaic of those individual sunset moments stitched together.
                        </Trans>
                    </p>
                    <p className="text-[11px] leading-relaxed mt-2" style={{ color: "var(--muted-foreground)" }}>
                        {t("mapLegend.compositeDesc2")}
                    </p>
                </div>

                <div>
                    <h4 className="text-xs font-bold mb-1.5" style={{ color: "var(--gold-dim)" }}>{t("mapLegend.whatColorsMean")}</h4>
                    <p className="text-[11px] leading-relaxed mb-2" style={{ color: "var(--muted-foreground)" }}>
                        <Trans i18nKey="mapLegend.criterionDesc" values={{ criterion: visibilityCriterion === "yallop" ? t("mapLegend.yallop") : t("mapLegend.odeh") }}>
                            Based on the <strong style={{ color: "var(--gold)" }}>{visibilityCriterion === "yallop" ? "Yallop (1997)" : "Odeh (2004)"}</strong> criterion, representing the probability of sighting at local sunset:
                        </Trans>
                    </p>

                    <div className="space-y-3">
                        {(["A", "B", "C", "D", "E", "F"] as VisibilityZone[]).map(zone => {
                            const criterionLabels = visibilityCriterion === "yallop" ? YALLOP_ZONE_LABELS : ODEH_ZONE_LABELS;
                            const zoneLabel = criterionLabels[zone];
                            return (
                                <div key={zone} className="flex items-start gap-2.5">
                                    <div
                                        className="w-3.5 h-3.5 rounded-sm flex-shrink-0 mt-0.5"
                                        style={{ background: highContrast ? highContrastZoneColors[zone] : zoneColors[zone] }}
                                    />
                                    <div>
                                        <div className="text-[11px] font-bold leading-tight" style={{ color: "var(--foreground)" }}>
                                            {t("mapLegend.zone", { zone })} {zoneLabel.label}
                                            {zoneLabel.threshold !== "—" && (
                                                <span className="font-mono font-normal ml-1 opacity-50" style={{ fontSize: "9px" }}>({zoneLabel.threshold})</span>
                                            )}
                                        </div>
                                        <div className="text-[10px] leading-snug mt-0.5 opacity-80" style={{ color: "var(--muted-foreground)" }}>
                                            {zoneLabel.desc}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="p-3 rounded-lg text-[11px] leading-relaxed text-center font-medium" style={{ background: "color-mix(in oklch, var(--gold) 10%, transparent)", color: "var(--gold)", border: "1px solid color-mix(in oklch, var(--gold) 20%, transparent)" }}>
                    {t("mapLegend.quote")}
                </div>
            </div>
        </div>
    );
}

export function MapTimePanel({ effectiveDate }: Pick<MapLegendPanelsProps, 'effectiveDate'>) {
    const { t } = useTranslation();
    return (
        <div className="breezy-card p-4 animate-breezy-enter" style={{ animationDelay: "100ms" }}>
            <div className="text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>{t("mapLegend.showing")}</div>
            <div className="text-sm font-semibold" style={{ color: "var(--gold)" }}>
                {effectiveDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </div>
            <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                {effectiveDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} {t("mapLegend.local")}
            </div>
        </div>
    );
}

export function MapCrowdsourceLegend() {
    const { t } = useTranslation();
    return (
        <div className="breezy-card p-4 animate-breezy-enter" style={{ animationDelay: "150ms" }}>
            <div className="text-xs font-medium mb-3" style={{ color: "var(--muted-foreground)" }}>
                {t("mapLegend.crowdsourced")}
            </div>
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full border border-black dark:border-white shadow-sm" style={{ background: "#4ade80" }} />
                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{t("mapLegend.nakedEye")}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full border border-black dark:border-white shadow-sm" style={{ background: "#60a5fa" }} />
                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{t("mapLegend.opticalAid")}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full border border-black dark:border-white shadow-sm" style={{ background: "#9ca3af" }} />
                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{t("mapLegend.notSeen")}</span>
                </div>
            </div>
        </div>
    );
}
