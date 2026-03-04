import { publicProcedure, router } from "./_core/trpc.js";
import { z } from "zod";

async function fetchWithTimeout(url: string, timeoutMs = 2000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (err) {
        clearTimeout(id);
        throw err;
    }
}

export const demRouter = router({
    getElevation: publicProcedure
        .input(z.object({ lat: z.number(), lng: z.number() }))
        .query(async ({ input }: { input: { lat: number; lng: number } }) => {
            try {
                const res = await fetchWithTimeout(`https://api.open-meteo.com/v1/elevation?latitude=${input.lat}&longitude=${input.lng}`, 2000);
                if (!res.ok) throw new Error("Failed to fetch from Open-Meteo elevation API");
                const data = (await res.json()) as any;

                if (data.elevation && data.elevation.length > 0) {
                    return { elevation: data.elevation[0] };
                }
                return { elevation: 0 };
            } catch (err) {
                console.error("DEM Error:", err);
                return { elevation: 0 };
            }
        }),
});
