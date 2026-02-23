/**
 * Visibility Texture Web Worker
 *
 * Offloads the heavy visibility grid computation to a background thread,
 * keeping the main thread responsive during the 2-4 second calculation.
 *
 * Now imports from the shared astronomy module instead of inlining copies.
 *
 * Input message:  { dateTs: number, resolution: number, isMercator: boolean }
 * Output message: { pixels: Uint8ClampedArray, width: number, height: number }
 */
import {
    toRad,
    toDeg,
    crescentWidth,
    yallopQ,
    classifyYallop,
    ZONE_RGB,
    type VisibilityZone,
} from "@shared/astronomy";
import * as SunCalc from "suncalc";

// ─── Worker-specific calculation (simplified for grid performance) ────────────

function computeVisibilityAtPoint(date: Date, lat: number, lng: number): { zone: VisibilityZone; q: number } {
    const times = SunCalc.getTimes(date, lat, lng);
    const sunset = times.sunset instanceof Date && !isNaN(times.sunset.getTime())
        ? times.sunset
        : null;
    const calcTime = sunset ?? new Date(date.getFullYear(), date.getMonth(), date.getDate(), 18, 0, 0);

    const sunPos = SunCalc.getPosition(calcTime, lat, lng);
    const moonPos = SunCalc.getMoonPosition(calcTime, lat, lng);

    const moonAlt = toDeg(moonPos.altitude);
    const sunAlt = toDeg(sunPos.altitude);
    const arcv = moonAlt - sunAlt;

    const elongation = toDeg(Math.acos(
        Math.sin(sunPos.altitude) * Math.sin(moonPos.altitude) +
        Math.cos(sunPos.altitude) * Math.cos(moonPos.altitude) *
        Math.cos(moonPos.azimuth - sunPos.azimuth)
    ));

    const crescent = crescentWidth(elongation, moonPos.distance);
    const q = yallopQ(arcv, crescent.w);
    const safeQ = isNaN(q) ? -1.0 : q;
    const zone = classifyYallop(safeQ, moonAlt);
    return { zone, q: moonAlt <= 0 ? -1.0 : safeQ };
}

function isDaylight(lat: number, lng: number, date: Date): boolean {
    const sunPos = SunCalc.getPosition(date, lat, lng);
    return toDeg(sunPos.altitude) > -6;
}

// ─── Worker message handler ──────────────────────────────────────────────────

self.onmessage = (e: MessageEvent) => {
    const { dateTs, resolution, isMercator } = e.data;
    const date = new Date(dateTs);

    const W = Math.floor(360 / resolution);
    const H = Math.floor(180 / resolution);
    const pixels = new Uint8ClampedArray(W * H * 4);
    const qValues = new Float32Array(W * H);
    const maxLat = 85.051129;

    for (let py = 0; py < H; py++) {
        let lat: number;
        if (isMercator) {
            const mercY = Math.PI - (py / H) * 2 * Math.PI;
            lat = (2 * Math.atan(Math.exp(mercY)) - Math.PI / 2) * (180 / Math.PI);
            if (lat > maxLat) lat = maxLat;
            if (lat < -maxLat) lat = -maxLat;
        } else {
            lat = 90 - (py / H) * 180;
        }

        for (let px = 0; px < W; px++) {
            const lng = -180 + (px / W) * 360;
            const { zone, q } = computeVisibilityAtPoint(date, lat, lng);
            const [r, g, b] = ZONE_RGB[zone];
            const night = !isDaylight(lat, lng, date);
            const alpha = zone === "F" ? 40 : night ? 100 : 180;

            const pxIdx = py * W + px;
            const idx = pxIdx * 4;
            pixels[idx] = r;
            pixels[idx + 1] = g;
            pixels[idx + 2] = b;
            pixels[idx + 3] = alpha;
            qValues[pxIdx] = q;
        }
    }

    // Transfer both buffers for zero-copy performance
    (self as any).postMessage(
        { pixels, qValues, width: W, height: H },
        [pixels.buffer, qValues.buffer]
    );
};
