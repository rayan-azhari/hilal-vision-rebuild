/**
 * BestTimeCard - Displays the optimal time to observe the crescent moon.
 * Uses the computeBestObservationTime function from the astronomy engine.
 */
import { useMemo } from "react";
import { Clock, Cloud, Thermometer } from "lucide-react";
import { computeBestObservationTime, type Location } from "@/lib/astronomy";
import { trpc } from "@/lib/trpc";

interface BestTimeCardProps {
    date: Date;
    location: Location;
    animationDelay?: string;
}

export function BestTimeCard({ date, location, animationDelay = "0ms" }: BestTimeCardProps) {
    const result = useMemo(
        () => computeBestObservationTime(date, location),
        [date.getTime(), location.lat, location.lng]
    );

    const { data: weather } = trpc.weather.getLocalWeather.useQuery(
        { lat: location.lat, lng: location.lng },
        { enabled: result.viable && !!location.lat && !!location.lng, staleTime: 5 * 60 * 1000 }
    );

    const formatT = (d: Date) =>
        d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    return (
        <div className="breezy-card animate-breezy-enter" style={{ animationDelay }}>
            <div className="flex items-center gap-2 mb-3">
                <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{
                        background: "color-mix(in oklch, var(--gold) 15%, transparent)",
                    }}
                >
                    <Clock className="w-3.5 h-3.5" style={{ color: "var(--gold)" }} />
                </div>
                <div>
                    <div className="text-xs font-medium" style={{ color: "var(--foreground)" }}>
                        Best Time to Observe
                    </div>
                    <div className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                        Optimal crescent viewing window
                    </div>
                </div>
            </div>

            {result.viable ? (
                <div className="space-y-2.5">
                    {/* Best time */}
                    <div
                        className="flex items-center justify-between px-3 py-2 rounded-lg"
                        style={{
                            background: "color-mix(in oklch, var(--gold) 8%, transparent)",
                            border: "1px solid color-mix(in oklch, var(--gold) 15%, transparent)",
                        }}
                    >
                        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                            Optimal Time
                        </span>
                        <span
                            className="text-sm font-mono font-bold"
                            style={{ color: "var(--gold)" }}
                        >
                            {formatT(result.bestTime)}
                        </span>
                    </div>

                    {/* Window */}
                    <div className="flex justify-between items-center">
                        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                            Window
                        </span>
                        <span className="text-xs font-mono" style={{ color: "var(--foreground)" }}>
                            {formatT(result.windowStart)} - {formatT(result.windowEnd)}
                        </span>
                    </div>

                    {/* Moon alt at best time */}
                    <div className="flex justify-between items-center">
                        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                            Moon Alt
                        </span>
                        <span className="text-xs font-mono" style={{ color: "var(--foreground)" }}>
                            {result.moonAltAtBest.toFixed(1)}°
                        </span>
                    </div>

                    {/* Sun alt at best time */}
                    <div className="flex justify-between items-center">
                        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                            Sun Alt
                        </span>
                        <span className="text-xs font-mono" style={{ color: "var(--foreground)" }}>
                            {result.sunAltAtBest.toFixed(1)}°
                        </span>
                    </div>

                    {/* Elevation (if available) */}
                    {location.elevation !== undefined && (
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/10" title="Observer altitude adjusts horizon dip calculations">
                            <span className="text-xs flex items-center gap-1" style={{ color: "var(--muted-foreground)" }}>
                                Elevation <span className="text-[10px] opacity-60">(Pro)</span>
                            </span>
                            <span className="text-xs font-mono" style={{ color: "var(--foreground)" }}>
                                {Math.round(location.elevation)}m
                            </span>
                        </div>
                    )}

                    {/* Weather Conditions Panel */}
                    {weather && (
                        <div className="mt-4 pt-3 border-t border-white/10">
                            <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>
                                Observation Conditions
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center bg-white/5 px-2 py-1.5 rounded-md">
                                    <span className="text-xs flex items-center gap-1.5" style={{ color: "var(--foreground)" }}>
                                        <Cloud className="w-3 h-3 text-white/70" /> Cloud Cover
                                    </span>
                                    <span className="text-xs font-mono font-bold" style={{ color: "var(--foreground)" }}>
                                        {Math.round(weather.cloudCover)}%
                                    </span>
                                </div>

                                <div className="flex justify-between items-center bg-white/5 px-2 py-1.5 rounded-md">
                                    <span className="text-xs flex items-center gap-1.5" style={{ color: "var(--foreground)" }}>
                                        <Thermometer className="w-3 h-3 text-white/70" /> Temperature
                                    </span>
                                    <span className="text-xs font-mono font-bold" style={{ color: "var(--foreground)" }}>
                                        {Math.round(weather.temperature)}°C
                                    </span>
                                </div>

                                <div
                                    className="text-xs mt-2 p-2 rounded-md text-center font-medium"
                                    style={{
                                        color: weather.conditionColor,
                                        background: `color-mix(in oklch, ${weather.conditionColor} 10%, transparent)`
                                    }}
                                >
                                    {weather.conditionText}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div
                    className="text-xs text-center py-3 rounded-lg"
                    style={{
                        color: "var(--muted-foreground)",
                        background: "color-mix(in oklch, var(--space-light) 50%, transparent)",
                    }}
                >
                    No viable observation window for this date and location
                </div>
            )}
        </div>
    );
}
