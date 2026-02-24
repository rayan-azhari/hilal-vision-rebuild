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
    odehV,
    classifyYallop,
    classifyOdeh,
    ZONE_RGB,
    HIGH_CONTRAST_ZONE_RGB,
    type VisibilityZone,
} from "@shared/astronomy";
import * as SunCalc from "suncalc";

// ─── Worker-specific calculation (simplified for grid performance) ────────────

function computeVisibilityAtPoint(date: Date, lat: number, lng: number, criterion: "yallop" | "odeh"): { zone: VisibilityZone; value: number } {
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

    if (criterion === "yallop") {
        const q = yallopQ(arcv, crescent.w);
        const safeQ = isNaN(q) ? -1.0 : q;
        const zone = classifyYallop(safeQ, moonAlt);
        return { zone, value: moonAlt <= 0 ? -1.0 : safeQ };
    } else {
        const v = odehV(arcv, crescent.w);
        const safeV = isNaN(v) ? -10.0 : v;
        const zone = classifyOdeh(safeV, moonAlt);
        return { zone, value: moonAlt <= 0 ? -10.0 : safeV };
    }
}

function isDaylight(lat: number, lng: number, date: Date): boolean {
    const sunPos = SunCalc.getPosition(date, lat, lng);
    return toDeg(sunPos.altitude) > -6;
}

// ─── Worker message handler ──────────────────────────────────────────────────

self.onmessage = (e: MessageEvent) => {
    const { dateTs, resolution, isMercator, criterion, highContrast } = e.data;
    const date = new Date(dateTs);

    const W = Math.floor(360 / resolution);
    const H = Math.floor(180 / resolution);
    const pixels = new Uint8ClampedArray(W * H * 4);
    const qValues = new Float32Array(W * H);
    const maxLat = 85.051129;

    const rgbMap = highContrast ? HIGH_CONTRAST_ZONE_RGB : ZONE_RGB;

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
            const { zone, value } = computeVisibilityAtPoint(date, lat, lng, criterion || "yallop");
            const [r, g, b] = rgbMap[zone];
            const night = !isDaylight(lat, lng, date);
            const alpha = zone === "F" ? 40 : night ? 100 : 180;

            const pxIdx = py * W + px;
            const idx = pxIdx * 4;
            pixels[idx] = r;
            pixels[idx + 1] = g;
            pixels[idx + 2] = b;
            pixels[idx + 3] = alpha;
            qValues[pxIdx] = value;
        }
    }

    // Transfer both buffers for zero-copy performance
    (self as any).postMessage(
        { pixels, qValues, width: W, height: H },
        [pixels.buffer, qValues.buffer]
    );
};
