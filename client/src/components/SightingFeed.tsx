import { trpc } from "@/lib/trpc";
import { Eye, MapPin, Clock } from "lucide-react";

const SIGHTING_COLORS: Record<string, string> = {
    positive: "#4ade80",
    uncertain: "#facc15",
    negative: "#f87171",
};

const SIGHTING_LABELS: Record<string, string> = {
    positive: "🟢 Seen",
    uncertain: "🔵 Uncertain",
    negative: "⚪ Not Seen",
};

export function SightingFeed() {
    const { data, isLoading } = trpc.telemetry.getObservations.useQuery(
        { limit: 10, offset: 0 },
        {
            refetchInterval: 30_000, // Auto-refresh every 30 seconds
            refetchOnWindowFocus: true,
        }
    );

    const sightings = data?.data;

    if (isLoading) {
        return (
            <div className="breezy-card p-6 animate-breezy-enter">
                <div className="flex items-center gap-2 mb-4">
                    <Eye className="w-4 h-4" style={{ color: "var(--gold)" }} />
                    <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                        Live Sighting Feed
                    </span>
                    <span className="ml-auto flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Live</span>
                    </span>
                </div>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-16 rounded-lg animate-pulse"
                            style={{ background: "var(--space-light)" }}
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (!sightings || sightings.length === 0) {
        return (
            <div className="breezy-card p-6 animate-breezy-enter">
                <div className="flex items-center gap-2 mb-4">
                    <Eye className="w-4 h-4" style={{ color: "var(--gold)" }} />
                    <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                        Live Sighting Feed
                    </span>
                </div>
                <div className="text-center py-6">
                    <div className="text-2xl mb-2">☽</div>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                        No recent sighting reports. Be the first to report tonight!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="breezy-card p-6 animate-breezy-enter">
            <div className="flex items-center gap-2 mb-4">
                <Eye className="w-4 h-4" style={{ color: "var(--gold)" }} />
                <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                    Live Sighting Feed
                </span>
                <span className="ml-auto flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                        Live · {sightings.length} reports
                    </span>
                </span>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                {sightings.map((s: any, i: number) => {
                    const result = s.visualSuccess || "uncertain";
                    const color = SIGHTING_COLORS[result] || "#6b7280";

                    return (
                        <div
                            key={s.id || i}
                            className="flex items-start gap-3 p-3 rounded-xl transition-all"
                            style={{
                                background: "var(--space-light)",
                                borderLeft: `3px solid ${color}`,
                            }}
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <MapPin className="w-3 h-3" style={{ color: "var(--gold-dim)" }} />
                                    <span className="text-xs font-medium truncate" style={{ color: "var(--foreground)" }}>
                                        {s.city || `${parseFloat(s.lat).toFixed(1)}°, ${parseFloat(s.lng).toFixed(1)}°`}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-3 h-3" style={{ color: "var(--muted-foreground)" }} />
                                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                                        {new Date(s.createdAt).toLocaleString(undefined, {
                                            month: "short",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                </div>
                                {s.notes && (
                                    <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--muted-foreground)" }}>
                                        {s.notes}
                                    </p>
                                )}
                            </div>
                            <span
                                className="text-xs font-bold px-2 py-1 rounded-lg whitespace-nowrap"
                                style={{
                                    background: `color-mix(in oklch, ${color} 15%, transparent)`,
                                    color,
                                }}
                            >
                                {SIGHTING_LABELS[result] || result}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
