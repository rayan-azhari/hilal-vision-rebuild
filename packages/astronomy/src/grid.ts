import { VisibilityZone } from "@hilal/types";
import { computeSunMoonAtSunset } from "./sunMoon.js";
import { classifyYallop, classifyOdeh } from "./core.js";

/**
 * Generate a world visibility grid for a given date.
 * Returns an array of {lat, lng, zone, q} for every 2° grid point.
 */
export function generateVisibilityGrid(
    date: Date,
    resolution = 4,
    criterion: "yallop" | "odeh" = "yallop"
): Array<{ lat: number; lng: number; zone: VisibilityZone; q: number; v?: number }> {
    const results: Array<{ lat: number; lng: number; zone: VisibilityZone; q: number; v?: number }> = [];

    // Latitude clamped to ±80° — polar twilight zones where the sun may not set
    // produce undefined sunset times. Observers above 80°N/S should use a dedicated
    // polar-region visibility tool.
    for (let lat = -80; lat <= 80; lat += resolution) {
        for (let lng = -180; lng <= 180; lng += resolution) {
            const data = computeSunMoonAtSunset(date, { lat, lng });
            const zone = criterion === "yallop" ? classifyYallop(data.qValue, data.moonAlt) : classifyOdeh(data.odehCriterion, data.moonAlt);
            results.push({ lat, lng, zone, q: data.qValue, v: data.odehCriterion });
        }
    }

    return results;
}
