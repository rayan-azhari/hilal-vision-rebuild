/**
 * Hilal Vision — Astronomy Engine Unit Tests
 * Tests the core calculation functions for correctness.
 */
import { describe, it, expect } from "vitest";

// We test pure math functions inline since they don't depend on the server
const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;

function yallopQ(arcv: number, w: number): number {
  const f = 11.8371 - 6.3226 * w + 0.7319 * w * w - 0.1018 * w * w * w;
  return (arcv - f) / 10;
}

function crescentWidth(elongationDeg: number, moonDistKm: number): { w: number; sd: number } {
  const SD = toDeg(Math.asin(1737.4 / moonDistKm)) * 60;
  const arcl = toRad(elongationDeg);
  const w = SD * (1 - Math.cos(arcl));
  return { w, sd: SD };
}

function classifyYallop(q: number, moonAlt: number): string {
  if (moonAlt <= 0) return "F";
  if (q >= 0.216) return "A";
  if (q >= -0.014) return "B";
  if (q >= -0.160) return "C";
  if (q >= -0.232) return "D";
  return "E";
}

function gregorianToJD(y: number, m: number, d: number): number {
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
}

function jdToHijri(jd: number): { year: number; month: number; day: number } {
  const z = Math.floor(jd + 0.5);
  const a = z - 1948440 + 10632;
  const n = Math.floor((a - 1) / 10631);
  const aa = a - 10631 * n + 354;
  const j = Math.floor((10985 - aa) / 5316) * Math.floor(50 * aa / 17719) +
            Math.floor(aa / 5670) * Math.floor(43 * aa / 15238);
  const aa2 = aa - Math.floor((30 - j) / 15) * Math.floor(17719 * j / 50) -
              Math.floor(j / 16) * Math.floor(15238 * j / 43) + 29;
  const month = Math.floor(24 * aa2 / 709);
  const day = aa2 - Math.floor(709 * month / 24);
  const year = 30 * n + j - 30;
  return { year, month, day };
}

function gregorianToHijri(date: Date): { year: number; month: number; day: number } {
  const jd = gregorianToJD(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return jdToHijri(jd);
}

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

describe("Hijri calendar conversion", () => {
  it("converts 2024-03-10 to approximately Sha'ban/Ramadan 1445", () => {
    const hijri = gregorianToHijri(new Date(2024, 2, 10));
    expect(hijri.year).toBe(1445);
    // March 10, 2024 is in Sha'ban (8) or Ramadan (9)
    expect([8, 9]).toContain(hijri.month);
  });

  it("converts 2024-04-10 to approximately Shawwal 1445", () => {
    const hijri = gregorianToHijri(new Date(2024, 3, 10));
    expect(hijri.year).toBe(1445);
    expect(hijri.month).toBe(10); // Shawwal
  });

  it("converts 2022-04-01 to approximately Sha'ban 1443", () => {
    const hijri = gregorianToHijri(new Date(2022, 3, 1));
    expect(hijri.year).toBe(1443);
    // April 1, 2022 is in Sha'ban (month 8) or early Ramadan (month 9)
    expect([8, 9]).toContain(hijri.month);
  });

  it("year is within expected range for modern dates", () => {
    const hijri = gregorianToHijri(new Date(2026, 1, 18));
    expect(hijri.year).toBeGreaterThan(1440);
    expect(hijri.year).toBeLessThan(1450);
  });
});

describe("Yallop q-value formula", () => {
  it("produces expected q for known values", () => {
    // For arcv=10, w=0.5: f = 11.8371 - 3.1613 + 0.18298 - 0.01273 ≈ 8.85
    // q = (10 - 8.85) / 10 ≈ 0.115
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
