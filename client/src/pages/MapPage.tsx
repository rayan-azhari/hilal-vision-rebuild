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
import { BestTimeCard } from "@/components/BestTimeCard";
import ProGate from "@/components/ProGate";
import { useProTier } from "@/contexts/ProTierContext";

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
  const [tempOverride, setTempOverride] = useState<number | "">("");
  const [pressureOverride, setPressureOverride] = useState<number | "">("");
  const [elevationOverride, setElevationOverride] = useState<number | "">("");
  const [autoFetchWeather, setAutoFetchWeather] = useState(true);

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

  // Auto-fetch real-time atmospheric data from Open-Meteo
  useEffect(() => {
    if (!autoFetchWeather) return;

    let isMounted = true;
    const fetchWeather = async () => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${selectedCity.lat}&longitude=${selectedCity.lng}&current=temperature_2m,surface_pressure&elevation=nan`);
        if (!res.ok) throw new Error("Weather fetch failed");
        const data = await res.json();

        if (isMounted) {
          if (data.current?.temperature_2m !== undefined) setTempOverride(data.current.temperature_2m);
          if (data.current?.surface_pressure !== undefined) setPressureOverride(data.current.surface_pressure);
          if (data.elevation !== undefined && !isNaN(data.elevation)) setElevationOverride(data.elevation);
        }
      } catch (err) {
        console.error("Failed to fetch atmospheric overrides from Open-Meteo:", err);
      }
    };

    fetchWeather();

    return () => { isMounted = false; };
  }, [selectedCity, autoFetchWeather]);

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
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center: [20, 30],
        zoom: 3,
        minZoom: 3,
        maxZoom: 6,
        maxBounds: [
          [-90, -180],
          [90, 180]
        ],
        maxBoundsViscosity: 1.0,
        zoomControl: true,
        attributionControl: false,
      });

      // Dark or Light tile layer
      tileLayerRef.current = L.tileLayer(
        theme === "light"
          ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        { subdomains: "abcd", maxZoom: 20 }
      ).addTo(map);

      // Attribution
      L.control.attribution({ position: "bottomright" })
        .addAttribution('© <a href="https://carto.com/">CARTO</a>')
        .addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      pinsGroupRef.current = L.layerGroup().addTo(map);

      map.on('click', async (e: any) => {
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
          <div ref={mapRef} className="absolute inset-0" style={{ zIndex: 1 }} />

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

              <div className="mt-3 pt-2 text-[10px] leading-tight border-t" style={{ color: "var(--muted-foreground)", borderColor: "color-mix(in oklch, var(--gold) 10%, transparent)" }}>
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
          className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l overflow-y-auto relative z-50"
          style={{
            borderColor: "color-mix(in oklch, var(--gold) 12%, transparent)",
            background: "var(--space-mid)",
          }}
        >
          <div className="p-5 space-y-5">

            {/* Controls */}
            <div className="breezy-card overflow-visible p-4 animate-breezy-enter">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Map Controls</span>
                {isLoading && (
                  <div className="w-3 h-3 rounded-full border border-t-transparent animate-spin" style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }} />
                )}
              </div>
              <div className="space-y-4">
                {/* Hour offset */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs" style={{ color: "var(--muted-foreground)" }}>Hour Offset</label>
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

                {/* Resolution */}
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: "var(--muted-foreground)" }}>Resolution</label>
                  <div className="relative">
                    <select
                      value={resolution}
                      onChange={e => setResolution(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg text-sm appearance-none pr-8"
                      style={{
                        background: "var(--space-light)",
                        border: "1px solid color-mix(in oklch, var(--gold) 20%, transparent)",
                        color: "var(--foreground)",
                      }}
                    >
                      <option value={2} style={{ background: "var(--space-mid)" }}>Fine (2°)</option>
                      <option value={4} style={{ background: "var(--space-mid)" }}>Normal (4°)</option>
                      <option value={6} style={{ background: "var(--space-mid)" }}>Fast (6°)</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--gold-dim)" }} />
                  </div>
                </div>

                {/* Criterion switch */}
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: "var(--muted-foreground)" }}>Criterion</label>
                  <div className="relative">
                    <select
                      value={visibilityCriterion}
                      onChange={e => setVisibilityCriterion(e.target.value as "yallop" | "odeh")}
                      className="w-full px-3 py-2 rounded-lg text-sm appearance-none pr-8"
                      style={{
                        background: "var(--space-light)",
                        border: "1px solid color-mix(in oklch, var(--gold) 20%, transparent)",
                        color: "var(--foreground)",
                      }}
                    >
                      <option value="yallop" style={{ background: "var(--space-mid)" }}>Yallop (1997)</option>
                      <option value="odeh" style={{ background: "var(--space-mid)" }}>Odeh (2004)</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--gold-dim)" }} />
                  </div>
                </div>
              </div>

              {/* Overlays */}
              <div className="pt-2 border-t space-y-2 mt-2" style={{ borderColor: "color-mix(in oklch, var(--gold) 10%, transparent)" }}>
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Visibility Map</span>
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
                    onClick={() => isPremium ? setShowClouds(!showClouds) : setShowUpgradeModal(true)}
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

              {/* Atmospheric Overrides */}
              <ProGate featureName="Atmospheric Overrides">
              <div className="pt-3 border-t space-y-3 mt-3" style={{ borderColor: "color-mix(in oklch, var(--gold) 10%, transparent)" }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Atmospheric Overrides</span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoFetchWeather}
                      onChange={(e) => setAutoFetchWeather(e.target.checked)}
                      className="rounded appearance-none w-3 h-3 flex items-center justify-center bg-transparent border cursor-pointer"
                      style={{
                        borderColor: "var(--gold-dim)",
                        background: autoFetchWeather ? "var(--gold)" : "transparent"
                      }}
                    />
                    <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>Auto-fetch</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] mb-1" style={{ color: "var(--muted-foreground)" }}>Temp (°C)</label>
                    <input
                      type="number"
                      value={tempOverride}
                      onChange={(e) => {
                        setTempOverride(e.target.value === "" ? "" : Number(e.target.value));
                        setAutoFetchWeather(false);
                      }}
                      className="w-full px-2 py-1.5 rounded text-xs bg-transparent border"
                      style={{ borderColor: "color-mix(in oklch, var(--gold) 20%, transparent)" }}
                      placeholder="e.g. 15"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] mb-1" style={{ color: "var(--muted-foreground)" }}>Pressure (hPa)</label>
                    <input
                      type="number"
                      value={pressureOverride}
                      onChange={(e) => {
                        setPressureOverride(e.target.value === "" ? "" : Number(e.target.value));
                        setAutoFetchWeather(false);
                      }}
                      className="w-full px-2 py-1.5 rounded text-xs bg-transparent border"
                      style={{ borderColor: "color-mix(in oklch, var(--gold) 20%, transparent)" }}
                      placeholder="e.g. 1013"
                    />
                  </div>
                </div>
              </div>
              </ProGate>
            </div>
          </div>

          {/* Best Time to Observe */}
          <ProGate featureName="Best Time to Observe">
          <div className="animate-breezy-enter" style={{ animationDelay: "45ms" }}>
            <BestTimeCard date={effectiveDate} location={selectedCity} />
          </div>
          </ProGate>

          <div className="breezy-card p-4 animate-breezy-enter" style={{ animationDelay: "50ms" }}>
            <div className="text-xs font-medium mb-3" style={{ color: "var(--muted-foreground)" }}>
              Visibility Zones
            </div>
            <div className="space-y-3">
              {(["A", "B", "C", "D", "E"] as VisibilityZone[]).map(zone => (
                <div key={zone} className="flex items-start gap-2.5">
                  <div
                    className="w-4 h-4 rounded-sm flex-shrink-0 mt-0.5"
                    style={{ background: highContrast ? HIGH_CONTRAST_ZONE_COLORS[zone] : ZONE_COLORS[zone] }}
                  />
                  <div>
                    <div className="text-xs font-medium" style={{ color: "var(--foreground)" }}>
                      Zone {zone} - {VISIBILITY_LABELS[zone].label}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                      {VISIBILITY_LABELS[zone].desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="breezy-card p-4 animate-breezy-enter" style={{ animationDelay: "50ms" }}>
            <div className="flex items-center gap-1.5 mb-2">
              <Info className="w-3.5 h-3.5" style={{ color: "var(--gold-dim)" }} />
              <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>About the Map</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              Colours show the probability of naked-eye crescent sighting at sunset for each region.
              Use the time slider to see how visibility changes across the globe.
            </p>
            <p className="text-xs leading-relaxed mt-2" style={{ color: "var(--muted-foreground)" }}>
              Based on the <strong style={{ color: "var(--gold-dim)" }}>{visibilityCriterion === "yallop" ? "Yallop (1997) q-value" : "Odeh (2004) V-value"}</strong> criterion.
            </p>
          </div>

          {/* Effective time display */}
          <div className="breezy-card p-4 animate-breezy-enter" style={{ animationDelay: "100ms" }}>
            <div className="text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>Showing</div>
            <div className="text-sm font-semibold" style={{ color: "var(--gold)" }}>
              {effectiveDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </div>
            <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              {effectiveDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} local
            </div>
          </div>

          {/* Sighting Legend */}
          <div className="breezy-card p-4 animate-breezy-enter" style={{ animationDelay: "150ms" }}>
            <div className="text-xs font-medium mb-3" style={{ color: "var(--muted-foreground)" }}>
              Crowdsourced Sightings
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full border border-black dark:border-white shadow-sm" style={{ background: "#4ade80" }} />
                <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Naked Eye</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full border border-black dark:border-white shadow-sm" style={{ background: "#60a5fa" }} />
                <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Optical Aid</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full border border-black dark:border-white shadow-sm" style={{ background: "#9ca3af" }} />
                <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Attempted, Not Seen</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
