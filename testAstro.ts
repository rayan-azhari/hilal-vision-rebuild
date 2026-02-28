import Astronomy from "astronomy-engine";

const { Observer, SearchRiseSet, Body, Equator, Horizon, AngleFromSun, Illumination, MoonPhase, SearchMoonPhase } = Astronomy;

const date = new Date("2024-03-10T12:00:00Z");
const loc = { lat: 21.4225, lng: 39.8262, elevation: 300 }; // Mecca
const obs = new Observer(loc.lat, loc.lng, loc.elevation);

const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
const sunsetResult = SearchRiseSet(Body.Sun, obs, -1, startOfDay, 1);
const sunset = sunsetResult ? sunsetResult.date : null;

console.log("Sunset:", sunset);

if (sunset) {
    const eqSun = Equator(Body.Sun, sunset, obs, true, true);
    const eqMoon = Equator(Body.Moon, sunset, obs, true, true);

    // "normal" applies standard atmospheric refraction
    const hcSun = Horizon(sunset, obs, eqSun.ra, eqSun.dec, "normal");
    const hcMoon = Horizon(sunset, obs, eqMoon.ra, eqMoon.dec, "normal");

    console.log("Sun Alt:", hcSun.altitude, "Az:", hcSun.azimuth);
    console.log("Moon Alt:", hcMoon.altitude, "Az:", hcMoon.azimuth);

    const elongation = AngleFromSun(Body.Moon, sunset);
    const illum = Illumination(Body.Moon, sunset);

    console.log("Elongation:", elongation);
    console.log("Moon geo_dist (AU):", illum.geo_dist); // To get km: geo_dist * 149597870.7
    console.log("Moon phase fraction:", illum.phase_fraction);

    // Moon Phase degrees (0=new, 90=first quarter...)
    console.log("Moon phase angle (deg ecliptic):", MoonPhase(sunset));

    // Next new moon
    const nextNew = SearchMoonPhase(0, startOfDay, 35);
    console.log("Next new moon:", nextNew?.date);
}
