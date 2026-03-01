import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Map, Clock, ChevronDown, Info, Eye, Cloud } from "lucide-react";
import * as d3 from "d3";
import {
  computeSunMoonAtSunset,
  gregorianToHijri,
  MAJOR_CITIES,
  VISIBILITY_LABELS,
  type VisibilityZone,
} from "@/lib/astronomy";
import { useVisibilityWorker } from "@/hooks/useVisibilityWorker";
import { useTheme } from "@/contexts/ThemeContext";
import { trpc } from "@/lib/trpc";
import { MapPin } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import type { SharedVisibilityState } from "./VisibilityPage";
import { useGlobalState } from "@/contexts/GlobalStateContext";
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

const ZONE_HEX: Record<VisibilityZone, string> = {
  A: "rgba(74,222,128,0.45)",
  B: "rgba(250,204,21,0.45)",
  C: "rgba(251,146,60,0.45)",
  D: "rgba(248,113,113,0.45)",
  E: "rgba(107,114,128,0.30)",
  F: "rgba(31,41,55,0.20)",
};



export default function MapPage({ shared }: { shared: SharedVisibilityState }) {
  const { hourOffset, setHourOffset } = shared;
  const { date, location: selectedCity, visibilityCriterion, setVisibilityCriterion } = useGlobalState();
  const { isPremium, setShowUpgradeModal } = useProTier();
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);
  const pinsGroupRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const overlayRef = useRef<any>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { theme, highContrast } = useTheme();
  const trpcUtils = trpc.useContext();
  const { data: observationsResult } = trpc.telemetry.getObservations.useQuery({});
  const observations = observationsResult?.data;

  const [isLoading, setIsLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<{ lat: number, lng: number, data: any, elevation?: number } | null>(null);
  const [resolution, setResolution] = useState(4);
  const [showVisibility, setShowVisibility] = useState(true);
  const [showClouds, setShowClouds] = useState(false);

  // Atmospheric Overrides
  const {
    tempOverride, setTempOverride,
    pressureOverride, setPressureOverride,
    elevationOverride, setElevationOverride,
    autoFetchWeather, setAutoFetchWeather,
  } = useAtmosphericData(selectedCity);

  const [moonData, setMoonData] = useState(() =>
    computeSunMoonAtSunset(new Date(), MAJOR_CITIES[0])
  );

  useEffect(() => {
    if (leafletRef.current) {
      leafletRef.current.setView([selectedCity.lat, selectedCity.lng], Math.max(leafletRef.current.getZoom(), 4), { animate: true });
    }
  }, [selectedCity]);

  const hijri = useMemo(() => gregorianToHijri(date), [date]);

  const effectiveDate = useMemo(
    () => new Date(date.getTime() + hourOffset * 3600 * 1000),
    [date, hourOffset]
  );
  const effectiveDateRef = useRef(effectiveDate);
  useEffect(() => {
    effectiveDateRef.current = effectiveDate;
  }, [effectiveDate]);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current) return;

    // Cleanup any existing map instance on this div due to strict mode
    const container = mapRef.current;
    if ((container as any)._leaflet_id) {
      (container as any)._leaflet_id = null;
    }

    let mounted = true;

    let mapInstance: any = null;

    import("leaflet").then((L) => {
      if (!mounted || !mapRef.current) return;

      // Fix Leaflet default icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "/leaflet/marker-icon-2x.png",
        iconUrl: "/leaflet/marker-icon.png",
        shadowUrl: "/leaflet/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center: [20, 30],
        zoom: 2,
        minZoom: 2, // Increased from 1 to avoid showing grey space above/below map on tall screens
        maxZoom: 6,
        worldCopyJump: false, // Turned off since we are restricting bounds
        zoomControl: true,
        attributionControl: false,
        maxBounds: [
          [-90, -180],
          [90, 180]
        ],
        maxBoundsViscosity: 1.0 // Prevents dragging outside the bounds
      });

      // Dark or Light tile layer
      tileLayerRef.current = L.tileLayer(
        theme === "light"
          ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        { subdomains: "abcd", maxZoom: 20, noWrap: true, bounds: [[-90, -180], [90, 180]] }
      ).addTo(map);

      // Attribution
      L.control.attribution({ position: "bottomright" })
        .addAttribution('© <a href="https://carto.com/">CARTO</a>')
        .addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      pinsGroupRef.current = L.layerGroup().addTo(map);

      map.on('click', (e: any) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
          let lat = e.latlng.lat;
          let lng = e.latlng.lng;
          if (lat > 90) lat = 90;
          if (lat < -90) lat = -90;
          lng = ((lng + 180) % 360 + 360) % 360 - 180;

          let localElevation = typeof elevationOverride === "number" ? elevationOverride : undefined;

          // If we don't have an override, fetch the real DEM data for this point
          if (localElevation === undefined) {
            try {
              const demRes = await trpcUtils.dem.getDem.fetch({ lat, lng });
              if (demRes && demRes.elevation !== undefined) {
                localElevation = demRes.elevation;
              }
            } catch (err) {
              console.error("Failed to fetch DEM elevation for point", err);
            }
          }

          const d = computeSunMoonAtSunset(effectiveDateRef.current, {
            lat,
            lng,
            elevation: localElevation,
            temperature: typeof tempOverride === "number" ? tempOverride : undefined,
            pressure: typeof pressureOverride === "number" ? pressureOverride : undefined
          });
          setSelectedPoint({ lat, lng, data: d, elevation: localElevation });
        }, 300);
      });

      leafletRef.current = map;
    });

    return () => {
      mounted = false;
      if (mapInstance) {
        mapInstance.remove();
      }
      leafletRef.current = null;
    };
  }, []);

  // Invalidate map size when container becomes visible (fixes tiles not loading
  // when switching from Globe to Map view, since Leaflet can't calculate bounds
  // while the container has display:none)
  useEffect(() => {
    if (!mapRef.current) return;
    const observer = new ResizeObserver(() => {
      if (leafletRef.current) {
        leafletRef.current.invalidateSize();
      }
    });
    observer.observe(mapRef.current);
    return () => observer.disconnect();
  }, []);

  // Update tile layer when theme changes
  useEffect(() => {
    if (tileLayerRef.current) {
      tileLayerRef.current.setUrl(
        theme === "light"
          ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      );
    }
  }, [theme]);

  const effectiveDateTs = effectiveDate.getTime();

  // Custom worker hook handles computation off main thread
  const { qData, isComputing } = useVisibilityWorker(
    effectiveDateTs,
    resolution,
    true,
    showVisibility,
    visibilityCriterion,
    highContrast,
    typeof tempOverride === "number" ? tempOverride : undefined,
    typeof pressureOverride === "number" ? pressureOverride : undefined
  );
  const { cloudTextureUrl: cloudsUrl, isLoading: isCloudsLoading } = useCloudOverlay(effectiveDateTs, showClouds, "mercator");

  // Compute local moon data
  useEffect(() => {
    setMoonData(computeSunMoonAtSunset(new Date(effectiveDateTs), {
      ...selectedCity,
      elevation: typeof elevationOverride === "number" ? elevationOverride : undefined,
      temperature: typeof tempOverride === "number" ? tempOverride : undefined,
      pressure: typeof pressureOverride === "number" ? pressureOverride : undefined
    }));
  }, [effectiveDateTs, selectedCity, elevationOverride, tempOverride, pressureOverride]);

  // Sync loading state
  useEffect(() => {
    setIsLoading(isComputing || (showClouds && isCloudsLoading));
  }, [isComputing, isCloudsLoading, showClouds]);

  // Handle GeoJSON Contour overlay
  const geoJsonLayerRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    if (!qData || !showVisibility || !layerGroupRef.current) {
      if (geoJsonLayerRef.current) {
        geoJsonLayerRef.current.remove();
        geoJsonLayerRef.current = null;
      }
      return;
    }

    const L = (window as any).L;
    if (!L) return;

    const { qValues, width, height } = qData;

    // Thresholds matching Yallop or Odeh definitions
    const thresholds = visibilityCriterion === "yallop"
      ? [-2.0, -0.999, -0.232, -0.160, -0.014, 0.216]
      : [-10.0, -0.999, -0.96, 2.00, 5.65];

    const thresholdsToZone = (value: number): VisibilityZone => {
      if (visibilityCriterion === "yallop") {
        if (value >= 0.216) return "A";
        if (value >= -0.014) return "B";
        if (value >= -0.160) return "C";
        if (value >= -0.232) return "D";
        if (value >= -0.999) return "E";
        return "F";
      } else {
        if (value >= 5.65) return "A";
        if (value >= 2.00) return "B";
        if (value >= -0.96) return "C";
        if (value >= -0.999) return "D"; // Odeh has D=requires telescope, groups invisible with D. E makes sense to plot anyway
        return "F";
      }
    };

    const contourGen = d3.contours()
      .size([width, height])
      .thresholds(thresholds);

    const contours = contourGen(Array.from(qValues));

    if (geoJsonLayerRef.current) {
      geoJsonLayerRef.current.remove();
    }

    const pathGen = d3.geoPath();

    let svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" style="width:100%; height:100%;">`;
    contours.forEach(contour => {
      const zone = thresholdsToZone(contour.value);
      const color = (highContrast ? HIGH_CONTRAST_ZONE_COLORS[zone] : ZONE_COLORS[zone]) || "#000";
      // Ensure lower zones have lower opacity so the stack looks correct
      const opacity = zone === "F" ? 0.35 : 0.6;

      // Draw the contour using perfectly scalable SVG path
      const d = pathGen(contour);
      if (d) {
        svgString += `<path d="${d}" fill="${color}" fill-opacity="${opacity}" fill-rule="evenodd" stroke="none" />`;
      }
    });
    svgString += `</svg>`;

    // Encode string to valid data URL
    const svgUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;

    const bounds: [[number, number], [number, number]] = [[-85.051128, -180], [85.051128, 180]];

    geoJsonLayerRef.current = L.imageOverlay(svgUrl, bounds, {
      opacity: 0.8,
      interactive: false,
      zIndex: 10
    }).addTo(layerGroupRef.current!);

    return () => { mounted = false; };
  }, [qData, showVisibility, visibilityCriterion, highContrast]);

  // Apply clouds overlay
  const cloudOverlayRef = useRef<any>(null);
  useEffect(() => {
    if (!leafletRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    if (showClouds && cloudsUrl) {
      const bounds: [[number, number], [number, number]] = [[-85.051128, -180], [85.051128, 180]];
      if (cloudOverlayRef.current) {
        cloudOverlayRef.current.setUrl(cloudsUrl);
      } else {
        cloudOverlayRef.current = L.imageOverlay(cloudsUrl, bounds, {
          opacity: 0.9,
          zIndex: 15,
          className: "cloud-overlay-layer",
          interactive: false,
        }).addTo(leafletRef.current);
      }
    } else if (cloudOverlayRef.current) {
      cloudOverlayRef.current.remove();
      cloudOverlayRef.current = null;
    }
  }, [cloudsUrl, showClouds]);

  // Draw observation pins
  useEffect(() => {
    if (!leafletRef.current || !pinsGroupRef.current || !observations) return;
    import("leaflet").then((L) => {
      pinsGroupRef.current.clearLayers();

      observations.forEach(obs => {
        let color = "#9ca3af"; // grey for not_seen
        if (obs.visualSuccess === "naked_eye") color = "#4ade80"; // green
        else if (obs.visualSuccess === "optical_aid") color = "#60a5fa"; // blue

        const markerHtml = `
          <div style="
            width: 12px; height: 12px; 
            background: ${color}; 
            border: 2px solid ${theme === 'light' ? '#ffffff' : '#000000'};
            border-radius: 50%;
            box-shadow: 0 0 4px rgba(0,0,0,0.5);
          "></div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: "",
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        });

        const popup = `
          <div class="text-xs space-y-1">
            <div class="font-bold flex items-center gap-1.5 mb-1" style="color: ${color}">
              <div class="w-2 h-2 rounded-full" style="background: ${color}"></div>
              ${obs.visualSuccess.replace("_", " ").toUpperCase()}
            </div>
            <div class="text-[10px] opacity-70">${new Date(obs.observationTime).toLocaleString()}</div>
            ${obs.cloudFraction ? `<div>Clouds: ${obs.cloudFraction}%</div>` : ''}
            ${obs.pm25 ? `<div>AOD/PM2.5: ${obs.pm25}</div>` : ''}
            ${obs.notes ? `<div class="italic border-t border-white/10 pt-1 mt-1">${obs.notes}</div>` : ''}
          </div>
        `;

        L.marker([parseFloat(obs.lat), parseFloat(obs.lng)], { icon })
          .bindPopup(popup)
          .addTo(pinsGroupRef.current);
      });
    });
  }, [observations, theme]);

  return (
    <div className="h-full flex flex-col" style={{ background: "var(--space)" }}>
      {/* Header */}
      <PageHeader
        icon={<Map />}
        title="Crescent Visibility Map"
        subtitle={`Global visibility heatmap · ${visibilityCriterion === "yallop" ? "Yallop (1997)" : "Odeh (2004)"} criterion`}
      >
        <div className="text-xs font-arabic text-right" style={{ color: "var(--gold-dim)" }}>
          <div>{hijri.day} {hijri.monthNameArabic} {hijri.year} هـ</div>
          <div style={{ color: "var(--muted-foreground)" }}>{hijri.monthName}</div>
        </div>
      </PageHeader>

      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
        {/* Map */}
        <div className="relative flex-1 min-h-[60vh] lg:min-h-0">
          <div ref={mapRef} className="absolute inset-0" style={{ zIndex: 1, touchAction: "none" }} />

          {/* Selected point popup */}
          {selectedPoint && (
            <div
              className="absolute top-4 left-4 z-10 p-4 rounded-xl text-xs space-y-2 shadow-xl animate-in fade-in zoom-in duration-200"
              style={{
                background: "color-mix(in oklch, var(--space-mid) 95%, transparent)",
                border: "1px solid color-mix(in oklch, var(--gold) 20%, transparent)",
                backdropFilter: "blur(12px)",
                minWidth: "220px"
              }}
            >
              <div className="flex items-center gap-2 mb-3 pb-2 border-b" style={{ borderColor: "color-mix(in oklch, var(--gold) 10%, transparent)" }}>
                <div className="w-3 h-3 rounded-sm" style={{ background: highContrast ? HIGH_CONTRAST_ZONE_COLORS[selectedPoint.data.visibility as VisibilityZone] : ZONE_COLORS[selectedPoint.data.visibility as VisibilityZone] }} />
                <span className="font-bold text-sm" style={{ color: "var(--foreground)" }}>
                  Zone {selectedPoint.data.visibility}
                </span>
                <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  {selectedPoint.lat.toFixed(2)}°, {selectedPoint.lng.toFixed(2)}°
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span style={{ color: "var(--muted-foreground)" }}>q-Value</span>
                  <span className="font-mono font-medium" style={{ color: "var(--gold)" }}>{selectedPoint.data.qValue.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--muted-foreground)" }}>Age</span>
                  <span className="font-mono">{selectedPoint.data.moonAge.toFixed(1)} h</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--muted-foreground)" }}>Moon Altitude</span>
                  <span className="font-mono">{selectedPoint.data.moonAlt.toFixed(2)}°</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--muted-foreground)" }}>Elongation</span>
                  <span className="font-mono">{selectedPoint.data.elongation.toFixed(2)}°</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--muted-foreground)" }}>Crescent Width</span>
                  <span className="font-mono">{selectedPoint.data.crescent.w.toFixed(2)}'</span>
                </div>
                {selectedPoint.elevation !== undefined && (
                  <div className="flex justify-between border-t pt-1 mt-1" style={{ borderColor: "color-mix(in oklch, var(--gold) 10%, transparent)" }}>
                    <span style={{ color: "var(--muted-foreground)" }}>Local Elevation</span>
                    <span className="font-mono">{Math.round(selectedPoint.elevation)} m</span>
                  </div>
                )}
              </div>

              {selectedPoint.data.imageUrl && (
                <div className="mt-3 overflow-hidden rounded-md border border-white/10 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-10" />
                  <img
                    src={selectedPoint.data.imageUrl}
                    alt="Sighting Photograph"
                    className="w-full h-32 object-cover"
                    loading="lazy"
                  />
                  <div className="absolute bottom-1 right-2 text-[8px] text-white/70 z-20">Attached Photo</div>
                </div>
              )}

              <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] leading-tight border-t" style={{ color: "var(--muted-foreground)", borderColor: "color-mix(in oklch, var(--gold) 10%, transparent)" }}>
                {VISIBILITY_LABELS[selectedPoint.data.visibility as VisibilityZone].desc}
              </div>

              <button
                onClick={() => setSelectedPoint(null)}
                className="w-full mt-3 py-1.5 rounded text-[10px] font-medium transition-colors hover:bg-white/5"
                style={{ color: "var(--gold-dim)" }}
              >
                ✕ Close
              </button>
            </div>
          )}
        </div>

        {/* Legend sidebar */}
        <div
          className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l overflow-y-auto relative z-50 flex flex-col"
          style={{
            borderColor: "color-mix(in oklch, var(--gold) 12%, transparent)",
            background: "var(--space-mid)",
            height: "100%",
          }}
        >
          <div className="p-5 space-y-5 flex-1">

            {/* Controls */}
            <MapControlsPanel
              isLoading={isLoading}
              resolution={resolution}
              setResolution={setResolution}
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
