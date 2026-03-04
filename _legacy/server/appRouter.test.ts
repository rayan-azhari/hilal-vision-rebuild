import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Hoisted mock refs (must be created before vi.mock calls) ─────────────────
const { mockLimit } = vi.hoisted(() => ({
    mockLimit: vi.fn().mockResolvedValue({ success: true }),
}));

// ─── Module mocks ─────────────────────────────────────────────────────────────

// Provide fake Upstash credentials so getRateLimiter() initialises successfully
vi.mock("./_core/env.js", () => ({
    ENV: {
        upstashRedisRestUrl: "https://mock.upstash.io",
        upstashRedisRestToken: "mock-token",
        ownerOpenId: "",
        clerkSecretKey: "",
        databaseUrl: "",
        cookieSecret: "",
        oAuthServerUrl: "",
        appId: "",
        isProduction: false,
        forgeApiUrl: "",
        forgeApiKey: "",
        stripeSecretKey: "",
        stripeWebhookSecret: "",
        stripePriceMonthly: "",
        stripePriceAnnual: "",
        stripePriceLifetime: "",
        revenuecatGoogleKey: "",
        revenuecatAppleKey: "",
        revenuecatWebhookAuth: "",
    },
}));

vi.mock("@upstash/redis", () => ({
    Redis: class {
        constructor() {}
    },
}));

vi.mock("@upstash/ratelimit", () => ({
    Ratelimit: class {
        static slidingWindow() {
            return {};
        }
        limit = mockLimit;
    },
}));

// Mock DB
vi.mock("./db.js", () => ({
    getDb: vi.fn(),
}));

// Mock astronomy to control visibility output per test
vi.mock("../shared/astronomy.js", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../shared/astronomy.js")>();
    return { ...actual, computeSunMoonAtSunset: vi.fn() };
});

import { appRouter } from "./appRouter.js";
import { getDb } from "./db.js";
import { computeSunMoonAtSunset } from "../shared/astronomy.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeDbWithInsert() {
    return {
        insert: vi.fn().mockReturnValue({
            values: vi.fn().mockResolvedValue(undefined),
        }),
        select: vi.fn().mockReturnValue({
            from: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            offset: vi.fn().mockResolvedValue([]),
        }),
    } as any;
}

const ctx = { req: { headers: {} } as any, res: {} as any, user: { id: "test-user" } };

beforeEach(() => {
    vi.clearAllMocks();
    mockLimit.mockResolvedValue({ success: true }); // default: allow
    vi.mocked(getDb).mockResolvedValue(makeDbWithInsert());
    // Default fetch mock for weather enrichment (graceful, returns empty)
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
        ok: true,
        json: async () => ({ current: {} }),
    } as Response);
});

const baseObservation = {
    lat: 21.39,
    lng: 39.86,
    observationTime: "2026-02-28T18:00:00.000Z",
    visualSuccess: "naked_eye" as const,
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("appRouter.telemetry.getObservations", () => {
    it("returns { data: [], total: 0 } when DB is unavailable", async () => {
        vi.mocked(getDb).mockResolvedValue(null);
        const caller = appRouter.createCaller(ctx);
        const result = await caller.telemetry.getObservations({ limit: 10, offset: 0 });
        expect(result).toEqual({ data: [], total: 0 });
    });
});

describe("appRouter.telemetry.submitObservation — Zone-F rejection", () => {
    it("rejects a naked_eye sighting when astronomy returns Zone F", async () => {
        vi.mocked(computeSunMoonAtSunset).mockReturnValue({ visibility: "F" } as any);
        const caller = appRouter.createCaller(ctx);

        await expect(
            caller.telemetry.submitObservation({
                ...baseObservation,
                visualSuccess: "naked_eye",
            })
        ).rejects.toThrow(/Astronomical data indicates/i);
    });

    it("rejects an optical_aid sighting when astronomy returns Zone F", async () => {
        vi.mocked(computeSunMoonAtSunset).mockReturnValue({ visibility: "F" } as any);
        const caller = appRouter.createCaller(ctx);

        await expect(
            caller.telemetry.submitObservation({
                ...baseObservation,
                visualSuccess: "optical_aid",
            })
        ).rejects.toThrow(/Astronomical data indicates/i);
    });

    it("allows a not_seen report even when astronomy returns Zone F", async () => {
        vi.mocked(computeSunMoonAtSunset).mockReturnValue({ visibility: "F" } as any);
        const caller = appRouter.createCaller(ctx);

        const result = await caller.telemetry.submitObservation({
            ...baseObservation,
            visualSuccess: "not_seen",
        });
        expect(result).toEqual({ success: true });
    });

    it("rejects when rate limit is exceeded", async () => {
        mockLimit.mockResolvedValue({ success: false });
        vi.mocked(computeSunMoonAtSunset).mockReturnValue({ visibility: "A" } as any);
        const caller = appRouter.createCaller(ctx);

        await expect(
            caller.telemetry.submitObservation({
                ...baseObservation,
                visualSuccess: "naked_eye",
            })
        ).rejects.toThrow(/Rate limit exceeded/i);
    });
});
