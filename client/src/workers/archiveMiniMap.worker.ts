/**
 * Archive Mini-Map Web Worker
 *
 * Offloads the 900+ synchronous astronomy grid-point calculations from the
 * main thread when rendering the monthly visibility thumbnail on ArchivePage.
 *
 * Input:  { dateTs: number }   — timestamp of the Hijri month's new-moon date
 * Output: { pixels: Uint8ClampedArray, width: number, height: number }
 *          transferred zero-copy via Transferable
 */
import { crescentWidth, yallopQ, classifyYallop, type VisibilityZone } from "@shared/astronomy";
import * as Astronomy from "astronomy-engine";

// RGBA values matching ArchivePage ZONE_COLORS + hex "99" opacity (~0.6 alpha)
const ZONE_RGBA: Record<VisibilityZone, [number, number, number, number]> = {
    A: [74, 222, 128, 153],   // #4ade80
    B: [250, 204, 21, 153],   // #facc15
    C: [251, 146, 60, 153],   // #fb923c
    D: [248, 113, 113, 153],  // #f87171
    E: [107, 114, 128, 153],  // #6b7280
    F: [31, 41, 55, 80],      // #1f2937
};

function getZoneAtPoint(date: Date, lat: number, lng: number): VisibilityZone {
    const obs = new Astronomy.Observer(lat, lng, 0);
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
    const sunsetResult = Astronomy.SearchRiseSet(Astronomy.Body.Sun, obs, -1, startOfDay, 1);
    const calcTime = sunsetResult
        ? sunsetResult.date
        : new Date(date.getFullYear(), date.getMonth(), date.getDate(), 18, 0, 0);

    const eqSun = Astronomy.Equator(Astronomy.Body.Sun, calcTime, obs, true, true);
    const eqMoon = Astronomy.Equator(Astronomy.Body.Moon, calcTime, obs, true, true);
    const hcSun = Astronomy.Horizon(calcTime, obs, eqSun.ra, eqSun.dec, "normal");
    const hcMoon = Astronomy.Horizon(calcTime, obs, eqMoon.ra, eqMoon.dec, "normal");
    const moonIllum = Astronomy.Illumination(Astronomy.Body.Moon, calcTime);

    const arcv = hcMoon.altitude - hcSun.altitude;
    const elongation = Astronomy.AngleFromSun(Astronomy.Body.Moon, calcTime);
    const crescent = crescentWidth(elongation, moonIllum.geo_dist * 149597870.7);
    const q = yallopQ(arcv, crescent.w);

    return classifyYallop(isNaN(q) ? -99 : q, hcMoon.altitude);
}

self.onmessage = (e: MessageEvent) => {
    const { dateTs } = e.data;
    const date = new Date(dateTs);

    const resolution = 8;
    const W = 200;
    const H = 100;
    const pixels = new Uint8ClampedArray(W * H * 4);

    // Background: #0a0e1a
    for (let i = 0; i < pixels.length; i += 4) {
        pixels[i] = 10; pixels[i + 1] = 14; pixels[i + 2] = 26; pixels[i + 3] = 255;
    }

    for (let lat = -80; lat <= 80; lat += resolution) {
        for (let lng = -180; lng <= 180; lng += resolution) {
            const zone = getZoneAtPoint(date, lat, lng);
            const [r, g, b, a] = ZONE_RGBA[zone];

            const px = Math.floor(((lng + 180) / 360) * W);
            const py = Math.floor(((90 - lat) / 180) * H);
            const pw = Math.ceil((resolution / 360) * W) + 1;
            const ph = Math.ceil((resolution / 180) * H) + 1;

            for (let dy = 0; dy < ph; dy++) {
                for (let dx = 0; dx < pw; dx++) {
                    const ix = px + dx;
                    const iy = py + dy;
                    if (ix >= 0 && ix < W && iy >= 0 && iy < H) {
                        const idx = (iy * W + ix) * 4;
                        pixels[idx] = r;
                        pixels[idx + 1] = g;
                        pixels[idx + 2] = b;
                        pixels[idx + 3] = a;
                    }
                }
            }
        }
    }

    (self as any).postMessage({ pixels, width: W, height: H }, [pixels.buffer]);
};
