import * as Astronomy from "astronomy-engine";

export type LunarEclipseType = "none" | "penumbral" | "partial" | "total";

/**
 * Determine whether a given full moon date will have a lunar eclipse.
 * Delegates to astronomy-engine's SearchLunarEclipse which uses the full
 * ELP2000 lunar model — far more accurate than node-regression approximations.
 */
export function predictLunarEclipse(fullMoonDate: Date): LunarEclipseType {
    // Search from 2 days before the full moon to find any eclipse at this full moon.
    const searchStart = new Date(fullMoonDate.getTime() - 2 * 86400000);
    const eclipse = Astronomy.SearchLunarEclipse(searchStart);

    // If the found eclipse peak is more than 2 days away, this full moon has no eclipse.
    if (Math.abs(eclipse.peak.date.getTime() - fullMoonDate.getTime()) > 2 * 86400000) {
        return "none";
    }

    if (eclipse.kind === Astronomy.EclipseKind.Total) return "total";
    if (eclipse.kind === Astronomy.EclipseKind.Partial) return "partial";
    if (eclipse.kind === Astronomy.EclipseKind.Penumbral) return "penumbral";
    return "none";
}
