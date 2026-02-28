/**
 * Hilal Vision — Astronomy Engine Unit Tests
 * Tests the ACTUAL production functions from astronomy.ts for correctness.
 */
import { describe, it, expect } from "vitest";
import {
  toRad,
  toDeg,
  yallopQ,
  crescentWidth,
  classifyYallop,
  classifyOdeh,
  gregorianToJD,
  jdToHijri,
  gregorianToHijri,
  computeBestObservationTime,
} from "../shared/astronomy.js";

// ─── Yallop Classification ───────────────────────────────────────────────────

describe("Yallop q-value classification", () => {
  it("classifies zone A for high q-value", () => {
    expect(classifyYallop(0.3, 10)).toBe("A");
  });

  it("classifies zone B for borderline q-value", () => {
    expect(classifyYallop(0.0, 10)).toBe("B");
  });

  it("classifies zone E for very low q-value", () => {
    expect(classifyYallop(-0.5, 10)).toBe("E");
  });

  it("classifies zone F when moon is below horizon", () => {
    expect(classifyYallop(0.5, -1)).toBe("F");
  });

  it("classifies zone C for moderate q-value", () => {
    expect(classifyYallop(-0.1, 5)).toBe("C");
  });
});

// ─── Crescent Width ──────────────────────────────────────────────────────────

describe("Crescent width calculation", () => {
  it("returns near-zero width for very small elongation", () => {
    const { w } = crescentWidth(1, 384400);
    expect(w).toBeGreaterThan(0);
    expect(w).toBeLessThan(0.1);
  });

  it("returns larger width for larger elongation", () => {
    const { w: w1 } = crescentWidth(5, 384400);
    const { w: w2 } = crescentWidth(15, 384400);
    expect(w2).toBeGreaterThan(w1);
  });

  it("semi-diameter is approximately 15 arcmin at mean distance", () => {
    const { sd } = crescentWidth(10, 384400);
    expect(sd).toBeGreaterThan(14);
    expect(sd).toBeLessThan(17);
  });
});

// ─── Hijri Calendar ──────────────────────────────────────────────────────────

describe("Hijri calendar conversion (arithmetic fallback)", () => {
  function gregorianToHijriArithmetic(date: Date) {
    const jd = gregorianToJD(date.getFullYear(), date.getMonth() + 1, date.getDate());
    return jdToHijri(jd);
  }

  it("converts 2024-03-10 to approximately Sha'ban/Ramadan 1445", () => {
    const hijri = gregorianToHijriArithmetic(new Date(2024, 2, 10));
    expect(hijri.year).toBe(1445);
    expect([8, 9]).toContain(hijri.month);
  });

  it("converts 2024-04-10 to approximately Shawwal 1445", () => {
    const hijri = gregorianToHijriArithmetic(new Date(2024, 3, 10));
    expect(hijri.year).toBe(1445);
    expect(hijri.month).toBe(10);
  });

  it("converts 2022-04-01 to approximately Sha'ban 1443", () => {
    const hijri = gregorianToHijriArithmetic(new Date(2022, 3, 1));
    expect(hijri.year).toBe(1443);
    expect([8, 9]).toContain(hijri.month);
  });

  it("year is within expected range for modern dates", () => {
    const hijri = gregorianToHijriArithmetic(new Date(2026, 1, 18));
    expect(hijri.year).toBeGreaterThan(1440);
    expect(hijri.year).toBeLessThan(1450);
  });
});

// ─── Yallop q-value Formula ──────────────────────────────────────────────────

describe("Yallop q-value formula", () => {
  it("produces expected q for known values", () => {
    const q = yallopQ(10, 0.5);
    expect(q).toBeGreaterThan(0.0);
    expect(q).toBeLessThan(0.5);
  });

  it("q decreases as arcv decreases", () => {
    const q1 = yallopQ(15, 1);
    const q2 = yallopQ(5, 1);
    expect(q1).toBeGreaterThan(q2);
  });
});

// ─── Degree/Radian Conversions ───────────────────────────────────────────────

describe("Degree/radian conversions", () => {
  it("toRad converts 180° to π", () => {
    expect(toRad(180)).toBeCloseTo(Math.PI, 10);
  });

  it("toDeg converts π to 180°", () => {
    expect(toDeg(Math.PI)).toBeCloseTo(180, 10);
  });

  it("round-trip conversion is identity", () => {
    const deg = 45.678;
    expect(toDeg(toRad(deg))).toBeCloseTo(deg, 10);
  });
});

// ─── Best Time to Observe ────────────────────────────────────────────────────

describe("Best time to observe calculator", () => {
  it("returns a best time between sunset and moonset", () => {
    const date = new Date(2026, 1, 23);
    const loc = { lat: 21.3891, lng: 39.8579 };
    const result = computeBestObservationTime(date, loc);

    expect(result.bestTime.getTime()).toBeGreaterThanOrEqual(result.windowStart.getTime());
    expect(result.bestTime.getTime()).toBeLessThanOrEqual(result.windowEnd.getTime());
  });

  it("windowEnd is after windowStart", () => {
    const date = new Date(2026, 1, 23);
    const loc = { lat: 21.3891, lng: 39.8579 };
    const result = computeBestObservationTime(date, loc);

    expect(result.windowEnd.getTime()).toBeGreaterThan(result.windowStart.getTime());
  });

  it("score is non-negative", () => {
    const date = new Date(2026, 1, 23);
    const loc = { lat: 21.3891, lng: 39.8579 };
    const result = computeBestObservationTime(date, loc);

    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  it("sun altitude at best time is below or near horizon", () => {
    const date = new Date(2026, 1, 23);
    const loc = { lat: 21.3891, lng: 39.8579 };
    const result = computeBestObservationTime(date, loc);

    if (result.viable) {
      expect(result.sunAltAtBest).toBeLessThanOrEqual(0);
    }
  });
});

// ─── Phase 4: Edge Case Fixes ────────────────────────────────────────────────

describe("crescentWidth — edge cases (Phase 4 fixes)", () => {
  it("returns {w:0, sd:0} for zero moonDistKm (guard against NaN)", () => {
    const result = crescentWidth(10, 0);
    expect(result.w).toBe(0);
    expect(result.sd).toBe(0);
  });

  it("returns {w:0, sd:0} for moonDistKm equal to moon radius (domain boundary)", () => {
    const result = crescentWidth(10, 1737.4);
    expect(result.w).toBe(0);
    expect(result.sd).toBe(0);
  });

  it("returns {w:0, sd:0} for elongation=0 (conjunction day)", () => {
    // At conjunction, elongation is 0 — cos(0) = 1 — so w = SD*(1-1) = 0
    const result = crescentWidth(0, 384400);
    expect(result.w).toBe(0);
    expect(result.sd).toBeGreaterThan(0); // SD is still valid
  });

  it("returns valid crescent width for typical new moon geometry", () => {
    // Moon at 384400 km, elongation 8°
    const result = crescentWidth(8, 384400);
    expect(result.w).toBeGreaterThan(0);
    expect(result.sd).toBeGreaterThan(14); // SD > 14 arcmin at typical distance
    expect(result.sd).toBeLessThan(18);
  });
});

describe("classifyOdeh — Zone E fix (Phase 4)", () => {
  it("returns E for V < -1.64 (was incorrectly returning D before fix)", () => {
    expect(classifyOdeh(-2.0, 5)).toBe("E");
    expect(classifyOdeh(-1.65, 5)).toBe("E");
    expect(classifyOdeh(-99, 5)).toBe("E");
  });

  it("returns D for V in [-1.64, -0.96)", () => {
    expect(classifyOdeh(-1.64, 5)).toBe("D");
    expect(classifyOdeh(-1.0, 5)).toBe("D");
    expect(classifyOdeh(-0.97, 5)).toBe("D");
  });

  it("returns C for V in [-0.96, 2.00)", () => {
    expect(classifyOdeh(0, 5)).toBe("C");
    expect(classifyOdeh(-0.96, 5)).toBe("C");
  });

  it("returns B for V in [2.00, 5.65)", () => {
    expect(classifyOdeh(3.0, 5)).toBe("B");
  });

  it("returns A for V >= 5.65", () => {
    expect(classifyOdeh(6.0, 5)).toBe("A");
  });

  it("returns F when moon is below horizon regardless of V", () => {
    expect(classifyOdeh(10.0, -1)).toBe("F");
    expect(classifyOdeh(-5.0, 0)).toBe("F");
  });
});
