import { describe, it, expect, vi, beforeEach } from "vitest";
import { visibilityHandler, moonPhasesHandler } from "./publicApi.js";

// ─── Mock req/res factory ─────────────────────────────────────────────────────

function mockGetReq(query: Record<string, string>) {
    return { method: "GET", query } as any;
}

function mockRes() {
    let capturedBody: unknown = null;
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn((body: unknown) => {
            capturedBody = body;
        }),
        get body() {
            return capturedBody;
        },
    } as any;
    return res;
}

beforeEach(() => {
    vi.restoreAllMocks();
});

// ─── GET /api/v1/visibility ───────────────────────────────────────────────────

describe("GET /api/v1/visibility", () => {
    it("returns 200 with correct shape for a valid Mecca location", () => {
        const res = mockRes();
        visibilityHandler(
            mockGetReq({ lat: "21.39", lng: "39.86", date: "2026-02-28" }),
            res
        );
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        const body = res.body as any;
        expect(body.data).toHaveProperty("visibilityZone");
        expect(body.data).toHaveProperty("qValue");
        expect(body.data).toHaveProperty("elongation");
        expect(body.data.location).toEqual({ lat: 21.39, lng: 39.86 });
    });

    it("uses today's date when date param is omitted", () => {
        const res = mockRes();
        visibilityHandler(mockGetReq({ lat: "21.39", lng: "39.86" }), res);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        expect(res.status).not.toHaveBeenCalled();
    });

    it("returns 400 for an invalid date string", () => {
        const res = mockRes();
        visibilityHandler(
            mockGetReq({ lat: "21.39", lng: "39.86", date: "not-a-date" }),
            res
        );
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("returns 400 for a date more than 50 years in the future", () => {
        const res = mockRes();
        visibilityHandler(
            mockGetReq({ lat: "21.39", lng: "39.86", date: "2100-01-01" }),
            res
        );
        expect(res.status).toHaveBeenCalledWith(400);
        const body = res.body as any;
        expect(body.error).toMatch(/out of supported range/i);
    });

    it("returns 400 for a date more than 50 years in the past", () => {
        const res = mockRes();
        visibilityHandler(
            mockGetReq({ lat: "21.39", lng: "39.86", date: "1900-01-01" }),
            res
        );
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("returns 400 when lat is out of range", () => {
        const res = mockRes();
        visibilityHandler(mockGetReq({ lat: "200", lng: "39.86" }), res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("returns 400 when lng is missing", () => {
        const res = mockRes();
        visibilityHandler(mockGetReq({ lat: "21.39" }), res);
        expect(res.status).toHaveBeenCalledWith(400);
    });
});

// ─── GET /api/v1/moon-phases ──────────────────────────────────────────────────

describe("GET /api/v1/moon-phases", () => {
    it("returns 200 with phase info for a valid date", () => {
        const res = mockRes();
        moonPhasesHandler(mockGetReq({ date: "2026-02-28" }), res);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        const body = res.body as any;
        expect(body.data).toHaveProperty("phaseName");
        expect(body.data).toHaveProperty("illuminatedFraction");
        expect(body.data).toHaveProperty("nextNewMoon");
    });

    it("returns 200 with today's data when date is omitted", () => {
        const res = mockRes();
        moonPhasesHandler(mockGetReq({}), res);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it("returns 400 for a date more than 50 years away", () => {
        const res = mockRes();
        moonPhasesHandler(mockGetReq({ date: "1800-01-01" }), res);
        expect(res.status).toHaveBeenCalledWith(400);
        const body = res.body as any;
        expect(body.error).toMatch(/out of supported range/i);
    });

    it("returns 400 for an invalid date string", () => {
        const res = mockRes();
        moonPhasesHandler(mockGetReq({ date: "bad-date" }), res);
        expect(res.status).toHaveBeenCalledWith(400);
    });
});
