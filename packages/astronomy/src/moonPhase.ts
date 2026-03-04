import * as Astronomy from "astronomy-engine";
import { MoonPhaseInfo } from "@hilal/types";

export function getMoonPhaseInfo(date: Date): MoonPhaseInfo {
    const phaseDeg = Astronomy.MoonPhase(date);
    const phase = phaseDeg / 360.0;
    const illum = Astronomy.Illumination(Astronomy.Body.Moon, date);
    const illuminatedFraction = illum.phase_fraction;

    const LUNAR_CYCLE = 29.53058867;
    const ageDays = phase * LUNAR_CYCLE;
    const moonAge = ageDays * 24;

    const phaseName = getPhaseName(phase);
    const phaseArabic = getPhaseArabic(phase);

    const nextNewResult = Astronomy.SearchMoonPhase(0, date, 35);
    const exactNextNewMoon = nextNewResult ? nextNewResult.date : new Date();

    const nextFullResult = Astronomy.SearchMoonPhase(180, date, 35);
    const nextFullMoon = nextFullResult ? nextFullResult.date : new Date();

    return {
        phase,
        phaseName,
        phaseArabic,
        illuminatedFraction,
        moonAge,
        nextNewMoon: exactNextNewMoon,
        nextNewMoonExact: exactNextNewMoon,
        nextFullMoon
    };
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

export function findNewMoonNear(approx: Date): Date {
    const start = new Date(approx.getTime() - 15 * 24 * 3600 * 1000);
    const result = Astronomy.SearchMoonPhase(0, start, 30);
    return result ? result.date : approx;
}
