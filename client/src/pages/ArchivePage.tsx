import { useState, useEffect, useRef } from "react";
import { SEO } from "@/components/SEO";
import { Archive, ChevronLeft, ChevronRight, Info, Download } from "lucide-react";
import { useProTier } from "@/contexts/ProTierContext";
import ProGate from "@/components/ProGate";
import { PageHeader } from "@/components/PageHeader";
import {
  hijriToGregorian,
  computeSunMoonAtSunset,
  HIJRI_MONTHS,
  MAJOR_CITIES,
  type VisibilityZone,
} from "@/lib/astronomy";

const ZONE_COLORS: Record<VisibilityZone, string> = {
  A: "#4ade80",
  B: "#facc15",
  C: "#fb923c",
  D: "#f87171",
  E: "#6b7280",
  F: "#1f2937",
};

const ZONE_LABELS: Record<VisibilityZone, string> = {
  A: "Easily Visible",
  B: "Visible",
  C: "Optical Aid",
  D: "Telescope Only",
  E: "Not Visible",
  F: "Below Horizon",
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

function computeMonthSummary(year: number, month: number): MonthSummary {
  const newMoonDate = hijriToGregorian(year, month, 1);

  const cityResults = MAJOR_CITIES.slice(0, 12).map(city => {
    const data = computeSunMoonAtSunset(newMoonDate, city);
    return { city: city.name, country: city.country, zone: data.visibility, q: data.qValue };
  });

  // Global zone: majority vote
  const zoneCounts: Record<string, number> = {};
  cityResults.forEach(r => { zoneCounts[r.zone] = (zoneCounts[r.zone] ?? 0) + 1; });
  const globalZone = (Object.entries(zoneCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "E") as VisibilityZone;

  return { hijriYear: year, hijriMonth: month, newMoonDate, cityResults, globalZone };
}

import { trpc } from "@/lib/trpc";

function VisibilityMiniMap({ year, month }: { year: number; month: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef = useRef<Worker | null>(null);

  // Send computation to worker when year/month changes
  useEffect(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(
        new URL("../workers/archiveMiniMap.worker.ts", import.meta.url),
        { type: "module" }
      );
    }

    const worker = workerRef.current;
    const dateTs = hijriToGregorian(year, month, 1).getTime();
    worker.postMessage({ dateTs });

    worker.onmessage = (e: MessageEvent) => {
      const { pixels, width, height } = e.data;
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.putImageData(new ImageData(pixels, width, height), 0, 0);
    };
  }, [year, month]);

  // Terminate worker on unmount
  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  return <canvas ref={canvasRef} role="img" aria-label={`World visibility map for ${year} AH month ${month}`} className="w-full rounded-lg" style={{ height: "80px", imageRendering: "pixelated" }} />;
}

export default function ArchivePage() {
  const { isPremium, setShowUpgradeModal } = useProTier();
  const [selectedYear, setSelectedYear] = useState(1465);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [monthDetail, setMonthDetail] = useState<MonthSummary | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Fetch ICOP data from static JSON file (bypasses serverless function)
  const [icopData, setIcopData] = useState<any[] | null>(null);
  const [isLoadingIcop, setIsLoadingIcop] = useState(false);
  const icopCacheRef = useRef<any[] | null>(null);

  useEffect(() => {
    // document.title managed by <SEO> component
  }, [selectedYear]);

  const years = Array.from({ length: 28 }, (_, i) => 1438 + i);

  useEffect(() => {
    if (selectedMonth === null) return;

    // If already cached, filter from cache
    if (icopCacheRef.current) {
      const monthData = icopCacheRef.current.find(
        (d: any) => d.hijriYear === selectedYear && d.hijriMonth === selectedMonth
      );
      setIcopData(monthData?.observations ?? null);
      return;
    }

    // Fetch the static JSON once
    setIsLoadingIcop(true);
    fetch("/icop-history.json")
      .then((r) => r.json())
      .then((allData: any[]) => {
        icopCacheRef.current = allData;
        const monthData = allData.find(
          (d: any) => d.hijriYear === selectedYear && d.hijriMonth === selectedMonth
        );
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
    const rows = icopData.map((d: any) => [d.city, d.country, d.result, d.opticalAid]);
    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.map((val: string) => `"${val}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `icop_observations_${selectedYear}_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportComputedToCSV = () => {
    if (!monthDetail || monthDetail.cityResults.length === 0) return;
    const headers = ["City", "Country", "Zone", "Q-Value"];
    const rows = monthDetail.cityResults.map(d => [d.city, d.country, d.zone, d.q.toFixed(4)]);
    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.map((val: string) => `"${val}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `computed_visibility_${selectedYear}_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = (data: any, prefix: string) => {
    if (!data) return;
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${prefix}_${selectedYear}_${selectedMonth}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--space)" }}>
      <SEO
        title={`Archive - ${selectedYear} AH`}
        description={`Crescent visibility archive for ${selectedYear} AH. Browse historical moon sighting data for all 12 Islamic months from 1438 to 1465 AH.`}
        path="/archive"
      />
      {/* Header */}
      <PageHeader
        icon={<Archive />}
        title="Crescent Visibility Archive"
        subtitle="1438–1465 AH · All 12 Islamic months"
      />

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Year selector + month grid */}
          <div className="lg:col-span-2 space-y-6">
            {/* Year navigation */}
            <div className="breezy-card p-5 animate-breezy-enter">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setSelectedYear((y: number) => Math.max(1438, y - 1))}
                  disabled={selectedYear <= 1438}
                  className="p-2 rounded-lg disabled:opacity-30 transition-colors hover:bg-white/5"
                >
                  <ChevronLeft className="w-5 h-5" style={{ color: "var(--gold-dim)" }} />
                </button>
                <div className="text-center">
                  <div
                    className="text-2xl font-bold"
                    style={{ fontFamily: "Cinzel, serif", color: "var(--gold)" }}
                  >
                    {selectedYear} AH
                  </div>
                  <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    Hijri Year
                  </div>
                </div>
                <button
                  onClick={() => setSelectedYear((y: number) => Math.min(1465, y + 1))}
                  disabled={selectedYear >= 1465}
                  className="p-2 rounded-lg disabled:opacity-30 transition-colors hover:bg-white/5"
                >
                  <ChevronRight className="w-5 h-5" style={{ color: "var(--gold-dim)" }} />
                </button>
              </div>

              {/* Quick year selector */}
              <div className="flex flex-wrap gap-1.5 justify-center">
                {years.map(y => {
                  const isFree = y >= 1463; // Free users get 3 most recent years
                  const isLocked = !isPremium && !isFree;
                  return (
                    <button
                      key={y}
                      onClick={() => {
                        if (isLocked) { setShowUpgradeModal(true); return; }
                        setSelectedYear(y); setSelectedMonth(null); setMonthDetail(null);
                      }}
                      title={isLocked ? "Years before 1463 AH · Unlock with Pro" : undefined}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono transition-all"
                      style={{
                        background: y === selectedYear
                          ? "color-mix(in oklch, var(--gold) 20%, transparent)"
                          : isLocked ? "var(--space-mid)" : "var(--space-light)",
                        border: y === selectedYear
                          ? "1px solid color-mix(in oklch, var(--gold) 40%, transparent)"
                          : "1px solid transparent",
                        color: y === selectedYear ? "var(--gold)" : isLocked ? "var(--muted-foreground)" : "var(--muted-foreground)",
                        opacity: isLocked ? 0.4 : 1,
                      }}
                    >
                      {y}
                      {isLocked && (
                        <>
                          <span aria-hidden="true"> 🔒</span>
                          <span className="sr-only"> (Pro required)</span>
                        </>
                      )}
                    </button>
                  );
                })}
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
                    className="rounded-xl p-4 text-left transition-all duration-200 hover:-translate-y-0.5"
                    style={{
                      background: isSelected
                        ? "color-mix(in oklch, var(--gold) 10%, var(--space-mid))"
                        : "var(--space-mid)",
                      border: isSelected
                        ? "1px solid color-mix(in oklch, var(--gold) 35%, transparent)"
                        : "1px solid color-mix(in oklch, var(--gold) 8%, transparent)",
                      boxShadow: isSelected
                        ? "0 4px 20px color-mix(in oklch, var(--gold) 10%, transparent)"
                        : "none",
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="text-xs font-bold px-1.5 py-0.5 rounded"
                        style={{
                          background: "var(--space-light)",
                          color: "var(--muted-foreground)",
                        }}
                      >
                        {month.short}
                      </span>
                      <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                        {monthNum.toString().padStart(2, "0")}
                      </span>
                    </div>
                    <div className="text-sm font-medium mb-0.5" style={{ color: "var(--foreground)" }}>
                      {month.en}
                    </div>
                    <div className="text-xs font-arabic" style={{ color: "var(--gold-dim)" }}>
                      {month.ar}
                    </div>
                    <div className="mt-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {hijriToGregorian(selectedYear, monthNum, 1).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric"
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
              <div
                className="breezy-card p-6 text-center animate-breezy-enter"
                style={{ animationDelay: "50ms" }}
              >
                <div className="text-3xl mb-3">☽</div>
                <div className="text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                  Select a Month
                </div>
                <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  Click any month to see crescent visibility details for major cities worldwide
                </div>
              </div>
            )}

            {(isLoadingDetail || isLoadingIcop) && (
              <div
                className="breezy-card p-6 flex items-center justify-center animate-breezy-enter"
                style={{ minHeight: "200px", animationDelay: "100ms" }}
              >
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }}
                  />
                  <span className="text-xs" style={{ color: "var(--gold)" }}>Loading…</span>
                </div>
              </div>
            )}

            {monthDetail && !isLoadingDetail && (
              <>
                <div
                  className="breezy-card p-5 animate-breezy-enter"
                  style={{ animationDelay: "50ms" }}
                >
                  <div className="text-xs mb-2" style={{ color: "var(--muted-foreground)" }}>Month Details</div>
                  <div
                    className="text-lg font-bold mb-0.5"
                    style={{ fontFamily: "Cinzel, serif", color: "var(--gold)" }}
                  >
                    {HIJRI_MONTHS[monthDetail.hijriMonth - 1]?.en}
                  </div>
                  <div className="text-sm font-arabic mb-3" style={{ color: "var(--gold-dim)" }}>
                    {HIJRI_MONTHS[monthDetail.hijriMonth - 1]?.ar}
                  </div>
                  <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    New Moon: {monthDetail.newMoonDate.toLocaleDateString("en-GB", {
                      weekday: "long", day: "numeric", month: "long", year: "numeric"
                    })}
                  </div>
                  <div
                    className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{
                      background: `color-mix(in oklch, ${ZONE_COLORS[monthDetail.globalZone]} 10%, transparent)`,
                      border: `1px solid color-mix(in oklch, ${ZONE_COLORS[monthDetail.globalZone]} 25%, transparent)`,
                    }}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ background: ZONE_COLORS[monthDetail.globalZone] }}
                    />
                    <span className="text-xs font-medium" style={{ color: ZONE_COLORS[monthDetail.globalZone] }}>
                      Global: {ZONE_LABELS[monthDetail.globalZone]}
                    </span>
                  </div>
                </div>

                {/* ICOP Actual Observations */}
                {icopData && icopData.length > 0 && (
                  <div
                    className="breezy-card p-5 animate-breezy-enter"
                    style={{ animationDelay: "100ms" }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex flex-col">
                        <div className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
                          Actual Observations (ICOP)
                        </div>
                        <span className="text-xs" style={{ color: "var(--gold-dim)" }}>
                          {icopData.length} records
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={exportIcopToCSV} className="p-1 rounded hover:bg-white/5 transition-colors" title="Export to CSV">
                          <span className="text-[10px] font-mono mr-1" style={{ color: "var(--gold-dim)" }}>CSV</span><Download className="w-3 h-3 inline pb-0.5" style={{ color: "var(--gold-dim)" }} />
                        </button>
                        <button onClick={() => exportToJSON(icopData, 'icop_observations')} className="p-1 rounded hover:bg-white/5 transition-colors" title="Export to JSON">
                          <span className="text-[10px] font-mono mr-1" style={{ color: "var(--gold-dim)" }}>JSON</span><Download className="w-3 h-3 inline pb-0.5" style={{ color: "var(--gold-dim)" }} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                      {icopData.map((obs: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between px-3 py-2 rounded-lg"
                          style={{
                            background: "var(--space-light)",
                            borderLeft: `3px solid ${obs.result === "Seen" ? "var(--accent)" : "var(--destructive)"}`
                          }}
                        >
                          <div>
                            <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{obs.city}</span>
                            <span className="text-xs ml-1" style={{ color: "var(--muted-foreground)" }}>{obs.country}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>
                              {obs.opticalAid === "Unknown (Parsed)" ? "Reported" : obs.opticalAid}
                            </span>
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ background: obs.result === "Seen" ? "var(--accent)" : "var(--destructive)" }}
                            />
                            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: obs.result === "Seen" ? "var(--accent)" : "var(--destructive)" }}>
                              {obs.result}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Computed City Visibility */}
                <div
                  className="breezy-card p-5 animate-breezy-enter"
                  style={{ animationDelay: "120ms" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
                      Computed City Visibility (Theoretical)
                    </div>
                    <div className="flex gap-2">
                      <button onClick={exportComputedToCSV} className="p-1 rounded hover:bg-white/5 transition-colors" title="Export to CSV">
                        <span className="text-[10px] font-mono mr-1" style={{ color: "var(--gold-dim)" }}>CSV</span><Download className="w-3 h-3 inline pb-0.5" style={{ color: "var(--gold-dim)" }} />
                      </button>
                      <button onClick={() => exportToJSON(monthDetail.cityResults, 'computed_visibility')} className="p-1 rounded hover:bg-white/5 transition-colors" title="Export to JSON">
                        <span className="text-[10px] font-mono mr-1" style={{ color: "var(--gold-dim)" }}>JSON</span><Download className="w-3 h-3 inline pb-0.5" style={{ color: "var(--gold-dim)" }} />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                    {monthDetail.cityResults.map(({ city, country, zone, q }) => (
                      <div
                        key={city}
                        className="flex items-center justify-between px-3 py-2 rounded-lg"
                        style={{ background: "var(--space-light)" }}
                      >
                        <div>
                          <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{city}</span>
                          <span className="text-xs ml-1" style={{ color: "var(--muted-foreground)" }}>{country}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>
                            q={q.toFixed(2)}
                          </span>
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ background: ZONE_COLORS[zone] }}
                          />
                          <span className="text-xs font-bold" style={{ color: ZONE_COLORS[zone] }}>
                            {zone}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Legend */}
                <div
                  className="breezy-card p-4 animate-breezy-enter"
                  style={{ animationDelay: "150ms" }}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <Info className="w-3.5 h-3.5" style={{ color: "var(--gold-dim)" }} />
                    <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>Zone Legend</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {(["A", "B", "C", "D", "E"] as VisibilityZone[]).map(z => (
                      <div key={z} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-sm" style={{ background: ZONE_COLORS[z] }} />
                        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                          {z}: {ZONE_LABELS[z]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
