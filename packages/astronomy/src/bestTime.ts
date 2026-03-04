import * as Astronomy from "astronomy-engine";
import { BestObservationResult } from "@hilal/types";

/**
 * Compute the best time to observe the crescent moon for a given date and location.
 * Scans from sunset to moonset (or sunset + 2h if no moonset) in 5-minute steps.
 */
export function computeBestObservationTime(
    date: Date,
    loc: { lat: number; lng: number }
): BestObservationResult {
    const obs = new Astronomy.Observer(loc.lat, loc.lng, 0);
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);

    const sunsetResult = Astronomy.SearchRiseSet(Astronomy.Body.Sun, obs, -1, startOfDay, 1);
    const moonsetResult = Astronomy.SearchRiseSet(Astronomy.Body.Moon, obs, -1, startOfDay, 1);

    // Window starts at sunset
    const sunset = sunsetResult ? sunsetResult.date : new Date(date.getFullYear(), date.getMonth(), date.getDate(), 18, 0, 0);

    // Window ends at moonset, or sunset + 2h if no set time or set is before sunset
    let windowEnd: Date;
    if (moonsetResult && moonsetResult.date.getTime() > sunset.getTime()) {
        windowEnd = moonsetResult.date;
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
        const eqSun = Astronomy.Equator(Astronomy.Body.Sun, moment, obs, true, true);
        const eqMoon = Astronomy.Equator(Astronomy.Body.Moon, moment, obs, true, true);

        const hcSun = Astronomy.Horizon(moment, obs, eqSun.ra, eqSun.dec, "normal");
        const hcMoon = Astronomy.Horizon(moment, obs, eqMoon.ra, eqMoon.dec, "normal");

        const moonAlt = hcMoon.altitude;
        const sunAlt = hcSun.altitude;

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
