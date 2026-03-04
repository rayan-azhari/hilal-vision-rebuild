"use client";

import { useMemo } from "react";
import { Eye } from "lucide-react";
import {
    computeSunMoonAtSunset,
    classifyYallop,
    classifyOdeh,
    hijriToGregorian,
    MAJOR_CITIES,
    VISIBILITY_LABELS,
} from "@hilal/astronomy";
import { type VisibilityZone } from "@hilal/types";
import { useAppStore } from "@/store/useAppStore";

interface CrescentCountryListProps {
    viewYear: number;
    viewMonth: number;
}

export function CrescentCountryList({ viewYear, viewMonth }: CrescentCountryListProps) {
    const { visibilityCriterion } = useAppStore();

    const { grouped, observationDate } = useMemo(() => {
        // The 29th night of the Hijri month is the traditional crescent observation night
        const day29Greg = hijriToGregorian(viewYear, viewMonth, 29);

        const seen: Record<VisibilityZone, Set<string>> = {
            A: new Set(), B: new Set(), C: new Set(), D: new Set(), E: new Set(), F: new Set(),
        };

        for (const city of MAJOR_CITIES) {
            try {
                const data = computeSunMoonAtSunset(day29Greg, city);
                if (!data.sunset) continue;

                const zone = visibilityCriterion === "yallop"
                    ? classifyYallop(data.qValue, data.moonAlt)
                    : classifyOdeh(data.odehCriterion, data.moonAlt);

                seen[zone].add(city.country);
            } catch {
                // Skip cities where computation fails (polar regions, etc.)
            }
        }

        const result: Record<VisibilityZone, string[]> = {
            A: Array.from(seen.A).sort(),
            B: Array.from(seen.B).sort(),
            C: Array.from(seen.C).sort(),
            D: Array.from(seen.D).sort(),
            E: Array.from(seen.E).sort(),
            F: Array.from(seen.F).sort(),
        };

        return { grouped: result, observationDate: day29Greg };
    }, [viewYear, viewMonth, visibilityCriterion]);

    const hasAnyResults = Object.values(grouped).some(arr => arr.length > 0);
    if (!hasAnyResults) return null;

    return (
        <div
            className="breezy-card p-5 animate-breezy-enter"
            style={{ animationDelay: "200ms" }}
        >
            <div className="flex items-center gap-1.5 mb-1">
                <Eye className="w-4 h-4 text-[#C1A87D]" />
                <span className="text-xs font-semibold text-foreground">
                    Crescent Sighting Countries
                </span>
            </div>
            <div className="text-[10px] mb-3 text-muted-foreground">
                Night of the 29th • {observationDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} • {visibilityCriterion === "yallop" ? "Yallop Criterion" : "Odeh Criterion"}
            </div>

            <div className="space-y-1">
                {(["A", "B", "C", "D", "E", "F"] as VisibilityZone[]).map(zone => {
                    const countries = grouped[zone];
                    if (countries.length === 0) return null;
                    return (
                        <details key={zone} open={zone === "A" || zone === "B"}>
                            <summary className="flex items-center gap-2 cursor-pointer py-1.5 text-[11px] select-none">
                                <div
                                    className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                                    style={{ background: VISIBILITY_LABELS[zone].color }}
                                />
                                <span className="font-semibold text-foreground">
                                    {VISIBILITY_LABELS[zone].label}
                                </span>
                                <span className="ml-auto text-[10px] text-muted-foreground">
                                    {countries.length}
                                </span>
                            </summary>
                            <div className="flex flex-wrap gap-1 pl-[18px] pb-2">
                                {countries.map(country => (
                                    <span
                                        key={country}
                                        className="text-[10px] px-2 py-0.5 rounded-full border border-border/40 bg-foreground/5 text-muted-foreground"
                                    >
                                        {country}
                                    </span>
                                ))}
                            </div>
                        </details>
                    );
                })}
            </div>
        </div>
    );
}
