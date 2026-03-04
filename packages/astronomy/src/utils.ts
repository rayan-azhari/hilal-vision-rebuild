export const toRad = (d: number) => (d * Math.PI) / 180;

export const toDeg = (r: number) => (r * 180) / Math.PI;

export function formatDegrees(deg: number): string {
    const d = Math.abs(deg);
    const dir = deg >= 0 ? "N" : "S";
    return `${d.toFixed(2)}° ${dir}`;
}

export function formatAzimuth(az: number): string {
    const normalized = ((az % 360) + 360) % 360;
    const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    const idx = Math.round(normalized / 22.5) % 16;
    return `${normalized.toFixed(1)}° ${dirs[idx]}`;
}

export function formatTime(date: Date | null): string {
    if (!date) return "—";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
