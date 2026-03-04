import { router, publicProcedure } from "../trpc";
import { localWeatherQuerySchema, cloudGridQuerySchema } from "@hilal/types";

export const weatherRouter = router({
    getLocalConditions: publicProcedure
        .input(localWeatherQuerySchema)
        .query(async ({ input }) => {
            // Extract lat and lng when real API is implemented

            // In a real implementation, this would call Open-Meteo or another weather API.
            // For now, returning mocked data to unblock the UI layer.
            return {
                status: "success",
                data: {
                    temperature: 24,
                    cloudCover: 15,
                    visibilityKm: 10,
                    seeing: "good" as const, // 'excellent', 'good', 'average', 'poor'
                },
            };
        }),

    getCloudGrid: publicProcedure
        .input(cloudGridQuerySchema)
        .query(async ({ input }) => {
            // Returns a sparse grid of cloud cover data for the map overlay
            return {
                status: "success",
                data: {
                    date: input.date,
                    grid: [], // array of {lat, lng, cloudPct}
                },
            };
        }),
});
