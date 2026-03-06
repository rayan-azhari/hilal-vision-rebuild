"use client";

import { useEffect, useState, useMemo } from "react";
import Map, { NavigationControl, Source, Layer, Popup, useMap } from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useAppStore } from "@/store/useAppStore";
import { useVisibilityWorker } from "@/hooks/useVisibilityWorker";
import { useCloudOverlay } from "@/hooks/useCloudOverlay";
import { ProGate } from "@/components/ProGate";
import { trpc } from "@/lib/trpc";
import { Loader2, Eye, Cloud } from "lucide-react";
import type { FillLayerSpecification, CircleLayerSpecification } from "maplibre-gl";

const ZONE_COLORS: Record<string, string> = {
    A: "#4ade80",
    B: "#facc15",
    C: "#fb923c",
    D: "#f87171",
    E: "#6b7280",
    F: "#233342",
};

const ZONE_OPACITIES: Record<string, number> = {
    A: 0.55,
    B: 0.50,
    C: 0.50,
    D: 0.45,
    E: 0.30,
    F: 0.15,
};

const PIN_COLORS: Record<string, string> = {
    naked_eye: "#4ade80",
    optical_aid: "#60a5fa",
    not_seen: "#9ca3af",
};

interface PinProperties {
    id: number;
    visualSuccess: string;
    color: string;
    observationTime: string;
    notes: string | null;
}

/**
 * Cloud overlay component that renders the cloud texture as a raster overlay.
 * Uses MapLibre's addSource/addLayer with an image source.
 */
function CloudOverlayLayer({ imageUrl }: { imageUrl: string | null }) {
    const { current: map } = useMap();

    useEffect(() => {
        if (!map || !imageUrl) return;
        const mapInstance = map.getMap();

        const sourceId = "cloud-overlay-source";
        const layerId = "cloud-overlay-layer";

        // Remove existing
        if (mapInstance.getLayer(layerId)) mapInstance.removeLayer(layerId);
        if (mapInstance.getSource(sourceId)) mapInstance.removeSource(sourceId);

        mapInstance.addSource(sourceId, {
            type: "image",
            url: imageUrl,
            coordinates: [
                [-180, 85.051129],
                [180, 85.051129],
                [180, -85.051129],
                [-180, -85.051129],
            ],
        });

        mapInstance.addLayer({
            id: layerId,
            type: "raster",
            source: sourceId,
            paint: {
                "raster-opacity": 0.7,
                "raster-fade-duration": 0,
            },
        });

        return () => {
            if (mapInstance.getLayer(layerId)) mapInstance.removeLayer(layerId);
            if (mapInstance.getSource(sourceId)) mapInstance.removeSource(sourceId);
        };
    }, [map, imageUrl]);

    return null;
}

export function VisibilityMap() {
    const isDarkMode = useAppStore((s) => s.isDarkMode);
    const date = useAppStore((s) => s.date);
    const location = useAppStore((s) => s.location);
    const criterion = useAppStore((s) => s.visibilityCriterion);

    const showVisibility = useAppStore((s) => s.showVisibility);
    const setShowVisibility = useAppStore((s) => s.setShowVisibility);
    const showClouds = useAppStore((s) => s.showClouds);
    const setShowClouds = useAppStore((s) => s.setShowClouds);
    const resolution = useAppStore((s) => s.resolution);

    const [viewState, setViewState] = useState({
        longitude: location.lng || 39.8579,
        latitude: location.lat || 21.3891,
        zoom: location.lat ? 5 : 2,
    });

    const [selectedPin, setSelectedPin] = useState<{
        lng: number;
        lat: number;
        properties: PinProperties;
    } | null>(null);

    useEffect(() => {
        if (location.lat && location.lng) {
            setViewState({
                longitude: location.lng,
                latitude: location.lat,
                zoom: 5
            });
        }
    }, [location.lat, location.lng]);

    const dateTs = date.getTime();

    const { geoJSON, isComputing } = useVisibilityWorker(
        dateTs,
        resolution,
        showVisibility,
        criterion
    );

    const { cloudTextureUrl, isLoading: isCloudsLoading } = useCloudOverlay(dateTs, showClouds);

    // Fetch recent observations for crowdsourced pins
    const { data: observations } = trpc.telemetry.getRecentObservations.useQuery(undefined, {
        refetchOnWindowFocus: false,
        refetchInterval: 60_000,
    });

    // Build GeoJSON for observation pins
    const pinsGeoJSON = useMemo(() => {
        if (!observations || observations.length === 0) return null;
        return {
            type: "FeatureCollection" as const,
            features: observations.map((obs) => ({
                type: "Feature" as const,
                properties: {
                    id: obs.id,
                    visualSuccess: obs.visualSuccess ?? "not_seen",
                    color: PIN_COLORS[obs.visualSuccess ?? "not_seen"] ?? "#9ca3af",
                    observationTime: obs.observationTime?.toISOString?.() ?? String(obs.observationTime),
                    notes: obs.notes ?? null,
                } satisfies PinProperties,
                geometry: {
                    type: "Point" as const,
                    coordinates: [obs.lng, obs.lat],
                },
            })),
        };
    }, [observations]);

    const mapStyle = isDarkMode
        ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        : "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

    // Build fill-color expression from GeoJSON zone properties
    const fillColor: FillLayerSpecification["paint"] = {
        "fill-color": [
            "match",
            ["get", "zone"],
            "A", ZONE_COLORS.A,
            "B", ZONE_COLORS.B,
            "C", ZONE_COLORS.C,
            "D", ZONE_COLORS.D,
            "E", ZONE_COLORS.E,
            "F", ZONE_COLORS.F,
            "#000000",
        ],
        "fill-opacity": [
            "match",
            ["get", "zone"],
            "A", ZONE_OPACITIES.A,
            "B", ZONE_OPACITIES.B,
            "C", ZONE_OPACITIES.C,
            "D", ZONE_OPACITIES.D,
            "E", ZONE_OPACITIES.E,
            "F", ZONE_OPACITIES.F,
            0.2,
        ],
    };

    const pinLayerPaint: CircleLayerSpecification["paint"] = {
        "circle-radius": 6,
        "circle-color": ["get", "color"],
        "circle-stroke-width": 1.5,
        "circle-stroke-color": isDarkMode ? "#000" : "#fff",
        "circle-opacity": 0.9,
    };

    return (
        <div className="w-full h-[600px] rounded-2xl overflow-hidden border shadow-2xl relative" style={{ borderColor: "color-mix(in oklch, var(--gold) 15%, transparent)" }}>
            {/* Controls overlay */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <button
                    onClick={() => setShowVisibility(!showVisibility)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                    style={{
                        background: showVisibility
                            ? "color-mix(in oklch, var(--gold) 20%, var(--card))"
                            : "var(--card)",
                        color: showVisibility ? "var(--gold)" : "var(--muted-foreground)",
                        border: `1px solid ${showVisibility ? "color-mix(in oklch, var(--gold) 40%, transparent)" : "var(--border)"}`,
                        backdropFilter: "blur(12px)",
                    }}
                >
                    <Eye className="w-3.5 h-3.5" />
                    Zones {showVisibility ? "ON" : "OFF"}
                </button>
                <ProGate featureName="Cloud Overlay">
                    <button
                        onClick={() => setShowClouds(!showClouds)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                        style={{
                            background: showClouds
                                ? "color-mix(in oklch, var(--accent) 20%, var(--card))"
                                : "var(--card)",
                            color: showClouds ? "var(--accent)" : "var(--muted-foreground)",
                            border: `1px solid ${showClouds ? "color-mix(in oklch, var(--accent) 40%, transparent)" : "var(--border)"}`,
                            backdropFilter: "blur(12px)",
                        }}
                    >
                        <Cloud className="w-3.5 h-3.5" />
                        Clouds {showClouds ? "ON" : "OFF"}
                    </button>
                </ProGate>
            </div>

            {/* Loading indicator */}
            {(isComputing || (showClouds && isCloudsLoading)) && (
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium glass-card">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: "var(--gold)" }} />
                    <span style={{ color: "var(--muted-foreground)" }}>
                        {isComputing ? "Computing visibility..." : "Loading clouds..."}
                    </span>
                </div>
            )}

            <Map
                {...viewState}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onMove={evt => setViewState((evt as any).viewState)}
                mapStyle={mapStyle}
                interactive={true}
                interactiveLayerIds={pinsGeoJSON ? ["observation-pins"] : []}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onClick={(evt: any) => {
                    const feature = evt.features?.[0];
                    if (feature?.geometry?.type === "Point") {
                        const [lng, lat] = feature.geometry.coordinates as [number, number];
                        setSelectedPin({ lng, lat, properties: feature.properties as PinProperties });
                    } else {
                        setSelectedPin(null);
                    }
                }}
            >
                <NavigationControl position="bottom-right" />

                {/* Visibility zone GeoJSON overlay */}
                {geoJSON && showVisibility && (
                    <Source id="visibility-zones" type="geojson" data={geoJSON}>
                        <Layer
                            id="visibility-zones-fill"
                            type="fill"
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            paint={fillColor as any}
                        />
                    </Source>
                )}

                {/* Observation pins (crowdsourced sightings) */}
                {pinsGeoJSON && (
                    <Source id="observation-pins-source" type="geojson" data={pinsGeoJSON}>
                        <Layer
                            id="observation-pins"
                            type="circle"
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            paint={pinLayerPaint as any}
                        />
                    </Source>
                )}

                {/* Pin popup */}
                {selectedPin && (
                    <Popup
                        longitude={selectedPin.lng}
                        latitude={selectedPin.lat}
                        onClose={() => setSelectedPin(null)}
                        closeButton={true}
                        anchor="bottom"
                        offset={10}
                    >
                        <div style={{ padding: "4px 2px", fontSize: "11px", minWidth: "140px" }}>
                            <div style={{ fontWeight: 700, color: selectedPin.properties.color, marginBottom: "4px" }}>
                                {selectedPin.properties.visualSuccess.replace(/_/g, " ").toUpperCase()}
                            </div>
                            <div style={{ opacity: 0.7, marginBottom: "2px" }}>
                                {new Date(selectedPin.properties.observationTime).toLocaleString(undefined, {
                                    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                                })}
                            </div>
                            {selectedPin.properties.notes && (
                                <div style={{ fontStyle: "italic", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "4px", marginTop: "4px" }}>
                                    {selectedPin.properties.notes}
                                </div>
                            )}
                        </div>
                    </Popup>
                )}

                {/* Cloud overlay */}
                {showClouds && <CloudOverlayLayer imageUrl={cloudTextureUrl} />}
            </Map>
        </div>
    );
}
