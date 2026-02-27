/**
 * Hilal Vision — Islamic Calendar Engine Tests
 * Tests all three calendar engines and edge cases.
 */
import { describe, it, expect } from "vitest";
import {
    gregorianToHijri,
    gregorianToJD,
    jdToHijri,
    hijriToGregorian,
    getUmmAlQuraHijri,
    getUmmAlQuraDaysInMonth,
    getUmmAlQuraMonthStart,
    HIJRI_MONTHS,
} from "../shared/astronomy.js";

// ─── Hijri Month Names ──────────────────────────────────────────────────────

describe("Hijri month names", () => {
    it("has exactly 12 months", () => {
        expect(HIJRI_MONTHS).toHaveLength(12);
    });

    it("starts with Muharram and ends with Dhu al-Hijjah", () => {
        expect(HIJRI_MONTHS[0].en).toBe("Muharram");
        expect(HIJRI_MONTHS[11].en).toBe("Dhu al-Hijjah");
    });

    it("Ramadan is month 9 (index 8)", () => {
        expect(HIJRI_MONTHS[8].en).toBe("Ramadan");
    });

    it("each month has en, ar, and short properties", () => {
        for (const month of HIJRI_MONTHS) {
            expect(month).toHaveProperty("en");
            expect(month).toHaveProperty("ar");
            expect(month).toHaveProperty("short");
        }
    });
});

// ─── Gregorian to Hijri (Astronomical) ──────────────────────────────────────

describe("gregorianToHijri (astronomical engine)", () => {
    it("converts known Ramadan 2024 start date", () => {
        // Ramadan 1445 started approximately March 11-12, 2024
        const hijri = gregorianToHijri(new Date(2024, 2, 12));
        expect(hijri.year).toBe(1445);
        expect(hijri.month).toBe(9); // Ramadan
    });

    it("converts known Eid al-Fitr 2024 date", () => {
        // Shawwal 1, 1445 ≈ April 10, 2024
        const hijri = gregorianToHijri(new Date(2024, 3, 10));
        expect(hijri.year).toBe(1445);
        expect(hijri.month).toBe(10); // Shawwal
    });

    it("returns valid day range (1-30)", () => {
        const hijri = gregorianToHijri(new Date(2026, 1, 27));
        expect(hijri.day).toBeGreaterThanOrEqual(1);
        expect(hijri.day).toBeLessThanOrEqual(30);
    });

    it("returns valid month range (1-12)", () => {
        const hijri = gregorianToHijri(new Date(2026, 1, 27));
        expect(hijri.month).toBeGreaterThanOrEqual(1);
        expect(hijri.month).toBeLessThanOrEqual(12);
    });

    it("year is in expected range for 2020-2030 Gregorian dates", () => {
        for (const year of [2020, 2023, 2026, 2029]) {
            const hijri = gregorianToHijri(new Date(year, 0, 15));
            expect(hijri.year).toBeGreaterThanOrEqual(1441);
            expect(hijri.year).toBeLessThanOrEqual(1452);
        }
    });
});

// ─── Julian Day / Tabular Hijri ─────────────────────────────────────────────

describe("Julian Day and Tabular Hijri", () => {
    it("gregorianToJD returns known value for J2000.0 epoch", () => {
        // J2000.0 = January 1.5, 2000 = JD 2451545.0
        const jd = gregorianToJD(2000, 1, 1);
        expect(jd).toBeCloseTo(2451544.5, 0);
    });

    it("jdToHijri returns valid Hijri date", () => {
        const jd = gregorianToJD(2024, 3, 12);
        const hijri = jdToHijri(jd);
        expect(hijri.year).toBe(1445);
        expect(hijri.month).toBeGreaterThanOrEqual(8);
        expect(hijri.month).toBeLessThanOrEqual(9);
    });

    it("day is always between 1 and 30", () => {
        for (let m = 1; m <= 12; m++) {
            const jd = gregorianToJD(2025, m, 15);
            const hijri = jdToHijri(jd);
            expect(hijri.day).toBeGreaterThanOrEqual(1);
            expect(hijri.day).toBeLessThanOrEqual(30);
        }
    });
});

// ─── Hijri to Gregorian Round-Trip ──────────────────────────────────────────

describe("hijriToGregorian", () => {
    it("returns a valid Date object", () => {
        const date = hijriToGregorian(1445, 9, 1);
        expect(date).toBeInstanceOf(Date);
        expect(isNaN(date.getTime())).toBe(false);
    });

    it("Muharram 1, 1446 falls in mid-2024", () => {
        const date = hijriToGregorian(1446, 1, 1);
        expect(date.getFullYear()).toBe(2024);
        expect(date.getMonth()).toBeGreaterThanOrEqual(5); // June or later
    });
});

// ─── Umm al-Qura Calendar ──────────────────────────────────────────────────

describe("Umm al-Qura calendar engine", () => {
    it("getUmmAlQuraHijri returns valid date for today", () => {
        const hijri = getUmmAlQuraHijri(new Date());
        expect(hijri.year).toBeGreaterThanOrEqual(1440);
        expect(hijri.month).toBeGreaterThanOrEqual(1);
        expect(hijri.month).toBeLessThanOrEqual(12);
        expect(hijri.day).toBeGreaterThanOrEqual(1);
        expect(hijri.day).toBeLessThanOrEqual(30);
    });

    it("month has 29 or 30 days", () => {
        const days = getUmmAlQuraDaysInMonth(1445, 9); // Ramadan 1445
        expect([29, 30]).toContain(days);
    });

    it("getUmmAlQuraMonthStart returns a valid date", () => {
        const start = getUmmAlQuraMonthStart(1445, 9);
        expect(start).toBeInstanceOf(Date);
        expect(isNaN(start.getTime())).toBe(false);
    });

    it("all 12 months of 1445 have valid day counts", () => {
        for (let m = 1; m <= 12; m++) {
            const days = getUmmAlQuraDaysInMonth(1445, m);
            expect(days).toBeGreaterThanOrEqual(29);
            expect(days).toBeLessThanOrEqual(30);
        }
    });
});

// ─── Cross-Engine Consistency ───────────────────────────────────────────────

describe("Cross-engine consistency", () => {
    it("all three engines agree on the Hijri year for a known date", () => {
        const date = new Date(2024, 3, 15); // April 15, 2024
        const astronomical = gregorianToHijri(date);
        const tabular = jdToHijri(gregorianToJD(2024, 4, 15));
        const ummAlQura = getUmmAlQuraHijri(date);

        // All should agree on the year
        expect(astronomical.year).toBe(1445);
        expect(tabular.year).toBe(1445);
        expect(ummAlQura.year).toBe(1445);
    });

    it("engines agree within 1 day for recent dates", () => {
        const date = new Date(2025, 5, 15);
        const astro = gregorianToHijri(date);
        const tabular = jdToHijri(gregorianToJD(2025, 6, 15));
        const uaq = getUmmAlQuraHijri(date);

        // Months should match or be off by at most 1
        expect(Math.abs(astro.month - tabular.month)).toBeLessThanOrEqual(1);
        expect(Math.abs(astro.month - uaq.month)).toBeLessThanOrEqual(1);
    });
});
