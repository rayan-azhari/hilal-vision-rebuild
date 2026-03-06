import { z } from "zod";
import { publicProcedure, router } from "../trpc";

const coordInput = z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
});

export const demRouter = router({
    /**
     * Digital Elevation Model — returns terrain elevation (metres) at a lat/lng.
     * Source: Open-Meteo elevation API (SRTM-derived, 90m resolution).
     * Falls back to 0 m on error so callers don't need to handle failure.
     */
    getDem: publicProcedure
        .input(coordInput)
        .query(async ({ input }): Promise<{ elevation: number }> => {
            try {
                const url = `https://api.open-meteo.com/v1/elevation?latitude=${input.lat}&longitude=${input.lng}`;
                const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
                if (!res.ok) return { elevation: 0 };
                const data = (await res.json()) as { elevation?: number[] };
                return { elevation: data.elevation?.[0] ?? 0 };
            } catch {
                return { elevation: 0 };
            }
        }),

    /**
     * Aerosol Optical Depth — proxy for atmospheric dust/PM2.5 at a lat/lng.
     * Source: Open-Meteo air quality API.
     * Falls back to 0.1 (clean air estimate) on error.
     */
    getAod: publicProcedure
        .input(coordInput)
        .query(async ({ input }): Promise<{ aod: number }> => {
            try {
                const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${input.lat}&longitude=${input.lng}&current=aerosol_optical_depth`;
                const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
                if (!res.ok) return { aod: 0.1 };
                const data = (await res.json()) as { current?: { aerosol_optical_depth?: number } };
                return { aod: data.current?.aerosol_optical_depth ?? 0.1 };
            } catch {
                return { aod: 0.1 };
            }
        }),
});
