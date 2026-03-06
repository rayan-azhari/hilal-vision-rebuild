/**
 * Visibility Grid Web Worker
 *
 * Computes a grid of visibility q-values for every lat/lng cell,
 * returning Float32Array for d3.contours processing on the main thread.
 *
 * Input:  { dateTs, resolution, criterion }
 * Output: { qValues: Float32Array, width, height }
 */
import * as Astronomy from "astronomy-engine";
import {
    crescentWidth,
    yallopQ,
    odehV,
    classifyYallop,
    classifyOdeh,
} from "@hilal/astronomy";
import type { VisibilityZone } from "@hilal/types";

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

self.onmessage = (e: MessageEvent) => {
    const { dateTs, resolution, criterion } = e.data;
    const date = new Date(dateTs);

    const W = Math.floor(360 / resolution);
    const H = Math.floor(180 / resolution);
    const qValues = new Float32Array(W * H);
    const maxLat = 85.051129;

    for (let py = 0; py < H; py++) {
        // Web Mercator projection for MapLibre compatibility
        const mercY = Math.PI - ((py + 0.5) / H) * 2 * Math.PI;
        let lat = (2 * Math.atan(Math.exp(mercY)) - Math.PI / 2) * (180 / Math.PI);
        if (lat > maxLat) lat = maxLat;
        if (lat < -maxLat) lat = -maxLat;

        for (let px = 0; px < W; px++) {
            const lng = -180 + ((px + 0.5) / W) * 360;
            const utcNoon = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12, 0, 0);
            const startOfDay = new Date(utcNoon - (lng / 15) * 3600 * 1000);

            const pxIdx = py * W + px;
            try {
                const { value } = computeVisibilityAtPoint(startOfDay, lat, lng, criterion || "yallop");
                qValues[pxIdx] = value;
            } catch {
                qValues[pxIdx] = -99; // fallback: treat as below horizon
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (self as any).postMessage(
        { qValues, width: W, height: H },
        [qValues.buffer]
    );
};
