import { useState } from "react";
import { SEO } from "@/components/SEO";
import GlobePage from "./GlobePage";
import MapPage from "./MapPage";
import { useProTier } from "@/contexts/ProTierContext";
import ProGate from "@/components/ProGate";
import { useTranslation } from "react-i18next";

export interface SharedVisibilityState {
    hourOffset: number;
    setHourOffset: (h: number) => void;
}

export default function VisibilityPage() {
    const { isPremium, setShowUpgradeModal } = useProTier();
    const [view, setView] = useState<"globe" | "map">("map");
    const [hourOffset, setHourOffset] = useState(0);
    const { t } = useTranslation();

    const shared: SharedVisibilityState = {
        hourOffset, setHourOffset,
    };

    return (
        <div className="relative flex flex-col pt-12 lg:pt-0 min-h-[calc(100vh-10rem)] lg:h-[calc(100vh-7rem)] lg:overflow-hidden overflow-x-hidden">
            <SEO
                title={t("visibility.title")}
                description={t("visibility.description")}
                path="/visibility"
            />
            <div
                className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex p-1 rounded-[2rem] shadow-xl"
                style={{
                    background: "color-mix(in oklch, var(--card) 60%, transparent)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    border: "1px solid color-mix(in oklch, var(--border) 30%, transparent)"
                }}
            >
                <button
                    onClick={() => {
                        if (!isPremium) { setShowUpgradeModal(true); return; }
                        setView("globe");
                    }}
                    className="px-5 py-2 text-xs font-semibold rounded-[2rem] transition-all duration-300 magnetic flex items-center gap-1.5"
                    style={{
                        background: view === "globe" ? "var(--foreground)" : "transparent",
                        color: view === "globe" ? "var(--background)" : "var(--muted-foreground)"
                    }}
                >
                    {t("visibility.globeBtn")}
                    {!isPremium && <ProGate featureName={t("visibility.globeBtn")} inline>‎</ProGate>}
                </button>
                <button
                    onClick={() => setView("map")}
                    className="px-5 py-2 text-xs font-semibold rounded-[2rem] transition-all duration-300 magnetic"
                    style={{
                        background: view === "map" ? "var(--foreground)" : "transparent",
                        color: view === "map" ? "var(--background)" : "var(--muted-foreground)"
                    }}
                >
                    {t("visibility.mapBtn")}
                </button>
            </div>

            <div className="flex-1 min-h-0 w-full relative">
                <div style={{ display: view === "globe" ? "flex" : "none", height: "100%", flexDirection: "column" }}>
                    <GlobePage shared={shared} />
                </div>
                <div style={{ display: view === "map" ? "flex" : "none", height: "100%", flexDirection: "column" }}>
                    <MapPage shared={shared} />
                </div>
            </div>
        </div>
    );
}
