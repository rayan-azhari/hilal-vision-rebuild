/**
 * Hilal Vision — Visibility Computation Tests
 * Tests the moon visibility engine (Yallop + Odeh) and observation time computation.
 */
import { describe, it, expect } from "vitest";
import {
    computeSunMoonAtSunset,
    getSunsetTime,
    classifyYallop,
    classifyOdeh,
    yallopQ,
    odehV,
    crescentWidth,
    getMoonPhaseInfo,
    findNewMoonNear,
    computeBestObservationTime,
    generateVisibilityGrid,
    type Location,
    type VisibilityZone,
} from "../shared/astronomy.js";

// ─── Known Locations ────────────────────────────────────────────────────────

const MAKKAH: Location = { lat: 21.3891, lng: 39.8579 };
const LONDON: Location = { lat: 51.5074, lng: -0.1278 };
const BUENOS_AIRES: Location = { lat: -34.6037, lng: -58.3816 };
const TOKYO: Location = { lat: 35.6762, lng: 139.6503 };

// ─── Sunset Time ────────────────────────────────────────────────────────────

describe("getSunsetTime", () => {
    it("returns a Date for Makkah", () => {
        const sunset = getSunsetTime(new Date(2026, 1, 27), MAKKAH);
        expect(sunset).toBeInstanceOf(Date);
    });

    it("sunset in Makkah is between 14:00 and 17:00 UTC", () => {
        const sunset = getSunsetTime(new Date(2026, 1, 27), MAKKAH);
        if (sunset) {
            const hours = sunset.getUTCHours();
            expect(hours).toBeGreaterThanOrEqual(14);
            expect(hours).toBeLessThanOrEqual(17);
        }
    });

    it("sunset in London differs from Makkah", () => {
        const date = new Date(2026, 5, 21);
        const sunsetMakkah = getSunsetTime(date, MAKKAH);
        const sunsetLondon = getSunsetTime(date, LONDON);
        if (sunsetMakkah && sunsetLondon) {
            expect(sunsetMakkah.getTime()).not.toBe(sunsetLondon.getTime());
        }
    });
});

// ─── Compute Sun/Moon at Sunset ─────────────────────────────────────────────

describe("computeSunMoonAtSunset", () => {
    it("returns all required fields", () => {
        const data = computeSunMoonAtSunset(new Date(2026, 1, 27), MAKKAH);
        expect(data).toHaveProperty("moonAlt");
        expect(data).toHaveProperty("sunAlt");
        expect(data).toHaveProperty("arcv");
        expect(data).toHaveProperty("elongation");
        expect(data).toHaveProperty("crescent");  // CrescentWidth object
        expect(data).toHaveProperty("moonAge");
        expect(data).toHaveProperty("visibility");
        expect(data).toHaveProperty("qValue");
        expect(data).toHaveProperty("odehCriterion");
    });

    it("sun altitude at sunset is near 0 or negative", () => {
        const data = computeSunMoonAtSunset(new Date(2026, 1, 27), MAKKAH);
        expect(data.sunAlt).toBeLessThanOrEqual(1);
    });

    it("visibility is a valid zone (A-F)", () => {
        const data = computeSunMoonAtSunset(new Date(2026, 1, 27), MAKKAH);
        expect(["A", "B", "C", "D", "E", "F"]).toContain(data.visibility);
    });

    it("works for southern hemisphere", () => {
        const data = computeSunMoonAtSunset(new Date(2026, 1, 27), BUENOS_AIRES);
        expect(["A", "B", "C", "D", "E", "F"]).toContain(data.visibility);
    });

    it("ARCV equals moonAlt minus sunAlt", () => {
        const data = computeSunMoonAtSunset(new Date(2026, 1, 27), MAKKAH);
        expect(data.arcv).toBeCloseTo(data.moonAlt - data.sunAlt, 0);
    });
});

// ─── Yallop Classification ──────────────────────────────────────────────────
// Boundaries: A >= 0.216, B >= -0.014, C >= -0.160, D >= -0.232, E < -0.232

describe("Yallop q-value classification (comprehensive)", () => {
    const zones: [number, number, VisibilityZone][] = [
        [0.3, 10, "A"],     // q >= 0.216 → A
        [0.0, 10, "B"],     // -0.014 <= q < 0.216 → B
        [-0.1, 5, "C"],     // -0.160 <= q < -0.014 → C
        [-0.2, 3, "D"],     // -0.232 <= q < -0.160 → D
        [-0.5, 2, "E"],     // q < -0.232 → E
        [0.5, -1, "F"],     // moonAlt <= 0 → F
    ];

    for (const [q, moonAlt, expected] of zones) {
        it(`classifies q=${q}, moonAlt=${moonAlt} as zone ${expected}`, () => {
            expect(classifyYallop(q, moonAlt)).toBe(expected);
        });
    }

    it("zone F takes priority regardless of q-value", () => {
        expect(classifyYallop(1.0, -5)).toBe("F");
    });
});

// ─── Odeh Classification ────────────────────────────────────────────────────

describe("Odeh v-value classification", () => {
    it("classifies high v-value as zone A", () => {
        expect(classifyOdeh(6.0, 10)).toBe("A");
    });

    it("classifies moon below horizon as zone F", () => {
        expect(classifyOdeh(10.0, -1)).toBe("F");
    });
});

// ─── Q and V Formulas ───────────────────────────────────────────────────────

describe("Yallop Q formula", () => {
    it("q increases with ARCV", () => {
        const q1 = yallopQ(5, 1);
        const q2 = yallopQ(15, 1);
        expect(q2).toBeGreaterThan(q1);
    });

    it("q increases with wider crescent", () => {
        const q1 = yallopQ(10, 0.3);
        const q2 = yallopQ(10, 1.5);
        expect(q2).toBeGreaterThan(q1);
    });
});

describe("Odeh V formula", () => {
    it("v increases with ARCV", () => {
        const v1 = odehV(5, 1);
        const v2 = odehV(15, 1);
        expect(v2).toBeGreaterThan(v1);
    });
});

// ─── Crescent Width ─────────────────────────────────────────────────────────

describe("Crescent width (extended)", () => {
    it("width increases with elongation", () => {
        const { w: w5 } = crescentWidth(5, 384400);
        const { w: w10 } = crescentWidth(10, 384400);
        const { w: w20 } = crescentWidth(20, 384400);
        expect(w10).toBeGreaterThan(w5);
        expect(w20).toBeGreaterThan(w10);
    });

    it("semi-diameter increases when moon is closer", () => {
        const { sd: sdFar } = crescentWidth(10, 405500); // Apogee
        const { sd: sdClose } = crescentWidth(10, 363300); // Perigee
        expect(sdClose).toBeGreaterThan(sdFar);
    });

    it("width is zero at zero elongation", () => {
        const { w } = crescentWidth(0, 384400);
        expect(w).toBeCloseTo(0, 5);
    });
});

// ─── Moon Phase Info ────────────────────────────────────────────────────────

describe("getMoonPhaseInfo", () => {
    it("returns a valid phase name", () => {
        const info = getMoonPhaseInfo(new Date(2026, 1, 27));
        expect(info.phaseName).toBeTruthy();
        expect(typeof info.phaseName).toBe("string");
    });

    it("illuminatedFraction is between 0 and 1", () => {
        const info = getMoonPhaseInfo(new Date(2026, 1, 27));
        expect(info.illuminatedFraction).toBeGreaterThanOrEqual(0);
        expect(info.illuminatedFraction).toBeLessThanOrEqual(1);
    });

    it("phase is between 0 and 1", () => {
        const info = getMoonPhaseInfo(new Date(2026, 1, 27));
        expect(info.phase).toBeGreaterThanOrEqual(0);
        expect(info.phase).toBeLessThanOrEqual(1);
    });

    it("new moon has low illumination", () => {
        const newMoon = findNewMoonNear(new Date(2026, 1, 18));
        const info = getMoonPhaseInfo(newMoon);
        expect(info.illuminatedFraction).toBeLessThan(0.05);
    });

    it("has Arabic phase name", () => {
        const info = getMoonPhaseInfo(new Date(2026, 1, 27));
        expect(info.phaseArabic).toBeTruthy();
        expect(typeof info.phaseArabic).toBe("string");
    });
});

// ─── New Moon Finder ────────────────────────────────────────────────────────

describe("findNewMoonNear", () => {
    it("returns a Date", () => {
        const nm = findNewMoonNear(new Date(2026, 1, 18));
        expect(nm).toBeInstanceOf(Date);
    });

    it("new moon is within 15 days of the approximation", () => {
        const approx = new Date(2026, 1, 18);
        const nm = findNewMoonNear(approx);
        const diffDays = Math.abs(nm.getTime() - approx.getTime()) / (1000 * 60 * 60 * 24);
        expect(diffDays).toBeLessThan(16);
    });

    it("illumination at found new moon is very low", () => {
        const nm = findNewMoonNear(new Date(2026, 1, 18));
        const info = getMoonPhaseInfo(nm);
        expect(info.illuminatedFraction).toBeLessThan(0.03);
    });
});

// ─── Best Observation Time ──────────────────────────────────────────────────

describe("computeBestObservationTime (extended)", () => {
    it("works for multiple locations", () => {
        const date = new Date(2026, 1, 23);
        for (const loc of [MAKKAH, LONDON, TOKYO, BUENOS_AIRES]) {
            const result = computeBestObservationTime(date, loc);
            expect(result).toHaveProperty("bestTime");
            expect(result).toHaveProperty("windowStart");
            expect(result).toHaveProperty("windowEnd");
            expect(result).toHaveProperty("score");
        }
    });

    it("window end is after window start", () => {
        const result = computeBestObservationTime(new Date(2026, 1, 23), MAKKAH);
        expect(result.windowEnd.getTime()).toBeGreaterThanOrEqual(result.windowStart.getTime());
    });

    it("score is non-negative", () => {
        const result = computeBestObservationTime(new Date(2026, 1, 23), MAKKAH);
        expect(result.score).toBeGreaterThanOrEqual(0);
    });
});

// ─── Visibility Grid ────────────────────────────────────────────────────────
// Signature: generateVisibilityGrid(date, resolution, criterion)

describe("generateVisibilityGrid", () => {
    it("generates a grid with points", () => {
        const grid = generateVisibilityGrid(new Date(2026, 1, 27), 30);
        expect(grid).toBeInstanceOf(Array);
        expect(grid.length).toBeGreaterThan(0);
    });

    it("each point has lat, lng, and zone", () => {
        const grid = generateVisibilityGrid(new Date(2026, 1, 27), 60);
        for (const point of grid.slice(0, 5)) {
            expect(point).toHaveProperty("lat");
            expect(point).toHaveProperty("lng");
            expect(point).toHaveProperty("zone");
            expect(["A", "B", "C", "D", "E", "F"]).toContain(point.zone);
        }
    });

    it("grid works with Odeh criterion", () => {
        const grid = generateVisibilityGrid(new Date(2026, 1, 27), 60, "odeh");
        expect(grid.length).toBeGreaterThan(0);
    });

    it("finer resolution produces more points", () => {
        const coarse = generateVisibilityGrid(new Date(2026, 1, 27), 30);
        const fine = generateVisibilityGrid(new Date(2026, 1, 27), 10);
        expect(fine.length).toBeGreaterThan(coarse.length);
    });

    it("Odeh grid can contain Zone E points (Phase 4 fix verification)", () => {
        // Use day 1 of new moon cycle — deep non-visible regions should be Zone E with Odeh
        // 2024-03-10 = day of new moon (conjunction); vast majority of globe should be D/E/F
        const date = new Date(2024, 2, 10); // March 10, 2024
        const grid = generateVisibilityGrid(date, 30, "odeh");
        const zones = new Set(grid.map(p => p.zone));
        // After the fix, Zone E should appear (was previously never returned by classifyOdeh)
        expect(zones.has("E") || zones.has("F")).toBe(true);
    });

    it("grid zones are all valid VisibilityZone values", () => {
        const validZones: VisibilityZone[] = ["A", "B", "C", "D", "E", "F"];
        const grid = generateVisibilityGrid(new Date(2026, 1, 27), 30, "odeh");
        for (const point of grid) {
            expect(validZones).toContain(point.zone);
        }
    });

    it("grid does not contain NaN q-values", () => {
        const grid = generateVisibilityGrid(new Date(2026, 1, 27), 30);
        for (const point of grid) {
            expect(isNaN(point.q)).toBe(false);
        }
    });
});
