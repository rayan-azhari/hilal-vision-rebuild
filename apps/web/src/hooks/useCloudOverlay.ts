"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

function generateGridPoints(): Array<{ lat: number; lng: number }> {
    const points: Array<{ lat: number; lng: number }> = [];
    for (let lat = -60; lat <= 60; lat += 15) {
        for (let lng = -180; lng < 180; lng += 20) {
            points.push({ lat, lng });
        }
    }
    return points;
}

/**
 * Renders cloud cover data into a canvas data URL.
 * Uses bilinear interpolation + fractal noise for organic appearance.
 * Uses Mercator projection for MapLibre/Leaflet compatibility.
 */
function renderCloudTexture(
    data: Array<{ lat: number; lng: number; cloud_cover: number }>
): string {
    const W = 256;
    const H = 128;

    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;
    const imageData = ctx.createImageData(W, H);
    const pixels = imageData.data;

    const latStep = 15;
    const lngStep = 20;
    const gridMap = new Map<string, number>();
    for (const p of data) {
        gridMap.set(`${p.lat},${p.lng}`, p.cloud_cover);
    }

    for (let py = 0; py < H; py++) {
        // Mercator projection
        const mercatorY = Math.PI * (1 - 2 * py / H);
        const lat = (2 * Math.atan(Math.exp(mercatorY)) - Math.PI / 2) * 180 / Math.PI;

        for (let px = 0; px < W; px++) {
            const lng = -180 + (px / W) * 360;

            let latLo = Math.floor(lat / latStep) * latStep;
            if (latLo === 0) latLo = 0;
            let latHi = latLo + latStep;
            if (latHi === 0) latHi = 0;

            let lngLo = Math.floor(lng / lngStep) * lngStep;
            if (lngLo === 0) lngLo = 0;
            let lngHi = lngLo + lngStep;
            if (lngHi === 0) lngHi = 0;

            const clampLat = (l: number) => {
                const c = Math.max(-60, Math.min(60, l));
                return c === 0 ? 0 : c;
            };
            const clampLng = (l: number) => {
                if (l >= 180) l -= 360;
                if (l < -180) l += 360;
                return l === 0 ? 0 : l;
            };

            const tl = gridMap.get(`${clampLat(latHi)},${clampLng(lngLo)}`) ?? 0;
            const tr = gridMap.get(`${clampLat(latHi)},${clampLng(lngHi)}`) ?? 0;
            const bl = gridMap.get(`${clampLat(latLo)},${clampLng(lngLo)}`) ?? 0;
            const br = gridMap.get(`${clampLat(latLo)},${clampLng(lngHi)}`) ?? 0;

            const tx = (lng - lngLo) / lngStep;
            const ty = (lat - latLo) / latStep;
            const top = tl + (tr - tl) * tx;
            const bottom = bl + (br - bl) * tx;
            let norm = (bottom + (top - bottom) * ty) / 100;
            if (norm < 0) norm = 0;
            if (norm > 1) norm = 1;

            // Fractal noise for organic look
            const scale1 = 0.15;
            const scale2 = 0.3;
            const noise = Math.sin(px * scale1) * Math.cos(py * scale1) +
                Math.sin((px + py) * scale2) * 0.5;
            if (norm > 0) norm += noise * 0.15 * norm;

            // Smoothstep
            norm = norm * norm * (3 - 2 * norm);
            if (norm < 0.1) norm = 0;

            const alpha = Math.min(240, Math.floor(norm * 255));
            const idx = (py * W + px) * 4;
            pixels[idx] = 255;
            pixels[idx + 1] = 255;
            pixels[idx + 2] = 255;
            pixels[idx + 3] = alpha;
        }
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL();
}

/**
 * Hook that fetches cloud cover from Open-Meteo and renders it as an image overlay.
 */
export function useCloudOverlay(dateTs: number, enabled: boolean = true) {
    const dateStr = new Date(dateTs).toISOString().slice(0, 10);

    const { data, isLoading } = useQuery({
        queryKey: ["cloudGrid", dateStr],
        queryFn: async () => {
            const gridPoints = generateGridPoints();
            const BATCH_SIZE = 25;
            const allResults: Array<{ lat: number; lng: number; cloud_cover: number }> = [];

            for (let i = 0; i < gridPoints.length; i += BATCH_SIZE) {
                const batch = gridPoints.slice(i, i + BATCH_SIZE);
                const lats = batch.map((p) => p.lat).join(",");
                const lngs = batch.map((p) => p.lng).join(",");

                try {
                    if (i > 0) await new Promise(r => setTimeout(r, 100));

                    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}&hourly=cloud_cover&forecast_days=1&timezone=auto`;
                    const res = await fetch(url);

                    if (!res.ok) {
                        batch.forEach((p) => allResults.push({ ...p, cloud_cover: 0 }));
                        continue;
                    }

                    const json = (await res.json()) as { hourly?: { cloud_cover?: number[] } } | { hourly?: { cloud_cover?: number[] } }[];
                    const locations = Array.isArray(json) ? json : [json];

                    for (let j = 0; j < batch.length; j++) {
                        const locData = locations[j];
                        if (!locData?.hourly?.cloud_cover) {
                            allResults.push({ ...batch[j], cloud_cover: 0 });
                            continue;
                        }
                        const hourlyCloud = locData.hourly.cloud_cover as number[];
                        const sunsetHourIdx = Math.min(18, hourlyCloud.length - 1);
                        allResults.push({
                            lat: batch[j].lat,
                            lng: batch[j].lng,
                            cloud_cover: hourlyCloud[sunsetHourIdx] ?? 0,
                        });
                    }
                } catch {
                    batch.forEach((p) => allResults.push({ ...p, cloud_cover: 0 }));
                }
            }

            return { data: allResults };
        },
        enabled,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const cloudTextureUrl = useMemo(() => {
        if (!data?.data || data.data.length === 0) return null;
        return renderCloudTexture(data.data);
    }, [data]);

    return { cloudTextureUrl, isLoading };
}
