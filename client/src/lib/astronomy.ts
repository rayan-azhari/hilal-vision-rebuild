/**
 * Hilal Vision — Astronomy Client Wrapper
 *
 * Re-exports everything from the shared isomorphic astronomy module,
 * and adds DOM-dependent functions that require `document` / `canvas`.
 */

// Re-export everything from the shared module so existing imports work unchanged
export * from "@shared/astronomy";

import {
  computeSunMoonAtSunset,
  isDaylight,
  ZONE_RGB,
  type VisibilityZone,
} from "@shared/astronomy";

// ─── DOM-Dependent Functions ──────────────────────────────────────────────────

/**
 * Build a visibility texture as a data URL using Canvas 2D.
 * This function requires `document` and cannot run in Web Workers or Node.js.
 */
export function buildVisibilityTexture(date: Date, resolution = 2, isMercator = false): string {
  const W = Math.floor(360 / resolution);
  const H = Math.floor(180 / resolution);
  const offCanvas = document.createElement("canvas");
  offCanvas.width = W;
  offCanvas.height = H;
  const offCtx = offCanvas.getContext("2d")!;
  const imageData = offCtx.createImageData(W, H);
  const data = imageData.data;

  const maxLat = 85.051129;

  for (let py = 0; py < H; py++) {
    let lat: number;
    if (isMercator) {
      const mercY = Math.PI - (py / H) * 2 * Math.PI;
      lat = (2 * Math.atan(Math.exp(mercY)) - Math.PI / 2) * (180 / Math.PI);
      if (lat > maxLat) lat = maxLat;
      if (lat < -maxLat) lat = -maxLat;
    } else {
      lat = 90 - (py / H) * 180;
    }

    for (let px = 0; px < W; px++) {
      const lng = -180 + (px / W) * 360;
      const result = computeSunMoonAtSunset(date, { lat, lng });
      const [r, g, b] = ZONE_RGB[result.visibility];
      const night = !isDaylight(lat, lng, date);
      const alpha = result.visibility === "F" ? 40 : night ? 100 : 180;
      const idx = (py * W + px) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = alpha;
    }
  }
  offCtx.putImageData(imageData, 0, 0);

  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  // Smooth the boundaries between the low-res computed pixels
  ctx.filter = "blur(12px)";
  // Draw 3 times to wrap the edges seamlessly across the dateline
  ctx.drawImage(offCanvas, -canvas.width, 0, canvas.width, canvas.height);
  ctx.drawImage(offCanvas, 0, 0, canvas.width, canvas.height);
  ctx.drawImage(offCanvas, canvas.width, 0, canvas.width, canvas.height);

  return canvas.toDataURL();
}
