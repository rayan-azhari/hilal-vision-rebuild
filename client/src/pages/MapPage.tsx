import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Map, Clock, ChevronDown, Info } from "lucide-react";
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
import { LocationSearch } from "@/components/LocationSearch";

const ZONE_COLORS: Record<VisibilityZone, string> = {
  A: "#4ade80",
  B: "#facc15",
  C: "#fb923c",
  D: "#f87171",
  E: "#6b7280",
  F: "#1f2937",
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
  const { date, setDate, hourOffset, setHourOffset, selectedCity, setSelectedCity } = shared;
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);
  const pinsGroupRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const overlayRef = useRef<any>(null);

  const { theme } = useTheme();
  const { data: observationsResult } = trpc.telemetry.getObservations.useQuery({});
  const observations = observationsResult?.data;

  const [isLoading, setIsLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<{ lat: number, lng: number, zone: VisibilityZone } | null>(null);
  const [resolution, setResolution] = useState(4);
  const [showVisibility, setShowVisibility] = useState(true);
  const [moonData, setMoonData] = useState(() =>
    computeSunMoonAtSunset(new Date(), MAJOR_CITIES[0])
  );

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
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center: [20, 30],
        zoom: 2,
        minZoom: 1,
        maxZoom: 6,
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

      map.on('click', (e: any) => {
        let lat = e.latlng.lat;
        let lng = e.latlng.lng;
        if (lat > 90) lat = 90;
        if (lat < -90) lat = -90;
        lng = ((lng + 180) % 360 + 360) % 360 - 180;

        const d = computeSunMoonAtSunset(effectiveDateRef.current, { lat, lng });
        setSelectedPoint({ lat, lng, zone: d.visibility });
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
  const { textureUrl, isComputing } = useVisibilityWorker(effectiveDateTs, resolution, true, showVisibility);

  // Compute local moon data
  useEffect(() => {
    setMoonData(computeSunMoonAtSunset(new Date(effectiveDateTs), selectedCity));
  }, [effectiveDateTs, selectedCity]);

  // Sync loading state
  useEffect(() => {
    setIsLoading(isComputing);
  }, [isComputing]);

  // Handle tile overlay
  useEffect(() => {
    let mounted = true;

    if (!textureUrl || !showVisibility || !layerGroupRef.current) {
      if (overlayRef.current) {
        overlayRef.current.remove();
        overlayRef.current = null;
      }
      return;
    }

    const L = (window as any).L;
    const bounds: [[number, number], [number, number]] = [[-85.051128, -180], [85.051128, 180]];

    if (!L) {
      import("leaflet").then((Leaflet) => {
        if (!mounted) return;
        if (overlayRef.current) {
          overlayRef.current.setUrl(textureUrl);
        } else {
          overlayRef.current = Leaflet.imageOverlay(textureUrl, bounds, { opacity: 0.8, interactive: false }).addTo(layerGroupRef.current!);
        }
      });
    } else {
      if (overlayRef.current) {
        overlayRef.current.setUrl(textureUrl);
      } else {
        overlayRef.current = L.imageOverlay(textureUrl, bounds, { opacity: 0.8, interactive: false }).addTo(layerGroupRef.current!);
      }
    }

    return () => { mounted = false; };
  }, [textureUrl, showVisibility]);

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

  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  return (
    <div className="h-full flex flex-col" style={{ background: "var(--space)" }}>
      {/* Header */}
      <PageHeader
        icon={<Map />}
        title="Crescent Visibility Map"
        subtitle="Global visibility heatmap · Yallop criterion"
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
              className="absolute top-4 left-4 z-10 p-3 rounded-xl text-xs"
              style={{
                background: "color-mix(in oklch, var(--space-mid) 95%, transparent)",
                border: "1px solid color-mix(in oklch, var(--gold) 20%, transparent)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-sm" style={{ background: ZONE_COLORS[selectedPoint.zone] }} />
                <span className="font-medium" style={{ color: "var(--foreground)" }}>
                  Zone {selectedPoint.zone} — {VISIBILITY_LABELS[selectedPoint.zone].label}
                </span>
              </div>
              <div style={{ color: "var(--muted-foreground)" }}>
                {selectedPoint.lat.toFixed(1)}°, {selectedPoint.lng.toFixed(1)}°
              </div>
              <div style={{ color: "var(--muted-foreground)" }}>
                {VISIBILITY_LABELS[selectedPoint.zone].desc}
              </div>
              <button
                onClick={() => setSelectedPoint(null)}
                className="mt-1 text-xs"
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
                {/* Date */}
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: "var(--muted-foreground)" }}>Date</label>
                  <input
                    type="date"
                    value={dateStr}
                    onChange={e => {
                      const [y, m, d] = e.target.value.split("-").map(Number);
                      setDate(new Date(y, m - 1, d, 18, 0, 0));
                    }}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: "var(--space-light)",
                      border: "1px solid color-mix(in oklch, var(--gold) 20%, transparent)",
                      color: "var(--foreground)",
                      colorScheme: "dark",
                    }}
                  />
                </div>

                {/* Location */}
                <div className="pt-2 border-t" style={{ borderColor: "color-mix(in oklch, var(--gold) 10%, transparent)" }}>
                  <div className="flex items-center justify-between mb-2 mt-1">
                    <label className="text-xs" style={{ color: "var(--muted-foreground)" }}>Location</label>
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
                              if (!MAJOR_CITIES.find(c => c.name === "GPS Location")) {
                                MAJOR_CITIES.unshift(newCity);
                              }
                              setSelectedCity(newCity);
                              leafletRef.current?.setView([newCity.lat, newCity.lng], 5, { animate: true });
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
                        leafletRef.current?.setView([city.lat, city.lng], 5, { animate: true });
                      }}
                    />
                  </div>
                </div>

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
              </div>
            </div>

            <div className="breezy-card p-4 animate-breezy-enter" style={{ animationDelay: "50ms" }}>
              <div className="text-xs font-medium mb-3" style={{ color: "var(--muted-foreground)" }}>
                Visibility Zones
              </div>
              <div className="space-y-3">
                {(["A", "B", "C", "D", "E"] as VisibilityZone[]).map(zone => (
                  <div key={zone} className="flex items-start gap-2.5">
                    <div
                      className="w-4 h-4 rounded-sm flex-shrink-0 mt-0.5"
                      style={{ background: ZONE_COLORS[zone] }}
                    />
                    <div>
                      <div className="text-xs font-medium" style={{ color: "var(--foreground)" }}>
                        Zone {zone} — {VISIBILITY_LABELS[zone].label}
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
                Based on the <strong style={{ color: "var(--gold-dim)" }}>Yallop (1997)</strong> q-value criterion.
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
    </div>
  );
}
