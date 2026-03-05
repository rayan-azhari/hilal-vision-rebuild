"use client";

import { ChevronDown, Eye, Cloud, Clock, Settings2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useState } from "react";

export function MapControlsPanel() {
    const [isExpanded, setIsExpanded] = useState(true);

    const resolution = useAppStore((state) => state.resolution);
    const setResolution = useAppStore((state) => state.setResolution);
    const showVisibility = useAppStore((state) => state.showVisibility);
    const setShowVisibility = useAppStore((state) => state.setShowVisibility);
    const showClouds = useAppStore((state) => state.showClouds);
    const setShowClouds = useAppStore((state) => state.setShowClouds);
    const hourOffset = useAppStore((state) => state.hourOffset);
    const setHourOffset = useAppStore((state) => state.setHourOffset);

    // Pro features
    const autoFetchWeather = useAppStore((state) => state.autoFetchWeather);
    const setAutoFetchWeather = useAppStore((state) => state.setAutoFetchWeather);
    const tempOverride = useAppStore((state) => state.tempOverride);
    const setTempOverride = useAppStore((state) => state.setTempOverride);
    const pressureOverride = useAppStore((state) => state.pressureOverride);
    const setPressureOverride = useAppStore((state) => state.setPressureOverride);

    if (!isExpanded) {
        return (
            <button
                onClick={() => setIsExpanded(true)}
                className="absolute top-4 left-4 z-10 p-3 rounded-2xl glass border border-foreground/10 shadow-xl hover:bg-foreground/5 transition-all text-foreground/70"
            >
                <Settings2 className="w-5 h-5" />
            </button>
        );
    }

    return (
        <div className="absolute top-4 left-4 z-10 w-72 rounded-2xl glass border border-foreground/10 shadow-2xl overflow-hidden backdrop-blur-xl animate-fade-in origin-top-left">
            <div className="flex items-center justify-between p-4 border-b border-foreground/5 bg-foreground/5">
                <span className="text-sm font-bold text-foreground">Map Settings</span>
                <button
                    onClick={() => setIsExpanded(false)}
                    className="p-1.5 rounded-lg hover:bg-foreground/10 transition-colors text-foreground/50"
                >
                    <ChevronDown className="w-4 h-4" />
                </button>
            </div>

            <div className="p-4 space-y-5">
                {/* Time Offset Slider */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-foreground/70 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> Time Offset
                        </label>
                        <span className="text-xs font-mono font-bold text-primary-500">
                            {hourOffset > 0 ? "+" : ""}{hourOffset}h
                        </span>
                    </div>
                    <input
                        type="range"
                        min="-24"
                        max="24"
                        step="1"
                        value={hourOffset}
                        onChange={(e) => setHourOffset(Number(e.target.value))}
                        className="w-full h-1.5 bg-foreground/10 rounded-full appearance-none cursor-pointer accent-primary-500"
                    />
                </div>

                {/* Overlays Toggles */}
                <div className="space-y-2 pt-2 border-t border-foreground/5">
                    <div className="flex items-center justify-between py-1">
                        <span className="text-xs font-semibold text-foreground/70 flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5" /> Visibility Zones
                        </span>
                        <button
                            onClick={() => setShowVisibility(!showVisibility)}
                            className={`w-10 h-5 rounded-full transition-colors relative flex items-center ${showVisibility ? "bg-primary-500" : "bg-foreground/20"}`}
                        >
                            <div
                                className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform absolute ${showVisibility ? "translate-x-5" : "translate-x-1"}`}
                            />
                        </button>
                    </div>
                    <div className="flex items-center justify-between py-1">
                        <span className="text-xs font-semibold text-foreground/70 flex items-center gap-1.5">
                            <Cloud className="w-3.5 h-3.5" /> Global Cloud Cover
                        </span>
                        <button
                            onClick={() => setShowClouds(!showClouds)}
                            className={`w-10 h-5 rounded-full transition-colors relative flex items-center ${showClouds ? "bg-primary-500" : "bg-foreground/20"}`}
                        >
                            <div
                                className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform absolute ${showClouds ? "translate-x-5" : "translate-x-1"}`}
                            />
                        </button>
                    </div>
                </div>

                {/* Atmos Overrides */}
                <div className="space-y-3 pt-4 border-t border-foreground/5 relative">
                    {/* Pro overlay would go here */}
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">Atmospheric Overrides</span>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={autoFetchWeather}
                                onChange={(e) => setAutoFetchWeather(e.target.checked)}
                                className="rounded text-primary-500 bg-foreground/5 border-foreground/20 focus:ring-primary-500 focus:ring-offset-0 w-3.5 h-3.5"
                            />
                            <span className="text-[10px] uppercase font-bold text-foreground/50 tracking-wider">Auto</span>
                        </label>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-foreground/60 uppercase">Temp (°C)</label>
                            <input
                                type="number"
                                placeholder="..."
                                disabled={autoFetchWeather}
                                value={tempOverride}
                                onChange={(e) => setTempOverride(e.target.value === "" ? "" : Number(e.target.value))}
                                className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-foreground/5 border border-foreground/10 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-foreground/60 uppercase">Pressure (hPa)</label>
                            <input
                                type="number"
                                placeholder="..."
                                disabled={autoFetchWeather}
                                value={pressureOverride}
                                onChange={(e) => setPressureOverride(e.target.value === "" ? "" : Number(e.target.value))}
                                className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-foreground/5 border border-foreground/10 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
