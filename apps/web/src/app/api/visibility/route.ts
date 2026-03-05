import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { generateVisibilityGrid } from "@hilal/astronomy";

export const runtime = "edge";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date"); // YYYY-MM-DD
    const criterion = searchParams.get("criterion") === "odeh" ? "odeh" : "yallop";

    // Default to today
    let targetDate = new Date();
    if (dateStr) {
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) {
            targetDate = parsed;
        } else {
            return NextResponse.json({ error: "Invalid date format. Expected YYYY-MM-DD" }, { status: 400 });
        }
    }

    const formattedDate = targetDate.toISOString().split("T")[0];
    const cacheKey = `visibility_grid:${formattedDate}:${criterion}:4deg`;

    try {
        // 1. Try to hit Vercel KV for pre-computed Edge cache
        const cachedGridStr = await kv.get<string>(cacheKey);

        if (cachedGridStr) {
            const parsedGrid = typeof cachedGridStr === "string" ? JSON.parse(cachedGridStr) : cachedGridStr;
            return NextResponse.json({
                cached: true,
                date: formattedDate,
                criterion,
                grid: parsedGrid
            });
        }

        // 2. Fallback: compute on the edge right now
        // This takes longer (1-2s typical, depending on CPU) but ensures 100% SLA even if cron failed
        const grid = generateVisibilityGrid(targetDate, 4, criterion);

        // We do *not* write to KV here, because kv.set incurs latency penalty on the client response.
        // It's better to let the cron handle caching. If they request an arbitrary date 10 years
        // in the future, we just compute it synchronously on the Edge worker.

        return NextResponse.json({
            cached: false,
            date: formattedDate,
            criterion,
            grid
        });

    } catch (error) {
        console.error("Edge API Error fetching visibility grid:", error);
        return NextResponse.json(
            { error: "Internal Server Error fetching grid data" },
            { status: 500 }
        );
    }
}
