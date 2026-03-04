import { router, publicProcedure } from "../trpc";
import { visibilityQuerySchema, moonPhaseQuerySchema } from "@hilal/types";
import { computeSunMoonAtSunset, getMoonPhaseInfo } from "@hilal/astronomy";

export const visibilityRouter = router({
    getLocalVisibility: publicProcedure
        .input(visibilityQuerySchema)
        .query(async ({ input }) => {
            const { lat, lng } = input;
            const date = input.date ? new Date(input.date) : new Date();

            const ephemeris = computeSunMoonAtSunset(date, { lat, lng });

            if (!ephemeris.sunset) {
                return {
                    status: "no_sunset",
                    message: "The sun does not set at this location on this date.",
                };
            }

            return {
                status: "success",
                data: {
                    ephemeris,
                    visibility: ephemeris.visibility,
                },
            };
        }),

    getMoonPhase: publicProcedure
        .input(moonPhaseQuerySchema)
        .query(async ({ input }) => {
            const date = input.date ? new Date(input.date) : new Date();
            const phaseData = getMoonPhaseInfo(date);

            return {
                status: "success",
                data: {
                    phase: phaseData,
                },
            };
        }),
});
