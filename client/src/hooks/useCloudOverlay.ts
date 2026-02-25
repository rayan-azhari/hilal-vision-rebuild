/**
 * useCloudOverlay - Fetches cloud cover grid from tRPC and renders
 * it into a canvas texture URL for map/globe overlay.
 */
import { useMemo } from "react";
import { trpc } from "@/lib/trpc";

/**
 * Bilinear interpolation of sparse grid data into a full canvas texture.
 * Input: sparse grid points with `cloud_cover` (0-100).
 * Output: base64 data URL of a 1024×512 RGBA canvas (white = cloudy, transparent = clear).
 */
function renderCloudTexture(
    data: Array<{ lat: number; lng: number; cloud_cover: number }>
): string {
    // Halved dimensions for extreme performance on mobile (256x128)
    const W = 256;
    const H = 128;

    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;
    const imageData = ctx.createImageData(W, H);
    const pixels = imageData.data;

    // Build a lookup map for fast nearest-neighbor + interpolation
    const latStep = 15;
    const lngStep = 20;
    const gridMap = new Map<string, number>();
    for (const p of data) {
        gridMap.set(`${p.lat},${p.lng}`, p.cloud_cover);
    }

    for (let py = 0; py < H; py++) {
        const lat = 90 - (py / H) * 180;
        for (let px = 0; px < W; px++) {
            const lng = -180 + (px / W) * 360;

            // Find surrounding grid points for bilinear interpolation
            // Fix -0 JS bug which causes Map misses
            let latLo = Math.floor(lat / latStep) * latStep;
            if (latLo === 0) latLo = 0;
            let latHi = latLo + latStep;
            if (latHi === 0) latHi = 0;

            let lngLo = Math.floor(lng / lngStep) * lngStep;
            if (lngLo === 0) lngLo = 0;
            let lngHi = lngLo + lngStep;
            if (lngHi === 0) lngHi = 0;

            // Clamp to grid bounds
            const clampLat = (l: number) => {
                const c = Math.max(-60, Math.min(60, l));
                return c === 0 ? 0 : c;
            };
            const clampLng = (l: number) => {
                if (l >= 180) l -= 360;
                if (l < -180) l += 360;
                return l === 0 ? 0 : l;
            };

            const tl = gridMap.get(`${clampLat(latHi)},${clampLng(lngLo)}`) ?? 0;
            const tr = gridMap.get(`${clampLat(latHi)},${clampLng(lngHi)}`) ?? 0;
            const bl = gridMap.get(`${clampLat(latLo)},${clampLng(lngLo)}`) ?? 0;
            const br = gridMap.get(`${clampLat(latLo)},${clampLng(lngHi)}`) ?? 0;

            const tx = (lng - lngLo) / lngStep;
            const ty = (lat - latLo) / latStep;
            const top = tl + (tr - tl) * tx;
            const bottom = bl + (br - bl) * tx;
            const rawValue = bottom + (top - bottom) * ty;

            let norm = rawValue / 100;
            if (norm < 0) norm = 0;
            if (norm > 1) norm = 1;

            // Generate organic fractal noise using screen coordinates
            // This breaks up the blocky bilinear interpolation diamonds
            const scale1 = 0.15;
            const scale2 = 0.3;
            // noise ranges roughly -1.0 to 1.0
            const noise = Math.sin(px * scale1) * Math.cos(py * scale1) +
                Math.sin((px + py) * scale2) * 0.5;

            // Perturb the normalized cloud value slightly
            if (norm > 0) {
                norm += noise * 0.15 * norm;
            }

            // Smoothstep curve for contrast
            norm = norm * norm * (3 - 2 * norm);

            // Cloud edge threshold
            if (norm < 0.1) norm = 0;

            const alpha = Math.min(240, Math.floor(norm * 255));

            const idx = (py * W + px) * 4;
            // Pure white clouds across both dark and light themes
            pixels[idx] = 255;     // R
            pixels[idx + 1] = 255; // G
            pixels[idx + 2] = 255; // B
            pixels[idx + 3] = alpha;
        }
    }

    ctx.putImageData(imageData, 0, 0);

    // We no longer use outCtx.filter = "blur(8px)" or draw multiple times 
    // wrapping around, as it was crashing Mobile WebKit memory.
    // Three.js and Leaflet automatically use LinearFilter which handles the smoothing.

    return canvas.toDataURL();
}

export function useCloudOverlay(dateTs: number, enabled: boolean = true) {
    const dateStr = new Date(dateTs).toISOString().slice(0, 10);

    const { data, isLoading } = trpc.weather.getCloudGrid.useQuery(
        { date: dateStr },
        { enabled, staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false }
    );

    const cloudTextureUrl = useMemo(() => {
        if (!data?.data || data.data.length === 0) return null;
        return renderCloudTexture(data.data);
    }, [data]);

    return { cloudTextureUrl, isLoading };
}
