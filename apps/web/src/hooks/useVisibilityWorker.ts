"use client";

import { useState, useEffect, useRef } from "react";
import { contours as d3Contours } from "d3-contour";
import type { FeatureCollection } from "geojson";

export interface VisibilityQData {
    qValues: Float32Array;
    width: number;
    height: number;
}

/**
 * Converts raw q-value grid data into GeoJSON FeatureCollection of contour polygons.
 * Each feature has a `zone` property (A-F) with a `color` property for styling.
 */
function qDataToGeoJSON(
    qData: VisibilityQData,
    criterion: "yallop" | "odeh"
): FeatureCollection {
    const { qValues, width, height } = qData;

    const thresholds = criterion === "yallop"
        ? [-2.0, -0.999, -0.232, -0.160, -0.014, 0.216]
        : [-10.0, -0.999, -0.96, 2.00, 5.65];

    const ZONE_COLORS: Record<string, string> = {
        A: "rgba(74,222,128,0.55)",
        B: "rgba(250,204,21,0.50)",
        C: "rgba(251,146,60,0.50)",
        D: "rgba(248,113,113,0.45)",
        E: "rgba(107,114,128,0.30)",
        F: "rgba(31,41,55,0.15)",
    };

    const thresholdsToZone = (value: number): string => {
        if (criterion === "yallop") {
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
            if (value >= -0.999) return "D";
            return "F";
        }
    };

    const contourGen = d3Contours()
        .size([width, height])
        .thresholds(thresholds);

    const contourData = contourGen(Array.from(qValues));

    // Map d3 contour grid coordinates to lng/lat
    const features = contourData.map((contour) => {
        const zone = thresholdsToZone(contour.value);

        // Transform grid coords (px → lng/lat)
        // d3 contours outputs in pixel space of the grid
        // We need to convert to geographic coordinates
        const transformedCoords = (contour as { coordinates: number[][][][] }).coordinates.map((polygon: number[][][]) =>
            polygon.map((ring: number[][]) =>
                ring.map(([px, py]: number[]) => {
                    const lng = -180 + (px / width) * 360;
                    // Mercator inverse for lat
                    const mercY = Math.PI - (py / height) * 2 * Math.PI;
                    const lat = (2 * Math.atan(Math.exp(mercY)) - Math.PI / 2) * (180 / Math.PI);
                    return [lng, lat];
                })
            )
        );

        return {
            type: "Feature" as const,
            properties: {
                zone,
                color: ZONE_COLORS[zone] || "rgba(0,0,0,0)",
                value: contour.value,
            },
            geometry: {
                type: "MultiPolygon" as const,
                coordinates: transformedCoords,
            },
        };
    });

    return {
        type: "FeatureCollection",
        features,
    };
}

export function useVisibilityWorker(
    dateTs: number,
    resolution: number,
    enabled: boolean = true,
    criterion: "yallop" | "odeh" = "yallop"
) {
    const [geoJSON, setGeoJSON] = useState<FeatureCollection | null>(null);
    const [qData, setQData] = useState<VisibilityQData | null>(null);
    const [isComputing, setIsComputing] = useState(false);
    const workerRef = useRef<Worker | null>(null);

    useEffect(() => {
        if (!enabled) return;

        if (!workerRef.current) {
            workerRef.current = new Worker(
                new URL("../workers/visibility.worker.ts", import.meta.url),
                { type: "module" }
            );
        }

        const worker = workerRef.current;
        setIsComputing(true);

        worker.onmessage = (e: MessageEvent) => {
            const { qValues, width, height } = e.data;
            const data: VisibilityQData = { qValues, width, height };
            setQData(data);
            const geojson = qDataToGeoJSON(data, criterion);
            setGeoJSON(geojson);
            setIsComputing(false);
        };

        worker.onerror = (err) => {
            console.error("[useVisibilityWorker] Worker error:", err);
            setIsComputing(false);
        };

        worker.postMessage({ dateTs, resolution, criterion });
    }, [dateTs, resolution, enabled, criterion]);

    useEffect(() => {
        return () => {
            workerRef.current?.terminate();
            workerRef.current = null;
        };
    }, []);

    return { geoJSON, qData, isComputing };
}
