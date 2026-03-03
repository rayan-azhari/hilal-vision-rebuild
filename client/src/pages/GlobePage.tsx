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
import { trpc } from "@/lib/trpc";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/PageHeader";
import type { SharedVisibilityState } from "./VisibilityPage";
import { useCloudOverlay } from "@/hooks/useCloudOverlay";
import { useAtmosphericData } from "@/hooks/useAtmosphericData";
import { BestTimeCard } from "@/components/BestTimeCard";
import ProGate from "@/components/ProGate";
import { useProTier } from "@/contexts/ProTierContext";
import { MapControlsPanel } from "@/components/MapControlsPanel";
import { MapInfoPanel, MapTimePanel, MapCrowdsourceLegend } from "@/components/MapLegendPanels";

const ZONE_COLORS: Record<VisibilityZone, string> = {
  A: "#4ade80",
  B: "#facc15",
  C: "#fb923c",
  D: "#f87171",
  E: "#6b7280",
  F: "#233342",
};

const HIGH_CONTRAST_ZONE_COLORS: Record<VisibilityZone, string> = {
  A: "#eaf018",
  B: "#e1781e",
  C: "#a03c28",
  D: "#3c2896",
  E: "#140a3c",
  F: "#233342",
};

export default function GlobePage({ shared }: { shared: SharedVisibilityState }) {
  const { t, i18n } = useTranslation();
  const { hourOffset, setHourOffset } = shared;
  const { date, location: selectedCity, visibilityCriterion, setVisibilityCriterion } = useGlobalState();
  const { isPremium, setShowUpgradeModal } = useProTier();
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

  // Atmospheric Overrides
  const {
    tempOverride, setTempOverride,
    pressureOverride, setPressureOverride,
    elevationOverride, setElevationOverride,
    autoFetchWeather, setAutoFetchWeather,
  } = useAtmosphericData(selectedCity);

  useEffect(() => {
    if (isGlobeInitialized && globeInstanceRef.current) {
      globeInstanceRef.current.pointOfView({ lat: selectedCity.lat, lng: selectedCity.lng, altitude: 3.0 }, 1000);
    }
  }, [selectedCity, isGlobeInitialized]);

  const effectiveDate = useMemo(
    () => new Date(date.getTime() + hourOffset * 3600 * 1000),
    [date, hourOffset]
  );
  const hijri = useMemo(() => gregorianToHijri(date), [date]);
  const { theme, highContrast } = useTheme();

  const trpcUtils = trpc.useContext();

  // Initialize globe once — defer until container is visible (has non-zero dimensions).
  // When mounted inside a display:none parent (e.g. VisibilityPage's tab system),
  // clientWidth/clientHeight are 0, which creates a broken 0×0 WebGL canvas.
  useEffect(() => {
    if (!globeRef.current) return;
    let mounted = true;
    let cleanupGlobe: (() => void) | null = null;

    const initGlobe = () => {
      if (!mounted || !globeRef.current) return;
      const el = globeRef.current;
      if (el.clientWidth === 0 || el.clientHeight === 0) return; // still hidden

      import("globe.gl").then((mod) => {
        if (!mounted || !globeRef.current) return;
        // Double-check visibility after async import
        if (globeRef.current.clientWidth === 0 || globeRef.current.clientHeight === 0) return;
        if (globeInstanceRef.current) return; // already initialized

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

        // Point of view: altitude 2.5 is slightly zoomed in, altitude 3.0 allows the full earth to be visible on desktop
        globe.pointOfView({ lat: selectedCity.lat, lng: selectedCity.lng, altitude: 3.0 });
        globe.controls().autoRotate = true;
        globe.controls().autoRotateSpeed = 0.3;
        globe.controls().enableZoom = true;
        // Prevent users from zooming too close or too far
        globe.controls().minDistance = 150;
        globe.controls().maxDistance = 600;

        // Adjust lighting to tint the dark side deep navy instead of pure black
        const ambientLight = globe.scene().children.find((obj: any) => obj.type === 'AmbientLight');
        if (ambientLight) {
          (ambientLight as THREE.AmbientLight).color = new THREE.Color(theme === "light" ? 0xffffff : 0x233342);
          (ambientLight as THREE.AmbientLight).intensity = theme === "light" ? Math.PI : Math.PI * 1.5;
        } else {
          globe.scene().add(new THREE.AmbientLight(theme === "light" ? 0xffffff : 0x233342, theme === "light" ? Math.PI : Math.PI * 1.5));
        }

        // Add base emissive glow so the black oceans on the texture don't render pure black
        const baseMaterial = globe.globeMaterial();
        if (baseMaterial) {
          baseMaterial.emissive = new THREE.Color(theme === "light" ? 0x000000 : 0x151f28);
          baseMaterial.emissiveIntensity = theme === "light" ? 0 : 1.0;
        }

        globeInstanceRef.current = globe;
        cleanupGlobe = () => {
          globe._destructor?.();
        };
        setTimeout(() => setIsGlobeInitialized(true), 150);
      });
    };

    // Try immediately (works when map tab is not the default)
    initGlobe();

    // Also watch for visibility changes via ResizeObserver
    const ro = new ResizeObserver(() => {
      if (!globeInstanceRef.current) {
        initGlobe();
      }
    });
    ro.observe(globeRef.current);

    return () => {
      mounted = false;
      ro.disconnect();
      if (cleanupGlobe) cleanupGlobe();
      globeInstanceRef.current = null;
    };
  }, []);

  // Recompute textures when date/visibility/clouds change
  const effectiveDateTs = effectiveDate.getTime();
  const { textureUrl, isComputing } = useVisibilityWorker(
    effectiveDateTs,
    3,
    false,
    showVisibility,
    visibilityCriterion,
    highContrast,
    typeof tempOverride === "number" ? tempOverride : undefined,
    typeof pressureOverride === "number" ? pressureOverride : undefined
  );
  const { cloudTextureUrl: cloudsUrl, isLoading: isCloudsLoading } = useCloudOverlay(effectiveDateTs, showClouds);

  // Sync loading state
  useEffect(() => {
    setIsLoading(isComputing || (showClouds && isCloudsLoading));
  }, [isComputing, isCloudsLoading, showClouds]);

  // Update globe texture and lighting when theme changes
  useEffect(() => {
    const globe = globeInstanceRef.current;
    if (!globe) return;
    globe.globeImageUrl(
      theme === "light"
        ? "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        : "https://unpkg.com/three-globe/example/img/earth-dark.jpg"
    );

    const ambientLight = globe.scene().children.find((obj: any) => obj.type === 'AmbientLight');
    if (ambientLight) {
      (ambientLight as THREE.AmbientLight).color = new THREE.Color(theme === "light" ? 0xffffff : 0x233342);
      (ambientLight as THREE.AmbientLight).intensity = theme === "light" ? Math.PI : Math.PI * 1.5;
    }

    const baseMaterial = globe.globeMaterial();
    if (baseMaterial) {
      baseMaterial.emissive = new THREE.Color(theme === "light" ? 0x000000 : 0x151f28);
      baseMaterial.emissiveIntensity = theme === "light" ? 0 : 1.0;
    }
  }, [theme]);

  // Compute local moon data and labels
  useEffect(() => {
    const globe = globeInstanceRef.current;
    if (!globe) return;

    let isMounted = true;

    const updateMoonData = async () => {
      let localElevation = typeof elevationOverride === "number" ? elevationOverride : undefined;

      if (localElevation === undefined) {
        try {
          const demRes = await trpcUtils.dem.getDem.fetch({ lat: selectedCity.lat, lng: selectedCity.lng });
          if (demRes && demRes.elevation !== undefined) {
            localElevation = demRes.elevation;
          }
        } catch (err) {
          console.error("Failed to fetch DEM elevation for point", err);
        }
      }

      if (!isMounted) return;

      setMoonData(computeSunMoonAtSunset(new Date(effectiveDateTs), {
        ...selectedCity,
        elevation: localElevation,
        temperature: typeof tempOverride === "number" ? tempOverride : undefined,
        pressure: typeof pressureOverride === "number" ? pressureOverride : undefined
      }));
    };

    updateMoonData();

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

    const scene = globe.scene();
    const existing = scene.children.find((c: any) => c.name === "visibility-layer");
    if (existing) scene.remove(existing);

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
      overlayMesh.name = "visibility-layer";
      overlayMesh.rotation.y = -Math.PI / 2; // Match three-globe's internal globe rotation
      scene.add(overlayMesh);

      return () => {
        scene.remove(overlayMesh);
        geometry.dispose();
        material.dispose();
      };
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
      const geometry = new THREE.SphereGeometry(r * 1.004, 64, 64);
      const cloudMesh = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          opacity: 1,
          depthWrite: false,
        })
      );
      cloudMesh.name = "clouds-layer";
      cloudMesh.rotation.y = -Math.PI / 2; // Match three-globe's internal globe rotation
      scene.add(cloudMesh);

      return () => {
        scene.remove(cloudMesh);
        geometry.dispose();
      };
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

  // Handle window resize for already-initialized globe
  useEffect(() => {
    const handleResize = () => {
      const el = globeRef.current;
      if (el && el.clientWidth > 0 && el.clientHeight > 0 && globeInstanceRef.current) {
        globeInstanceRef.current
          .width(el.clientWidth)
          .height(el.clientHeight);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex flex-col lg:h-full lg:overflow-hidden" style={{ background: "var(--space)" }}>
      {/* Page header */}
      <PageHeader
        icon={<Globe2 />}
        title={t("globePage.title")}
        subtitle={visibilityCriterion === "yallop" ? t("globePage.subtitleYallop") : t("globePage.subtitleOdeh")}
      >
        <div className={`text-xs ${i18n.language === 'ar' || i18n.language === 'ur' ? 'font-arabic' : ''} text-right`} style={{ color: "var(--gold-dim)" }}>
          <div>{hijri.day} {i18n.language === 'ar' || i18n.language === 'ur' ? hijri.monthNameArabic : hijri.monthName} {hijri.year} هـ</div>
          <div style={{ color: "var(--muted-foreground)" }}>{hijri.monthName}</div>
        </div>
      </PageHeader>

      <div className="flex flex-col lg:flex-row flex-1 lg:min-h-0 lg:overflow-hidden">
        {/* Globe container */}
        <div className="relative flex-none h-[65vh] lg:h-auto lg:flex-1 lg:min-h-0 border-b lg:border-b-0" style={{ borderColor: "color-mix(in oklch, var(--gold) 12%, transparent)" }}>
          <div
            ref={globeRef}
            className="absolute inset-0 transition-opacity duration-[2000ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]"
            style={{ opacity: isGlobeInitialized ? 1 : 0, touchAction: "none" }}
          />

          {(!isGlobeInitialized || isLoading) && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-500" style={{ background: "rgba(0,0,0,0.2)" }}>
              <div className="flex flex-col items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full border-2 animate-spin"
                  style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }}
                />
                <span className="text-sm" style={{ color: "var(--gold)" }}>{t("globePage.computing")}</span>
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
              {isAutoRotate ? t("globePage.pause") : t("globePage.rotate")}
            </button>
          </div>
        </div>

        {/* Side panel */}
        <div
          className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l overflow-y-auto relative z-50 flex flex-col"
          style={{
            borderColor: "color-mix(in oklch, var(--gold) 12%, transparent)",
            background: "var(--space-mid)"
          }}
        >
          <div className="p-5 space-y-4 flex-1">
            <MapControlsPanel
              isLoading={isLoading}
              resolution={4} // Globe doesn't use 2D resolution slider
              setResolution={() => { }}
              visibilityCriterion={visibilityCriterion}
              setVisibilityCriterion={setVisibilityCriterion}
              showVisibility={showVisibility}
              setShowVisibility={setShowVisibility}
              showClouds={showClouds}
              setShowClouds={setShowClouds}
              hourOffset={hourOffset}
              setHourOffset={setHourOffset}
              isPremium={isPremium}
              setShowUpgradeModal={setShowUpgradeModal}
              autoFetchWeather={autoFetchWeather}
              setAutoFetchWeather={setAutoFetchWeather}
              tempOverride={tempOverride}
              setTempOverride={setTempOverride}
              pressureOverride={pressureOverride}
              setPressureOverride={setPressureOverride}
            />
          </div>

          <div
            className="p-5 space-y-4 border-t"
            style={{
              borderColor: "color-mix(in oklch, var(--gold) 12%, transparent)",
              background: "color-mix(in oklch, var(--space) 95%, transparent)",
            }}
          >
            {/* Best Time to Observe */}
            <ProGate featureName="Best Time to Observe">
              <div className="animate-breezy-enter" style={{ animationDelay: "45ms" }}>
                <BestTimeCard date={effectiveDate} location={selectedCity} />
              </div>
            </ProGate>

            <MapInfoPanel
              visibilityCriterion={visibilityCriterion}
              highContrast={highContrast}
              zoneColors={ZONE_COLORS}
              highContrastZoneColors={HIGH_CONTRAST_ZONE_COLORS}
            />

            <MapTimePanel effectiveDate={effectiveDate} />

            <MapCrowdsourceLegend />
          </div>
        </div>
      </div>
    </div>
  );
}
