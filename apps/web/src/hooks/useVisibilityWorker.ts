"use client";

import { useState, useEffect, useRef } from "react";
import * as Astronomy from "astronomy-engine";
import { crescentWidth, yallopQ, odehV, classifyYallop, classifyOdeh, ZONE_RGB } from "@hilal/astronomy";
import type { VisibilityZone } from "@hilal/types";

export interface VisibilityQData {
    qValues: Float32Array;
    width: number;
    height: number;
}

// ─── Per-point visibility calculation (same logic as legacy worker) ──────────

function computeVisibilityAtPoint(
    startOfDay: Date,
    lat: number,
    lng: number,
    criterion: "yallop" | "odeh"
): { zone: VisibilityZone; value: number } {
    const obs = new Astronomy.Observer(lat, lng, 0);
    const sunsetResult = Astronomy.SearchRiseSet(Astronomy.Body.Sun, obs, -1, startOfDay, 1);

    const calcTime = sunsetResult
        ? sunsetResult.date
        : new Date(startOfDay.getFullYear(), startOfDay.getMonth(), startOfDay.getDate(), 18, 0, 0);

    const eqSun = Astronomy.Equator(Astronomy.Body.Sun, calcTime, obs, true, true);
    const eqMoon = Astronomy.Equator(Astronomy.Body.Moon, calcTime, obs, true, true);
    const hcSun = Astronomy.Horizon(calcTime, obs, eqSun.ra, eqSun.dec, "normal");
    const hcMoon = Astronomy.Horizon(calcTime, obs, eqMoon.ra, eqMoon.dec, "normal");
    const moonIllum = Astronomy.Illumination(Astronomy.Body.Moon, calcTime);

    const moonAlt = hcMoon.altitude;
    const sunAlt = hcSun.altitude;
    const arcv = moonAlt - sunAlt;

    const elongation = Astronomy.AngleFromSun(Astronomy.Body.Moon, calcTime);
    const crescent = crescentWidth(elongation, moonIllum.geo_dist * 149597870.7);

    if (criterion === "yallop") {
        const q = yallopQ(arcv, crescent.w);
        const safeQ = isNaN(q) ? -99 : q;
        const zone = classifyYallop(safeQ, moonAlt);
        return { zone, value: moonAlt <= 0 ? -99 : safeQ };
    } else {
        const v = odehV(arcv, crescent.w);
        const safeV = isNaN(v) ? -99 : v;
        const zone = classifyOdeh(safeV, moonAlt);
        return { zone, value: moonAlt <= 0 ? -99 : safeV };
    }
}

// ─── Chunked grid computation → RGBA pixels + q-values ─────────────────────

const CHUNK_SIZE = 100;

function computeGridChunked(
    dateTs: number,
    resolution: number,
    criterion: "yallop" | "odeh",
    onComplete: (pixels: Uint8ClampedArray, qValues: Float32Array, W: number, H: number) => void,
    signal: AbortSignal
): void {
    const date = new Date(dateTs);
    const W = Math.floor(360 / resolution);
    const H = Math.floor(180 / resolution);
    const pixels = new Uint8ClampedArray(W * H * 4);
    const qValues = new Float32Array(W * H);
    const maxLat = 85.051129;
    const totalPoints = W * H;

    let idx = 0;

    function processChunk() {
        if (signal.aborted) return;

        const end = Math.min(idx + CHUNK_SIZE, totalPoints);
        for (; idx < end; idx++) {
            const py = Math.floor(idx / W);
            const px = idx % W;

            // Web Mercator projection
            const mercY = Math.PI - ((py + 0.5) / H) * 2 * Math.PI;
            let lat = (2 * Math.atan(Math.exp(mercY)) - Math.PI / 2) * (180 / Math.PI);
            if (lat > maxLat) lat = maxLat;
            if (lat < -maxLat) lat = -maxLat;

            const lng = -180 + ((px + 0.5) / W) * 360;
            const utcNoon = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12, 0, 0);
            const startOfDay = new Date(utcNoon - (lng / 15) * 3600 * 1000);

            let zone: VisibilityZone = "F";
            let value = -99;
            try {
                const result = computeVisibilityAtPoint(startOfDay, lat, lng, criterion);
                zone = result.zone;
                value = result.value;
            } catch {
                // fallback: treat as below horizon
            }

            const [r, g, b] = ZONE_RGB[zone];
            const alpha = zone === "F" ? 40 : 180;

            const pxOff = idx * 4;
            pixels[pxOff] = r;
            pixels[pxOff + 1] = g;
            pixels[pxOff + 2] = b;
            pixels[pxOff + 3] = alpha;
            qValues[idx] = value;
        }

        if (idx >= totalPoints) {
            onComplete(pixels, qValues, W, H);
        } else {
            setTimeout(processChunk, 0);
        }
    }

    setTimeout(processChunk, 0);
}

// ─── Canvas rendering (legacy approach: pixel grid → blur → data URL) ───────

function pixelsToTextureUrl(pixels: Uint8ClampedArray, W: number, H: number): string {
    // Draw raw pixels onto small canvas
    const offCanvas = document.createElement("canvas");
    offCanvas.width = W;
    offCanvas.height = H;
    const offCtx = offCanvas.getContext("2d");
    if (!offCtx) return "";

    const imageData = offCtx.createImageData(W, H);
    imageData.data.set(pixels);
    offCtx.putImageData(imageData, 0, 0);

    // Upscale with blur for smooth zone boundaries
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    ctx.filter = "blur(12px)";
    // Draw 3 times to wrap edges seamlessly across the dateline
    ctx.drawImage(offCanvas, -canvas.width, 0, canvas.width, canvas.height);
    ctx.drawImage(offCanvas, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(offCanvas, canvas.width, 0, canvas.width, canvas.height);

    return canvas.toDataURL();
}

// ─── React hook ─────────────────────────────────────────────────────────────

export function useVisibilityWorker(
    dateTs: number,
    resolution: number,
    enabled: boolean = true,
    criterion: "yallop" | "odeh" = "yallop"
) {
    const [textureUrl, setTextureUrl] = useState<string | null>(null);
    const [qData, setQData] = useState<VisibilityQData | null>(null);
    const [isComputing, setIsComputing] = useState(false);
    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        if (!enabled) return;

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setIsComputing(true);

        computeGridChunked(
            dateTs,
            resolution,
            criterion,
            (pixels, qValues, W, H) => {
                if (controller.signal.aborted) return;
                setQData({ qValues, width: W, height: H });
                const url = pixelsToTextureUrl(pixels, W, H);
                setTextureUrl(url);
                setIsComputing(false);
            },
            controller.signal
        );

        return () => {
            controller.abort();
        };
    }, [dateTs, resolution, enabled, criterion]);

    return { textureUrl, qData, isComputing };
}
