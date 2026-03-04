import uq from "@umalqura/core";
import { HijriDate } from "@hilal/types";
import { findNewMoonNear } from "./moonPhase.js";
import { HIJRI_MONTHS, SYNODIC_MS } from "./constants.js";

const HIJRI_EPOCH_YEAR = 1446;
const HIJRI_EPOCH_MONTH = 1; // Muharram
const HIJRI_EPOCH_GREG = new Date(2024, 6, 7); // July 7, 2024

const newMoonCache = new Map<number, Date>();

export function getNewMoonForMonthOffset(offset: number): Date {
    if (newMoonCache.has(offset)) return newMoonCache.get(offset)!;

    const epochNM = findNewMoonNear(HIJRI_EPOCH_GREG);

    if (offset >= 0) {
        let nm = newMoonCache.get(0) ?? epochNM;
        newMoonCache.set(0, nm);
        for (let i = 1; i <= offset; i++) {
            if (!newMoonCache.has(i)) {
                const prev = newMoonCache.get(i - 1)!;
                nm = findNewMoonNear(new Date(prev.getTime() + SYNODIC_MS));
                newMoonCache.set(i, nm);
            }
        }
    } else {
        let nm = newMoonCache.get(0) ?? epochNM;
        newMoonCache.set(0, nm);
        for (let i = -1; i >= offset; i--) {
            if (!newMoonCache.has(i)) {
                const next = newMoonCache.get(i + 1)!;
                nm = findNewMoonNear(new Date(next.getTime() - SYNODIC_MS));
                newMoonCache.set(i, nm);
            }
        }
    }

    return newMoonCache.get(offset)!;
}

export function offsetToHijri(offset: number): { year: number; month: number } {
    const totalMonths = (HIJRI_EPOCH_YEAR - 1) * 12 + (HIJRI_EPOCH_MONTH - 1) + offset;
    const year = Math.floor(totalMonths / 12) + 1;
    const month = (totalMonths % 12) + 1;
    return { year, month };
}

export function hijriToOffset(year: number, month: number): number {
    const epochTotal = (HIJRI_EPOCH_YEAR - 1) * 12 + (HIJRI_EPOCH_MONTH - 1);
    const targetTotal = (year - 1) * 12 + (month - 1);
    return targetTotal - epochTotal;
}

export function gregorianToHijri(date: Date): HijriDate {
    const target = date.getTime();
    const epochNM = findNewMoonNear(HIJRI_EPOCH_GREG);
    const roughOffset = Math.round((target - epochNM.getTime()) / SYNODIC_MS);

    for (let off = roughOffset - 1; off <= roughOffset + 1; off++) {
        const monthStart = getNewMoonForMonthOffset(off);
        const nextMonthStart = getNewMoonForMonthOffset(off + 1);

        const msDay = new Date(monthStart.getFullYear(), monthStart.getMonth(), monthStart.getDate());
        const nmsDay = new Date(nextMonthStart.getFullYear(), nextMonthStart.getMonth(), nextMonthStart.getDate());
        const tDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        if (tDay.getTime() >= msDay.getTime() && tDay.getTime() < nmsDay.getTime()) {
            const day = Math.floor((tDay.getTime() - msDay.getTime()) / (24 * 3600 * 1000)) + 1;
            const { year, month } = offsetToHijri(off);
            const monthInfo = HIJRI_MONTHS[month - 1] ?? HIJRI_MONTHS[0];
            return {
                year,
                month,
                day,
                monthName: monthInfo.en,
                monthNameArabic: monthInfo.ar,
                monthNameShort: monthInfo.short,
            };
        }
    }

    const jd = gregorianToJD(date.getFullYear(), date.getMonth() + 1, date.getDate());
    const result = jdToHijri(jd);
    const monthInfo = HIJRI_MONTHS[result.month - 1] ?? HIJRI_MONTHS[0];
    return {
        year: result.year,
        month: result.month,
        day: result.day,
        monthName: monthInfo.en,
        monthNameArabic: monthInfo.ar,
        monthNameShort: monthInfo.short,
    };
}

export function gregorianToJD(y: number, m: number, d: number): number {
    if (m <= 2) { y -= 1; m += 12; }
    const A = Math.floor(y / 100);
    const B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
}

export function jdToHijri(jd: number): { year: number; month: number; day: number } {
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

export function hijriToGregorian(year: number, month: number, day: number): Date {
    const offset = hijriToOffset(year, month);
    const monthStart = getNewMoonForMonthOffset(offset);
    const msDay = new Date(monthStart.getFullYear(), monthStart.getMonth(), monthStart.getDate());
    return new Date(msDay.getTime() + (day - 1) * 24 * 3600 * 1000);
}

export function getUmmAlQuraHijri(date: Date): HijriDate {
    const d = uq(date);
    const monthInfo = HIJRI_MONTHS[d.hm - 1] ?? HIJRI_MONTHS[0];
    return {
        year: d.hy,
        month: d.hm,
        day: d.hd,
        monthName: monthInfo.en,
        monthNameArabic: monthInfo.ar,
        monthNameShort: monthInfo.short,
    };
}

export function getUmmAlQuraDaysInMonth(year: number, month: number): number {
    const d = uq(year, month, 1);
    return d.daysInMonth;
}

export function getUmmAlQuraMonthStart(year: number, month: number): Date {
    const d = uq(year, month, 1);
    return d.date;
}
