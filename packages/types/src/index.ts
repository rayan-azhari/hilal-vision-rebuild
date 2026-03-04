export * from "./schemas.js";

export interface Location {
    lat: number;
    lng: number;
    name?: string;
    elevation?: number; // meters above sea level
    temperature?: number; // Celsius
    pressure?: number; // hPa (millibars)
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
    maghrib: Date | null; // equals sunset (Maghrib begins at sunset)
}

export interface MoonPhaseInfo {
    phase: number;        // 0–1
    phaseName: string;
    phaseArabic: string;
    illuminatedFraction: number; // 0–1
    moonAge: number;      // hours since new moon
    nextNewMoon: Date;    // approximate date of next new moon
    nextNewMoonExact: Date; // exact time of next conjunction down to the second
    nextFullMoon: Date;   // approximate date of next full moon
}

export interface HijriDate {
    year: number;
    month: number;
    day: number;
    monthName: string;
    monthNameArabic: string;
    monthNameShort: string;
}

export interface BestObservationResult {
    bestTime: Date;
    score: number;
    moonAltAtBest: number;
    sunAltAtBest: number;
    windowStart: Date;
    windowEnd: Date;
    viable: boolean; // true if there's a meaningful observation window
}
