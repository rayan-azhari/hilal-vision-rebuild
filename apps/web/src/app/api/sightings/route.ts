import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { db } from "@hilal/db";
import { observationReports } from "@hilal/db/schema";
import { eq, sql } from "drizzle-orm";
import { computeSunMoonAtSunset } from "@hilal/astronomy";

// ─── In-memory rate limiter (5 req / min / IP) ───────────────────────────────
const _rateMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, maxReqs = 5, windowMs = 60_000): boolean {
    const now = Date.now();
    if (_rateMap.size > 10_000) {
        _rateMap.forEach((v, k) => { if (now > v.resetAt) _rateMap.delete(k); });
    }
    const record = _rateMap.get(key);
    if (!record || now > record.resetAt) {
        _rateMap.set(key, { count: 1, resetAt: now + windowMs });
        return true;
    }
    if (record.count >= maxReqs) return false;
    record.count += 1;
    return true;
}

const sightingSchema = z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    observationTime: z.string().optional(),
    visualSuccess: z.enum(["naked_eye", "optical_aid", "not_seen"]).default("not_seen"),
    notes: z.string().max(1000).optional(),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
    // ── Auth (Clerk) ─────────────────────────────────────────────────────────
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // ── Rate limit by IP ─────────────────────────────────────────────────────
    const ip =
        req.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() ??
        req.headers.get("x-real-ip") ??
        "unknown";
    if (!checkRateLimit(ip)) {
        return NextResponse.json(
            { error: "Rate limit exceeded. Please wait before submitting again." },
            { status: 429 }
        );
    }

    // ── Validate input ───────────────────────────────────────────────────────
    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = sightingSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
    }

    const { lat, lng, observationTime, visualSuccess, notes } = parsed.data;

    if (!db) {
        return NextResponse.json({ error: "Database not available" }, { status: 503 });
    }

    const obsDate = new Date(observationTime ?? Date.now());
    if (isNaN(obsDate.getTime())) {
        return NextResponse.json({ error: "Invalid observationTime format" }, { status: 400 });
    }

    // ── Zone F rejection ─────────────────────────────────────────────────────
    if (visualSuccess !== "not_seen") {
        const computed = computeSunMoonAtSunset(obsDate, { lat, lng });
        if (computed.visibility === "F") {
            return NextResponse.json(
                { error: "Validation failed: the moon was below the horizon at this location and time." },
                { status: 422 }
            );
        }
    }

    // ── Privacy jitter (~1.1 km displacement before storage) ─────────────────
    const jitteredLat = lat + (Math.random() - 0.5) * 0.02;
    const jitteredLng = lng + (Math.random() - 0.5) * 0.02;

    // ── Persist immediately ───────────────────────────────────────────────────
    const [insertedRow] = await db
        .insert(observationReports)
        .values({
            userId,
            location: sql`ST_SetSRID(ST_MakePoint(${jitteredLng}, ${jitteredLat}), 4326)`,
            observationTime: obsDate,
            visualSuccess,
            notes: notes ?? null,
            imageUrl: null,
        })
        .returning({ id: observationReports.id });

    const sightingId = insertedRow?.id;

    // ── Async Open-Meteo enrichment (non-blocking) ────────────────────────────
    after(async () => {
        if (!db || !sightingId) return;
        try {
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,surface_pressure,cloud_cover`;
            const res = await fetch(weatherUrl, { signal: AbortSignal.timeout(3000) });
            if (!res.ok) return;
            const data = (await res.json()) as {
                current?: { temperature_2m?: number; surface_pressure?: number; cloud_cover?: number };
            };
            await db
                .update(observationReports)
                .set({
                    temperature: data.current?.temperature_2m?.toString(),
                    pressure: data.current?.surface_pressure?.toString(),
                    cloudFraction: data.current?.cloud_cover?.toString(),
                })
                .where(eq(observationReports.id, sightingId));
        } catch {
            // Enrichment failure is non-fatal
        }
    });

    return NextResponse.json({ success: true, id: sightingId }, { status: 201 });
}
