import { Router } from "express";
import { z } from "zod";
import { computeSunMoonAtSunset, getMoonPhaseInfo } from "../shared/astronomy.js";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Lazy-initialised rate limiter (gracefully skipped if env vars are missing)
let ratelimiter: Ratelimit | null = null;

function getRatelimiter(): Ratelimit | null {
    if (ratelimiter) return ratelimiter;
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) return null;
    ratelimiter = new Ratelimit({
        redis: new Redis({ url, token }),
        limiter: Ratelimit.slidingWindow(10, "1 m"),
        prefix: "hilal:public-api",
    });
    return ratelimiter;
}

async function applyRateLimit(req: any, res: any): Promise<boolean> {
    const rl = getRatelimiter();
    if (!rl) return false; // No rate limiting if Upstash is not configured
    const forwarded = req.headers["x-forwarded-for"] as string | undefined;
    // Use the last entry Vercel appends (not the first, which is user-controlled)
    const ip = forwarded
        ? forwarded.split(",").map((s: string) => s.trim()).at(-1) ?? "unknown"
        : req.socket?.remoteAddress ?? "unknown";
    const { success, limit, remaining, reset } = await rl.limit(ip);
    res.set("X-RateLimit-Limit", String(limit));
    res.set("X-RateLimit-Remaining", String(remaining));
    res.set("X-RateLimit-Reset", String(reset));
    if (!success) {
        res.status(429).json({ error: "Too many requests. Please wait before retrying." });
        return true;
    }
    return false;
}

export const publicApiRouter = Router();

const visibilitySchema = z.object({
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
    date: z.string().optional(),
});

const moonPhaseSchema = z.object({
    date: z.string().optional(),
});

/**
 * @openapi
 * /api/v1/visibility:
 *   get:
 *     description: Get visibility data (Yallop & Odeh criteria) for a specific location and date.
 */
export async function visibilityHandler(req: any, res: any) {
    if (await applyRateLimit(req, res)) return;
    try {
        const parsed = visibilitySchema.parse(req.query);
        const date = parsed.date ? new Date(parsed.date as string) : new Date();

        if (isNaN(date.getTime())) {
            return res.status(400).json({ error: "Invalid date format" });
        }

        // Reject extreme dates — polar and deep-past/future edge cases are unsupported
        const FIFTY_YEARS_MS = 50 * 365.25 * 24 * 3600 * 1000;
        if (Math.abs(date.getTime() - Date.now()) > FIFTY_YEARS_MS) {
            return res.status(400).json({ error: "Date out of supported range (±50 years from today)" });
        }

        const data = computeSunMoonAtSunset(date, { lat: parsed.lat as number, lng: parsed.lng as number });

        res.json({
            success: true,
            data: {
                date: date.toISOString(),
                location: { lat: parsed.lat, lng: parsed.lng },
                qValue: data.qValue,
                odehCriterion: data.odehCriterion,
                visibilityZone: data.visibility,
                moonAgeHours: data.moonAge,
                elongation: data.elongation,
                moonAltitude: data.moonAlt,
                sunAltitude: data.sunAlt,
            }
        });
    } catch (err: any) {
        res.status(400).json({ error: "Validation failed", details: err.errors || err.message });
    }
}

/**
 * @openapi
 * /api/v1/moon-phases:
 *   get:
 *     description: Get current and upcoming moon phase information.
 */
export async function moonPhasesHandler(req: any, res: any) {
    if (await applyRateLimit(req, res)) return;
    try {
        const parsed = moonPhaseSchema.parse(req.query);
        const date = parsed.date ? new Date(parsed.date) : new Date();

        if (isNaN(date.getTime())) {
            return res.status(400).json({ error: "Invalid date format" });
        }

        const FIFTY_YEARS_MS = 50 * 365.25 * 24 * 3600 * 1000;
        if (Math.abs(date.getTime() - Date.now()) > FIFTY_YEARS_MS) {
            return res.status(400).json({ error: "Date out of supported range (±50 years from today)" });
        }

        const data = getMoonPhaseInfo(date);

        res.json({
            success: true,
            data: {
                date: date.toISOString(),
                phaseName: data.phaseName,
                illuminatedFraction: data.illuminatedFraction,
                moonAgeHours: data.moonAge,
                nextNewMoon: data.nextNewMoon.toISOString(),
                nextNewMoonExact: data.nextNewMoonExact.toISOString(),
                nextFullMoon: data.nextFullMoon.toISOString()
            }
        });
    } catch (err: any) {
        res.status(400).json({ error: "Validation failed", details: err.errors || err.message });
    }
}

publicApiRouter.get("/visibility", visibilityHandler);
publicApiRouter.get("/moon-phases", moonPhasesHandler);
