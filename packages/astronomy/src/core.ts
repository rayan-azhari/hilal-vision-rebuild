import { VisibilityZone, CrescentWidth } from "@hilal/types";
import { toRad, toDeg } from "./utils";

/**
 * Calculate crescent width using Yallop formula.
 * W = SD × (1 - cos(ARCL)) where ARCL = elongation
 */
export function crescentWidth(elongationDeg: number, moonDistKm: number): CrescentWidth {
    if (!moonDistKm || moonDistKm <= 1737.4) return { w: 0, sd: 0 };
    const SD = toDeg(Math.asin(1737.4 / moonDistKm)) * 60; // semi-diameter in arcmin
    const arcl = toRad(elongationDeg);
    const w = SD * (1 - Math.cos(arcl));
    return { w, sd: SD };
}

/**
 * Yallop (1997) q-value criterion.
 * q = (ARCV - (11.8371 - 6.3226·W + 0.7319·W² - 0.1018·W³)) / 10
 */
export function yallopQ(arcv: number, w: number): number {
    const f = 11.8371 - 6.3226 * w + 0.7319 * w * w - 0.1018 * w * w * w;
    return (arcv - f) / 10;
}

/**
 * Odeh (2004) criterion value.
 * V = ARCV - (-0.1018·W³ + 0.7319·W² - 6.3226·W + 7.1651)
 */
export function odehV(arcv: number, w: number): number {
    const f = -0.1018 * w * w * w + 0.7319 * w * w - 6.3226 * w + 7.1651;
    return arcv - f;
}

/**
 * Classify visibility zone from Yallop q-value.
 */
export function classifyYallop(q: number, moonAltAtSunset: number): VisibilityZone {
    if (moonAltAtSunset <= 0) return "F";
    if (q >= 0.216) return "A";
    if (q >= -0.014) return "B";
    if (q >= -0.160) return "C";
    if (q >= -0.232) return "D";
    return "E";
}

/**
 * Classify visibility zone from Odeh (2004) V-value.
 * Zones per Odeh (2004):
 *   A: V ≥ 5.65  — easily visible with naked eye
 *   B: V ≥ 2.00  — visible under perfect conditions
 *   C: V ≥ -0.96 — may need optical aid
 *   D: V ≥ -1.64 — not visible even with optical aid
 *   E: V < -1.64 — definitely not visible (moon too young or too low)
 */
export function classifyOdeh(v: number, moonAltAtSunset: number): VisibilityZone {
    if (moonAltAtSunset <= 0) return "F";
    if (v >= 5.65) return "A";
    if (v >= 2.00) return "B";
    if (v >= -0.96) return "C";
    if (v >= -1.64) return "D";
    return "E";
}
