import * as Astronomy from "astronomy-engine";
import { Location, SunMoonData } from "@hilal/types";
import { crescentWidth, yallopQ, odehV, classifyYallop, classifyOdeh } from "./core.js";

/**
 * Get the time of astronomical sunset for a location and date.
 */
export function getSunsetTime(date: Date, loc: Location): Date | null {
    const obs = new Astronomy.Observer(loc.lat, loc.lng, loc.elevation || 0);
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
    const result = Astronomy.SearchRiseSet(Astronomy.Body.Sun, obs, -1, startOfDay, 1);
    return result ? result.date : null;
}

/**
 * Main calculation: compute all sun/moon parameters at sunset for a given date and location.
 */
export function computeSunMoonAtSunset(date: Date, loc: Location): SunMoonData {
    const obs = new Astronomy.Observer(loc.lat, loc.lng, loc.elevation || 0);
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);

    const sunsetResult = Astronomy.SearchRiseSet(Astronomy.Body.Sun, obs, -1, startOfDay, 1);
    const sunriseResult = Astronomy.SearchRiseSet(Astronomy.Body.Sun, obs, 1, startOfDay, 1);

    const sunset = sunsetResult ? sunsetResult.date : null;
    const sunrise = sunriseResult ? sunriseResult.date : null;

    // Use sunset time for calculations, or 18:00 local as fallback
    const calcTime = sunset ?? new Date(date.getFullYear(), date.getMonth(), date.getDate(), 18, 0, 0);

    const eqSun = Astronomy.Equator(Astronomy.Body.Sun, calcTime, obs, true, true);
    const eqMoon = Astronomy.Equator(Astronomy.Body.Moon, calcTime, obs, true, true);

    const hcSun = Astronomy.Horizon(calcTime, obs, eqSun.ra, eqSun.dec, "normal");
    const hcMoon = Astronomy.Horizon(calcTime, obs, eqMoon.ra, eqMoon.dec, "normal");

    const moonIllum = Astronomy.Illumination(Astronomy.Body.Moon, calcTime);

    const moonriseResult = Astronomy.SearchRiseSet(Astronomy.Body.Moon, obs, 1, startOfDay, 1);
    const moonsetResult = Astronomy.SearchRiseSet(Astronomy.Body.Moon, obs, -1, startOfDay, 1);

    // Horizon dip due to elevation: 1.76 * sqrt(elevation_in_meters). Result is arcminutes.
    const dipArcmin = loc.elevation ? 1.76 * Math.sqrt(loc.elevation) : 0;
    const dipDeg = dipArcmin / 60;

    // Atmospheric refraction P/T correction.
    const computeRefractionDelta = (altDeg: number, pressure: number, temperature: number): number => {
        const h = Math.max(altDeg, 0.21); // clamp to avoid formula instability near/below horizon
        const R_bennett = 1.02 / Math.tan(((h + 10.3 / (h + 5.11)) * Math.PI) / 180); // arcmin
        const R_std = R_bennett / 60; // degrees, standard conditions
        const R_true = R_std * (pressure / 1010) * (283 / (273 + temperature));
        return R_true - R_std;
    };

    let sunRefractionDelta = 0;
    let moonRefractionDelta = 0;
    if (loc.temperature !== undefined && loc.pressure !== undefined) {
        sunRefractionDelta = computeRefractionDelta(hcSun.altitude, loc.pressure, loc.temperature);
        moonRefractionDelta = computeRefractionDelta(hcMoon.altitude, loc.pressure, loc.temperature);
    }

    const sunAlt = hcSun.altitude + dipDeg + sunRefractionDelta;
    const sunAz = hcSun.azimuth;
    const moonAlt = hcMoon.altitude + dipDeg + moonRefractionDelta;
    const moonAz = hcMoon.azimuth;

    // Elongation: True angular separation
    const elongation = Astronomy.AngleFromSun(Astronomy.Body.Moon, calcTime);

    // Arc of Vision: moon altitude minus sun altitude at sunset
    const arcv = moonAlt - sunAlt;

    // Difference in azimuth
    const daz = moonAz - sunAz;

    // Moon distance for crescent width (km)
    const moonDist = moonIllum.geo_dist * 149597870.7;
    const crescent = crescentWidth(elongation, moonDist);

    const q = yallopQ(arcv, crescent.w);
    const odeh = odehV(arcv, crescent.w);

    // Phase angle in degrees (0 to 360)
    const phaseDeg = Astronomy.MoonPhase(calcTime);
    // Phase 0..1 representation for compatibility
    const phaseNormal = phaseDeg / 360;
    const moonAge = phaseNormal * 29.53058867 * 24; // hours

    // Maghrib = sunset (Islamic jurisprudence: Maghrib begins at sunset)
    const maghrib = sunset;

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
        illumination: moonIllum.phase_fraction,
        phase: phaseNormal,
        moonrise: moonriseResult ? moonriseResult.date : null,
        moonset: moonsetResult ? moonsetResult.date : null,
        sunset,
        sunrise,
        maghrib,
    };
}
