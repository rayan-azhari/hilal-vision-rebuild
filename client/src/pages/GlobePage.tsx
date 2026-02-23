import { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { Globe2, Play, Pause, ChevronDown, MapPin, Clock, Eye, Cloud } from "lucide-react";
import { useGlobalState } from "@/contexts/GlobalStateContext";
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
import { useCloudOverlay } from "@/hooks/useCloudOverlay";
import { BestTimeCard } from "@/components/BestTimeCard";

export default function GlobePage({ shared }: { shared: SharedVisibilityState }) {
  const { hourOffset, setHourOffset } = shared;
  const { date, location: selectedCity } = useGlobalState();
  const globeRef = useRef<HTMLDivElement>(null);
  const globeInstanceRef = useRef<any>(null);
  const [moonData, setMoonData] = useState(() =>
    computeSunMoonAtSunset(new Date(), MAJOR_CITIES[0])
  );
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isGlobeInitialized, setIsGlobeInitialized] = useState(false);
  const [showVisibility, setShowVisibility] = useState(true);
  const [showClouds, setShowClouds] = useState(false);

  useEffect(() => {
    if (isGlobeInitialized && globeInstanceRef.current) {
      globeInstanceRef.current.pointOfView({ lat: selectedCity.lat, lng: selectedCity.lng, altitude: 2.5 }, 1000);
    }
  }, [selectedCity, isGlobeInitialized]);

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

      globe.pointOfView({ lat: selectedCity.lat, lng: selectedCity.lng, altitude: 2.5 });
      globe.controls().autoRotate = true;
      globe.controls().autoRotateSpeed = 0.3;

      globeInstanceRef.current = globe;
      setTimeout(() => setIsGlobeInitialized(true), 150);
    });

    return () => {
      mounted = false;
      if (globeInstanceRef.current) {
        globeInstanceRef.current._destructor?.();
        globeInstanceRef.current = null;
      }
    };
  }, []);

  // Recompute textures when date/visibility/clouds change
  const effectiveDateTs = effectiveDate.getTime();
  const { textureUrl, isComputing } = useVisibilityWorker(effectiveDateTs, 3, false, showVisibility);
  const { cloudTextureUrl: cloudsUrl, isLoading: isCloudsLoading } = useCloudOverlay(effectiveDateTs, showClouds);

  // Sync loading state
  useEffect(() => {
    setIsLoading(isComputing || (showClouds && isCloudsLoading));
  }, [isComputing, isCloudsLoading, showClouds]);

  // Update globe texture when theme changes
  useEffect(() => {
    const globe = globeInstanceRef.current;
    if (!globe) return;
    globe.globeImageUrl(
      theme === "light"
        ? "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        : "https://unpkg.com/three-globe/example/img/earth-dark.jpg"
    );
  }, [theme]);

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

  // Apply clouds overlay
  useEffect(() => {
    const globe = globeInstanceRef.current;
    if (!globe) return;

    // Remove existing cloud layer
    const scene = globe.scene();
    const existing = scene.children.find((c: any) => c.name === "clouds-layer");
    if (existing) scene.remove(existing);

    if (showClouds && cloudsUrl) {
      const texture = new THREE.TextureLoader().load(cloudsUrl);
      const r = globe.getGlobeRadius();
      const cloudMesh = new THREE.Mesh(
        new THREE.SphereGeometry(r * 1.004, 64, 64),
        new THREE.MeshPhongMaterial({
          map: texture,
          transparent: true,
          opacity: 0.8,
          side: THREE.DoubleSide,
        })
      );
      cloudMesh.name = "clouds-layer";
      scene.add(cloudMesh);
    }
  }, [cloudsUrl, showClouds]);

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
          <div
            ref={globeRef}
            className="absolute inset-0 transition-opacity duration-[2000ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]"
            style={{ opacity: isGlobeInitialized ? 1 : 0 }}
          />

          {(!isGlobeInitialized || isLoading) && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-500" style={{ background: "rgba(0,0,0,0.2)" }}>
              <div className="flex flex-col items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full border-2 animate-spin"
                  style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }}
                />
                <span className="text-sm" style={{ color: "var(--gold)" }}>Computing visibility…</span>
              </div>
            </div>
          )}

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
            {/* Hour Offset */}
            <div className="breezy-card p-4 animate-breezy-enter" style={{ animationDelay: "25ms" }}>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Hour Offset</label>
                <span className="text-xs font-mono" style={{ color: "var(--gold)" }}>
                  {hourOffset >= 0 ? "+" : ""}{hourOffset}h
                </span>
              </div>
              <div className="flex items-center gap-2 mb-4">
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

              {/* Overlays */}
              <div className="pt-4 border-t space-y-2 mt-2" style={{ borderColor: "color-mix(in oklch, var(--gold) 10%, transparent)" }}>
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Visibility Overlay</span>
                  <button
                    onClick={() => setShowVisibility(!showVisibility)}
                    className={`w-8 h-4 rounded-full transition-colors relative`}
                    style={{ background: showVisibility ? "var(--gold)" : "var(--muted)" }}
                  >
                    <div
                      className={`absolute top-0.5 bottom-0.5 w-3 bg-white rounded-full transition-transform`}
                      style={{
                        left: "2px",
                        transform: showVisibility ? "translateX(16px)" : "translateX(0)"
                      }}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Cloud className="w-3.5 h-3.5" /> Cloud Cover</span>
                  <button
                    onClick={() => setShowClouds(!showClouds)}
                    className={`w-8 h-4 rounded-full transition-colors relative`}
                    style={{ background: showClouds ? "var(--gold)" : "var(--muted)" }}
                  >
                    <div
                      className={`absolute top-0.5 bottom-0.5 w-3 bg-white rounded-full transition-transform`}
                      style={{
                        left: "2px",
                        transform: showClouds ? "translateX(16px)" : "translateX(0)"
                      }}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Best Time to Observe */}
            <div className="animate-breezy-enter" style={{ animationDelay: "75ms" }}>
              <BestTimeCard date={effectiveDate} location={selectedCity} />
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
                  Zone {moonData.visibility} - {VISIBILITY_LABELS[moonData.visibility].label}
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
                { label: "Sunset", value: moonData.sunset ? moonData.sunset.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-" },
                { label: "Moonset", value: moonData.moonset ? moonData.moonset.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-" },
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
                      <strong style={{ color: "var(--gold)" }}>{zone}</strong> - {VISIBILITY_LABELS[zone].label}
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
