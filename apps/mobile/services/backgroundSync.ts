import { getPendingSightings, markSightingSynced } from "./offlineStore";

/**
 * Iterates through the local SQLite store and pushes them to the backend 
 * Next.js API route when network connection is restored.
 */
export async function syncOfflineSightings() {
    const pending = getPendingSightings();
    if (pending.length === 0) return;

    console.log(`Syncing ${pending.length} offline sightings...`);

    for (const sighting of pending) {
        try {
            // Send the payload to the Vercel backend
            const response = await fetch("https://hilalvision.com/api/v1/sightings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    latitude: sighting.latitude,
                    longitude: sighting.longitude,
                    observedAt: sighting.observedAt,
                    result: sighting.result,
                    notes: sighting.notes,
                }),
            });

            if (response.ok) {
                // Mark as synced locally so we don't upload again
                if (sighting.id !== undefined) {
                    markSightingSynced(sighting.id);
                }
            } else {
                console.error("Failed to sync sighting", sighting.id, response.statusText);
            }
        } catch (e) {
            console.error("Network error syncing sighting", sighting.id, e);
            // Fail gracefully — we'll retry next time syncOfflineSightings is called
        }
    }
}
