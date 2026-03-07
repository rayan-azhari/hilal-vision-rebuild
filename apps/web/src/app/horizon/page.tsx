"use client";

import { useEffect, useRef, useState } from "react";
import { Compass, MapPin } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import {
    computeSunMoonAtSunset,
    gregorianToHijri,
    formatTime,
    type SunMoonData,
    VISIBILITY_LABELS,
} from "@hilal/astronomy";
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

    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width / dpr;
    const H = canvas.height / dpr;
    const s = Math.max(0.6, Math.min(1.5, W / 600));

    // Clear buffer
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Sky gradient (dusk)
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.75);
    sky.addColorStop(0, "#020617"); // slate-950
    sky.addColorStop(0.4, "#0f172a"); // slate-900
    sky.addColorStop(0.7, "#1e1b4b"); // indigo-950
    sky.addColorStop(0.85, "#451a03"); // orange-950
    sky.addColorStop(1, "#7c2d12"); // orange-900
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H * 0.75);

    // Ground
    const ground = ctx.createLinearGradient(0, H * 0.75, 0, H);
    ground.addColorStop(0, "#050505");
    ground.addColorStop(1, "#000000");
    ctx.fillStyle = ground;
    ctx.fillRect(0, H * 0.75, W, H * 0.25);

    // Apparent horizon line
    ctx.strokeStyle = "rgba(251, 146, 60, 0.4)"; // orange-400
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
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 0.5;
        ctx.setLineDash([2, 10]);
        ctx.beginPath();
        ctx.moveTo(0, geoY);
        ctx.lineTo(W, geoY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = `${Math.round(10 * s)}px sans-serif`;
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.textAlign = "left";
        ctx.fillText("Geometric 0°", 8, geoY - 4);
    }

    // Stars
    const rng = (seed: number) => {
        let rs = seed;
        return () => { rs = (rs * 1664525 + 1013904223) & 0xffffffff; return (rs >>> 0) / 0xffffffff; };
    };
    const rand = rng(42);
    for (let i = 0; i < 100; i++) {
        const sx = rand() * W;
        const sy = rand() * H * 0.65;
        const sr = rand() * 1.5 + 0.5;
        const sa = rand() * 0.7 + 0.1;
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
    ctx.font = `bold ${Math.round(12 * s)}px sans-serif`;
    ctx.fillStyle = "rgba(251, 146, 60, 0.6)";
    ctx.textAlign = "center";
    azLabels.forEach((az) => {
        const x = azToX(az);
        ctx.fillText(dirLabels[az] ?? `${az}°`, x, H * 0.75 + Math.round(20 * s));
        ctx.strokeStyle = "rgba(251, 146, 60, 0.15)";
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 6]);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H * 0.75);
        ctx.stroke();
        ctx.setLineDash([]);
    });

    // Altitude grid lines
    [5, 10, 15, 20, 30].forEach((alt) => {
        const y = altToY(alt);
        if (y < 0 || y > H * 0.75) return;
        ctx.strokeStyle = "rgba(251, 146, 60, 0.1)";
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 8]);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = `bold ${Math.round(10 * s)}px sans-serif`;
        ctx.fillStyle = "rgba(251, 146, 60, 0.4)";
        ctx.textAlign = "left";
        ctx.fillText(`${alt}°`, 8, y - 4);
    });

    // Sun glow / sunset position
    const sunX = azToX(data.sunAz);
    const sunY = altToY(data.sunAlt);

    // Sunset glow on horizon
    const sunGlow = ctx.createRadialGradient(sunX, H * 0.75, 0, sunX, H * 0.75, Math.round(150 * s));
    sunGlow.addColorStop(0, "rgba(249, 115, 22, 0.4)");
    sunGlow.addColorStop(0.5, "rgba(249, 115, 22, 0.1)");
    sunGlow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = sunGlow;
    ctx.fillRect(0, 0, W, H * 0.75);

    // Sun disc (below horizon or just setting)
    if (sunY > 0 && sunY < H * 0.75) {
        const sunR = Math.round(24 * s);
        const sunDisc = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR);
        sunDisc.addColorStop(0, "rgba(253, 224, 71, 0.9)");
        sunDisc.addColorStop(0.3, "rgba(249, 115, 22, 0.8)");
        sunDisc.addColorStop(1, "rgba(249, 115, 22, 0)");
        ctx.fillStyle = sunDisc;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
        ctx.fill();
    }

    // Sun label
    ctx.font = `bold ${Math.round(12 * s)}px sans-serif`;
    ctx.fillStyle = "rgba(253, 224, 71, 0.9)";
    ctx.textAlign = "center";
    ctx.fillText("☀ Sun", sunX, Math.min(sunY - 16, H * 0.72));

    // Moon position
    const moonX = azToX(data.moonAz);
    const moonY = altToY(data.moonAlt);

    if (moonY > 0 && moonY < H * 0.75 && moonX > 0 && moonX < W) {
        // Moon glow
        const moonGlowR = Math.round(36 * s);
        const moonGlow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonGlowR);
        moonGlow.addColorStop(0, "rgba(253, 230, 138, 0.3)");
        moonGlow.addColorStop(0.4, "rgba(253, 230, 138, 0.1)");
        moonGlow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = moonGlow;
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonGlowR, 0, Math.PI * 2);
        ctx.fill();

        // Moon crescent rendering
        const mr = Math.round(14 * s);
        ctx.fillStyle = "rgba(15, 23, 42, 0.9)"; // dark sky color behind crescent
        ctx.beginPath();
        ctx.arc(moonX, moonY, mr, 0, Math.PI * 2);
        ctx.fill();

        // Lit portion
        const phaseNormal = Astronomy.MoonPhase(date) / 360.0;
        const isWaxing = phaseNormal <= 0.5;
        const k = phaseNormal * 2;
        const rx = Math.abs(mr * Math.cos(Math.PI * k));
        let termSweep;
        if (phaseNormal <= 0.25) termSweep = 0;
        else if (phaseNormal <= 0.5) termSweep = 1;
        else if (phaseNormal <= 0.75) termSweep = 0;
        else termSweep = 1;

        ctx.fillStyle = "rgba(253, 230, 138, 0.95)"; // yellow-200
        ctx.beginPath();
        ctx.moveTo(moonX, moonY - mr);
        ctx.arc(moonX, moonY, mr, -Math.PI / 2, Math.PI / 2, false);
        ctx.ellipse(moonX, moonY, rx < 0.5 ? 0.5 : rx, mr, 0, Math.PI / 2, -Math.PI / 2, termSweep === 0);
        ctx.closePath();
        ctx.fill();

        // Moon label
        ctx.font = `bold ${Math.round(12 * s)}px sans-serif`;
        ctx.fillStyle = "rgba(253, 230, 138, 0.9)";
        ctx.textAlign = "center";
        ctx.fillText("☾ Moon", moonX, moonY - mr - Math.round(8 * s));

        // Altitude label
        ctx.font = `bold ${Math.round(11 * s)}px sans-serif`;
        ctx.fillStyle = "rgba(253, 230, 138, 0.6)";
        ctx.fillText(`${data.moonAlt.toFixed(1)}°`, moonX, moonY + mr + Math.round(16 * s));
    } else {
        // Moon below horizon indicator
        ctx.font = `bold ${Math.round(12 * s)}px sans-serif`;
        ctx.fillStyle = "rgba(253, 230, 138, 0.5)";
        ctx.textAlign = "center";
        ctx.fillText("☾ Moon Below Horizon", W / 2, H * 0.75 - 12);
    }

    // Arc of vision line
    if (data.moonAlt > 0 && data.sunAlt < 5) {
        ctx.strokeStyle = "rgba(251, 146, 60, 0.5)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(sunX, altToY(data.sunAlt));
        ctx.lineTo(moonX, moonY);
        ctx.stroke();
        ctx.setLineDash([]);

        // ARCV label
        const midX = (sunX + moonX) / 2;
        const midY = (altToY(data.sunAlt) + moonY) / 2;
        ctx.font = `bold ${Math.round(11 * s)}px sans-serif`;
        ctx.fillStyle = "rgba(251, 146, 60, 0.8)";
        ctx.textAlign = "center";
        ctx.fillText(`ARCV: ${data.arcv.toFixed(1)}°`, midX, midY - 10);
    }

    // Compass rose (bottom right)
    const cx2 = W - Math.round(50 * s);
    const cy2 = H - Math.round(40 * s);
    ctx.font = `black ${Math.round(12 * s)}px sans-serif`;
    ctx.fillStyle = "rgba(251, 146, 60, 0.6)";
    ctx.textAlign = "center";
    ctx.fillText("W", cx2, cy2);
    ctx.fillStyle = "rgba(251, 146, 60, 0.3)";
    ctx.fillText("N", cx2 - Math.round(20 * s), cy2);
    ctx.fillText("S", cx2 + Math.round(20 * s), cy2);
}

export default function HorizonPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const date = useAppStore((state) => state.date);
    const loc = useAppStore((state) => state.location);
    const [data, setData] = useState<SunMoonData | null>(null);

    const elevation = loc.elevation ?? 0;
    const dipDeg = (1.76 * Math.sqrt(elevation)) / 60; // arcmin → degrees

    useEffect(() => {
        // The core calculation happens purely locally now.
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
        <div className="min-h-screen pt-6 pb-12 flex flex-col max-w-[1400px] mx-auto px-4">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col">
                    <div className="w-12 h-12 rounded-xl bg-primary-500/20 text-primary-400 flex items-center justify-center mb-4 shadow-lg shadow-primary-500/10">
                        <Compass className="w-6 h-6" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-2">
                        Local <span className="text-primary-400">Horizon</span>
                    </h1>
                    <p className="text-foreground/60 max-w-xl text-sm font-medium">
                        Simulated horizon view at sunset. Shows the exact altitude and azimuth of the Sun and Moon to help you locate the crescent in the sky.
                    </p>
                </div>
                <div className="text-right glass px-4 py-2 rounded-xl border border-foreground/10 self-start md:self-auto">
                    <div className="text-sm font-bold text-primary-400">
                        {hijri.day} {hijri.monthName} {hijri.year} AH
                    </div>
                    <div className="text-xs font-semibold text-foreground/50">
                        {date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[600px]">
                {/* Canvas Container */}
                <div className="relative flex-1 glass rounded-3xl border border-foreground/10 overflow-hidden shadow-2xl min-h-[400px]">
                    <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full"
                        style={{ display: "block" }}
                    />

                    {/* Location Badge */}
                    <div className="absolute top-4 left-4 glass px-4 py-2 rounded-2xl border border-foreground/10 shadow-xl flex items-center gap-2 backdrop-blur-xl bg-background/50">
                        <MapPin className="w-4 h-4 text-primary-400" />
                        <span className="text-sm font-bold text-foreground shadow-sm">
                            {loc.name || "Custom Location"}
                        </span>
                        <span className="text-xs font-mono font-medium text-foreground/60 ml-2">
                            {loc.lat.toFixed(2)}°, {loc.lng.toFixed(2)}°
                        </span>
                    </div>
                </div>

                {/* Sidebar Data Panel */}
                <div className="w-full lg:w-96 flex flex-col gap-4">
                    {data && (
                        <div className="glass p-6 rounded-3xl border border-foreground/10 shadow-xl flex-1 flex flex-col">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-foreground/10">
                                <span className="text-xs font-bold uppercase tracking-widest text-foreground/50">Computed Zone</span>
                                <span
                                    className="text-sm font-black px-3 py-1 rounded-xl shadow-sm"
                                    style={{
                                        backgroundColor:
                                            data.visibility === "A" ? "#4ade80" :
                                                data.visibility === "B" ? "#facc15" :
                                                    data.visibility === "C" ? "#fb923c" : "#f87171",
                                        color: "#111"
                                    }}
                                >
                                    Zone {data.visibility}
                                </span>
                            </div>

                            <div className="space-y-3 flex-1">
                                {[
                                    { label: "Moon Altitude", value: `${data.moonAlt.toFixed(2)}°` },
                                    { label: "Moon Azimuth", value: `${data.moonAz.toFixed(1)}°` },
                                    { label: "Sun Altitude", value: `${data.sunAlt.toFixed(2)}°` },
                                    { label: "Arc of Vision", value: `${data.arcv.toFixed(2)}°` },
                                    { label: "Elongation", value: `${data.elongation.toFixed(2)}°` },
                                    { label: "Crescent Width", value: `${data.crescent.w.toFixed(3)}'` },
                                    { label: "Yallop q-value", value: data.qValue.toFixed(4) },
                                    { label: "Horizon Dip", value: dipDeg > 0.01 ? `${(dipDeg * 60).toFixed(1)}'` : "—" },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex justify-between items-center py-1.5 focus-within:bg-foreground/5 rounded-lg px-2 -mx-2 transition-colors">
                                        <span className="text-sm font-semibold text-foreground/60">{label}</span>
                                        <span className="text-sm font-mono font-bold text-foreground">{value}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-foreground/10">
                                <div className="bg-foreground/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-1">Sunset</span>
                                    <span className="text-lg font-mono font-bold text-foreground">{formatTime(data.sunset)}</span>
                                </div>
                                <div className="bg-foreground/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-1">Moonset</span>
                                    <span className="text-lg font-mono font-bold text-foreground">{formatTime(data.moonset)}</span>
                                </div>
                            </div>

                            <div className="mt-4 text-xs font-semibold text-center text-foreground/50">
                                {VISIBILITY_LABELS[data.visibility].desc}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
