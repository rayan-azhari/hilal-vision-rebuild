import { useState } from "react";
import { SEO } from "@/components/SEO";
import GlobePage from "./GlobePage";
import MapPage from "./MapPage";

export interface SharedVisibilityState {
    hourOffset: number;
    setHourOffset: (h: number) => void;
}

export default function VisibilityPage() {
    const [view, setView] = useState<"globe" | "map">("globe");
    const [hourOffset, setHourOffset] = useState(0);

    const shared: SharedVisibilityState = {
        hourOffset, setHourOffset,
    };

    return (
        <div className="relative h-full flex flex-col pt-12 lg:pt-0">
            <SEO
                title="Visibility — 3D Globe & 2D Map"
                description="Interactive crescent moon visibility predictions on a 3D globe and 2D map with cloud cover overlay and best observation time calculator."
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
                    onClick={() => setView("globe")}
                    className="px-5 py-2 text-xs font-semibold rounded-[2rem] transition-all duration-300 magnetic"
                    style={{
                        background: view === "globe" ? "var(--foreground)" : "transparent",
                        color: view === "globe" ? "var(--background)" : "var(--muted-foreground)"
                    }}
                >
                    3D Globe
                </button>
                <button
                    onClick={() => setView("map")}
                    className="px-5 py-2 text-xs font-semibold rounded-[2rem] transition-all duration-300 magnetic"
                    style={{
                        background: view === "map" ? "var(--foreground)" : "transparent",
                        color: view === "map" ? "var(--background)" : "var(--muted-foreground)"
                    }}
                >
                    2D Map
                </button>
            </div>

            <div className="flex-1 w-full relative">
                <div style={{ display: view === "globe" ? "block" : "none", height: "100%" }}>
                    <GlobePage shared={shared} />
                </div>
                <div style={{ display: view === "map" ? "block" : "none", height: "100%" }}>
                    <MapPage shared={shared} />
                </div>
            </div>
        </div>
    );
}
