import * as Astronomy from "astronomy-engine";
import { toRad, toDeg } from "./utils";

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
    const obs = new Astronomy.Observer(lat, lng, 0);
    const eq = Astronomy.Equator(Astronomy.Body.Sun, date, obs, true, true);
    const hc = Astronomy.Horizon(date, obs, eq.ra, eq.dec, "normal");
    return hc.altitude > 0;
}
