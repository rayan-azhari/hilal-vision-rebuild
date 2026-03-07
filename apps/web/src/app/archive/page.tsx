"use client";

import { useState, useEffect, useRef } from "react";
import { Archive, ChevronLeft, ChevronRight, Download } from "lucide-react";
import Map, { useMap } from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { hijriToGregorian, gregorianToHijri, computeSunMoonAtSunset, HIJRI_MONTHS, MAJOR_CITIES, type VisibilityZone } from "@hilal/astronomy";
import { useAppStore } from "@/store/useAppStore";

const ZONE_COLORS: Record<VisibilityZone, string> = {
    A: "#4ade80",
    B: "#facc15",
    C: "#fb923c",
    D: "#f87171",
    E: "#6b7280",
    F: "#1f2937",
};

// RGBA values for the mini-map canvas pixels (~60% opacity for non-F zones)
const ZONE_RGBA: Record<VisibilityZone, [number, number, number, number]> = {
    A: [74, 222, 128, 153],
    B: [250, 204, 21, 153],
    C: [251, 146, 60, 153],
    D: [248, 113, 113, 153],
    E: [107, 114, 128, 153],
    F: [31, 41, 55, 80],
};

interface MonthSummary {
    hijriYear: number;
    hijriMonth: number;
    newMoonDate: Date;
    cityResults: Array<{
        city: string;
        country: string;
        zone: VisibilityZone;
        q: number;
    }>;
    globalZone: VisibilityZone;
}

interface IcopObservation {
    city: string;
    country: string;
    result: "Seen" | "Not Seen" | "Cloudy";
    opticalAid: string;
}

interface IcopMonthData {
    hijriYear: number;
    hijriMonth: number;
    observations: IcopObservation[];
}

/**
 * Imperative raster layer — adds the visibility texture as an image source
 * on the mini-map, identical to VisibilityZoneLayer in VisibilityMap.tsx.
 */
function MiniMapZoneLayer({ textureUrl }: { textureUrl: string | null }) {
    const { current: map } = useMap();

    useEffect(() => {
        if (!map) return;
        const m = map.getMap();
        const sourceId = "mini-visibility-source";
        const layerId = "mini-visibility-layer";

        function addLayer() {
            try {
                if (m.getLayer(layerId)) m.removeLayer(layerId);
                if (m.getSource(sourceId)) m.removeSource(sourceId);
                if (!textureUrl) return;

                m.addSource(sourceId, {
                    type: "image",
                    url: textureUrl,
                    coordinates: [
                        [-180, 85.051129],
                        [180, 85.051129],
                        [180, -85.051129],
                        [-180, -85.051129],
                    ],
                });
                m.addLayer({
                    id: layerId,
                    type: "raster",
                    source: sourceId,
                    paint: { "raster-opacity": 0.85, "raster-fade-duration": 0 },
                });
            } catch (err) {
                console.error("[MiniMapZoneLayer]", err);
            }
        }

        if (m.isStyleLoaded()) {
            addLayer();
        } else {
            m.once("style.load", addLayer);
        }

        return () => {
            try {
                if (m.getLayer(layerId)) m.removeLayer(layerId);
                if (m.getSource(sourceId)) m.removeSource(sourceId);
            } catch { /* map may be destroyed */ }
        };
    }, [map, textureUrl]);

    return null;
}

/**
 * Full-width MapLibre visibility map for the selected Hijri month.
 * Computes an RGBA pixel grid (8° resolution, Mercator projection) then
 * blurs + upscales it to a 1024×512 texture — same pipeline as
 * useVisibilityWorker — and overlays it on a real CartoDB basemap.
 */
function VisibilityMiniMap({ year, month }: { year: number; month: number }) {
    const isDarkMode = useAppStore((s) => s.isDarkMode);
    const [textureUrl, setTextureUrl] = useState<string | null>(null);

    useEffect(() => {
        const date = hijriToGregorian(year, month, 1);

        // Mercator pixel grid (matches useVisibilityWorker projection)
        const resolution = 8;
        const W = Math.floor(360 / resolution);
        const H = Math.floor(180 / resolution);
        const pixels = new Uint8ClampedArray(W * H * 4);
        const maxLat = 85.051129;

        for (let py = 0; py < H; py++) {
            for (let px = 0; px < W; px++) {
                const mercY = Math.PI - ((py + 0.5) / H) * 2 * Math.PI;
                let lat = (2 * Math.atan(Math.exp(mercY)) - Math.PI / 2) * (180 / Math.PI);
                lat = Math.max(-maxLat, Math.min(maxLat, lat));
                const lng = -180 + ((px + 0.5) / W) * 360;

                const data = computeSunMoonAtSunset(date, { lat, lng });
                const zone = data.visibility;
                const [r, g, b] = ZONE_RGBA[zone];
                const alpha = zone === "F" ? 40 : 180;

                const off = (py * W + px) * 4;
                pixels[off] = r;
                pixels[off + 1] = g;
                pixels[off + 2] = b;
                pixels[off + 3] = alpha;
            }
        }

        // Upscale with blur (same as pixelsToTextureUrl in useVisibilityWorker)
        const offCanvas = document.createElement("canvas");
        offCanvas.width = W;
        offCanvas.height = H;
        const offCtx = offCanvas.getContext("2d");
        if (!offCtx) return;
        offCtx.putImageData(new ImageData(pixels, W, H), 0, 0);

        const canvas = document.createElement("canvas");
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.filter = "blur(12px)";
        ctx.drawImage(offCanvas, -1024, 0, 1024, 512);
        ctx.drawImage(offCanvas, 0, 0, 1024, 512);
        ctx.drawImage(offCanvas, 1024, 0, 1024, 512);

        setTextureUrl(canvas.toDataURL());
    }, [year, month]);

    const mapStyle = isDarkMode
        ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        : "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

    return (
        <div style={{ height: "420px" }} className="w-full">
            <Map
                initialViewState={{ longitude: 0, latitude: 20, zoom: 0.8 }}
                mapStyle={mapStyle}
                interactive={false}
                attributionControl={false}
                style={{ width: "100%", height: "100%" }}
            >
                <MiniMapZoneLayer textureUrl={textureUrl} />
            </Map>
        </div>
    );
}

function computeMonthSummary(year: number, month: number): MonthSummary {
    const newMoonDate = hijriToGregorian(year, month, 1);

    const cityResults = MAJOR_CITIES.slice(0, 12).map((city) => {
        const data = computeSunMoonAtSunset(newMoonDate, city);
        return { city: city.name, country: city.country, zone: data.visibility, q: data.qValue };
    });

    // Global zone: majority vote
    const zoneCounts: Record<string, number> = {};
    cityResults.forEach((r) => {
        zoneCounts[r.zone] = (zoneCounts[r.zone] ?? 0) + 1;
    });
    const globalZone = (Object.entries(zoneCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "E") as VisibilityZone;

    return { hijriYear: year, hijriMonth: month, newMoonDate, cityResults, globalZone };
}

export default function ArchivePage() {
    const [selectedYear, setSelectedYear] = useState(1446); // SSR-safe default; updated on mount
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
    const [monthDetail, setMonthDetail] = useState<MonthSummary | null>(null);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);

    // Fetch ICOP data from static JSON file
    const [icopData, setIcopData] = useState<IcopObservation[] | null>(null);
    const [isLoadingIcop, setIsLoadingIcop] = useState(false);
    const icopCacheRef = useRef<IcopMonthData[] | null>(null);

    const years = Array.from({ length: 28 }, (_, i) => 1438 + i);

    // Default to current Hijri year and month on mount, and auto-load it
    useEffect(() => {
        const today = gregorianToHijri(new Date());
        const year = today.year;
        const month = today.month;
        setSelectedYear(year);
        setSelectedMonth(month);
        setIsLoadingDetail(true);
        setTimeout(() => {
            const summary = computeMonthSummary(year, month);
            setMonthDetail(summary);
            setIsLoadingDetail(false);
        }, 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (selectedMonth === null) return;

        // If already cached, filter from cache
        if (icopCacheRef.current) {
            const monthData = icopCacheRef.current.find((d) => d.hijriYear === selectedYear && d.hijriMonth === selectedMonth);
            setIcopData(monthData?.observations ?? null);
            return;
        }

        // Fetch the static JSON once (requires public/icop-history.json)
        setIsLoadingIcop(true);
        fetch("/icop-history.json")
            .then((r) => r.json())
            .then((allData: IcopMonthData[]) => {
                icopCacheRef.current = allData;
                const monthData = allData.find((d) => d.hijriYear === selectedYear && d.hijriMonth === selectedMonth);
                setIcopData(monthData?.observations ?? null);
            })
            .catch(() => setIcopData(null))
            .finally(() => setIsLoadingIcop(false));
    }, [selectedYear, selectedMonth]);

    const handleMonthClick = (month: number) => {
        setSelectedMonth(month);
        setIsLoadingDetail(true);
        setTimeout(() => {
            const summary = computeMonthSummary(selectedYear, month);
            setMonthDetail(summary);
            setIsLoadingDetail(false);
        }, 50);
    };

    const exportIcopToCSV = () => {
        if (!icopData || icopData.length === 0) return;
        const headers = ["City", "Country", "Result", "Optical Aid"];
        const rows = icopData.map((d) => [d.city, d.country, d.result, d.opticalAid]);
        const csvContent = [headers.join(","), ...rows.map((e) => e.map((val) => `"${val}"`).join(","))].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `icop_observations_${selectedYear}_${selectedMonth}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="pt-6 pb-12 max-w-[1400px] mx-auto px-4 min-h-screen">
            {/* Header */}
            <div className="mb-12 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary-500/20 text-primary-400 flex items-center justify-center mb-6 shadow-xl shadow-primary-500/10">
                    <Archive className="w-8 h-8" />
                </div>
                <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-4">
                    Astronomical <span className="bg-gradient-to-br from-primary-400 to-primary-600 text-transparent bg-clip-text">Archive</span>
                </h1>
                <p className="text-foreground/60 max-w-2xl text-lg font-medium mx-auto">
                    Historical sighting records from the ICOP database and computed retrospective visibility.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Year selector + month grid */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Year navigation */}
                    <div className="glass p-5 rounded-3xl border border-foreground/10 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={() => setSelectedYear((y) => Math.max(1438, y - 1))}
                                disabled={selectedYear <= 1438}
                                className="p-2 rounded-xl disabled:opacity-30 transition-colors bg-foreground/5 hover:bg-foreground/10 text-foreground"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div className="text-center">
                                <div className="text-2xl font-bold font-display text-primary-400">
                                    {selectedYear} AH
                                </div>
                                <div className="text-xs text-foreground/50 uppercase tracking-widest font-bold mt-1">
                                    Hijri Year
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedYear((y) => Math.min(1465, y + 1))}
                                disabled={selectedYear >= 1465}
                                className="p-2 rounded-xl disabled:opacity-30 transition-colors bg-foreground/5 hover:bg-foreground/10 text-foreground"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Quick year selector */}
                        <div className="flex flex-wrap gap-2 justify-center mt-6">
                            {years.map((y) => (
                                <button
                                    key={y}
                                    onClick={() => {
                                        setSelectedYear(y);
                                        setSelectedMonth(null);
                                        setMonthDetail(null);
                                    }}
                                    className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${y === selectedYear
                                        ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30"
                                        : "glass border border-foreground/10 text-foreground/60 hover:text-foreground"
                                        }`}
                                >
                                    {y}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Month grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {HIJRI_MONTHS.map((month, i) => {
                            const monthNum = i + 1;
                            const isSelected = selectedMonth === monthNum;

                            return (
                                <button
                                    key={monthNum}
                                    onClick={() => handleMonthClick(monthNum)}
                                    className={`rounded-2xl p-5 text-left transition-all duration-300 border ${isSelected
                                        ? "glass border-primary-500/50 shadow-xl shadow-primary-500/10 scale-[1.02]"
                                        : "glass border-foreground/5 hover:border-foreground/20 hover:scale-[1.01]"
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-bold px-2 py-1 rounded-lg bg-foreground/5 text-foreground/50">
                                            {month.short}
                                        </span>
                                        <span className="text-xs font-bold text-foreground/40">
                                            {monthNum.toString().padStart(2, "0")}
                                        </span>
                                    </div>
                                    <div className="text-lg font-bold text-foreground">
                                        {month.en}
                                    </div>
                                    <div className="mt-3 text-xs font-semibold text-foreground/50">
                                        {hijriToGregorian(selectedYear, monthNum, 1).toLocaleDateString("en-GB", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Detail panel */}
                <div className="space-y-4">
                    {!selectedMonth && (
                        <div className="glass p-8 rounded-3xl border border-foreground/10 text-center shadow-xl">
                            <div className="text-4xl mb-4 opacity-50">☾</div>
                            <div className="text-base font-bold text-foreground mb-2">Select a Month</div>
                            <div className="text-sm font-medium text-foreground/50">
                                Click any month to view historical visibility data and global records.
                            </div>
                        </div>
                    )}

                    {(isLoadingDetail || isLoadingIcop) && (
                        <div className="glass p-8 rounded-3xl border border-foreground/10 flex items-center justify-center min-h-[300px]">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-10 h-10 rounded-full border-4 border-foreground/10 border-t-primary-500 animate-spin" />
                                <span className="text-sm font-bold text-foreground/50 uppercase tracking-widest">Loading...</span>
                            </div>
                        </div>
                    )}

                    {monthDetail && !isLoadingDetail && (
                        <>
                            <div className="glass p-6 rounded-3xl border border-foreground/10 shadow-xl">
                                <div className="text-xs font-bold text-foreground/50 uppercase tracking-widest mb-3">Month Details</div>
                                <div className="text-2xl font-display font-bold text-primary-400 mb-4">
                                    {HIJRI_MONTHS[monthDetail.hijriMonth - 1]?.en}
                                </div>
                                <div className="text-sm font-semibold text-foreground/70 mb-4">
                                    New Moon:{" "}
                                    <span className="text-foreground">
                                        {monthDetail.newMoonDate.toLocaleDateString("en-GB", {
                                            weekday: "long",
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </span>
                                </div>
                                <div
                                    className="flex items-center gap-3 px-4 py-3 rounded-2xl border"
                                    style={{
                                        backgroundColor: `color-mix(in srgb, ${ZONE_COLORS[monthDetail.globalZone]} 10%, transparent)`,
                                        borderColor: `color-mix(in srgb, ${ZONE_COLORS[monthDetail.globalZone]} 30%, transparent)`,
                                    }}
                                >
                                    <div
                                        className="w-4 h-4 rounded-full shadow-sm"
                                        style={{ background: ZONE_COLORS[monthDetail.globalZone] }}
                                    />
                                    <span className="text-sm font-bold" style={{ color: ZONE_COLORS[monthDetail.globalZone] }}>
                                        Global: Zone {monthDetail.globalZone}
                                    </span>
                                </div>

                            </div>

                            {/* ICOP Actual Observations */}
                            {icopData && icopData.length > 0 && (
                                <div className="glass p-6 rounded-3xl border border-foreground/10 shadow-xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex flex-col">
                                            <div className="text-xs font-bold text-foreground/50 uppercase tracking-widest">
                                                Actual Observations
                                            </div>
                                            <span className="text-sm font-semibold text-primary-500">
                                                {icopData.length} records found
                                            </span>
                                        </div>
                                        <button onClick={exportIcopToCSV} className="p-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 transition-colors text-foreground/50 hover:text-foreground">
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                        {icopData.map((obs, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between px-4 py-3 rounded-xl bg-foreground/5 border-l-4"
                                                style={{ borderLeftColor: obs.result === "Seen" ? "var(--color-primary-500)" : "var(--color-destructive)" }}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-foreground">{obs.city}</span>
                                                    <span className="text-xs font-medium text-foreground/50">{obs.country}</span>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">
                                                        {obs.opticalAid}
                                                    </span>
                                                    <span
                                                        className="text-xs font-bold px-2 py-0.5 rounded-md"
                                                        style={{
                                                            backgroundColor: obs.result === "Seen" ? "color-mix(in srgb, var(--color-primary-500) 20%, transparent)" : "color-mix(in srgb, var(--color-destructive) 20%, transparent)",
                                                            color: obs.result === "Seen" ? "var(--color-primary-400)" : "var(--color-destructive)",
                                                        }}
                                                    >
                                                        {obs.result}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Computed City Visibility */}
                            <div className="glass p-6 rounded-3xl border border-foreground/10 shadow-xl">
                                <div className="text-xs font-bold text-foreground/50 uppercase tracking-widest mb-4">Computed Overview</div>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                    {monthDetail.cityResults.map(({ city, country, zone, q }) => (
                                        <div
                                            key={city}
                                            className="flex items-center justify-between px-4 py-3 rounded-xl bg-foreground/5"
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-foreground">{city}</span>
                                                <span className="text-xs font-medium text-foreground/50">{country}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-mono font-medium text-foreground/40">
                                                    q={q.toFixed(2)}
                                                </span>
                                                <span
                                                    className="text-sm font-black px-2 py-0.5 rounded-lg shadow-sm"
                                                    style={{ backgroundColor: ZONE_COLORS[zone], color: "#111" }}
                                                >
                                                    {zone}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </>
                    )}
                </div>
            </div>

            {/* Full-width visibility map — shown once a month is selected */}
            {monthDetail && !isLoadingDetail && (
                <div className="mt-6 glass rounded-3xl border border-foreground/10 shadow-xl overflow-hidden">
                    <div className="px-6 pt-5 pb-3 flex items-center justify-between">
                        <div>
                            <div className="text-xs font-bold text-foreground/50 uppercase tracking-widest mb-1">
                                Global Visibility Map
                            </div>
                            <div className="text-base font-bold text-foreground">
                                {HIJRI_MONTHS[monthDetail.hijriMonth - 1]?.en} {monthDetail.hijriYear} AH
                                <span className="ml-3 text-sm font-normal text-foreground/50">
                                    — {monthDetail.newMoonDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                                </span>
                            </div>
                        </div>
                        <div
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border"
                            style={{
                                backgroundColor: `color-mix(in srgb, ${ZONE_COLORS[monthDetail.globalZone]} 15%, transparent)`,
                                borderColor: `color-mix(in srgb, ${ZONE_COLORS[monthDetail.globalZone]} 35%, transparent)`,
                                color: ZONE_COLORS[monthDetail.globalZone],
                            }}
                        >
                            Zone {monthDetail.globalZone}
                        </div>
                    </div>
                    <VisibilityMiniMap year={monthDetail.hijriYear} month={monthDetail.hijriMonth} />
                </div>
            )}
        </div>
    );
}
