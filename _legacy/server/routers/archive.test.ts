import { describe, it, expect } from "vitest";
import { createCallerFactory } from "../_core/trpc.js";
import { archiveRouter } from "./archive.js";

const createCaller = createCallerFactory(archiveRouter);
const caller = createCaller({ req: {} as any, res: {} as any, user: null });

describe("archive.getHistoricalData", () => {
    it("returns observations array for an existing year/month", async () => {
        // Ramadan 1445 (1445/9) is confirmed to have ICOP records
        const result = await caller.getHistoricalData({ hijriYear: 1445, hijriMonth: 9 });
        expect(result).not.toBeNull();
        expect(Array.isArray(result)).toBe(true);
        expect((result as unknown[]).length).toBeGreaterThan(0);
    });

    it("returns null for a year/month with no ICOP data", async () => {
        // 1499 is the max allowed year but has no ICOP data yet
        const result = await caller.getHistoricalData({ hijriYear: 1499, hijriMonth: 12 });
        expect(result).toBeNull();
    });

    it("each observation record has required fields", async () => {
        const result = await caller.getHistoricalData({ hijriYear: 1440, hijriMonth: 9 });
        expect(result).not.toBeNull();
        const obs = (result as any[])[0];
        expect(obs).toHaveProperty("country");
        expect(obs).toHaveProperty("result");
    });

    it("rejects hijriYear below minimum (1400)", async () => {
        await expect(
            caller.getHistoricalData({ hijriYear: 1399, hijriMonth: 1 })
        ).rejects.toThrow();
    });

    it("rejects hijriYear above maximum (1500)", async () => {
        await expect(
            caller.getHistoricalData({ hijriYear: 1501, hijriMonth: 1 })
        ).rejects.toThrow();
    });

    it("rejects hijriMonth below 1", async () => {
        await expect(
            caller.getHistoricalData({ hijriYear: 1445, hijriMonth: 0 })
        ).rejects.toThrow();
    });

    it("rejects hijriMonth above 12", async () => {
        await expect(
            caller.getHistoricalData({ hijriYear: 1445, hijriMonth: 13 })
        ).rejects.toThrow();
    });
});
