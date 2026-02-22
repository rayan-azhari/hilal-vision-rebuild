/**
 * Visibility Texture Web Worker
 *
 * Offloads the heavy computeSunMoonAtSunset grid computation to a background
 * thread, keeping the main thread responsive during the 2-4 second calculation.
 *
 * Input message:  { dateTs: number, resolution: number, isMercator: boolean }
 * Output message: { pixels: Uint8ClampedArray, width: number, height: number }
 */
import * as SunCalc from "suncalc";

// ─── Inlined core calculations (can't import DOM-dependent astronomy.ts) ───

function toRad(d: number) { return d * Math.PI / 180; }
function toDeg(r: number) { return r * 180 / Math.PI; }

function crescentWidth(elongationDeg: number, moonDistKm: number) {
    const SD = toDeg(Math.asin(1737.4 / moonDistKm)) * 60;
    const w = SD * (1 - Math.cos(toRad(elongationDeg)));
    return { w, sd: SD };
}

function yallopQ(arcv: number, w: number): number {
    return (arcv - (11.8371 - 6.3226 * w + 0.7319 * w * w - 0.1018 * w * w * w)) / 10;
}

type VisibilityZone = "A" | "B" | "C" | "D" | "E" | "F";

function classifyYallop(q: number, moonAltAtSunset: number): VisibilityZone {
    if (moonAltAtSunset < 0) return "F";
    if (q >= 0.216) return "A";
    if (q >= -0.014) return "B";
    if (q >= -0.160) return "C";
    if (q >= -0.232) return "D";
    return "E";
}

const ZONE_RGB: Record<VisibilityZone, [number, number, number]> = {
    A: [74, 222, 128],
    B: [250, 204, 21],
    C: [251, 146, 60],
    D: [248, 113, 113],
    E: [107, 114, 128],
    F: [31, 41, 55],
};

function computeVisibilityAtPoint(date: Date, lat: number, lng: number): VisibilityZone {
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
    return classifyYallop(q, moonAlt);
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
            const zone = computeVisibilityAtPoint(date, lat, lng);
            const [r, g, b] = ZONE_RGB[zone];
            const night = !isDaylight(lat, lng, date);
            const alpha = zone === "F" ? 40 : night ? 100 : 180;
            const idx = (py * W + px) * 4;
            pixels[idx] = r;
            pixels[idx + 1] = g;
            pixels[idx + 2] = b;
            pixels[idx + 3] = alpha;
        }
    }

    // Transfer the buffer for zero-copy performance
    (self as any).postMessage(
        { pixels, width: W, height: H },
        [pixels.buffer]
    );
};
