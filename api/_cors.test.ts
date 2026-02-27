/**
 * CORS Utility Tests
 * Verifies origin whitelisting works correctly.
 */
import { describe, it, expect, vi } from "vitest";
import { setCorsHeaders } from "./_cors.js";
import type { IncomingMessage, ServerResponse } from "http";

function mockReqRes(origin?: string) {
    const req = {
        method: "GET",
        headers: { origin },
    } as unknown as IncomingMessage;

    const headers: Record<string, string> = {};
    const res = {
        setHeader: vi.fn((key: string, val: string) => {
            headers[key] = val;
        }),
        end: vi.fn(),
        statusCode: 200,
    } as unknown as ServerResponse;

    return { req, res, headers };
}

describe("setCorsHeaders", () => {
    it("sets Access-Control-Allow-Origin for whitelisted origin", () => {
        const { req, res } = mockReqRes("https://moonsighting.live");
        setCorsHeaders(req, res);

        expect(res.setHeader).toHaveBeenCalledWith(
            "Access-Control-Allow-Origin",
            "https://moonsighting.live",
        );
    });

    it("sets Vary: Origin for whitelisted origin", () => {
        const { req, res } = mockReqRes("https://moonsighting.live");
        setCorsHeaders(req, res);

        expect(res.setHeader).toHaveBeenCalledWith("Vary", "Origin");
    });

    it("does NOT set Access-Control-Allow-Origin for unknown origin", () => {
        const { req, res } = mockReqRes("https://evil-site.com");
        setCorsHeaders(req, res);

        const calls = (res.setHeader as any).mock.calls;
        const originCalls = calls.filter(
            ([key]: [string]) => key === "Access-Control-Allow-Origin",
        );
        expect(originCalls).toHaveLength(0);
    });

    it("does NOT set Access-Control-Allow-Origin when origin is missing", () => {
        const { req, res } = mockReqRes(undefined);
        setCorsHeaders(req, res);

        const calls = (res.setHeader as any).mock.calls;
        const originCalls = calls.filter(
            ([key]: [string]) => key === "Access-Control-Allow-Origin",
        );
        expect(originCalls).toHaveLength(0);
    });

    it("allows Capacitor Android origin (https://localhost)", () => {
        const { req, res } = mockReqRes("https://localhost");
        setCorsHeaders(req, res);

        expect(res.setHeader).toHaveBeenCalledWith(
            "Access-Control-Allow-Origin",
            "https://localhost",
        );
    });

    it("allows Capacitor iOS origin (capacitor://localhost)", () => {
        const { req, res } = mockReqRes("capacitor://localhost");
        setCorsHeaders(req, res);

        expect(res.setHeader).toHaveBeenCalledWith(
            "Access-Control-Allow-Origin",
            "capacitor://localhost",
        );
    });

    it("allows local dev origin (http://localhost:5173)", () => {
        const { req, res } = mockReqRes("http://localhost:5173");
        setCorsHeaders(req, res);

        expect(res.setHeader).toHaveBeenCalledWith(
            "Access-Control-Allow-Origin",
            "http://localhost:5173",
        );
    });

    it("returns true for OPTIONS preflight and ends response", () => {
        const req = {
            method: "OPTIONS",
            headers: { origin: "https://moonsighting.live" },
        } as unknown as IncomingMessage;

        const res = {
            setHeader: vi.fn(),
            end: vi.fn(),
            statusCode: 200,
        } as unknown as ServerResponse;

        const isPreflight = setCorsHeaders(req, res);
        expect(isPreflight).toBe(true);
        expect(res.end).toHaveBeenCalled();
    });

    it("returns false for non-OPTIONS requests", () => {
        const { req, res } = mockReqRes("https://moonsighting.live");
        const isPreflight = setCorsHeaders(req, res);
        expect(isPreflight).toBe(false);
    });

    it("allows Vercel preview domain", () => {
        const { req, res } = mockReqRes("https://moon-dashboard-one.vercel.app");
        setCorsHeaders(req, res);

        expect(res.setHeader).toHaveBeenCalledWith(
            "Access-Control-Allow-Origin",
            "https://moon-dashboard-one.vercel.app",
        );
    });
});
