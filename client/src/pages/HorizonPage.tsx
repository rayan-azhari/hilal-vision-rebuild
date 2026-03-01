import { useEffect, useRef, useState, useCallback } from "react";
import { SEO } from "@/components/SEO";
import { Compass, MapPin, ChevronDown, Clock, Locate } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useGlobalState } from "@/contexts/GlobalStateContext";
import {
  computeSunMoonAtSunset,
  VISIBILITY_LABELS,
  gregorianToHijri,
  formatTime,
  type SunMoonData,
} from "@/lib/astronomy";
import { trpc } from "@/lib/trpc";
import * as Astronomy from "astronomy-engine";

function drawHorizon(
  canvas: HTMLCanvasElement,
  data: SunMoonData,
  date: Date,
  loc: { lat: number; lng: number },
  dipDeg: number
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;

  // Clear
  ctx.clearRect(0, 0, W, H);

  // Sky gradient (dusk)
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.75);
  sky.addColorStop(0, "#0a0e1a");
  sky.addColorStop(0.4, "#0d1a2e");
  sky.addColorStop(0.7, "#1a1a3e");
  sky.addColorStop(0.85, "#2d1b0e");
  sky.addColorStop(1, "#4a2a0a");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H * 0.75);

  // Ground
  const ground = ctx.createLinearGradient(0, H * 0.75, 0, H);
  ground.addColorStop(0, "#1a1208");
  ground.addColorStop(1, "#0d0a04");
  ctx.fillStyle = ground;
  ctx.fillRect(0, H * 0.75, W, H * 0.25);

  // Apparent horizon line (adjusted for observer elevation / dip)
  ctx.strokeStyle = "rgba(200,160,80,0.3)";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 8]);
  ctx.beginPath();
  ctx.moveTo(0, H * 0.75);
  ctx.lineTo(W, H * 0.75);
  ctx.stroke();
  ctx.setLineDash([]);

  // Geometric 0° reference (only when elevation creates meaningful dip)
  if (dipDeg > 0.05) {
    const altToYLocal = (alt: number) => H * 0.75 - (alt / 45) * H * 0.5;
    const geoY = altToYLocal(dipDeg);
    ctx.strokeStyle = "rgba(150,150,150,0.25)";
    ctx.lineWidth = 0.5;
    ctx.setLineDash([2, 10]);
    ctx.beginPath();
    ctx.moveTo(0, geoY);
    ctx.lineTo(W, geoY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = "9px Inter, sans-serif";
    ctx.fillStyle = "rgba(150,150,150,0.4)";
    ctx.textAlign = "left";
    ctx.fillText("geometric 0°", 4, geoY - 2);
  }

  // Stars
  const rng = (seed: number) => {
    let s = seed;
    return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
  };
  const rand = rng(42);
  for (let i = 0; i < 80; i++) {
    const sx = rand() * W;
    const sy = rand() * H * 0.65;
    const sr = rand() * 1.2 + 0.3;
    const sa = rand() * 0.6 + 0.2;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${sa})`;
    ctx.fill();
  }

  // Azimuth range: show ±60° around west (270°)
  const centerAz = 270;
  const viewRange = 120;
  const azToX = (az: number) => {
    const diff = ((az - centerAz + 180) % 360) - 180;
    return W / 2 + (diff / viewRange) * W;
  };
  const altToY = (alt: number) => H * 0.75 - (alt / 45) * H * 0.5;

  // Azimuth labels
  const azLabels = [210, 240, 270, 300, 330];
  const dirLabels: Record<number, string> = { 210: "SSW", 240: "WSW", 270: "W", 300: "WNW", 330: "NNW" };
  ctx.font = "11px Inter, sans-serif";
  ctx.fillStyle = "rgba(200,160,80,0.5)";
  ctx.textAlign = "center";
  azLabels.forEach(az => {
    const x = azToX(az);
    ctx.fillText(dirLabels[az] ?? `${az}°`, x, H * 0.75 + 18);
    ctx.strokeStyle = "rgba(200,160,80,0.1)";
    ctx.lineWidth = 0.5;
    ctx.setLineDash([2, 6]);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H * 0.75);
    ctx.stroke();
    ctx.setLineDash([]);
  });

  // Altitude grid lines
  [5, 10, 15, 20, 30].forEach(alt => {
    const y = altToY(alt);
    if (y < 0 || y > H * 0.75) return;
    ctx.strokeStyle = "rgba(200,160,80,0.08)";
    ctx.lineWidth = 0.5;
    ctx.setLineDash([2, 8]);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = "9px Inter, sans-serif";
    ctx.fillStyle = "rgba(200,160,80,0.35)";
    ctx.textAlign = "left";
    ctx.fillText(`${alt}°`, 4, y - 2);
  });

  // Sun glow / sunset position
  const sunX = azToX(data.sunAz);
  const sunY = altToY(data.sunAlt);

  // Sunset glow on horizon
  const sunGlow = ctx.createRadialGradient(sunX, H * 0.75, 0, sunX, H * 0.75, 120);
  sunGlow.addColorStop(0, "rgba(255,120,0,0.35)");
  sunGlow.addColorStop(0.5, "rgba(255,80,0,0.12)");
  sunGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = sunGlow;
  ctx.fillRect(0, 0, W, H * 0.75);

  // Sun disc (below horizon or just setting)
  if (sunY > 0 && sunY < H * 0.75) {
    const sunDisc = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 20);
    sunDisc.addColorStop(0, "rgba(255,200,50,0.9)");
    sunDisc.addColorStop(0.3, "rgba(255,120,0,0.7)");
    sunDisc.addColorStop(1, "rgba(255,80,0,0)");
    ctx.fillStyle = sunDisc;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 20, 0, Math.PI * 2);
    ctx.fill();
  }

  // Sun label
  ctx.font = "bold 11px Inter, sans-serif";
  ctx.fillStyle = "rgba(255,160,50,0.8)";
  ctx.textAlign = "center";
  ctx.fillText("☀ Sun", sunX, Math.min(sunY - 12, H * 0.72));

  // Moon position
  const moonX = azToX(data.moonAz);
  const moonY = altToY(data.moonAlt);

  if (moonY > 0 && moonY < H * 0.75 && moonX > 0 && moonX < W) {
    // Moon glow
    const moonGlow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 30);
    moonGlow.addColorStop(0, "rgba(200,180,100,0.5)");
    moonGlow.addColorStop(0.4, "rgba(200,180,100,0.2)");
    moonGlow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 30, 0, Math.PI * 2);
    ctx.fill();

    // Moon crescent
    const mr = 12;
    ctx.fillStyle = "rgba(40,35,25,0.9)";
    ctx.beginPath();
    ctx.arc(moonX, moonY, mr, 0, Math.PI * 2);
    ctx.fill();

    // Lit portion (simple crescent)
    const phaseNormal = Astronomy.MoonPhase(date) / 360.0;
    const isWaxing = phaseNormal <= 0.5;
    const k = phaseNormal * 2;
    const rx = Math.abs(mr * Math.cos(Math.PI * k));
    const baseSweep = isWaxing ? 1 : 0;
    let termSweep;
    if (phaseNormal <= 0.25) termSweep = 0;
    else if (phaseNormal <= 0.5) termSweep = 1;
    else if (phaseNormal <= 0.75) termSweep = 0;
    else termSweep = 1;

    ctx.fillStyle = "rgba(220,200,120,0.9)";
    ctx.beginPath();
    ctx.moveTo(moonX, moonY - mr);
    ctx.arc(moonX, moonY, mr, -Math.PI / 2, Math.PI / 2, false);
    ctx.ellipse(moonX, moonY, rx < 0.5 ? 0.5 : rx, mr, 0, Math.PI / 2, -Math.PI / 2, termSweep === 0);
    ctx.closePath();
    ctx.fill();

    // Moon label
    ctx.font = "bold 11px Inter, sans-serif";
    ctx.fillStyle = "rgba(220,200,120,0.9)";
    ctx.textAlign = "center";
    ctx.fillText("☽ Moon", moonX, moonY - mr - 6);

    // Altitude label
    ctx.font = "10px Inter, sans-serif";
    ctx.fillStyle = "rgba(220,200,120,0.6)";
    ctx.fillText(`${data.moonAlt.toFixed(1)}°`, moonX, moonY + mr + 14);
  } else {
    // Moon below horizon indicator
    const indicatorX = Math.max(20, Math.min(W - 20, moonX));
    ctx.font = "11px Inter, sans-serif";
    ctx.fillStyle = "rgba(200,180,100,0.4)";
    ctx.textAlign = "center";
    ctx.fillText("☽ Moon below horizon", W / 2, H * 0.75 - 10);
  }

  // Arc of vision line
  if (data.moonAlt > 0 && data.sunAlt < 5) {
    ctx.strokeStyle = "rgba(200,160,80,0.3)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.moveTo(sunX, altToY(data.sunAlt));
    ctx.lineTo(moonX, moonY);
    ctx.stroke();
    ctx.setLineDash([]);

    // ARCV label
    const midX = (sunX + moonX) / 2;
    const midY = (altToY(data.sunAlt) + moonY) / 2;
    ctx.font = "10px Inter, sans-serif";
    ctx.fillStyle = "rgba(200,160,80,0.6)";
    ctx.textAlign = "center";
    ctx.fillText(`ARCV: ${data.arcv.toFixed(1)}°`, midX, midY - 8);
  }

  // Compass rose (bottom right)
  const cx2 = W - 40;
  const cy2 = H - 30;
  ctx.font = "bold 10px Inter, sans-serif";
  ctx.fillStyle = "rgba(200,160,80,0.5)";
  ctx.textAlign = "center";
  ctx.fillText("W", cx2, cy2);
  ctx.fillStyle = "rgba(200,160,80,0.3)";
  ctx.fillText("N", cx2 - 14, cy2);
  ctx.fillText("S", cx2 + 14, cy2);
}

export default function HorizonPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { date, location: loc } = useGlobalState();
  const [data, setData] = useState<SunMoonData | null>(null);

  // Fetch real terrain elevation from Open-Meteo DEM API
  const demQuery = trpc.dem.getDem.useQuery(
    { lat: loc.lat, lng: loc.lng },
    { staleTime: Infinity }
  );
  const elevation = demQuery.data?.elevation ?? 0;
  const dipDeg = (1.76 * Math.sqrt(elevation)) / 60; // arcmin → degrees

  // Set document title
  useEffect(() => {
    // document.title managed by <SEO> component
  }, [loc.name]);

  useEffect(() => {
    const d = computeSunMoonAtSunset(date, { ...loc, elevation });
    setData(d);
  }, [date, loc.lat, loc.lng, elevation]);

  useEffect(() => {
    if (!canvasRef.current || !data) return;
    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    drawHorizon(canvas, data, date, loc, dipDeg);
  }, [data, date, dipDeg]);

  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !data) return;
      const canvas = canvasRef.current;
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      drawHorizon(canvas, data, date, loc, dipDeg);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [data, date, dipDeg]);

  const hijri = gregorianToHijri(date);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--space)" }}>
      <SEO
        title={`Horizon View - ${loc.name}`}
        description={`Local horizon simulator for ${loc.name} showing moon and sun positions at sunset for crescent sighting.`}
        path="/horizon"
      />
      {/* Header */}
      <PageHeader
        icon={<Compass />}
        title="Local Horizon View"
        subtitle="Moon & sun positions at sunset · Sighting window simulator"
      >
        <div className="text-xs font-arabic text-right" style={{ color: "var(--gold-dim)" }}>
          {hijri.day} {hijri.monthNameArabic} {hijri.year} هـ
        </div>
      </PageHeader>

      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
        {/* Canvas */}
        <div className="relative flex-1 min-h-[50vh] lg:min-h-0">
          <canvas
            ref={canvasRef}
            role="img"
            aria-label="Horizon view showing sun and moon positions above the local horizon"
            className="absolute inset-0 w-full h-full"
            style={{ display: "block" }}
          />
          {/* Location badge */}
          <div
            className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs"
            style={{
              background: "color-mix(in oklch, var(--space-mid) 90%, transparent)",
              border: "1px solid color-mix(in oklch, var(--gold) 20%, transparent)",
              backdropFilter: "blur(8px)",
              color: "var(--gold)",
            }}
          >
            <MapPin className="w-3 h-3" />
            {loc.name} · {loc.lat.toFixed(2)}°, {loc.lng.toFixed(2)}°
          </div>
        </div>

        {/* Side panel */}
        <div
          className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l overflow-y-auto relative z-50"
          style={{
            borderColor: "color-mix(in oklch, var(--gold) 12%, transparent)",
            background: "var(--space-mid)",
          }}
        >
          <div className="p-5 space-y-5">
            {/* Data readout */}
            {data && (
              <div
                className="breezy-card p-4 space-y-2.5 animate-breezy-enter"
                style={{ animationDelay: "150ms" }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Visibility</span>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: `color-mix(in oklch, ${data.visibility === "A" ? "#4ade80" :
                        data.visibility === "B" ? "#facc15" :
                          data.visibility === "C" ? "#fb923c" : "#f87171"
                        } 15%, transparent)`,
                      color: data.visibility === "A" ? "#4ade80" :
                        data.visibility === "B" ? "#facc15" :
                          data.visibility === "C" ? "#fb923c" : "#f87171",
                    }}
                  >
                    Zone {data.visibility}
                  </span>
                </div>

                {[
                  { label: "Moon Altitude", value: `${data.moonAlt.toFixed(2)}°` },
                  { label: "Moon Azimuth", value: `${data.moonAz.toFixed(1)}°` },
                  { label: "Sun Altitude", value: `${data.sunAlt.toFixed(2)}°` },
                  { label: "Arc of Vision", value: `${data.arcv.toFixed(2)}°` },
                  { label: "Elongation", value: `${data.elongation.toFixed(2)}°` },
                  { label: "Crescent Width", value: `${data.crescent.w.toFixed(3)}'` },
                  { label: "Yallop q", value: data.qValue.toFixed(4) },
                  { label: "Terrain Elevation", value: elevation > 0 ? `${elevation.toFixed(0)} m` : "—" },
                  { label: "Horizon Dip", value: dipDeg > 0.01 ? `${(dipDeg * 60).toFixed(1)}'` : "—" },
                  { label: "Sunset", value: formatTime(data.sunset) },
                  { label: "Maghrib", value: formatTime(data.maghrib) },
                  { label: "Moonset", value: formatTime(data.moonset) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{label}</span>
                    <span className="text-xs font-mono" style={{ color: "var(--foreground)" }}>{value}</span>
                  </div>
                ))}

                <div
                  className="pt-2 mt-1 border-t text-xs"
                  style={{
                    borderColor: "color-mix(in oklch, var(--gold) 10%, transparent)",
                    color: "var(--muted-foreground)",
                  }}
                >
                  {VISIBILITY_LABELS[data.visibility].desc}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
