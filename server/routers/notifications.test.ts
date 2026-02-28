import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock DB before importing anything that uses it
vi.mock("../db.js", () => ({
    getDb: vi.fn(),
}));

import { createCallerFactory } from "../_core/trpc.js";
import { notificationsRouter } from "./notifications.js";
import { getDb } from "../db.js";

const createCaller = createCallerFactory(notificationsRouter);
// subscribe is a publicProcedure so no user auth is required
const caller = createCaller({ req: {} as any, res: {} as any, user: null });

// Helper: Drizzle-style fluent chain for select queries
function makeSelectChain(rows: unknown[]) {
    const chain: any = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(rows),
    };
    return chain;
}

beforeEach(() => {
    vi.clearAllMocks();
});

describe("notifications.subscribe", () => {
    it("inserts a new token when it does not already exist", async () => {
        const mockValues = vi.fn().mockResolvedValue(undefined);
        vi.mocked(getDb).mockResolvedValue({
            select: vi.fn().mockReturnValue(makeSelectChain([])), // token not found
            insert: vi.fn().mockReturnValue({ values: mockValues }),
        } as any);

        const result = await caller.subscribe({ token: "abc123xyz789", deviceType: "web" });
        expect(result).toEqual({ success: true });
        expect(mockValues).toHaveBeenCalledOnce();
    });

    it("skips insert when the token already exists", async () => {
        const mockValues = vi.fn();
        vi.mocked(getDb).mockResolvedValue({
            select: vi.fn().mockReturnValue(makeSelectChain([{ token: "abc123xyz789" }])),
            insert: vi.fn().mockReturnValue({ values: mockValues }),
        } as any);

        const result = await caller.subscribe({ token: "abc123xyz789", deviceType: "ios" });
        expect(result).toEqual({ success: true });
        expect(mockValues).not.toHaveBeenCalled();
    });

    it("throws when DB is unavailable", async () => {
        vi.mocked(getDb).mockResolvedValue(null);

        await expect(
            caller.subscribe({ token: "abc123xyz789" })
        ).rejects.toThrow("Database not available");
    });

    it("rejects token shorter than 10 characters", async () => {
        await expect(
            caller.subscribe({ token: "short" })
        ).rejects.toThrow();
    });
});
