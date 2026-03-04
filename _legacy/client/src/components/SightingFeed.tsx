import { trpc } from "@/lib/trpc";
import { Eye, MapPin, Clock, Bell, Download, Pause, Play, PlusCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { requestNotificationPermission } from "@/lib/firebase";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { SightingReportForm } from "./SightingReportForm";
import { useTranslation } from "react-i18next";

const SIGHTING_COLORS: Record<string, string> = {
    positive: "#4ade80",
    uncertain: "#facc15",
    negative: "#f87171",
};

export function SightingFeed() {
    const { t } = useTranslation();
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [reportOpen, setReportOpen] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(() => new Date());
    const [secondsAgo, setSecondsAgo] = useState(0);
    const subscribeMutation = trpc.notifications.subscribe.useMutation({
        onSuccess: () => {
            toast.success(t("feed.subscribedSuccess"));
            setIsSubscribing(false);
        },
        onError: (err) => {
            console.error("Subscription failed:", err);
            toast.error(t("feed.subscribeFailed"));
            setIsSubscribing(false);
        }
    });

    const handleSubscribe = async () => {
        setIsSubscribing(true);
        const token = await requestNotificationPermission();
        if (token) {
            subscribeMutation.mutate({ token, deviceType: "web" });
        } else {
            setIsSubscribing(false);
            toast.error(t("feed.permissionDenied"));
        }
    };

    const { data, isLoading } = trpc.telemetry.getObservations.useQuery(
        { limit: 10, offset: 0 },
        {
            refetchInterval: isPaused ? false : 30_000,
            refetchOnWindowFocus: false, // Prevent massive DB spike on tab switch
        }
    );

    // Track when data last refreshed
    useEffect(() => {
        if (data) setLastUpdated(new Date());
    }, [data]);

    // Increment the "X seconds ago" counter every second
    useEffect(() => {
        const interval = setInterval(() => {
            setSecondsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [lastUpdated]);

    const sightings = data?.data;

    const exportToCSV = () => {
        if (!sightings || sightings.length === 0) return;
        const headers = ["ID", "Latitude", "Longitude", "City", "Observation Time", "Result", "Notes", "Temperature", "Pressure", "Cloud Fraction", "PM25"];
        const rows = sightings.map((s: any) => [
            s.id, s.lat, s.lng, s.city || "", s.observationTime, s.visualSuccess, s.notes || "", s.temperature || "", s.pressure || "", s.cloudFraction || "", s.pm25 || ""
        ]);
        const csvContent = [
            headers.join(","),
            ...rows.map(e => e.map((val: any) => `"${val}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `hilal_sightings_feed.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowExportMenu(false);
    };

    const exportToJSON = () => {
        if (!sightings || sightings.length === 0) return;
        const jsonContent = JSON.stringify(sightings, null, 2);
        const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `hilal_sightings_feed.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowExportMenu(false);
    };

    const SIGHTING_LABELS: Record<string, string> = {
        positive: t("feed.seen"),
        uncertain: t("feed.uncertain"),
        negative: t("feed.notSeen"),
    };

    if (isLoading) {
        return (
            <div className="breezy-card p-6 animate-breezy-enter">
                <div className="flex items-center gap-2 mb-4">
                    <Eye className="w-4 h-4" style={{ color: "var(--gold)" }} />
                    <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                        {t("feed.title")}
                    </span>
                    <button
                        onClick={handleSubscribe}
                        disabled={isSubscribing}
                        className="ml-2 w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                        title={t("feed.enableNotif")}
                    >
                        <Bell className="w-4 h-4 text-white" />
                    </button>
                    <span className="ml-auto flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{t("feed.live")}</span>
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
            <>
                <div className="breezy-card p-6 animate-breezy-enter">
                    <div className="flex items-center gap-2 mb-4">
                        <Eye className="w-4 h-4" style={{ color: "var(--gold)" }} />
                        <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                            {t("feed.title")}
                        </span>
                        <button
                            onClick={handleSubscribe}
                            disabled={isSubscribing}
                            className="ml-2 w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                            title={t("feed.enableNotif")}
                        >
                            <Bell className="w-4 h-4 text-white" />
                        </button>
                    </div>
                    <div className="text-center py-8 flex flex-col items-center gap-4">
                        <div
                            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                            style={{ background: "color-mix(in oklch, var(--gold) 8%, transparent)", border: "1px solid color-mix(in oklch, var(--gold) 20%, transparent)" }}
                        >
                            ☽
                        </div>
                        <div>
                            <p className="text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>
                                {t("feed.noReports")}
                            </p>
                            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                                {t("feed.beFirst")}
                            </p>
                        </div>
                        <button
                            onClick={() => setReportOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105"
                            style={{
                                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                                color: "#fff",
                            }}
                        >
                            <PlusCircle className="w-3.5 h-3.5" />
                            {t("feed.reportSighting")}
                        </button>
                    </div>
                </div>

                <Dialog open={reportOpen} onOpenChange={setReportOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{t("feed.submitTitle")}</DialogTitle>
                            <DialogDescription>
                                {t("feed.submitDesc")}
                            </DialogDescription>
                        </DialogHeader>
                        <SightingReportForm onSuccess={() => setReportOpen(false)} />
                    </DialogContent>
                </Dialog>
            </>
        );
    }

    return (
        <div className="breezy-card p-6 animate-breezy-enter">
            <div className="flex items-center gap-2 mb-4">
                <Eye className="w-4 h-4" style={{ color: "var(--gold)" }} />
                <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                    {t("feed.title")}
                </span>

                <div className="relative ml-2">
                    <button
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                        title="Download Data"
                    >
                        <Download className="w-4 h-4 text-white" />
                    </button>
                    {showExportMenu && (
                        <div className="absolute top-full left-0 mt-1 w-32 rounded-lg shadow-xl z-50 overflow-hidden border"
                            style={{ background: "var(--space-mid)", borderColor: "color-mix(in oklch, var(--gold) 20%, transparent)" }}
                        >
                            <button onClick={exportToCSV} className="w-full text-left px-4 py-2 text-xs hover:bg-white/5 transition-colors" style={{ color: "var(--foreground)" }}>{t("feed.exportCsv")}</button>
                            <button onClick={exportToJSON} className="w-full text-left px-4 py-2 text-xs hover:bg-white/5 transition-colors" style={{ color: "var(--foreground)" }}>{t("feed.exportJson")}</button>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleSubscribe}
                    disabled={isSubscribing}
                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                    title={t("feed.enableNotif")}
                >
                    <Bell className="w-4 h-4 text-white" />
                </button>
                <span className="ml-auto flex items-center gap-1.5">
                    <button
                        onClick={() => setIsPaused((p) => !p)}
                        className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 transition-colors"
                        title={isPaused ? t("feed.resumeRefresh") : t("feed.pauseRefresh")}
                    >
                        {isPaused
                            ? <Play className="w-3 h-3" style={{ color: "var(--muted-foreground)" }} />
                            : <Pause className="w-3 h-3" style={{ color: "var(--muted-foreground)" }} />
                        }
                    </button>
                    <span className={`w-2 h-2 rounded-full ${isPaused ? "bg-gray-500" : "bg-green-400 animate-pulse"}`} />
                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                        {isPaused
                            ? `${t("feed.paused")} · ${sightings.length}`
                            : `${t("feed.secsAgo", { count: secondsAgo })} · ${sightings.length}`
                        }
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
