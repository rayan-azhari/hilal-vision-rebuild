import { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { Globe2, Play, Pause, ChevronDown, MapPin, Clock } from "lucide-react";
import {
  computeSunMoonAtSunset,
  isDaylight,
  gregorianToHijri,
  MAJOR_CITIES,
  VISIBILITY_LABELS,
  type VisibilityZone,
} from "@/lib/astronomy";
import { useVisibilityWorker } from "@/hooks/useVisibilityWorker";
import { useTheme } from "@/contexts/ThemeContext";
import { PageHeader } from "@/components/PageHeader";
import type { SharedVisibilityState } from "./VisibilityPage";
import { LocationSearch } from "@/components/LocationSearch";

export default function GlobePage({ shared }: { shared: SharedVisibilityState }) {
  const { date, setDate, hourOffset, setHourOffset, selectedCity, setSelectedCity } = shared;
  const globeRef = useRef<HTMLDivElement>(null);
  const globeInstanceRef = useRef<any>(null);
  const [moonData, setMoonData] = useState(() =>
    computeSunMoonAtSunset(new Date(), MAJOR_CITIES[0])
  );
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showVisibility, setShowVisibility] = useState(true);

  const effectiveDate = useMemo(
    () => new Date(date.getTime() + hourOffset * 3600 * 1000),
    [date, hourOffset]
  );
  const hijri = useMemo(() => gregorianToHijri(date), [date]);
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

  // Recompute texture when date changes (via Web Worker)
  const effectiveDateTs = effectiveDate.getTime();
  const { textureUrl, isComputing } = useVisibilityWorker(effectiveDateTs, 3, false, showVisibility);

  // Sync loading state
  useEffect(() => {
    setIsLoading(isComputing);
  }, [isComputing]);

  // Compute local moon data and labels
  useEffect(() => {
    const globe = globeInstanceRef.current;
    if (!globe) return;

    setMoonData(computeSunMoonAtSunset(new Date(effectiveDateTs), selectedCity));

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
  }, [effectiveDateTs, selectedCity]);

  // Apply visibility overlay
  useEffect(() => {
    const globe = globeInstanceRef.current;
    if (!globe) return;

    if (showVisibility && textureUrl) {
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
  }, [showVisibility, textureUrl]);

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
    <div className="h-full flex flex-col" style={{ background: "var(--space)" }}>
      {/* Page header */}
      <PageHeader
        icon={<Globe2 />}
        title="Interactive 3D Globe"
        subtitle="Day/night terminator · Moon visibility overlay"
      >
        <div className="text-xs font-arabic text-right" style={{ color: "var(--gold-dim)" }}>
          <div>{hijri.day} {hijri.monthNameArabic} {hijri.year} هـ</div>
          <div style={{ color: "var(--muted-foreground)" }}>{hijri.monthName}</div>
        </div>
      </PageHeader>

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
          className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l overflow-y-auto relative z-50"
          style={{
            borderColor: "color-mix(in oklch, var(--gold) 12%, transparent)",
            background: "var(--space-mid)",
          }}
        >
          <div className="p-5 space-y-5">
            {/* Date */}
            <div className="breezy-card overflow-visible p-4 animate-breezy-enter">
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

            {/* Hour Offset */}
            <div className="breezy-card p-4 animate-breezy-enter" style={{ animationDelay: "25ms" }}>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Hour Offset</label>
                <span className="text-xs font-mono" style={{ color: "var(--gold)" }}>
                  {hourOffset >= 0 ? "+" : ""}{hourOffset}h
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" style={{ color: "var(--gold-dim)" }} />
                <input
                  type="range"
                  min={-24}
                  max={24}
                  step={1}
                  value={hourOffset}
                  onChange={e => setHourOffset(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, var(--gold) ${((hourOffset + 24) / 48) * 100}%, var(--space-light) ${((hourOffset + 24) / 48) * 100}%)`,
                    accentColor: "var(--gold)",
                  }}
                />
              </div>
            </div>

            {/* City selector */}
            <div className="breezy-card p-4 animate-breezy-enter" style={{ animationDelay: "50ms" }}>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
                  Location
                </label>
                <button
                  onClick={() => {
                    if ("geolocation" in navigator) {
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          const newCity = {
                            name: "GPS Location",
                            country: "Current",
                            lat: pos.coords.latitude,
                            lng: pos.coords.longitude
                          };
                          // Add to list if not present so it shows up in select
                          if (!MAJOR_CITIES.find(c => c.name === "GPS Location")) {
                            MAJOR_CITIES.unshift(newCity);
                          }
                          setSelectedCity(newCity);
                          globeInstanceRef.current?.pointOfView({ lat: newCity.lat, lng: newCity.lng, altitude: 2 }, 1000);
                        },
                        () => alert("Could not retrieve GPS location.")
                      );
                    } else {
                      alert("Geolocation is not supported by your browser.");
                    }
                  }}
                  className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider hover:opacity-80 transition-opacity"
                  style={{ color: "var(--gold)" }}
                >
                  <MapPin className="w-3 h-3" /> Auto-Detect
                </button>
              </div>
              <div className="relative">
                <LocationSearch
                  selectedCity={selectedCity}
                  onSelect={(city) => {
                    setSelectedCity(city);
                    globeInstanceRef.current?.pointOfView({ lat: city.lat, lng: city.lng, altitude: 2 }, 1000);
                  }}
                />
              </div>
              <div className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                {selectedCity.lat.toFixed(4)}°, {selectedCity.lng.toFixed(4)}°
              </div>
            </div>

            {/* Moon data */}
            <div className="breezy-card space-y-3 p-4 animate-breezy-enter" style={{ animationDelay: "100ms" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Visibility Zones</span>
              </div>
              <div className="flex items-center gap-1.5 mb-2">
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: `var(--gold-dim)`,
                    color: "var(--background)",
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
                    <span className="text-xs" style={{ color: "var(--foreground)" }}>
                      <strong style={{ color: "var(--gold)" }}>{zone}</strong> — {VISIBILITY_LABELS[zone].label}
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
