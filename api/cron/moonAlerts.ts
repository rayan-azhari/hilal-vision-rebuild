/**
 * GET /api/cron/moonAlerts
 *
 * Vercel Cron Job — runs daily at 08:00 UTC.
 * Sends push notifications for:
 *   - 29th Hijri night (crescent moon watch alert)
 *   - Full moon tonight
 *   - Blue moon (second full moon in a calendar month)
 *   - Lunar eclipse (total / partial / penumbral)
 *
 * Authentication: x-cron-secret header (set by Vercel automatically for cron invocations,
 * or manually for testing).
 */
import type { IncomingMessage, ServerResponse } from "http";
import { ENV } from "../../server/_core/env.js";
import { getUmmAlQuraHijri, getMoonPhaseInfo, predictLunarEclipse } from "../../shared/astronomy.js";
import { setCorsHeaders } from "../_cors.js";

// Use Vercel's auto-provisioned production URL env var; fall back to the canonical domain.
const SEND_URL = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "moon-dashboard-one.vercel.app"}/api/push/send`;

async function sendNotification(
    title: string,
    body: string,
    data?: Record<string, string>
): Promise<{ sent: number; removed: number }> {
    const res = await fetch(SEND_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-cron-secret": ENV.cronSecret,
        },
        body: JSON.stringify({ title, body, data }),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`send endpoint responded ${res.status}: ${text}`);
    }
    return res.json();
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
    if (setCorsHeaders(req, res)) return;

    // Vercel cron invocations use GET; allow POST for manual testing
    if (req.method !== "GET" && req.method !== "POST") {
        res.statusCode = 405;
        res.end("Method Not Allowed");
        return;
    }

    // Authenticate
    const secret = (req.headers as any)["x-cron-secret"];
    if (!ENV.cronSecret || secret !== ENV.cronSecret) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
    }

    const today = new Date();
    const alerts: string[] = [];

    try {
        // ── 1. 29th Hijri night alert ──────────────────────────────────────────
        const hijri = getUmmAlQuraHijri(today);
        if (hijri.day === 29) {
            const result = await sendNotification(
                "🌙 29th Night — Crescent Watch",
                `Tonight is the 29th of ${hijri.monthName}. Look west after sunset for the new crescent moon!`,
                { type: "29th_night", hijriMonth: String(hijri.month) }
            );
            alerts.push(`29th_night (sent=${result.sent})`);
        }

        // ── 2. Full moon / Blue moon / Lunar eclipse ───────────────────────────
        const phase = getMoonPhaseInfo(today);
        const nextFull = phase.nextFullMoon;

        // Check if nextFullMoon is today (within same calendar date)
        const fullIsToday =
            nextFull.getFullYear() === today.getFullYear() &&
            nextFull.getMonth() === today.getMonth() &&
            nextFull.getDate() === today.getDate();

        if (fullIsToday) {
            // Detect blue moon: was there already a full moon earlier this calendar month?
            const SYNODIC_MS = 29.53059 * 24 * 3600 * 1000;
            const prevFull = new Date(nextFull.getTime() - SYNODIC_MS);
            const isBlueMoon = prevFull.getMonth() === today.getMonth();

            // Predict eclipse
            const eclipse = predictLunarEclipse(nextFull);

            if (eclipse === "total") {
                const result = await sendNotification(
                    "🌕🔴 Total Lunar Eclipse Tonight!",
                    "A total lunar eclipse (Blood Moon) is visible tonight. Look for the reddish moon as it passes through Earth's shadow.",
                    { type: "eclipse_total" }
                );
                alerts.push(`eclipse_total (sent=${result.sent})`);
            } else if (eclipse === "partial") {
                const result = await sendNotification(
                    "🌕 Partial Lunar Eclipse Tonight",
                    "A partial lunar eclipse is happening tonight. Part of the moon will darken as it enters Earth's shadow.",
                    { type: "eclipse_partial" }
                );
                alerts.push(`eclipse_partial (sent=${result.sent})`);
            } else if (eclipse === "penumbral") {
                const result = await sendNotification(
                    "🌕 Penumbral Lunar Eclipse Tonight",
                    "A subtle penumbral eclipse occurs tonight — the moon passes through Earth's outer shadow, causing a slight dimming.",
                    { type: "eclipse_penumbral" }
                );
                alerts.push(`eclipse_penumbral (sent=${result.sent})`);
            } else if (isBlueMoon) {
                const result = await sendNotification(
                    "🌕 Blue Moon Tonight!",
                    "Tonight brings a rare Blue Moon — the second full moon this calendar month. Look up after sunset!",
                    { type: "blue_moon" }
                );
                alerts.push(`blue_moon (sent=${result.sent})`);
            } else {
                const result = await sendNotification(
                    "🌕 Full Moon Tonight",
                    `Tonight's full moon (${phase.phaseName}) rises at sunset. Perfect for moon watching!`,
                    { type: "full_moon" }
                );
                alerts.push(`full_moon (sent=${result.sent})`);
            }
        }

        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ alerts, hijriDay: hijri.day }));
    } catch (err) {
        console.error("[cron/moonAlerts] Error:", err);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: String(err) }));
    }
}
