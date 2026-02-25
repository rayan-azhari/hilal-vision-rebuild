import { Router } from "express";
import { z } from "zod";
import { computeSunMoonAtSunset, getMoonPhaseInfo } from "../shared/astronomy.js";

export const publicApiRouter = Router();

const visibilitySchema = z.object({
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
    date: z.string().optional(),
});

const moonPhaseSchema = z.object({
    date: z.string().optional(),
});

import type { Request, Response } from "express";

/**
 * @openapi
 * /api/v1/visibility:
 *   get:
 *     description: Get visibility data (Yallop & Odeh criteria) for a specific location and date.
 */
publicApiRouter.get("/visibility", (req: Request, res: Response) => {
    try {
        const parsed = visibilitySchema.parse(req.query);
        const date = parsed.date ? new Date(parsed.date as string) : new Date();

        if (isNaN(date.getTime())) {
            return res.status(400).json({ error: "Invalid date format" });
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
});

/**
 * @openapi
 * /api/v1/moon-phases:
 *   get:
 *     description: Get current and upcoming moon phase information.
 */
publicApiRouter.get("/moon-phases", (req: Request, res: Response) => {
    try {
        const parsed = moonPhaseSchema.parse(req.query);
        const date = parsed.date ? new Date(parsed.date) : new Date();

        if (isNaN(date.getTime())) {
            return res.status(400).json({ error: "Invalid date format" });
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
});

