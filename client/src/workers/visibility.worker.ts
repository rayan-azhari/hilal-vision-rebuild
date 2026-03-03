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
import * as Astronomy from "astronomy-engine";

// ─── Worker-specific calculation (simplified for grid performance) ────────────

function computeVisibilityAtPoint(startOfDay: Date, lat: number, lng: number, criterion: "yallop" | "odeh", temperature?: number, pressure?: number): { zone: VisibilityZone; value: number } {
    const obs = new Astronomy.Observer(lat, lng, 0);
    const sunsetResult = Astronomy.SearchRiseSet(Astronomy.Body.Sun, obs, -1, startOfDay, 1);

    // Fallback time to 18:00 if no sunset (circumpolar regions)
    const calcTime = sunsetResult ? sunsetResult.date : new Date(startOfDay.getFullYear(), startOfDay.getMonth(), startOfDay.getDate(), 18, 0, 0);

    const eqSun = Astronomy.Equator(Astronomy.Body.Sun, calcTime, obs, true, true);
    const eqMoon = Astronomy.Equator(Astronomy.Body.Moon, calcTime, obs, true, true);
    const hcSun = Astronomy.Horizon(calcTime, obs, eqSun.ra, eqSun.dec, "normal");
    const hcMoon = Astronomy.Horizon(calcTime, obs, eqMoon.ra, eqMoon.dec, "normal");
    const moonIllum = Astronomy.Illumination(Astronomy.Body.Moon, calcTime);

    let refractionDelta = 0;
    if (temperature !== undefined && pressure !== undefined) {
        const R_std = 34 / 60;
        const R_true = R_std * (pressure / 1010) * (283 / (273 + temperature));
        refractionDelta = R_true - R_std;
    }

    const moonAlt = hcMoon.altitude + refractionDelta;
    const sunAlt = hcSun.altitude + refractionDelta;
    const arcv = moonAlt - sunAlt;

    const elongation = Astronomy.AngleFromSun(Astronomy.Body.Moon, calcTime);
    const crescent = crescentWidth(elongation, moonIllum.geo_dist * 149597870.7);

    if (criterion === "yallop") {
        const q = yallopQ(arcv, crescent.w);
        // Use -99 for NaN so classifyYallop returns "E" (definitely not visible), not a false E-zone
        const safeQ = isNaN(q) ? -99 : q;
        const zone = classifyYallop(safeQ, moonAlt);
        return { zone, value: moonAlt <= 0 ? -99 : safeQ };
    } else {
        const v = odehV(arcv, crescent.w);
        // Use -99 for NaN so classifyOdeh returns "E" (definitely not visible)
        const safeV = isNaN(v) ? -99 : v;
        const zone = classifyOdeh(safeV, moonAlt);
        return { zone, value: moonAlt <= 0 ? -99 : safeV };
    }
}

function isDaylight(lat: number, lng: number, date: Date): boolean {
    const obs = new Astronomy.Observer(lat, lng, 0);
    const eq = Astronomy.Equator(Astronomy.Body.Sun, date, obs, true, true);
    const hc = Astronomy.Horizon(date, obs, eq.ra, eq.dec, "normal");
    return hc.altitude > -6;
}

// ─── Worker message handler ──────────────────────────────────────────────────

self.onmessage = (e: MessageEvent) => {
    const { dateTs, resolution, isMercator, criterion, highContrast, temperature, pressure } = e.data;
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
            // +0.5 centers the sample in the grid cell (vs sampling at the top-left corner)
            const mercY = Math.PI - ((py + 0.5) / H) * 2 * Math.PI;
            lat = (2 * Math.atan(Math.exp(mercY)) - Math.PI / 2) * (180 / Math.PI);
            if (lat > maxLat) lat = maxLat;
            if (lat < -maxLat) lat = -maxLat;
        } else {
            lat = 90 - ((py + 0.5) / H) * 180;
        }

        for (let px = 0; px < W; px++) {
            const lng = -180 + ((px + 0.5) / W) * 360;
            // The green layer glitches on 2D map when calculated exclusively on local client startOfDay.
            // Using the UTC midnight, shifting backwards across longitudes (1 hr per 15 degrees).
            const utcMidnight = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0);
            const startOfDay = new Date(utcMidnight - (lng / 15) * 3600 * 1000);
            const { zone, value } = computeVisibilityAtPoint(startOfDay, lat, lng, criterion || "yallop", temperature, pressure);
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
