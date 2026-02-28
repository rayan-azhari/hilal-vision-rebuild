import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createCallerFactory } from "../_core/trpc.js";
import { weatherRouter } from "./weather.js";

const createCaller = createCallerFactory(weatherRouter);
const caller = createCaller({ req: {} as any, res: {} as any, user: null });

// A mock Open-Meteo response with one location (non-array)
// Code handles both array and single: `Array.isArray(json) ? json : [json]`
// With non-array, only the first point of each batch gets a non-zero value.
function makeMockResponse(cloudCover = 50) {
    return {
        ok: true,
        json: async () => ({
            hourly: {
                cloud_cover: Array(24).fill(0).map((_, i) => (i === 18 ? cloudCover : 0)),
            },
        }),
    } as Response;
}

beforeEach(() => {
    vi.restoreAllMocks();
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe("weather.getCloudGrid", () => {
    it("returns an array of grid points with lat, lng, cloud_cover", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(makeMockResponse(50));
        // Use a unique date to avoid cache hits from other tests
        const result = await caller.getCloudGrid({ date: "2020-01-15" });
        expect(result.data).toBeInstanceOf(Array);
        expect(result.data.length).toBeGreaterThan(0);
        expect(result.data[0]).toHaveProperty("lat");
        expect(result.data[0]).toHaveProperty("lng");
        expect(result.data[0]).toHaveProperty("cloud_cover");
    });

    it("returns cached result on a second call with the same date", async () => {
        const fetchSpy = vi
            .spyOn(globalThis, "fetch")
            .mockResolvedValue(makeMockResponse(30));

        const uniqueDate = "2020-02-15";
        await caller.getCloudGrid({ date: uniqueDate });
        const callsAfterFirst = fetchSpy.mock.calls.length;

        await caller.getCloudGrid({ date: uniqueDate }); // cached
        expect(fetchSpy.mock.calls.length).toBe(callsAfterFirst);
    });

    it("re-fetches for a different date key", async () => {
        const fetchSpy = vi
            .spyOn(globalThis, "fetch")
            .mockResolvedValue(makeMockResponse(20));

        await caller.getCloudGrid({ date: "2020-03-15" });
        const callsAfterFirst = fetchSpy.mock.calls.length;

        await caller.getCloudGrid({ date: "2020-04-15" }); // different date → no cache
        expect(fetchSpy.mock.calls.length).toBeGreaterThan(callsAfterFirst);
    });

    it("handles fetch errors gracefully — returns grid with cloud_cover 0", async () => {
        vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network error"));
        const result = await caller.getCloudGrid({ date: "2020-05-15" });
        expect(result.data).toBeInstanceOf(Array);
        expect(result.data.length).toBeGreaterThan(0);
        // All points should fall back to cloud_cover: 0
        result.data.forEach((point) => expect(point.cloud_cover).toBe(0));
    });
});
