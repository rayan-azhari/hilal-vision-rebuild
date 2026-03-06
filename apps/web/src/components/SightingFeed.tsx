"use client";

import { trpc } from "@/lib/trpc";
import { Eye, MapPin, Clock, Bell, Download, Pause, Play, PlusCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@/store/useAppStore";

type VisualSuccess = "naked_eye" | "optical_aid" | "not_seen";

const SIGHTING_COLORS: Record<VisualSuccess, string> = {
    naked_eye: "#4ade80",
    optical_aid: "#facc15",
    not_seen: "#f87171",
};

export function SightingFeed() {
    const { t } = useTranslation();
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(() => new Date());
    const [secondsAgo, setSecondsAgo] = useState(0);

    const setShowSightingModal = useAppStore((s) => s.setShowSightingModal);

    const handleSubscribe = async () => {
        setIsSubscribing(true);
        // FCM subscription is pending G-07 (push send route)
        toast.info(t("feed.comingSoon", "Push notifications coming soon."));
        setIsSubscribing(false);
    };

    const { data: sightings, isLoading } = trpc.telemetry.getRecentObservations.useQuery(
        undefined,
        {
            refetchInterval: isPaused ? false : 30_000,
            refetchOnWindowFocus: false,
        }
    );

    useEffect(() => {
        if (sightings) setLastUpdated(new Date());
    }, [sightings]);

    useEffect(() => {
        const interval = setInterval(() => {
            setSecondsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [lastUpdated]);

    const SIGHTING_LABELS: Record<VisualSuccess, string> = {
        naked_eye: t("feed.seen", "Seen"),
        optical_aid: t("feed.opticalAid", "Optical Aid"),
        not_seen: t("feed.notSeen", "Not Seen"),
    };

    const exportToCSV = () => {
        if (!sightings?.length) return;
        const headers = ["ID", "Latitude", "Longitude", "Observation Time", "Result", "Notes"];
        const rows = sightings.map((s) => [
            s.id, s.lat, s.lng, s.observationTime?.toString() ?? "", s.visualSuccess, s.notes ?? "",
        ]);
        const csvContent = [
            headers.join(","),
            ...rows.map((row) => row.map((v) => `"${v}"`).join(",")),
        ].join("\n");
        triggerDownload(csvContent, "text/csv;charset=utf-8;", "hilal_sightings_feed.csv");
        setShowExportMenu(false);
    };

    const exportToJSON = () => {
        if (!sightings?.length) return;
        triggerDownload(JSON.stringify(sightings, null, 2), "application/json;charset=utf-8;", "hilal_sightings_feed.json");
        setShowExportMenu(false);
    };

    const triggerDownload = (content: string, mime: string, filename: string) => {
        const blob = new Blob([content], { type: mime });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // ── Header bar (shared across all states) ─────────────────────────────────
    const header = (
        <div className="flex items-center gap-2 mb-4">
            <Eye className="w-4 h-4" style={{ color: "var(--gold)" }} />
            <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                {t("feed.title", "Live Sighting Feed")}
            </span>

            {sightings && sightings.length > 0 && (
                <div className="relative ml-2">
                    <button
                        onClick={() => setShowExportMenu((v) => !v)}
                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                        title="Download Data"
                    >
                        <Download className="w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
                    </button>
                    {showExportMenu && (
                        <div
                            className="absolute top-full left-0 mt-1 w-32 rounded-lg shadow-xl z-50 overflow-hidden border"
                            style={{
                                background: "var(--space-mid)",
                                borderColor: "color-mix(in oklch, var(--gold) 20%, transparent)",
                            }}
                        >
                            <button
                                onClick={exportToCSV}
                                className="w-full text-left px-4 py-2 text-xs hover:bg-white/5 transition-colors"
                                style={{ color: "var(--foreground)" }}
                            >
                                {t("feed.exportCsv", "Export CSV")}
                            </button>
                            <button
                                onClick={exportToJSON}
                                className="w-full text-left px-4 py-2 text-xs hover:bg-white/5 transition-colors"
                                style={{ color: "var(--foreground)" }}
                            >
                                {t("feed.exportJson", "Export JSON")}
                            </button>
                        </div>
                    )}
                </div>
            )}

            <button
                onClick={handleSubscribe}
                disabled={isSubscribing}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                title={t("feed.enableNotif", "Enable Notifications")}
            >
                <Bell className="w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
            </button>

            <span className="ml-auto flex items-center gap-1.5">
                {sightings && sightings.length > 0 && (
                    <button
                        onClick={() => setIsPaused((p) => !p)}
                        className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 transition-colors"
                        title={isPaused ? t("feed.resumeRefresh", "Resume") : t("feed.pauseRefresh", "Pause")}
                    >
                        {isPaused
                            ? <Play className="w-3 h-3" style={{ color: "var(--muted-foreground)" }} />
                            : <Pause className="w-3 h-3" style={{ color: "var(--muted-foreground)" }} />
                        }
                    </button>
                )}
                <span className={`w-2 h-2 rounded-full ${isPaused ? "bg-gray-500" : "bg-green-400 animate-pulse"}`} />
                <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {isPaused
                        ? t("feed.paused", "Paused")
                        : t("feed.secsAgo", { count: secondsAgo, defaultValue: `${secondsAgo}s ago` })
                    }
                </span>
            </span>
        </div>
    );

    // ── Loading skeleton ───────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="breezy-card p-6 animate-breezy-enter">
                {header}
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

    // ── Empty state ───────────────────────────────────────────────────────────
    if (!sightings || sightings.length === 0) {
        return (
            <div className="breezy-card p-6 animate-breezy-enter">
                {header}
                <div className="text-center py-8 flex flex-col items-center gap-4">
                    <div
                        className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                        style={{
                            background: "color-mix(in oklch, var(--gold) 8%, transparent)",
                            border: "1px solid color-mix(in oklch, var(--gold) 20%, transparent)",
                        }}
                    >
                        ☽
                    </div>
                    <div>
                        <p className="text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>
                            {t("feed.noReports", "No sightings reported yet")}
                        </p>
                        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                            {t("feed.beFirst", "Be the first to report from your area")}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowSightingModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105"
                        style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)", color: "#fff" }}
                    >
                        <PlusCircle className="w-3.5 h-3.5" />
                        {t("feed.reportSighting", "Report Sighting")}
                    </button>
                </div>
            </div>
        );
    }

    // ── Feed list ─────────────────────────────────────────────────────────────
    return (
        <div className="breezy-card p-6 animate-breezy-enter">
            {header}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                {sightings.map((s, i) => {
                    const result = (s.visualSuccess ?? "not_seen") as VisualSuccess;
                    const color = SIGHTING_COLORS[result] ?? "#6b7280";

                    return (
                        <div
                            key={s.id ?? i}
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
                                        {`${s.lat.toFixed(1)}°, ${s.lng.toFixed(1)}°`}
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
                                {SIGHTING_LABELS[result] ?? result}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
