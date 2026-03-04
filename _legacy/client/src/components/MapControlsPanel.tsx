import { ChevronDown, Eye, Cloud, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import ProGate from "./ProGate";

interface MapControlsPanelProps {
    isLoading: boolean;
    resolution: number;
    setResolution: (val: number) => void;
    visibilityCriterion: "yallop" | "odeh";
    setVisibilityCriterion: (val: "yallop" | "odeh") => void;
    showVisibility: boolean;
    setShowVisibility: (val: boolean) => void;
    showClouds: boolean;
    setShowClouds: (val: boolean) => void;
    hourOffset: number;
    setHourOffset: (val: number) => void;
    isPremium: boolean;
    setShowUpgradeModal: (val: boolean) => void;
    autoFetchWeather: boolean;
    setAutoFetchWeather: (val: boolean) => void;
    tempOverride: number | "";
    setTempOverride: (val: number | "") => void;
    pressureOverride: number | "";
    setPressureOverride: (val: number | "") => void;
}

export function MapControlsPanel({
    isLoading,
    resolution,
    setResolution,
    visibilityCriterion,
    setVisibilityCriterion,
    showVisibility,
    setShowVisibility,
    showClouds,
    setShowClouds,
    hourOffset,
    setHourOffset,
    isPremium,
    setShowUpgradeModal,
    autoFetchWeather,
    setAutoFetchWeather,
    tempOverride,
    setTempOverride,
    pressureOverride,
    setPressureOverride,
}: MapControlsPanelProps) {
    const { t } = useTranslation();

    return (
        <div className="breezy-card overflow-visible p-4 animate-breezy-enter">
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>{t("mapControls.title")}</span>
                {isLoading && (
                    <div className="w-3 h-3 rounded-full border border-t-transparent animate-spin" style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }} />
                )}
            </div>
            <div className="space-y-4">
                {/* Hour Offset */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>{t("mapControls.hourOffset")}</label>
                        <span className="text-xs font-mono" style={{ color: "var(--gold)" }}>
                            {hourOffset >= 0 ? "+" : ""}{hourOffset}h
                        </span>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-4 h-4" style={{ color: "var(--gold-dim)" }} />
                        <input
                            type="range"
                            min={-24}
                            max={24}
                            step={1}
                            value={hourOffset}
                            onChange={e => setHourOffset(Number(e.target.value))}
                            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                            style={{
                                background: `linear-gradient(to right, var(--gold) ${((hourOffset + 24) / 48) * 100}%, var(--space-light) ${((hourOffset + 24) / 48) * 100}%)`,
                                accentColor: "var(--gold)",
                            }}
                        />
                    </div>
                </div>

                {/* Resolution */}
                <div>
                    <label className="block text-xs mb-1.5" style={{ color: "var(--muted-foreground)" }}>{t("mapControls.resolution")}</label>
                    <div className="relative">
                        <select
                            value={resolution}
                            onChange={e => setResolution(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg text-sm appearance-none pr-8"
                            style={{
                                background: "var(--space-light)",
                                border: "1px solid color-mix(in oklch, var(--gold) 20%, transparent)",
                                color: "var(--foreground)",
                            }}
                        >
                            <option value={2} style={{ background: "var(--space-mid)" }}>{t("mapControls.resolutions.fine")}</option>
                            <option value={4} style={{ background: "var(--space-mid)" }}>{t("mapControls.resolutions.normal")}</option>
                            <option value={6} style={{ background: "var(--space-mid)" }}>{t("mapControls.resolutions.fast")}</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--gold-dim)" }} />
                    </div>
                </div>

                {/* Criterion switch */}
                <div>
                    <label className="block text-xs mb-1.5" style={{ color: "var(--muted-foreground)" }}>{t("mapControls.criterion")}</label>
                    <div className="relative">
                        <select
                            value={visibilityCriterion}
                            onChange={e => setVisibilityCriterion(e.target.value as "yallop" | "odeh")}
                            className="w-full px-3 py-2 rounded-lg text-sm appearance-none pr-8"
                            style={{
                                background: "var(--space-light)",
                                border: "1px solid color-mix(in oklch, var(--gold) 20%, transparent)",
                                color: "var(--foreground)",
                            }}
                        >
                            <option value="yallop" style={{ background: "var(--space-mid)" }}>{t("mapControls.criteria.yallop")}</option>
                            <option value="odeh" style={{ background: "var(--space-mid)" }}>{t("mapControls.criteria.odeh")}</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--gold-dim)" }} />
                    </div>
                </div>
            </div>

            {/* Overlays */}
            <div className="pt-2 border-t space-y-2 mt-2" style={{ borderColor: "color-mix(in oklch, var(--gold) 10%, transparent)" }}>
                <div className="flex items-center justify-between text-xs py-1">
                    <span className="text-muted-foreground flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> {t("mapControls.visibilityMap")}</span>
                    <button
                        onClick={() => setShowVisibility(!showVisibility)}
                        className="w-8 h-4 rounded-full transition-colors relative"
                        style={{ background: showVisibility ? "var(--gold)" : "var(--muted)" }}
                    >
                        <div
                            className="absolute top-0.5 bottom-0.5 w-3 bg-white rounded-full transition-transform"
                            style={{
                                left: "2px",
                                transform: showVisibility ? "translateX(16px)" : "translateX(0)"
                            }}
                        />
                    </button>
                </div>

                <div className="flex items-center justify-between text-xs py-1">
                    <span className="text-muted-foreground flex items-center gap-1.5"><Cloud className="w-3.5 h-3.5" /> {t("mapControls.cloudCover")}</span>
                    <button
                        onClick={() => isPremium ? setShowClouds(!showClouds) : setShowUpgradeModal(true)}
                        className="w-8 h-4 rounded-full transition-colors relative"
                        style={{ background: showClouds ? "var(--gold)" : "var(--muted)" }}
                    >
                        <div
                            className="absolute top-0.5 bottom-0.5 w-3 bg-white rounded-full transition-transform"
                            style={{
                                left: "2px",
                                transform: showClouds ? "translateX(16px)" : "translateX(0)"
                            }}
                        />
                    </button>
                </div>
            </div>

            {/* Atmospheric Overrides */}
            <ProGate featureName={t("mapControls.atmosphericOverrides")}>
                <div className="pt-3 border-t space-y-3 mt-3" style={{ borderColor: "color-mix(in oklch, var(--gold) 10%, transparent)" }}>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>{t("mapControls.atmosphericOverrides")}</span>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={autoFetchWeather}
                                onChange={(e) => setAutoFetchWeather(e.target.checked)}
                                className="rounded appearance-none w-3 h-3 flex items-center justify-center bg-transparent border cursor-pointer"
                                style={{
                                    borderColor: "var(--gold-dim)",
                                    background: autoFetchWeather ? "var(--gold)" : "transparent"
                                }}
                            />
                            <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{t("mapControls.autoFetch")}</span>
                        </label>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-[10px] mb-1" style={{ color: "var(--muted-foreground)" }}>{t("mapControls.temp")}</label>
                            <input
                                type="number"
                                value={tempOverride}
                                onChange={(e) => {
                                    setTempOverride(e.target.value === "" ? "" : Number(e.target.value));
                                    setAutoFetchWeather(false);
                                }}
                                className="w-full px-2 py-1.5 rounded text-xs bg-transparent border"
                                style={{ borderColor: "color-mix(in oklch, var(--gold) 20%, transparent)" }}
                                placeholder={t("mapControls.tempPlaceholder")}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] mb-1" style={{ color: "var(--muted-foreground)" }}>{t("mapControls.pressure")}</label>
                            <input
                                type="number"
                                value={pressureOverride}
                                onChange={(e) => {
                                    setPressureOverride(e.target.value === "" ? "" : Number(e.target.value));
                                    setAutoFetchWeather(false);
                                }}
                                className="w-full px-2 py-1.5 rounded text-xs bg-transparent border"
                                style={{ borderColor: "color-mix(in oklch, var(--gold) 20%, transparent)" }}
                                placeholder={t("mapControls.pressurePlaceholder")}
                            />
                        </div>
                    </div>
                </div>
            </ProGate>
        </div>
    );
}
