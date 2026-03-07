"use client";

import { useTranslation } from "react-i18next";
import { VisibilityMap } from "@/components/VisibilityMap";
import { BestTimeCard } from "@/components/BestTimeCard";
import { MapControlsPanel } from "@/components/MapControlsPanel";
import { useAppStore } from "@/store/useAppStore";

export default function VisibilityPage() {
    const date = useAppStore((s) => s.date);
    const location = useAppStore((s) => s.location);
    const { t } = useTranslation();

    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-display font-bold mb-2">{t("mapPage.title")}</h1>
                    <p className="text-foreground/60 max-w-2xl">
                        Interactive lunar visibility predictions across the globe.
                        Use the controls in the header to change the date, location, or prediction criterion.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Map Sidebar / Controls */}
                    <div className="lg:col-span-1 space-y-6">
                        <MapControlsPanel />

                        <BestTimeCard date={date} location={{ lat: location.lat, lng: location.lng }} />

                        <div className="p-6 rounded-2xl glass-card border border-foreground/10 shadow-lg">
                            <h3 className="font-bold mb-4 font-display" style={{ color: "var(--gold)" }}>Visibility Legend</h3>
                            <div className="space-y-3 pl-1">
                                <LegendItem color="bg-zone-a" label={t("zones.A")} />
                                <LegendItem color="bg-zone-b" label={t("zones.B")} />
                                <LegendItem color="bg-zone-c" label={t("zones.C")} />
                                <LegendItem color="bg-zone-d" label={t("zones.D")} />
                                <LegendItem color="bg-zone-e" label={t("zones.E")} />
                                <LegendItem color="bg-zone-f" label={t("zones.F")} />
                            </div>
                        </div>
                    </div>

                    {/* Main Map Area */}
                    <div className="lg:col-span-3">
                        <VisibilityMap />

                        <div className="mt-6 p-6 rounded-2xl bg-foreground/[0.02] border border-foreground/5 glass">
                            <h3 className="font-bold mb-2" style={{ color: "var(--foreground)" }}>Local Observation Details</h3>
                            <p className="text-foreground/70 text-sm leading-relaxed">
                                Our visibility model uses a multi-layered approach to predict the exact moments
                                of lunar crescent visibility. The map is generated dynamically via background workers,
                                factoring in atmospheric refraction, lunar elongation, and local sunset parameters.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function LegendItem({ color, label }: { color: string; label: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className={`w-3.5 h-3.5 rounded-full ${color} shadow-sm border border-foreground/10`} />
            <span className="text-sm font-medium text-foreground/80">{label}</span>
        </div>
    );
}
