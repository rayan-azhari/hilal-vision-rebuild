/**
 * Weather Router — Cloud Cover Grid
 *
 * Fetches cloud cover data from Open-Meteo for a sparse global grid
 * and returns it for client-side interpolation into a cloud overlay texture.
 */
import { publicProcedure, router } from "../_core/trpc.js";
import { z } from "zod";

// ─── In-Memory Cache ──────────────────────────────────────────────────────────

interface CacheEntry {
  data: Array<{ lat: number; lng: number; cloud_cover: number }>;
  timestamp: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, CacheEntry>();

function getCached(key: string): CacheEntry["data"] | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

// ─── Grid Generation ──────────────────────────────────────────────────────────

/**
 * Generate a sparse grid of lat/lng points for cloud cover sampling.
 * 15° latitude steps × 20° longitude steps over ±60° lat = ~162 points.
 */
function generateGridPoints(): Array<{ lat: number; lng: number }> {
  const points: Array<{ lat: number; lng: number }> = [];
  for (let lat = -60; lat <= 60; lat += 15) {
    for (let lng = -180; lng < 180; lng += 20) {
      points.push({ lat, lng });
    }
  }
  return points;
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const weatherRouter = router({
  getCloudGrid: publicProcedure
    .input(
      z.object({
        date: z.string().max(32),
      })
    )
    .query(async ({ input }) => {
      const dateKey = input.date.slice(0, 10); // YYYY-MM-DD
      const cached = getCached(dateKey);
      if (cached) return { data: cached };

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

        const fetchBatch = async (batchIndex: number) => {
          try {
            // Add a small staggered delay between batches to respect rate limits
            if (batchIndex > 0) await new Promise(r => setTimeout(r, batchIndex * 50));

            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}&hourly=cloud_cover&forecast_days=1&timezone=auto`;
            const res = await fetch(url, { signal: AbortSignal.timeout(2000) });

            if (!res.ok) {
              console.error(`Open-Meteo cloud fetch failed: ${res.status}`);
              batch.forEach((p) => allResults.push({ ...p, cloud_cover: 0 }));
              return;
            }

            const json = (await res.json()) as any;
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

        fetchPromises.push(fetchBatch(i / BATCH_SIZE));
      }

      await Promise.allSettled(fetchPromises);

      // Cache
      cache.set(dateKey, { data: allResults, timestamp: Date.now() });

      return { data: allResults };
    }),

  getLocalWeather: publicProcedure
    .input(
      z.object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
      })
    )
    .query(async ({ input }) => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${input.lat}&longitude=${input.lng}&current=temperature_2m,cloud_cover,relative_humidity_2m,wind_speed_10m,visibility&timezone=auto`;
        const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
        if (!res.ok) {
          throw new Error(`Open-Meteo fetch failed: ${res.status}`);
        }
        const json = (await res.json()) as any;

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
          conditionText = "Excellent — ideal viewing conditions";
          conditionColor = "#4ade80"; // green
        } else if (conditionsScore >= 45) {
          conditionText = "Good — some interference possible";
          conditionColor = "#a3e635"; // light green
        } else if (conditionsScore >= 25) {
          conditionText = "Fair — conditions may affect sighting";
          conditionColor = "#facc15"; // yellow
        } else {
          conditionText = "Poor — weather may prevent observation";
          conditionColor = "#f87171"; // red
        }

        return {
          cloudCover,
          temperature,
          humidity,
          windSpeed,
          visibilityKm,
          conditionsScore,
          conditionText,
          conditionColor,
        };
      } catch (err) {
        console.error("Local weather fetch error:", err);
        return {
          cloudCover: 0,
          temperature: 0,
          humidity: 0,
          windSpeed: 0,
          visibilityKm: 0,
          conditionsScore: 0,
          conditionText: "Weather unavailable",
          conditionColor: "#6b7280",
        };
      }
    }),
});
