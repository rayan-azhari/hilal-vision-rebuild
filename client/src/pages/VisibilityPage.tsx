import { useState } from "react";
import { MAJOR_CITIES } from "@/lib/astronomy";
import GlobePage from "./GlobePage";
import MapPage from "./MapPage";

export interface SharedVisibilityState {
    date: Date;
    setDate: (d: Date) => void;
    hourOffset: number;
    setHourOffset: (h: number) => void;
    selectedCity: (typeof MAJOR_CITIES)[0];
    setSelectedCity: (c: (typeof MAJOR_CITIES)[0]) => void;
}

export default function VisibilityPage() {
    const [view, setView] = useState<"globe" | "map">("globe");
    const [date, setDate] = useState(() => new Date());
    const [hourOffset, setHourOffset] = useState(0);
    const [selectedCity, setSelectedCity] = useState(MAJOR_CITIES[0]);

    const shared: SharedVisibilityState = {
        date, setDate,
        hourOffset, setHourOffset,
        selectedCity, setSelectedCity,
    };

    return (
        <div className="relative h-full flex flex-col pt-12 lg:pt-0">
            <div
                className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex p-1 rounded-lg shadow-xl"
                style={{
                    background: "color-mix(in oklch, var(--space-mid) 85%, transparent)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid color-mix(in oklch, var(--gold) 15%, transparent)"
                }}
            >
                <button
                    onClick={() => setView("globe")}
                    className="px-4 py-1.5 text-xs font-medium rounded-md transition-all"
                    style={{
                        background: view === "globe" ? "color-mix(in oklch, var(--gold) 15%, transparent)" : "transparent",
                        color: view === "globe" ? "var(--gold)" : "var(--muted-foreground)"
                    }}
                >
                    3D Globe
                </button>
                <button
                    onClick={() => setView("map")}
                    className="px-4 py-1.5 text-xs font-medium rounded-md transition-all"
                    style={{
                        background: view === "map" ? "color-mix(in oklch, var(--gold) 15%, transparent)" : "transparent",
                        color: view === "map" ? "var(--gold)" : "var(--muted-foreground)"
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
