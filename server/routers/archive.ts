import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
// Static import so Vercel serverless bundler includes the JSON data
import icopData from "../data/icop-history.json";

export const archiveRouter = router({
    getHistoricalData: publicProcedure
        .input(z.object({
            hijriYear: z.number().int().min(1400).max(1500),
            hijriMonth: z.number().int().min(1).max(12),
        }))
        .query(({ input }: { input: any }) => {
            const monthData = icopData.find((d: any) =>
                d.hijriYear === input.hijriYear && d.hijriMonth === input.hijriMonth
            );

            if (!monthData) return null;

            return monthData.observations;
        }),
});

