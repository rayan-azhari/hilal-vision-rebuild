import { router, publicProcedure } from "../trpc";
import { localWeatherQuerySchema, cloudGridQuerySchema } from "@hilal/types";

// ─── Grid Generation ──────────────────────────────────────────────────────────
function generateGridPoints(): Array<{ lat: number; lng: number }> {
    const points: Array<{ lat: number; lng: number }> = [];
    for (let lat = -60; lat <= 60; lat += 15) {
        for (let lng = -180; lng < 180; lng += 20) {
            points.push({ lat, lng });
        }
    }
    return points;
}

export const weatherRouter = router({
    getCloudGrid: publicProcedure
        .input(cloudGridQuerySchema)
        .query(async ({ input }) => {
            const gridPoints = generateGridPoints();

            // Open-Meteo supports comma-separated lat/lng for multi-location queries
            // Vercel/Node has max URL length limits, so we batch in very small chunks.
            const BATCH_SIZE = 25;
            const allResults: Array<{ lat: number; lng: number; cloud_cover: number }> = [];

            const fetchPromises = [];

            for (let i = 0; i < gridPoints.length; i += BATCH_SIZE) {
                const batch = gridPoints.slice(i, i + BATCH_SIZE);
                const lats = batch.map((p) => p.lat).join(",");
                const lngs = batch.map((p) => p.lng).join(",");

                const fetchBatch = async () => {
                    try {
                        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}&hourly=cloud_cover&forecast_days=1&timezone=auto`;

                        // Use Next.js fetch cache (revalidate every 5 minutes)
                        const res = await fetch(url, {
                            next: { revalidate: 300 }
                        });

                        if (!res.ok) {
                            console.error(`Open-Meteo cloud fetch failed: ${res.status}`);
                            batch.forEach((p) => allResults.push({ ...p, cloud_cover: 0 }));
                            return;
                        }

                        const json = (await res.json()) as { hourly?: { cloud_cover?: number[] } } | { hourly?: { cloud_cover?: number[] } }[];
                        const locations = Array.isArray(json) ? json : [json];

                        for (let j = 0; j < batch.length; j++) {
                            const locData = locations[j];
                            if (!locData?.hourly?.cloud_cover) {
                                allResults.push({ ...batch[j], cloud_cover: 0 });
                                continue;
                            }

                            const hourlyCloud = locData.hourly.cloud_cover as number[];
                            const sunsetHourIdx = Math.min(18, hourlyCloud.length - 1);
                            allResults.push({
                                lat: batch[j].lat,
                                lng: batch[j].lng,
                                cloud_cover: hourlyCloud[sunsetHourIdx] ?? 0,
                            });
                        }
                    } catch (err) {
                        console.error("Open-Meteo cloud grid fetch error:", err);
                        batch.forEach((p) => allResults.push({ ...p, cloud_cover: 0 }));
                    }
                };

                fetchPromises.push(fetchBatch());
            }

            await Promise.allSettled(fetchPromises);

            return {
                status: "success",
                data: {
                    date: input.date,
                    grid: allResults,
                },
            };
        }),

    getLocalWeather: publicProcedure
        .input(localWeatherQuerySchema)
        .query(async ({ input }) => {
            try {
                const url = `https://api.open-meteo.com/v1/forecast?latitude=${input.lat}&longitude=${input.lng}&current=temperature_2m,cloud_cover,relative_humidity_2m,wind_speed_10m,visibility&timezone=auto`;

                // Use Next.js cache (revalidate every 5 minutes)
                const res = await fetch(url, {
                    next: { revalidate: 300 }
                });

                if (!res.ok) {
                    throw new Error(`Open-Meteo fetch failed: ${res.status}`);
                }
                const json = (await res.json()) as { current?: { cloud_cover?: number; temperature_2m?: number; relative_humidity_2m?: number; wind_speed_10m?: number; visibility?: number; } };

                const cloudCover: number = json.current?.cloud_cover ?? 0;
                const temperature: number = json.current?.temperature_2m ?? 0;
                const humidity: number = json.current?.relative_humidity_2m ?? 0;
                const windSpeed: number = json.current?.wind_speed_10m ?? 0; // km/h
                const visibilityKm: number = Math.round((json.current?.visibility ?? 24000) / 1000);

                // Composite conditions score (0–100) weighted by observational impact
                const cloudScore = cloudCover <= 10 ? 50 : cloudCover <= 40 ? 35 : cloudCover <= 70 ? 15 : 0;
                const humidityScore = humidity <= 50 ? 20 : humidity <= 75 ? 10 : 0;
                const windScore = windSpeed <= 20 ? 15 : windSpeed <= 40 ? 8 : 0;
                const visScore = visibilityKm >= 20 ? 15 : visibilityKm >= 10 ? 8 : 0;
                const conditionsScore = cloudScore + humidityScore + windScore + visScore;

                let conditionText: string;
                let conditionColor: string;
                if (conditionsScore >= 70) {
                    conditionText = "Excellent";
                    conditionColor = "#4ade80"; // green
                } else if (conditionsScore >= 45) {
                    conditionText = "Good";
                    conditionColor = "#a3e635"; // light green
                } else if (conditionsScore >= 25) {
                    conditionText = "Fair";
                    conditionColor = "#facc15"; // yellow
                } else {
                    conditionText = "Poor";
                    conditionColor = "#f87171"; // red
                }

                return {
                    status: "success",
                    data: {
                        cloudCover,
                        temperature,
                        humidity,
                        windSpeed,
                        visibilityKm,
                        conditionsScore,
                        conditionText,
                        conditionColor,
                    }
                };
            } catch (err) {
                console.error("Local weather fetch error:", err);
                return {
                    status: "error",
                    data: {
                        cloudCover: 0,
                        temperature: 0,
                        humidity: 0,
                        windSpeed: 0,
                        visibilityKm: 0,
                        conditionsScore: 0,
                        conditionText: "Unavailable",
                        conditionColor: "#6b7280",
                    }
                };
            }
        }),
});
