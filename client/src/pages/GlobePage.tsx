import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Globe2, Play, Pause, ChevronDown } from "lucide-react";
import {
  computeSunMoonAtSunset,
  isDaylight,
  gregorianToHijri,
  MAJOR_CITIES,
  VISIBILITY_LABELS,
  type VisibilityZone,
} from "@/lib/astronomy";
import { useTheme } from "@/contexts/ThemeContext";

// Visibility zone colours as [r, g, b]
const ZONE_RGB: Record<VisibilityZone, [number, number, number]> = {
  A: [74, 222, 128],
  B: [250, 204, 21],
  C: [251, 146, 60],
  D: [248, 113, 113],
  E: [107, 114, 128],
  F: [31, 41, 55],
};

const ZONE_HEX: Record<VisibilityZone, string> = {
  A: "#4ade80",
  B: "#facc15",
  C: "#fb923c",
  D: "#f87171",
  E: "#6b7280",
  F: "#1f2937",
};

/**
 * Build a 512×256 canvas texture encoding visibility zones.
 * Each pixel maps to a lat/lng grid point.
 * Returns a data URL.
 */
function buildVisibilityTexture(date: Date): string {
  // Lower resolution for substantially faster rendering
  const W = 128;
  const H = 64;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const imageData = ctx.createImageData(W, H);
  const data = imageData.data;

  for (let py = 0; py < H; py++) {
    const lat = 90 - (py / H) * 180; // +90 at top → -90 at bottom
    for (let px = 0; px < W; px++) {
      const lng = -180 + (px / W) * 360;
      const result = computeSunMoonAtSunset(date, { lat, lng });
      const [r, g, b] = ZONE_RGB[result.visibility];
      const night = !isDaylight(lat, lng, date);
      const alpha = result.visibility === "F" ? 40 : night ? 100 : 180;
      const idx = (py * W + px) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = alpha;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
}

export default function GlobePage() {
  const globeRef = useRef<HTMLDivElement>(null);
  const globeInstanceRef = useRef<any>(null);
  const [date, setDate] = useState(() => new Date());
  const [selectedCity, setSelectedCity] = useState(MAJOR_CITIES[0]);
  const [moonData, setMoonData] = useState(() =>
    computeSunMoonAtSunset(new Date(), MAJOR_CITIES[0])
  );
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showVisibility, setShowVisibility] = useState(true);
  const hijri = gregorianToHijri(date);
  const { theme } = useTheme();

  // Initialize globe once
  useEffect(() => {
    if (!globeRef.current) return;
    let mounted = true;

    import("globe.gl").then((mod) => {
      if (!mounted || !globeRef.current) return;
      const GlobeGL = mod.default as any;

      const globe = GlobeGL()(globeRef.current)
        .width(globeRef.current.clientWidth)
        .height(globeRef.current.clientHeight)
        .backgroundColor("rgba(0,0,0,0)")
        .globeImageUrl(theme === "light" ? "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg" : "https://unpkg.com/three-globe/example/img/earth-dark.jpg")
        .bumpImageUrl("https://unpkg.com/three-globe/example/img/earth-topology.png")
        .atmosphereColor("#c8a040")
        .atmosphereAltitude(0.12)
        .enablePointerInteraction(true);

      globe.pointOfView({ lat: 25, lng: 45, altitude: 2.5 });
      globe.controls().autoRotate = true;
      globe.controls().autoRotateSpeed = 0.3;

      globeInstanceRef.current = globe;
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      if (globeInstanceRef.current) {
        globeInstanceRef.current._destructor?.();
        globeInstanceRef.current = null;
      }
    };
  }, []);

  // Recompute texture when date changes (in a worker-like async pattern)
  useEffect(() => {
    const globe = globeInstanceRef.current;
    if (!globe) return;

    setIsLoading(true);
    setMoonData(computeSunMoonAtSunset(date, selectedCity));

    // Defer heavy texture build off the main paint
    const id = setTimeout(() => {
      if (showVisibility) {
        const textureUrl = buildVisibilityTexture(date);

        // Render texture on a slightly larger sphere
        const r = globe.getGlobeRadius();
        const geometry = new THREE.SphereGeometry(r * 1.002, 72, 72);
        const material = new THREE.MeshBasicMaterial({
          map: new THREE.TextureLoader().load(textureUrl),
          transparent: true,
          opacity: 1,
          depthWrite: false, // Prevents z-fighting
        });
        const overlayMesh = new THREE.Mesh(geometry, material);

        globe.customLayerData([{}])
          .customThreeObject(() => overlayMesh);
      } else {
        globe.customLayerData([]);
      }

      // City label
      globe
        .labelsData([selectedCity])
        .labelLat((d: any) => d.lat)
        .labelLng((d: any) => d.lng)
        .labelText((d: any) => d.name)
        .labelSize(1.2)
        .labelColor(() => "#c8a040")
        .labelDotRadius(0.4)
        .labelAltitude(0.01);

      setIsLoading(false);
    }, 50);

    return () => clearTimeout(id);
  }, [date, selectedCity, showVisibility]);

  // Sync auto-rotate
  useEffect(() => {
    const globe = globeInstanceRef.current;
    if (!globe) return;
    globe.controls().autoRotate = isAutoRotate;
    globe.controls().autoRotateSpeed = 0.3;
  }, [isAutoRotate]);

  // Sync theme changes to globe
  useEffect(() => {
    if (globeInstanceRef.current) {
      globeInstanceRef.current.globeImageUrl(
        theme === "light"
          ? "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          : "https://unpkg.com/three-globe/example/img/earth-dark.jpg"
      );
    }
  }, [theme]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (globeRef.current && globeInstanceRef.current) {
        globeInstanceRef.current
          .width(globeRef.current.clientWidth)
          .height(globeRef.current.clientHeight);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [y, m, d] = e.target.value.split("-").map(Number);
    setDate(new Date(y, m - 1, d, 18, 0, 0));
  };

  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--space)" }}>
      {/* Page header */}
      <div
        className="border-b px-6 py-4 flex items-center justify-between"
        style={{ borderColor: "color-mix(in oklch, var(--gold) 12%, transparent)", background: "var(--space-mid)" }}
      >
        <div className="flex items-center gap-3">
          <Globe2 className="w-5 h-5" style={{ color: "var(--gold)" }} />
          <div>
            <h1 className="text-base font-semibold" style={{ fontFamily: "Cinzel, serif", color: "var(--foreground)" }}>
              Interactive 3D Globe
            </h1>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              Day/night terminator · Moon visibility overlay
            </p>
          </div>
        </div>
        <div className="text-xs font-arabic text-right" style={{ color: "var(--gold-dim)" }}>
          <div>{hijri.day} {hijri.monthNameArabic} {hijri.year} هـ</div>
          <div style={{ color: "var(--muted-foreground)" }}>{hijri.monthName}</div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
        {/* Globe container */}
        <div className="relative flex-1 min-h-[60vh] lg:min-h-0">
          <div ref={globeRef} className="absolute inset-0" />

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ background: "rgba(0,0,0,0.3)" }}>
              <div className="flex flex-col items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full border-2 animate-spin"
                  style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }}
                />
                <span className="text-sm" style={{ color: "var(--gold)" }}>Computing visibility…</span>
              </div>
            </div>
          )}

          {/* Controls overlay */}
          <div className="absolute bottom-4 left-4 flex gap-2">
            <button
              onClick={() => setIsAutoRotate(!isAutoRotate)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
              style={{
                background: "rgba(10,14,26,0.85)",
                border: "1px solid rgba(200,160,64,0.25)",
                color: "#c8a040",
                backdropFilter: "blur(8px)",
              }}
            >
              {isAutoRotate ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              {isAutoRotate ? "Pause" : "Rotate"}
            </button>
            <button
              onClick={() => setShowVisibility(!showVisibility)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
              style={{
                background: showVisibility ? "rgba(200,160,64,0.18)" : "rgba(10,14,26,0.85)",
                border: "1px solid rgba(200,160,64,0.25)",
                color: "#c8a040",
                backdropFilter: "blur(8px)",
              }}
            >
              Visibility
            </button>
          </div>
        </div>

        {/* Side panel */}
        <div
          className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l overflow-y-auto"
          style={{
            borderColor: "color-mix(in oklch, var(--gold) 12%, transparent)",
            background: "var(--space-mid)",
          }}
        >
          <div className="p-5 space-y-5">
            {/* Date */}
            <div className="breezy-card p-4 animate-breezy-enter">
              <label className="block text-xs font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>
                Date
              </label>
              <input
                type="date"
                value={dateStr}
                onChange={handleDateChange}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  background: "var(--space-light)",
                  border: "1px solid color-mix(in oklch, var(--gold) 20%, transparent)",
                  color: "var(--foreground)",
                  colorScheme: "dark",
                }}
              />
            </div>

            {/* City selector */}
            <div className="breezy-card p-4 animate-breezy-enter" style={{ animationDelay: "50ms" }}>
              <label className="block text-xs font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>
                Location
              </label>
              <div className="relative">
                <select
                  value={selectedCity.name}
                  onChange={e => {
                    const city = MAJOR_CITIES.find(c => c.name === e.target.value);
                    if (city) {
                      setSelectedCity(city);
                      globeInstanceRef.current?.pointOfView({ lat: city.lat, lng: city.lng, altitude: 2 }, 1000);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg text-sm appearance-none pr-8"
                  style={{
                    background: "var(--space-light)",
                    border: "1px solid color-mix(in oklch, var(--gold) 20%, transparent)",
                    color: "var(--foreground)",
                  }}
                >
                  {MAJOR_CITIES.map((c, i) => (
                    <option key={i} value={c.name} style={{ background: "var(--space-mid)" }}>
                      {c.name}, {c.country}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--gold-dim)" }} />
              </div>
              <div className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                {selectedCity.lat.toFixed(4)}°, {selectedCity.lng.toFixed(4)}°
              </div>
            </div>

            {/* Moon data */}
            <div className="breezy-card space-y-3 p-4 animate-breezy-enter" style={{ animationDelay: "100ms" }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Visibility</span>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: `${ZONE_HEX[moonData.visibility]}22`,
                    color: ZONE_HEX[moonData.visibility],
                    border: `1px solid ${ZONE_HEX[moonData.visibility]}44`,
                  }}
                >
                  Zone {moonData.visibility} — {VISIBILITY_LABELS[moonData.visibility].label}
                </span>
              </div>

              {[
                { label: "Moon Altitude", value: `${moonData.moonAlt.toFixed(2)}°` },
                { label: "Moon Azimuth", value: `${moonData.moonAz.toFixed(1)}°` },
                { label: "Elongation", value: `${moonData.elongation.toFixed(2)}°` },
                { label: "Arc of Vision", value: `${moonData.arcv.toFixed(2)}°` },
                { label: "Crescent Width", value: `${moonData.crescent.w.toFixed(3)}'` },
                { label: "Yallop q", value: moonData.qValue.toFixed(4) },
                { label: "Illumination", value: `${(moonData.illumination * 100).toFixed(1)}%` },
                { label: "Sunset", value: moonData.sunset ? moonData.sunset.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—" },
                { label: "Moonset", value: moonData.moonset ? moonData.moonset.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{label}</span>
                  <span className="text-xs font-mono font-medium" style={{ color: "var(--foreground)" }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="breezy-card p-4 animate-breezy-enter" style={{ animationDelay: "150ms" }}>
              <div className="text-xs font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>Legend</div>
              <div className="space-y-1.5">
                {(["A", "B", "C", "D", "E"] as VisibilityZone[]).map(zone => (
                  <div key={zone} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: ZONE_HEX[zone] }} />
                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {zone} — {VISIBILITY_LABELS[zone].label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
