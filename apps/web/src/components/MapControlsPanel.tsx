"use client";

import { ChevronDown, Eye, Cloud, Clock, Settings2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useAtmosphericData } from "@/hooks/useAtmosphericData";
import { ProGate } from "@/components/ProGate";
import { useState } from "react";

export function MapControlsPanel() {
    const [isExpanded, setIsExpanded] = useState(true);

    const location = useAppStore((s) => s.location);
    const resolution = useAppStore((s) => s.resolution);
    const setResolution = useAppStore((s) => s.setResolution);
    const visibilityCriterion = useAppStore((s) => s.visibilityCriterion);
    const setVisibilityCriterion = useAppStore((s) => s.setVisibilityCriterion);
    const showVisibility = useAppStore((s) => s.showVisibility);
    const setShowVisibility = useAppStore((s) => s.setShowVisibility);
    const showClouds = useAppStore((s) => s.showClouds);
    const setShowClouds = useAppStore((s) => s.setShowClouds);
    const hourOffset = useAppStore((s) => s.hourOffset);
    const setHourOffset = useAppStore((s) => s.setHourOffset);

    const clerkHasPro = useAppStore((s) => s.clerkHasPro);
    const nativeHasPro = useAppStore((s) => s.nativeHasPro);
    const isAdmin = useAppStore((s) => s.isAdmin);
    const setShowUpgradeModal = useAppStore((s) => s.setShowUpgradeModal);
    const isPremium = process.env.NODE_ENV === "development" || clerkHasPro || nativeHasPro || isAdmin;

    const {
        tempOverride, setTempOverride,
        pressureOverride, setPressureOverride,
        autoFetchWeather, setAutoFetchWeather,
    } = useAtmosphericData({ lat: location.lat, lng: location.lng });

    if (!isExpanded) {
        return (
            <button
                onClick={() => setIsExpanded(true)}
                className="p-3 rounded-2xl glass border border-foreground/10 shadow-xl hover:bg-foreground/5 transition-all text-foreground/70"
            >
                <Settings2 className="w-5 h-5" />
            </button>
        );
    }

    return (
        <div className="rounded-2xl glass border border-foreground/10 shadow-2xl overflow-hidden backdrop-blur-xl">
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
                        <span className="text-xs font-mono font-bold" style={{ color: "var(--gold)" }}>
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
                        className="w-full h-1.5 bg-foreground/10 rounded-full appearance-none cursor-pointer"
                        style={{ accentColor: "var(--gold)" }}
                    />
                </div>

                {/* Resolution */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-foreground/70">Resolution</label>
                    <div className="relative">
                        <select
                            value={resolution}
                            onChange={(e) => setResolution(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg text-xs appearance-none pr-8 focus:outline-none focus:ring-1"
                            style={{
                                background: "var(--space-light, color-mix(in oklch, var(--foreground) 5%, transparent))",
                                border: "1px solid color-mix(in oklch, var(--gold) 20%, transparent)",
                                color: "var(--foreground)",
                                accentColor: "var(--gold)",
                            }}
                        >
                            <option value={2}>Fine (slow)</option>
                            <option value={4}>Normal</option>
                            <option value={6}>Fast (coarse)</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none text-foreground/40" />
                    </div>
                </div>

                {/* Visibility Criterion */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-foreground/70">Visibility Criterion</label>
                    <div className="relative">
                        <select
                            value={visibilityCriterion}
                            onChange={(e) => setVisibilityCriterion(e.target.value as "yallop" | "odeh")}
                            className="w-full px-3 py-2 rounded-lg text-xs appearance-none pr-8 focus:outline-none focus:ring-1"
                            style={{
                                background: "var(--space-light, color-mix(in oklch, var(--foreground) 5%, transparent))",
                                border: "1px solid color-mix(in oklch, var(--gold) 20%, transparent)",
                                color: "var(--foreground)",
                            }}
                        >
                            <option value="yallop">Yallop (q-value)</option>
                            <option value="odeh">Odeh (V-value)</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none text-foreground/40" />
                    </div>
                </div>

                {/* Overlay Toggles */}
                <div className="space-y-2 pt-2 border-t border-foreground/5">
                    <div className="flex items-center justify-between py-1">
                        <span className="text-xs font-semibold text-foreground/70 flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5" /> Visibility Zones
                        </span>
                        <button
                            onClick={() => setShowVisibility(!showVisibility)}
                            className={`w-10 h-5 rounded-full transition-colors relative flex items-center ${showVisibility ? "" : "bg-foreground/20"}`}
                            style={showVisibility ? { background: "var(--gold)" } : undefined}
                        >
                            <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform absolute ${showVisibility ? "translate-x-5" : "translate-x-1"}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between py-1">
                        <span className="text-xs font-semibold text-foreground/70 flex items-center gap-1.5">
                            <Cloud className="w-3.5 h-3.5" /> Cloud Cover
                        </span>
                        <button
                            onClick={() => isPremium ? setShowClouds(!showClouds) : setShowUpgradeModal(true)}
                            className={`w-10 h-5 rounded-full transition-colors relative flex items-center ${showClouds ? "" : "bg-foreground/20"}`}
                            style={showClouds ? { background: "var(--gold)" } : undefined}
                        >
                            <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform absolute ${showClouds ? "translate-x-5" : "translate-x-1"}`} />
                        </button>
                    </div>
                </div>

                {/* Atmospheric Overrides — Pro-gated */}
                <ProGate featureName="Atmospheric Overrides">
                    <div className="space-y-3 pt-4 border-t border-foreground/5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground">Atmospheric Overrides</span>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={autoFetchWeather}
                                    onChange={(e) => setAutoFetchWeather(e.target.checked)}
                                    className="rounded w-3.5 h-3.5"
                                    style={{
                                        accentColor: "var(--gold)",
                                    }}
                                />
                                <span className="text-[10px] uppercase font-bold text-foreground/50 tracking-wider">Auto</span>
                            </label>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <label className="text-[10px] font-semibold text-foreground/60 uppercase">Temp (°C)</label>
                                <input
                                    type="number"
                                    placeholder="auto"
                                    disabled={autoFetchWeather}
                                    value={tempOverride}
                                    onChange={(e) => {
                                        setTempOverride(e.target.value === "" ? "" : Number(e.target.value));
                                        setAutoFetchWeather(false);
                                    }}
                                    className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-foreground/5 border border-foreground/10 focus:outline-none disabled:opacity-50"
                                    style={{ color: "var(--foreground)" }}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-semibold text-foreground/60 uppercase">Pressure (hPa)</label>
                                <input
                                    type="number"
                                    placeholder="auto"
                                    disabled={autoFetchWeather}
                                    value={pressureOverride}
                                    onChange={(e) => {
                                        setPressureOverride(e.target.value === "" ? "" : Number(e.target.value));
                                        setAutoFetchWeather(false);
                                    }}
                                    className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-foreground/5 border border-foreground/10 focus:outline-none disabled:opacity-50"
                                    style={{ color: "var(--foreground)" }}
                                />
                            </div>
                        </div>
                    </div>
                </ProGate>
            </div>
        </div>
    );
}
