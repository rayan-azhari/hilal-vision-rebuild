import { NextResponse } from 'next/server';
import { after } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { latitude, longitude, observedAt, result, notes } = body;

        // We imagine persisting this to the primary DB table immediately
        console.log(`[Sightings API] Ingested raw sighting near ${latitude}, ${longitude}`);
        const sightingId = Date.now(); // Mock ID for demonstration

        // We utilize Next.js 'after' to defer heavy processing until the response is closed
        after(async () => {
            console.log(`[Sightings API - Async] Fetching Open-Meteo enrichment for sighting ${sightingId}...`);
            try {
                // Enqueue background processing out of band (telemetry/weather enrichment)
                // Simulated network delay
                await new Promise(resolve => setTimeout(resolve, 2000));
                console.log(`[Sightings API - Async] Sighting ${sightingId} successfully enriched!`);
                // Actual db update happens here
            } catch (err) {
                console.error(`[Sightings API - Async] Enrichment failed:`, err);
            }
        });

        // We immediately acknowledge the user's sighting within 50ms rather than 5000ms
        return NextResponse.json({
            success: true,
            id: sightingId,
            message: "Sighting received successfully"
        }, { status: 201 });

    } catch (err) {
        return NextResponse.json({ error: "Invalid sighting payload" }, { status: 400 });
    }
}
