import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, emailSignups } from "@hilal/db";

const bodySchema = z.object({
    email: z.string().email().max(320),
});

// ─── Rate limiter (10 req / min / IP) ────────────────────────────────────────
const _rateMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, maxReqs = 10, windowMs = 60_000): boolean {
    const now = Date.now();
    if (_rateMap.size > 10_000) {
        _rateMap.forEach((v, k) => {
            if (now > v.resetAt) _rateMap.delete(k);
        });
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

/**
 * POST /api/email-signup
 * Register an email address for the waitlist / newsletter.
 * Duplicate emails are silently accepted (idempotent).
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
    // Rate limit by IP
    const ip =
        req.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() ??
        req.headers.get("x-real-ip") ??
        "unknown";

    if (!checkRateLimit(ip)) {
        return NextResponse.json(
            { error: "Too many requests. Please try again later." },
            { status: 429 }
        );
    }

    // Parse body
    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid email address" },
            { status: 400 }
        );
    }

    if (!db) {
        return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const { email } = parsed.data;

    try {
        // onConflictDoNothing: duplicate email → returns empty array but doesn't throw
        await db.insert(emailSignups).values({ email }).onConflictDoNothing();
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("[EmailSignup] Failed to save:", error);
        return NextResponse.json({ error: "Failed to save email" }, { status: 500 });
    }
}
