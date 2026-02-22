import { useEffect, useRef, useState, useCallback } from "react";
import { Map, Clock, ChevronDown, Info } from "lucide-react";
import {
  computeSunMoonAtSunset,
  gregorianToHijri,
  MAJOR_CITIES,
  VISIBILITY_LABELS,
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

const ZONE_HEX: Record<VisibilityZone, string> = {
  A: "rgba(74,222,128,0.45)",
  B: "rgba(250,204,21,0.45)",
  C: "rgba(251,146,60,0.45)",
  D: "rgba(248,113,113,0.45)",
  E: "rgba(107,114,128,0.30)",
  F: "rgba(31,41,55,0.20)",
};

interface GridPoint {
  lat: number;
  lng: number;
  zone: VisibilityZone;
}

function computeGrid(date: Date, resolution = 4): GridPoint[] {
  const pts: GridPoint[] = [];
  for (let lat = -80; lat <= 80; lat += resolution) {
    for (let lng = -180; lng <= 180; lng += resolution) {
      const d = computeSunMoonAtSunset(date, { lat, lng });
      pts.push({ lat, lng, zone: d.visibility });
    }
  }
  return pts;
}

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);

  const [date, setDate] = useState(() => new Date());
  const [hourOffset, setHourOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<GridPoint | null>(null);
  const [resolution, setResolution] = useState(4);

  const hijri = gregorianToHijri(date);

  // Compute effective date with hour offset
  const effectiveDate = new Date(date.getTime() + hourOffset * 3600 * 1000);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;
    let mounted = true;

    import("leaflet").then((L) => {
      if (!mounted || !mapRef.current || leafletRef.current) return;

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

      // Dark tile layer
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        { subdomains: "abcd", maxZoom: 20 }
      ).addTo(map);

      // Attribution
      L.control.attribution({ position: "bottomright" })
        .addAttribution('© <a href="https://carto.com/">CARTO</a>')
        .addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      leafletRef.current = map;
    });

    return () => {
      mounted = false;
      if (leafletRef.current) {
        leafletRef.current.remove();
        leafletRef.current = null;
      }
    };
  }, []);

  // Draw visibility grid
  const drawGrid = useCallback(async () => {
    if (!leafletRef.current || !layerGroupRef.current) return;
    const L = await import("leaflet");
    setIsLoading(true);

    const grid = computeGrid(effectiveDate, resolution);
    const step = resolution;

    layerGroupRef.current.clearLayers();

    // Draw rectangles for each grid point
    grid.forEach(({ lat, lng, zone }) => {
      if (zone === "F") return; // skip below-horizon
      const bounds: [[number, number], [number, number]] = [
        [lat - step / 2, lng - step / 2],
        [lat + step / 2, lng + step / 2],
      ];
      L.rectangle(bounds, {
        color: "transparent",
        fillColor: ZONE_HEX[zone],
        fillOpacity: 1,
        weight: 0,
      })
        .on("click", () => setSelectedPoint({ lat, lng, zone }))
        .addTo(layerGroupRef.current);
    });

    setIsLoading(false);
  }, [effectiveDate, resolution]);

  useEffect(() => {
    const timeout = setTimeout(drawGrid, 200);
    return () => clearTimeout(timeout);
  }, [drawGrid]);

  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--space)" }}>
      {/* Header */}
      <div
        className="border-b px-6 py-4 flex items-center justify-between"
        style={{ borderColor: "color-mix(in oklch, var(--gold) 12%, transparent)", background: "var(--space-mid)" }}
      >
        <div className="flex items-center gap-3">
          <Map className="w-5 h-5" style={{ color: "var(--gold)" }} />
          <div>
            <h1 className="text-base font-semibold" style={{ fontFamily: "Cinzel, serif", color: "var(--foreground)" }}>
              Crescent Visibility Map
            </h1>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              Global visibility heatmap · Yallop criterion
            </p>
          </div>
        </div>
        <div className="text-xs font-arabic text-right" style={{ color: "var(--gold-dim)" }}>
          {hijri.day} {hijri.monthNameArabic} {hijri.year} هـ
        </div>
      </div>

      {/* Controls bar */}
      <div
        className="px-6 py-3 flex flex-wrap items-center gap-4 border-b"
        style={{ borderColor: "color-mix(in oklch, var(--gold) 8%, transparent)", background: "var(--space-mid)" }}
      >
        {/* Date */}
        <div className="flex items-center gap-2">
          <label className="text-xs" style={{ color: "var(--muted-foreground)" }}>Date</label>
          <input
            type="date"
            value={dateStr}
            onChange={e => {
              const [y, m, d] = e.target.value.split("-").map(Number);
              setDate(new Date(y, m - 1, d, 18, 0, 0));
            }}
            className="px-2 py-1 rounded-lg text-xs"
            style={{
              background: "var(--space-light)",
              border: "1px solid color-mix(in oklch, var(--gold) 20%, transparent)",
              color: "var(--foreground)",
              colorScheme: "dark",
            }}
          />
        </div>

        {/* Hour offset slider */}
        <div className="flex items-center gap-3 flex-1 min-w-48">
          <Clock className="w-4 h-4 flex-shrink-0" style={{ color: "var(--gold-dim)" }} />
          <div className="flex-1">
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
          <span className="text-xs font-mono w-16 text-right" style={{ color: "var(--gold)" }}>
            {hourOffset >= 0 ? "+" : ""}{hourOffset}h
          </span>
        </div>

        {/* Resolution */}
        <div className="flex items-center gap-2">
          <label className="text-xs" style={{ color: "var(--muted-foreground)" }}>Resolution</label>
          <div className="relative">
            <select
              value={resolution}
              onChange={e => setResolution(Number(e.target.value))}
              className="px-2 py-1 rounded-lg text-xs appearance-none pr-6"
              style={{
                background: "var(--space-light)",
                border: "1px solid color-mix(in oklch, var(--gold) 20%, transparent)",
                color: "var(--foreground)",
              }}
            >
              <option value={2}>Fine (2°)</option>
              <option value={4}>Normal (4°)</option>
              <option value={6}>Fast (6°)</option>
            </select>
            <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: "var(--gold-dim)" }} />
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--gold)" }}>
            <div className="w-3 h-3 rounded-full border border-t-transparent animate-spin" style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }} />
            Computing…
          </div>
        )}
      </div>

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
          className="w-full lg:w-64 border-t lg:border-t-0 lg:border-l p-5 space-y-5"
          style={{
            borderColor: "color-mix(in oklch, var(--gold) 12%, transparent)",
            background: "var(--space-mid)",
          }}
        >
          <div className="breezy-card p-4 animate-breezy-enter">
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
        </div>
      </div>
    </div>
  );
}
