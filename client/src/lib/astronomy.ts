/**
 * Hilal Vision — Astronomy Calculation Engine
 * Implements Yallop (1997) and Odeh (2004) crescent visibility criteria.
 * Uses SunCalc for sun/moon positions and adds Islamic-specific calculations.
 */

import * as SunCalc from "suncalc";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Location {
  lat: number;
  lng: number;
  name?: string;
}

export interface SunMoonData {
  sunAlt: number;       // degrees
  sunAz: number;        // degrees
  moonAlt: number;      // degrees
  moonAz: number;       // degrees
  elongation: number;   // degrees (angular separation sun-moon)
  moonAge: number;      // hours since new moon
  arcv: number;         // Arc of Vision (moon alt - sun alt at sunset)
  daz: number;          // Difference in azimuth (moon az - sun az)
  crescent: CrescentWidth;
  qValue: number;       // Yallop q-value
  odehCriterion: number;// Odeh criterion value
  visibility: VisibilityZone;
  illumination: number; // 0–1
  phase: number;        // 0–1 (0=new, 0.5=full, 1=new)
  moonrise: Date | null;
  moonset: Date | null;
  sunset: Date | null;
  sunrise: Date | null;
  maghrib: Date | null; // ~18 min after sunset
}

export interface CrescentWidth {
  w: number;   // crescent width in arcminutes
  sd: number;  // semi-diameter in arcminutes
}

export type VisibilityZone =
  | "A" // Easily visible (q >= +0.216)
  | "B" // Visible under perfect conditions (q >= -0.014)
  | "C" // May need optical aid (q >= -0.160)
  | "D" // Only with optical aid (q >= -0.232)
  | "E" // Not visible even with optical aid (q < -0.232)
  | "F"; // Below horizon / not yet born

export interface MoonPhaseInfo {
  phase: number;        // 0–1
  phaseName: string;
  phaseArabic: string;
  illumination: number; // 0–100 %
  age: number;          // days since last new moon
  nextNewMoon: Date;
  nextFullMoon: Date;
  lastNewMoon: Date;
}

export interface HijriDate {
  year: number;
  month: number;
  day: number;
  monthName: string;
  monthNameArabic: string;
  monthNameShort: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const HIJRI_MONTHS = [
  { en: "Muharram", ar: "مُحَرَّم", short: "MUH" },
  { en: "Safar", ar: "صَفَر", short: "SFR" },
  { en: "Rabi al-Awwal", ar: "رَبِيع الأَوَّل", short: "RBA" },
  { en: "Rabi al-Thani", ar: "رَبِيع الثَّانِي", short: "RBT" },
  { en: "Jumada al-Ula", ar: "جُمَادَى الأُولَى", short: "JMO" },
  { en: "Jumada al-Akhira", ar: "جُمَادَى الآخِرَة", short: "JMT" },
  { en: "Rajab", ar: "رَجَب", short: "RJB" },
  { en: "Sha'ban", ar: "شَعْبَان", short: "SHB" },
  { en: "Ramadan", ar: "رَمَضَان", short: "RMD" },
  { en: "Shawwal", ar: "شَوَّال", short: "SHW" },
  { en: "Dhu al-Qi'dah", ar: "ذُو الْقَعْدَة", short: "ZQD" },
  { en: "Dhu al-Hijjah", ar: "ذُو الْحِجَّة", short: "ZHJ" },
];

export const VISIBILITY_LABELS: Record<VisibilityZone, { label: string; color: string; desc: string }> = {
  A: { label: "Easily Visible", color: "#4ade80", desc: "Naked eye sighting highly probable" },
  B: { label: "Visible", color: "#facc15", desc: "Visible under good conditions" },
  C: { label: "Optical Aid Helpful", color: "#fb923c", desc: "Binoculars may be needed" },
  D: { label: "Optical Aid Only", color: "#f87171", desc: "Only visible with telescope" },
  E: { label: "Not Visible", color: "#6b7280", desc: "Below visibility threshold" },
  F: { label: "Below Horizon", color: "#374151", desc: "Moon sets before or with sun" },
};

// ─── Core Calculations ────────────────────────────────────────────────────────

/** Convert degrees to radians */
export const toRad = (d: number) => (d * Math.PI) / 180;
/** Convert radians to degrees */
export const toDeg = (r: number) => (r * 180) / Math.PI;

/**
 * Calculate crescent width using Yallop formula.
 * W = SD × (1 - cos(ARCL)) where ARCL = elongation
 */
function crescentWidth(elongationDeg: number, moonDistKm: number): CrescentWidth {
  const SD = toDeg(Math.asin(1737.4 / moonDistKm)) * 60; // semi-diameter in arcmin
  const arcl = toRad(elongationDeg);
  const w = SD * (1 - Math.cos(arcl));
  return { w, sd: SD };
}

/**
 * Yallop (1997) q-value criterion.
 * q = (ARCV - (11.8371 - 6.3226·W + 0.7319·W² - 0.1018·W³)) / 10
 */
function yallopQ(arcv: number, w: number): number {
  const f = 11.8371 - 6.3226 * w + 0.7319 * w * w - 0.1018 * w * w * w;
  return (arcv - f) / 10;
}

/**
 * Odeh (2004) criterion value.
 * V = ARCV - (-0.1018·W³ + 0.7319·W² - 6.3226·W + 7.1651)
 */
function odehV(arcv: number, w: number): number {
  const f = -0.1018 * w * w * w + 0.7319 * w * w - 6.3226 * w + 7.1651;
  return arcv - f;
}

/**
 * Classify visibility zone from Yallop q-value.
 */
function classifyYallop(q: number, moonAltAtSunset: number): VisibilityZone {
  if (moonAltAtSunset <= 0) return "F";
  if (q >= 0.216) return "A";
  if (q >= -0.014) return "B";
  if (q >= -0.160) return "C";
  if (q >= -0.232) return "D";
  return "E";
}

export const ZONE_RGB: Record<VisibilityZone, [number, number, number]> = {
  A: [74, 222, 128],
  B: [250, 204, 21],
  C: [251, 146, 60],
  D: [248, 113, 113],
  E: [107, 114, 128],
  F: [31, 41, 55],
};

export function buildVisibilityTexture(date: Date, resolution = 2, isMercator = false): string {
  const W = Math.floor(360 / resolution);
  const H = Math.floor(180 / resolution);
  const offCanvas = document.createElement("canvas");
  offCanvas.width = W;
  offCanvas.height = H;
  const offCtx = offCanvas.getContext("2d")!;
  const imageData = offCtx.createImageData(W, H);
  const data = imageData.data;

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
      const result = computeSunMoonAtSunset(date, { lat, lng });
      const [r, g, b] = ZONE_RGB[result.visibility];
      const night = !isDaylight(lat, lng, date);
      const alpha = result.visibility === "F" ? 40 : night ? 100 : 180;
      const idx = (py * W + px) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = alpha;
    }
  }
  offCtx.putImageData(imageData, 0, 0);

  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  // Smooth the boundaries between the low-res computed pixels
  ctx.filter = "blur(12px)";
  // Draw 3 times to wrap the edges seamlessly across the dateline
  ctx.drawImage(offCanvas, -canvas.width, 0, canvas.width, canvas.height);
  ctx.drawImage(offCanvas, 0, 0, canvas.width, canvas.height);
  ctx.drawImage(offCanvas, canvas.width, 0, canvas.width, canvas.height);

  return canvas.toDataURL();
}

/**
 * Get the time of astronomical sunset for a location and date.
 */
export function getSunsetTime(date: Date, loc: Location): Date | null {
  const times = SunCalc.getTimes(date, loc.lat, loc.lng);
  return times.sunset instanceof Date && !isNaN(times.sunset.getTime())
    ? times.sunset
    : null;
}

/**
 * Main calculation: compute all sun/moon parameters at sunset for a given date and location.
 */
export function computeSunMoonAtSunset(date: Date, loc: Location): SunMoonData {
  const times = SunCalc.getTimes(date, loc.lat, loc.lng);
  const sunset = times.sunset instanceof Date && !isNaN(times.sunset.getTime())
    ? times.sunset
    : null;
  const sunrise = times.sunrise instanceof Date && !isNaN(times.sunrise.getTime())
    ? times.sunrise
    : null;

  // Use sunset time for calculations, or 18:00 local as fallback
  const calcTime = sunset ?? new Date(date.getFullYear(), date.getMonth(), date.getDate(), 18, 0, 0);

  const sunPos = SunCalc.getPosition(calcTime, loc.lat, loc.lng);
  const moonPos = SunCalc.getMoonPosition(calcTime, loc.lat, loc.lng);
  const moonIllum = SunCalc.getMoonIllumination(calcTime);
  const moonTimes = SunCalc.getMoonTimes(date, loc.lat, loc.lng);

  const sunAlt = toDeg(sunPos.altitude);
  const sunAz = toDeg(sunPos.azimuth) + 180; // SunCalc returns south=0; convert to N=0
  const moonAlt = toDeg(moonPos.altitude);
  const moonAz = toDeg(moonPos.azimuth) + 180;

  // Elongation (angular distance between sun and moon)
  const elongation = toDeg(Math.acos(
    Math.sin(sunPos.altitude) * Math.sin(moonPos.altitude) +
    Math.cos(sunPos.altitude) * Math.cos(moonPos.altitude) *
    Math.cos(moonPos.azimuth - sunPos.azimuth)
  ));

  // Arc of Vision: moon altitude minus sun altitude at sunset
  const arcv = moonAlt - sunAlt;

  // Difference in azimuth
  const daz = moonAz - sunAz;

  // Moon distance for crescent width
  const moonDist = moonPos.distance; // km
  const crescent = crescentWidth(elongation, moonDist);

  const q = yallopQ(arcv, crescent.w);
  const odeh = odehV(arcv, crescent.w);

  // Moon age: approximate from phase angle
  // Phase 0 = new moon, cycles every ~29.53 days
  const moonAge = moonIllum.phase * 29.53 * 24; // hours

  const maghrib = sunset ? new Date(sunset.getTime() + 18 * 60 * 1000) : null;

  return {
    sunAlt,
    sunAz,
    moonAlt,
    moonAz,
    elongation,
    moonAge,
    arcv,
    daz,
    crescent,
    qValue: q,
    odehCriterion: odeh,
    visibility: classifyYallop(q, moonAlt),
    illumination: moonIllum.fraction,
    phase: moonIllum.phase,
    moonrise: moonTimes.rise instanceof Date ? moonTimes.rise : null,
    moonset: moonTimes.set instanceof Date ? moonTimes.set : null,
    sunset,
    sunrise,
    maghrib,
  };
}

/**
 * Generate a world visibility grid for a given date.
 * Returns an array of {lat, lng, zone, q} for every 2° grid point.
 */
export function generateVisibilityGrid(
  date: Date,
  resolution = 4
): Array<{ lat: number; lng: number; zone: VisibilityZone; q: number }> {
  const results: Array<{ lat: number; lng: number; zone: VisibilityZone; q: number }> = [];

  for (let lat = -80; lat <= 80; lat += resolution) {
    for (let lng = -180; lng <= 180; lng += resolution) {
      const data = computeSunMoonAtSunset(date, { lat, lng });
      results.push({ lat, lng, zone: data.visibility, q: data.qValue });
    }
  }

  return results;
}

// ─── Moon Phase ───────────────────────────────────────────────────────────────

export function getMoonPhaseInfo(date: Date): MoonPhaseInfo {
  const illum = SunCalc.getMoonIllumination(date);
  const phase = illum.phase;
  const illumination = Math.round(illum.fraction * 100);

  // Moon age in days (approximate)
  const LUNAR_CYCLE = 29.53058867;
  const age = phase * LUNAR_CYCLE;

  const phaseName = getPhaseName(phase);
  const phaseArabic = getPhaseArabic(phase);

  // Find next new moon (phase crosses 0)
  const nextNewMoon = findNextPhase(date, 0);
  const nextFullMoon = findNextPhase(date, 0.5);
  const lastNewMoon = findLastNewMoon(date);

  return { phase, phaseName, phaseArabic, illumination, age, nextNewMoon, nextFullMoon, lastNewMoon };
}

function getPhaseName(phase: number): string {
  if (phase < 0.033 || phase > 0.967) return "New Moon";
  if (phase < 0.25) return "Waxing Crescent";
  if (phase < 0.283) return "First Quarter";
  if (phase < 0.467) return "Waxing Gibbous";
  if (phase < 0.533) return "Full Moon";
  if (phase < 0.717) return "Waning Gibbous";
  if (phase < 0.750) return "Last Quarter";
  return "Waning Crescent";
}

function getPhaseArabic(phase: number): string {
  if (phase < 0.033 || phase > 0.967) return "المحاق";
  if (phase < 0.25) return "الهلال المتزايد";
  if (phase < 0.283) return "التربيع الأول";
  if (phase < 0.467) return "الأحدب المتزايد";
  if (phase < 0.533) return "البدر";
  if (phase < 0.717) return "الأحدب المتناقص";
  if (phase < 0.750) return "التربيع الأخير";
  return "الهلال المتناقص";
}

function findNextPhase(from: Date, targetPhase: number): Date {
  const LUNAR_CYCLE_MS = 29.53058867 * 24 * 3600 * 1000;
  let t = new Date(from.getTime() + 24 * 3600 * 1000);
  for (let i = 0; i < 35; i++) {
    const illum = SunCalc.getMoonIllumination(t);
    const diff = Math.abs(illum.phase - targetPhase);
    if (diff < 0.02) return t;
    t = new Date(t.getTime() + 12 * 3600 * 1000);
  }
  // Fallback: estimate
  const currentPhase = SunCalc.getMoonIllumination(from).phase;
  let phaseDiff = targetPhase - currentPhase;
  if (phaseDiff <= 0) phaseDiff += 1;
  return new Date(from.getTime() + phaseDiff * LUNAR_CYCLE_MS);
}

function findLastNewMoon(from: Date): Date {
  const LUNAR_CYCLE_MS = 29.53058867 * 24 * 3600 * 1000;
  let t = new Date(from.getTime() - 24 * 3600 * 1000);
  for (let i = 0; i < 35; i++) {
    const illum = SunCalc.getMoonIllumination(t);
    if (illum.phase < 0.03 || illum.phase > 0.97) return t;
    t = new Date(t.getTime() - 12 * 3600 * 1000);
  }
  // Fallback
  const currentPhase = SunCalc.getMoonIllumination(from).phase;
  return new Date(from.getTime() - currentPhase * LUNAR_CYCLE_MS);
}

// ─── Hijri Calendar ───────────────────────────────────────────────────────────

/**
 * Lunar synodic month length in milliseconds (~29.53059 days).
 */
const SYNODIC_MS = 29.53058867 * 24 * 3600 * 1000;

/**
 * Find the precise moment of the new moon (conjunction) nearest to `approx`.
 * Searches in 6-hour steps for the phase minimum (phase crosses 0/1).
 */
function findNewMoonNear(approx: Date): Date {
  // Coarse search: 6-hour steps over ±15 days
  const start = approx.getTime() - 15 * 24 * 3600 * 1000;
  let bestT = start;
  let bestPhase = 1;

  for (let t = start; t < start + 30 * 24 * 3600 * 1000; t += 6 * 3600 * 1000) {
    const p = SunCalc.getMoonIllumination(new Date(t)).phase;
    // Phase wraps 0→1, new moon is at 0 (or equivalently 1)
    const dist = Math.min(p, 1 - p);
    if (dist < bestPhase) {
      bestPhase = dist;
      bestT = t;
    }
  }

  // Fine search: 30-minute steps over ±6 hours
  const fineStart = bestT - 6 * 3600 * 1000;
  for (let t = fineStart; t < bestT + 6 * 3600 * 1000; t += 30 * 60 * 1000) {
    const p = SunCalc.getMoonIllumination(new Date(t)).phase;
    const dist = Math.min(p, 1 - p);
    if (dist < bestPhase) {
      bestPhase = dist;
      bestT = t;
    }
  }

  return new Date(bestT);
}

/**
 * Known reference epoch: 1 Muharram 1446 AH ≈ July 7, 2024 (conjunction-based).
 * This date corresponds to the new moon nearest to the Umm al-Qura start of 1446.
 */
const HIJRI_EPOCH_YEAR = 1446;
const HIJRI_EPOCH_MONTH = 1; // Muharram
const HIJRI_EPOCH_GREG = new Date(2024, 6, 7); // July 7, 2024

/**
 * Build a list of new moon dates starting from an epoch.
 * Each index corresponds to one Hijri month (0 = epoch month, 1 = next month, etc.).
 * Returns the Gregorian date of the 1st of each Hijri month.
 */
const newMoonCache = new Map<number, Date>();

function getNewMoonForMonthOffset(offset: number): Date {
  if (newMoonCache.has(offset)) return newMoonCache.get(offset)!;

  // Start from the epoch new moon and step forward/backward
  const epochNM = findNewMoonNear(HIJRI_EPOCH_GREG);

  if (offset >= 0) {
    // Walk forward
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
    // Walk backward
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

/**
 * Convert month offset to Hijri year/month.
 */
function offsetToHijri(offset: number): { year: number; month: number } {
  const totalMonths = (HIJRI_EPOCH_YEAR - 1) * 12 + (HIJRI_EPOCH_MONTH - 1) + offset;
  const year = Math.floor(totalMonths / 12) + 1;
  const month = (totalMonths % 12) + 1;
  return { year, month };
}

/**
 * Convert Hijri year/month to month offset from epoch.
 */
function hijriToOffset(year: number, month: number): number {
  const epochTotal = (HIJRI_EPOCH_YEAR - 1) * 12 + (HIJRI_EPOCH_MONTH - 1);
  const targetTotal = (year - 1) * 12 + (month - 1);
  return targetTotal - epochTotal;
}

/**
 * Convert Gregorian date to Hijri (Islamic) date.
 * Uses astronomical conjunction to determine month boundaries.
 */
export function gregorianToHijri(date: Date): HijriDate {
  const target = date.getTime();

  // Estimate which month offset we're in
  const epochNM = findNewMoonNear(HIJRI_EPOCH_GREG);
  const roughOffset = Math.round((target - epochNM.getTime()) / SYNODIC_MS);

  // Search nearby offsets to find the right month
  for (let off = roughOffset - 1; off <= roughOffset + 1; off++) {
    const monthStart = getNewMoonForMonthOffset(off);
    const nextMonthStart = getNewMoonForMonthOffset(off + 1);

    // Use the calendar day (midnight) for month boundaries
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

  // Fallback to arithmetic algorithm (should rarely happen)
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

// Keep arithmetic functions as internal fallbacks
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

/**
 * Convert Hijri date to Gregorian.
 * Uses conjunction-based approach to find the correct new moon.
 */
export function hijriToGregorian(year: number, month: number, day: number): Date {
  const offset = hijriToOffset(year, month);
  const monthStart = getNewMoonForMonthOffset(offset);
  // Calendar day of month start
  const msDay = new Date(monthStart.getFullYear(), monthStart.getMonth(), monthStart.getDate());
  return new Date(msDay.getTime() + (day - 1) * 24 * 3600 * 1000);
}

function jdToGregorian(jd: number): Date {
  const z = Math.floor(jd + 0.5);
  const a = Math.floor((z - 1867216.25) / 36524.25);
  const aa = z + 1 + a - Math.floor(a / 4);
  const b = aa + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);
  const day = b - d - Math.floor(30.6001 * e);
  const month = e < 14 ? e - 1 : e - 13;
  const year = month > 2 ? c - 4716 : c - 4715;
  return new Date(year, month - 1, day);
}

// ─── Day/Night Terminator ─────────────────────────────────────────────────────

/**
 * Calculate the solar declination and equation of time for a given date.
 * Returns the sub-solar point (lat/lng where sun is directly overhead).
 */
export function getSubSolarPoint(date: Date): { lat: number; lng: number } {
  // Hour angle at UTC
  const jd = date.getTime() / 86400000 + 2440587.5;
  const T = (jd - 2451545.0) / 36525;
  const L0 = 280.46646 + 36000.76983 * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const Mrad = toRad(M);
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad)
    + (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad)
    + 0.000289 * Math.sin(3 * Mrad);
  const sunLon = L0 + C;
  const omega = 125.04 - 1934.136 * T;
  const lambda = sunLon - 0.00569 - 0.00478 * Math.sin(toRad(omega));
  const epsilon = 23.439291111 - 0.013004167 * T;
  const declRad = Math.asin(Math.sin(toRad(epsilon)) * Math.sin(toRad(lambda)));
  const declDeg = toDeg(declRad);

  // Greenwich Hour Angle
  const utcHours = (date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600);
  const gha = (utcHours - 12) * 15;

  return { lat: declDeg, lng: -gha };
}

/**
 * Generate terminator polygon points for day/night boundary.
 * Returns array of [lng, lat] points forming the terminator curve.
 */
export function getTerminatorPoints(date: Date, steps = 360): Array<[number, number]> {
  const { lat: decl, lng: gha } = getSubSolarPoint(date);
  const declRad = toRad(decl);
  const points: Array<[number, number]> = [];

  for (let i = 0; i <= steps; i++) {
    const lng = -180 + (360 * i) / steps;
    const lngRad = toRad(lng - (-gha));
    const latRad = Math.atan(-Math.cos(lngRad) / Math.tan(declRad));
    points.push([lng, toDeg(latRad)]);
  }

  return points;
}

/**
 * Check if a point is in daylight.
 */
export function isDaylight(lat: number, lng: number, date: Date): boolean {
  const sunPos = SunCalc.getPosition(date, lat, lng);
  return sunPos.altitude > 0;
}

// ─── Best Time to Observe ─────────────────────────────────────────────────────

export interface BestObservationResult {
  bestTime: Date;
  score: number;
  moonAltAtBest: number;
  sunAltAtBest: number;
  windowStart: Date;
  windowEnd: Date;
  viable: boolean; // true if there's a meaningful observation window
}

/**
 * Compute the best time to observe the crescent moon for a given date and location.
 * Scans from sunset to moonset (or sunset + 2h if no moonset) in 5-minute steps.
 */
export function computeBestObservationTime(
  date: Date,
  loc: { lat: number; lng: number }
): BestObservationResult {
  const times = SunCalc.getTimes(date, loc.lat, loc.lng);
  const moonTimes = SunCalc.getMoonTimes(date, loc.lat, loc.lng);

  // Window starts at sunset
  const sunset =
    times.sunset instanceof Date && !isNaN(times.sunset.getTime())
      ? times.sunset
      : new Date(date.getFullYear(), date.getMonth(), date.getDate(), 18, 0, 0);

  // Window ends at moonset, or sunset + 2h if no set time or set is before sunset
  let windowEnd: Date;
  if (
    moonTimes.set instanceof Date &&
    !isNaN(moonTimes.set.getTime()) &&
    moonTimes.set.getTime() > sunset.getTime()
  ) {
    windowEnd = moonTimes.set;
  } else {
    windowEnd = new Date(sunset.getTime() + 2 * 3600 * 1000); // 2h fallback
  }

  const STEP_MS = 5 * 60 * 1000;
  let bestTime = sunset;
  let bestScore = -Infinity;
  let bestMoonAlt = 0;
  let bestSunAlt = 0;

  for (let t = sunset.getTime(); t <= windowEnd.getTime(); t += STEP_MS) {
    const moment = new Date(t);
    const sunPos = SunCalc.getPosition(moment, loc.lat, loc.lng);
    const moonPos = SunCalc.getMoonPosition(moment, loc.lat, loc.lng);

    const moonAlt = (moonPos.altitude * 180) / Math.PI;
    const sunAlt = (sunPos.altitude * 180) / Math.PI;

    if (moonAlt <= 0) continue; // Moon must be above horizon

    // Scoring formula:
    // Higher score for:
    // 1. Darker sky (sun further below horizon)
    // 2. Higher moon altitude
    const darknessFactor =
      sunAlt < -12 ? 1.0 : sunAlt < -6 ? 0.8 : sunAlt < 0 ? 0.5 : 0.1;
    const altFactor = moonAlt > 5 ? Math.min(moonAlt / 20, 1.0) : moonAlt / 10;
    const score = moonAlt * darknessFactor * altFactor;

    if (score > bestScore) {
      bestScore = score;
      bestTime = moment;
      bestMoonAlt = moonAlt;
      bestSunAlt = sunAlt;
    }
  }

  return {
    bestTime,
    score: Math.max(0, bestScore),
    moonAltAtBest: bestMoonAlt,
    sunAltAtBest: bestSunAlt,
    windowStart: sunset,
    windowEnd,
    viable: bestScore > 0,
  };
}

// ─── Utility ──────────────────────────────────────────────────────────────────

export function formatDegrees(deg: number): string {
  const d = Math.abs(deg);
  const dir = deg >= 0 ? "N" : "S";
  return `${d.toFixed(2)}° ${dir}`;
}

export function formatAzimuth(az: number): string {
  const normalized = ((az % 360) + 360) % 360;
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const idx = Math.round(normalized / 22.5) % 16;
  return `${normalized.toFixed(1)}° ${dirs[idx]}`;
}

export function formatTime(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export const MAJOR_CITIES: Array<{ name: string; country: string; lat: number; lng: number }> = [
  // Expanded list of World Capitals & Major Cities
  { name: "Mecca", country: "Saudi Arabia", lat: 21.3891, lng: 39.8579 },
  { name: "Medina", country: "Saudi Arabia", lat: 24.5247, lng: 39.5692 },
  { name: "Riyadh", country: "Saudi Arabia", lat: 24.6877, lng: 46.7219 },
  { name: "Abu Dhabi", country: "UAE", lat: 24.4539, lng: 54.3773 },
  { name: "Dubai", country: "UAE", lat: 25.2048, lng: 55.2708 },
  { name: "Kuwait City", country: "Kuwait", lat: 29.3759, lng: 47.9774 },
  { name: "Doha", country: "Qatar", lat: 25.2854, lng: 51.5310 },
  { name: "Manama", country: "Bahrain", lat: 26.2285, lng: 50.5860 },
  { name: "Muscat", country: "Oman", lat: 23.5859, lng: 58.4059 },
  { name: "Sanaa", country: "Yemen", lat: 15.3694, lng: 44.1910 },
  { name: "Baghdad", country: "Iraq", lat: 33.3152, lng: 44.3661 },
  { name: "Tehran", country: "Iran", lat: 35.6892, lng: 51.3890 },
  { name: "Kabul", country: "Afghanistan", lat: 34.5553, lng: 69.2075 },
  { name: "Islamabad", country: "Pakistan", lat: 33.6844, lng: 73.0479 },
  { name: "Karachi", country: "Pakistan", lat: 24.8607, lng: 67.0011 },
  { name: "Lahore", country: "Pakistan", lat: 31.5204, lng: 74.3587 },
  { name: "New Delhi", country: "India", lat: 28.6139, lng: 77.2090 },
  { name: "Dhaka", country: "Bangladesh", lat: 23.8103, lng: 90.4125 },
  { name: "Male", country: "Maldives", lat: 4.1755, lng: 73.5093 },
  { name: "Colombo", country: "Sri Lanka", lat: 6.9271, lng: 79.8612 },
  { name: "Jakarta", country: "Indonesia", lat: -6.2088, lng: 106.8456 },
  { name: "Kuala Lumpur", country: "Malaysia", lat: 3.1390, lng: 101.6869 },
  { name: "Bandar Seri Begawan", country: "Brunei", lat: 4.9031, lng: 114.9398 },
  { name: "Singapore", country: "Singapore", lat: 1.3521, lng: 103.8198 },
  { name: "Bangkok", country: "Thailand", lat: 13.7563, lng: 100.5018 },
  { name: "Beijing", country: "China", lat: 39.9042, lng: 116.4074 },
  { name: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503 },
  { name: "Seoul", country: "South Korea", lat: 37.5665, lng: 126.9780 },
  { name: "Manila", country: "Philippines", lat: 14.5995, lng: 120.9842 },
  { name: "Canberra", country: "Australia", lat: -35.2809, lng: 149.1300 },
  { name: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093 },
  { name: "Wellington", country: "New Zealand", lat: -41.2865, lng: 174.7762 },
  { name: "Amman", country: "Jordan", lat: 31.9454, lng: 35.9284 },
  { name: "Damascus", country: "Syria", lat: 33.5138, lng: 36.2765 },
  { name: "Beirut", country: "Lebanon", lat: 33.8938, lng: 35.5018 },
  { name: "Jerusalem", country: "Palestine", lat: 31.7683, lng: 35.2137 },
  { name: "Ramallah", country: "Palestine", lat: 31.9038, lng: 35.2034 },
  { name: "Cairo", country: "Egypt", lat: 30.0444, lng: 31.2357 },
  { name: "Tripoli", country: "Libya", lat: 32.8872, lng: 13.1913 },
  { name: "Tunis", country: "Tunisia", lat: 36.8065, lng: 10.1815 },
  { name: "Algiers", country: "Algeria", lat: 36.7372, lng: 3.0868 },
  { name: "Rabat", country: "Morocco", lat: 34.0209, lng: -6.8416 },
  { name: "Casablanca", country: "Morocco", lat: 33.5731, lng: -7.5898 },
  { name: "Nouakchott", country: "Mauritania", lat: 18.0735, lng: -15.9582 },
  { name: "Khartoum", country: "Sudan", lat: 15.5007, lng: 32.5599 },
  { name: "Mogadishu", country: "Somalia", lat: 2.0469, lng: 45.3182 },
  { name: "Djibouti", country: "Djibouti", lat: 11.8251, lng: 42.5903 },
  { name: "Asmara", country: "Eritrea", lat: 15.3229, lng: 38.9251 },
  { name: "Addis Ababa", country: "Ethiopia", lat: 9.0222, lng: 38.7468 },
  { name: "Nairobi", country: "Kenya", lat: -1.2921, lng: 36.8219 },
  { name: "Kampala", country: "Uganda", lat: 0.3476, lng: 32.5825 },
  { name: "Dar es Salaam", country: "Tanzania", lat: -6.7924, lng: 39.2083 },
  { name: "Pretoria", country: "South Africa", lat: -25.7479, lng: 28.2293 },
  { name: "Abuja", country: "Nigeria", lat: 9.0579, lng: 7.4951 },
  { name: "Lagos", country: "Nigeria", lat: 6.5244, lng: 3.3792 },
  { name: "Accra", country: "Ghana", lat: 5.6037, lng: -0.1870 },
  { name: "Dakar", country: "Senegal", lat: 14.7167, lng: -17.4677 },
  { name: "Bamako", country: "Mali", lat: 12.6392, lng: -8.0029 },
  { name: "Niamey", country: "Niger", lat: 13.5116, lng: 2.1254 },
  { name: "N'Djamena", country: "Chad", lat: 12.1348, lng: 15.0557 },
  { name: "Istanbul", country: "Turkey", lat: 41.0082, lng: 28.9784 },
  { name: "Ankara", country: "Turkey", lat: 39.9334, lng: 32.8597 },
  { name: "Baku", country: "Azerbaijan", lat: 40.4093, lng: 49.8671 },
  { name: "Tashkent", country: "Uzbekistan", lat: 41.2995, lng: 69.2401 },
  { name: "Astana", country: "Kazakhstan", lat: 51.1694, lng: 71.4491 },
  { name: "Ashgabat", country: "Turkmenistan", lat: 37.9601, lng: 58.3261 },
  { name: "Dushanbe", country: "Tajikistan", lat: 38.5598, lng: 68.7870 },
  { name: "Bishkek", country: "Kyrgyzstan", lat: 42.8746, lng: 74.5698 },
  { name: "Moscow", country: "Russia", lat: 55.7558, lng: 37.6173 },
  { name: "London", country: "UK", lat: 51.5074, lng: -0.1278 },
  { name: "Paris", country: "France", lat: 48.8566, lng: 2.3522 },
  { name: "Berlin", country: "Germany", lat: 52.5200, lng: 13.4050 },
  { name: "Rome", country: "Italy", lat: 41.9028, lng: 12.4964 },
  { name: "Madrid", country: "Spain", lat: 40.4168, lng: -3.7038 },
  { name: "Athens", country: "Greece", lat: 37.9838, lng: 23.7275 },
  { name: "Sarajevo", country: "Bosnia & Herzegovina", lat: 43.8563, lng: 18.4131 },
  { name: "Washington, D.C.", country: "USA", lat: 38.8951, lng: -77.0364 },
  { name: "New York", country: "USA", lat: 40.7128, lng: -74.0060 },
  { name: "Los Angeles", country: "USA", lat: 34.0522, lng: -118.2437 },
  { name: "Ottawa", country: "Canada", lat: 45.4215, lng: -75.6972 },
  { name: "Toronto", country: "Canada", lat: 43.6532, lng: -79.3832 },
  { name: "Mexico City", country: "Mexico", lat: 19.4326, lng: -99.1332 },
  { name: "Brasilia", country: "Brazil", lat: -15.7975, lng: -47.8919 },
  { name: "Buenos Aires", country: "Argentina", lat: -34.6037, lng: -58.3816 },
  { name: "Santiago", country: "Chile", lat: -33.4489, lng: -70.6693 },
  { name: "Bogota", country: "Colombia", lat: 4.7110, lng: -74.0721 }
];
