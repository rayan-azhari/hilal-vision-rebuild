import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to read the JSON file lazily
async function getIcopData() {
    try {
        const dataPath = path.join(__dirname, "..", "data", "icop-history.json");
        const raw = await fs.readFile(dataPath, "utf-8");
        return JSON.parse(raw);
    } catch (err) {
        console.error("Failed to load ICOP data:", err);
        return [];
    }
}

export const archiveRouter = router({
    getHistoricalData: publicProcedure
        .input(z.object({
            hijriYear: z.number().int().min(1400).max(1500),
            hijriMonth: z.number().int().min(1).max(12),
        }))
        .query(async ({ input }: { input: any }) => {
            const allData = await getIcopData();

            const monthData = allData.find((d: any) =>
                d.hijriYear === input.hijriYear && d.hijriMonth === input.hijriMonth
            );

            if (!monthData) return null;

            return monthData.observations;
        }),
});
