import { useState, useEffect, useRef } from "react";
import { Archive, ChevronLeft, ChevronRight, Info } from "lucide-react";
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

function VisibilityMiniMap({ year, month }: { year: number; month: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = canvas.width = 200;
    const H = canvas.height = 100;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#0a0e1a";
    ctx.fillRect(0, 0, W, H);

    const date = hijriToGregorian(year, month, 1);
    const resolution = 8;

    for (let lat = -80; lat <= 80; lat += resolution) {
      for (let lng = -180; lng <= 180; lng += resolution) {
        const data = computeSunMoonAtSunset(date, { lat, lng });
        const x = ((lng + 180) / 360) * W;
        const y = ((90 - lat) / 180) * H;
        const pw = (resolution / 360) * W + 1;
        const ph = (resolution / 180) * H + 1;

        ctx.fillStyle = ZONE_COLORS[data.visibility] + "99";
        ctx.fillRect(x, y, pw, ph);
      }
    }

    // Simple continent outlines (very simplified)
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 0.5;
  }, [year, month]);

  return <canvas ref={canvasRef} className="w-full rounded-lg" style={{ height: "80px", imageRendering: "pixelated" }} />;
}

export default function ArchivePage() {
  const [selectedYear, setSelectedYear] = useState(1447);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [monthDetail, setMonthDetail] = useState<MonthSummary | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const years = Array.from({ length: 28 }, (_, i) => 1438 + i);

  const handleMonthClick = (month: number) => {
    setSelectedMonth(month);
    setIsLoadingDetail(true);
    setTimeout(() => {
      const summary = computeMonthSummary(selectedYear, month);
      setMonthDetail(summary);
      setIsLoadingDetail(false);
    }, 50);
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--space)" }}>
      {/* Header */}
      <div
        className="border-b px-6 py-4 flex items-center justify-between"
        style={{ borderColor: "color-mix(in oklch, var(--gold) 12%, transparent)", background: "var(--space-mid)" }}
      >
        <div className="flex items-center gap-3">
          <Archive className="w-5 h-5" style={{ color: "var(--gold)" }} />
          <div>
            <h1 className="text-base font-semibold" style={{ fontFamily: "Cinzel, serif", color: "var(--foreground)" }}>
              Crescent Visibility Archive
            </h1>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              1438–1465 AH · All 12 Islamic months
            </p>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Year selector + month grid */}
          <div className="lg:col-span-2 space-y-6">
            {/* Year navigation */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: "var(--space-mid)",
                border: "1px solid color-mix(in oklch, var(--gold) 12%, transparent)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setSelectedYear(y => Math.max(1438, y - 1))}
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
                  onClick={() => setSelectedYear(y => Math.min(1465, y + 1))}
                  disabled={selectedYear >= 1465}
                  className="p-2 rounded-lg disabled:opacity-30 transition-colors hover:bg-white/5"
                >
                  <ChevronRight className="w-5 h-5" style={{ color: "var(--gold-dim)" }} />
                </button>
              </div>

              {/* Quick year selector */}
              <div className="flex flex-wrap gap-1.5 justify-center">
                {years.map(y => (
                  <button
                    key={y}
                    onClick={() => { setSelectedYear(y); setSelectedMonth(null); setMonthDetail(null); }}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono transition-all"
                    style={{
                      background: y === selectedYear
                        ? "color-mix(in oklch, var(--gold) 20%, transparent)"
                        : "var(--space-light)",
                      border: y === selectedYear
                        ? "1px solid color-mix(in oklch, var(--gold) 40%, transparent)"
                        : "1px solid transparent",
                      color: y === selectedYear ? "var(--gold)" : "var(--muted-foreground)",
                    }}
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
                className="rounded-2xl p-6 text-center"
                style={{
                  background: "var(--space-mid)",
                  border: "1px solid color-mix(in oklch, var(--gold) 10%, transparent)",
                }}
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

            {isLoadingDetail && (
              <div
                className="rounded-2xl p-6 flex items-center justify-center"
                style={{
                  background: "var(--space-mid)",
                  border: "1px solid color-mix(in oklch, var(--gold) 10%, transparent)",
                  minHeight: "200px",
                }}
              >
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }}
                  />
                  <span className="text-xs" style={{ color: "var(--gold)" }}>Computing…</span>
                </div>
              </div>
            )}

            {monthDetail && !isLoadingDetail && (
              <>
                <div
                  className="rounded-2xl p-5"
                  style={{
                    background: "var(--space-mid)",
                    border: "1px solid color-mix(in oklch, var(--gold) 15%, transparent)",
                  }}
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

                {/* City results */}
                <div
                  className="rounded-2xl p-5"
                  style={{
                    background: "var(--space-mid)",
                    border: "1px solid color-mix(in oklch, var(--gold) 10%, transparent)",
                  }}
                >
                  <div className="text-xs font-medium mb-3" style={{ color: "var(--muted-foreground)" }}>
                    City Visibility
                  </div>
                  <div className="space-y-1.5">
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
                  className="rounded-2xl p-4"
                  style={{
                    background: "var(--space-mid)",
                    border: "1px solid color-mix(in oklch, var(--gold) 8%, transparent)",
                  }}
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
