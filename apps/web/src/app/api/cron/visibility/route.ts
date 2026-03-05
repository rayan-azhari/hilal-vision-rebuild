import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { generateVisibilityGrid } from "@hilal/astronomy";

// Recommended Vercel runtime for heavy compute or longer timeouts in Hobby/Pro
export const maxDuration = 60; // Up to 60s
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    // Basic authorization to prevent public spamming of the cron
    const authHeader = req.headers.get("authorization");
    const isCronTask = req.headers.get("x-vercel-cron");
    const cronSecret = process.env.CRON_SECRET;

    // Optional auth guard
    if (cronSecret && authHeader !== `Bearer ${cronSecret}` && isCronTask !== "1") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        // We pre-compute grids for today and tomorrow for both Yallop and Odeh criteria
        // Resolution is set to 4 (every 4 degrees of lat/lng)
        const resolutions = [
            { date: today, name: "today" },
            { date: tomorrow, name: "tomorrow" }
        ];

        const criteria: Array<"yallop" | "odeh"> = ["yallop", "odeh"];

        for (const res of resolutions) {
            for (const criterion of criteria) {
                const gridDateStr = res.date.toISOString().split("T")[0];
                const cacheKey = `visibility_grid:${gridDateStr}:${criterion}:4deg`;

                // Calculate the grid
                const grid = generateVisibilityGrid(res.date, 4, criterion);

                // Store in KV cache, expiring in 48 hours
                await kv.set(cacheKey, JSON.stringify(grid), { ex: 48 * 60 * 60 });
            }
        }

        return NextResponse.json({
            success: true,
            message: "Visibility grids calculated and cached successfully.",
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("Cron Error generating visibility grids:", error);
        return NextResponse.json(
            { error: "Internal Server Error during grid generation" },
            { status: 500 }
        );
    }
}
