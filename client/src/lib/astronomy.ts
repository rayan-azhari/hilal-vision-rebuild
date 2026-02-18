/**
 * Hilal Vision — Astronomy Calculation Engine
 * Implements Yallop (1997) and Odeh (2004) crescent visibility criteria.
 * Uses SunCalc for sun/moon positions and adds Islamic-specific calculations.
 */

import SunCalc from "suncalc";

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
  { en: "Muharram",     ar: "مُحَرَّم",      short: "MUH" },
  { en: "Safar",        ar: "صَفَر",         short: "SFR" },
  { en: "Rabi al-Awwal",ar: "رَبِيع الأَوَّل",short: "RBA" },
  { en: "Rabi al-Thani",ar: "رَبِيع الثَّانِي",short: "RBT" },
  { en: "Jumada al-Ula",ar: "جُمَادَى الأُولَى",short: "JMO" },
  { en: "Jumada al-Akhira",ar: "جُمَادَى الآخِرَة",short: "JMT" },
  { en: "Rajab",        ar: "رَجَب",         short: "RJB" },
  { en: "Sha'ban",      ar: "شَعْبَان",       short: "SHB" },
  { en: "Ramadan",      ar: "رَمَضَان",       short: "RMD" },
  { en: "Shawwal",      ar: "شَوَّال",        short: "SHW" },
  { en: "Dhu al-Qi'dah",ar: "ذُو الْقَعْدَة",short: "ZQD" },
  { en: "Dhu al-Hijjah",ar: "ذُو الْحِجَّة", short: "ZHJ" },
];

export const VISIBILITY_LABELS: Record<VisibilityZone, { label: string; color: string; desc: string }> = {
  A: { label: "Easily Visible",       color: "#4ade80", desc: "Naked eye sighting highly probable" },
  B: { label: "Visible",              color: "#facc15", desc: "Visible under good conditions" },
  C: { label: "Optical Aid Helpful",  color: "#fb923c", desc: "Binoculars may be needed" },
  D: { label: "Optical Aid Only",     color: "#f87171", desc: "Only visible with telescope" },
  E: { label: "Not Visible",          color: "#6b7280", desc: "Below visibility threshold" },
  F: { label: "Below Horizon",        color: "#374151", desc: "Moon sets before or with sun" },
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
 * Convert Gregorian date to Hijri (Islamic) date.
 * Uses the algorithmic conversion (Kuwaiti algorithm).
 */
export function gregorianToHijri(date: Date): HijriDate {
  const jd = gregorianToJD(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const { year, month, day } = jdToHijri(jd);
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

export function hijriToGregorian(year: number, month: number, day: number): Date {
  const jd = Math.floor(11 * year + 3) / 30 +
    354 * year + 30 * month -
    Math.floor((month - 1) / 2) + day + 1948440 - 385;
  return jdToGregorian(jd);
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
  { name: "Mecca",         country: "Saudi Arabia", lat: 21.3891, lng: 39.8579 },
  { name: "Medina",        country: "Saudi Arabia", lat: 24.5247, lng: 39.5692 },
  { name: "Riyadh",        country: "Saudi Arabia", lat: 24.6877, lng: 46.7219 },
  { name: "Istanbul",      country: "Turkey",       lat: 41.0082, lng: 28.9784 },
  { name: "Cairo",         country: "Egypt",        lat: 30.0444, lng: 31.2357 },
  { name: "Dubai",         country: "UAE",          lat: 25.2048, lng: 55.2708 },
  { name: "Karachi",       country: "Pakistan",     lat: 24.8607, lng: 67.0011 },
  { name: "Lahore",        country: "Pakistan",     lat: 31.5204, lng: 74.3587 },
  { name: "Dhaka",         country: "Bangladesh",   lat: 23.8103, lng: 90.4125 },
  { name: "Jakarta",       country: "Indonesia",    lat: -6.2088, lng: 106.8456 },
  { name: "Kuala Lumpur",  country: "Malaysia",     lat: 3.1390,  lng: 101.6869 },
  { name: "London",        country: "UK",           lat: 51.5074, lng: -0.1278 },
  { name: "Paris",         country: "France",       lat: 48.8566, lng: 2.3522 },
  { name: "New York",      country: "USA",          lat: 40.7128, lng: -74.0060 },
  { name: "Los Angeles",   country: "USA",          lat: 34.0522, lng: -118.2437 },
  { name: "Toronto",       country: "Canada",       lat: 43.6532, lng: -79.3832 },
  { name: "Sydney",        country: "Australia",    lat: -33.8688, lng: 151.2093 },
  { name: "Lagos",         country: "Nigeria",      lat: 6.5244,  lng: 3.3792 },
  { name: "Nairobi",       country: "Kenya",        lat: -1.2921, lng: 36.8219 },
  { name: "Tehran",        country: "Iran",         lat: 35.6892, lng: 51.3890 },
  { name: "Baghdad",       country: "Iraq",         lat: 33.3152, lng: 44.3661 },
  { name: "Amman",         country: "Jordan",       lat: 31.9454, lng: 35.9284 },
  { name: "Casablanca",    country: "Morocco",      lat: 33.5731, lng: -7.5898 },
  { name: "Tunis",         country: "Tunisia",      lat: 36.8065, lng: 10.1815 },
  { name: "Algiers",       country: "Algeria",      lat: 36.7372, lng: 3.0868 },
  { name: "Khartoum",      country: "Sudan",        lat: 15.5007, lng: 32.5599 },
  { name: "Kabul",         country: "Afghanistan",  lat: 34.5553, lng: 69.2075 },
  { name: "Tashkent",      country: "Uzbekistan",   lat: 41.2995, lng: 69.2401 },
  { name: "Baku",          country: "Azerbaijan",   lat: 40.4093, lng: 49.8671 },
];
