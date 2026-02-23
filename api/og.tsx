import { ImageResponse } from "@vercel/og";

export const config = {
    runtime: "edge",
};

export default async function handler(req: Request) {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city") || "Global";
    const zone = searchParams.get("zone") || "—";
    const date = searchParams.get("date") || new Date().toISOString().slice(0, 10);

    const zoneColors: Record<string, string> = {
        A: "#4ade80",
        B: "#facc15",
        C: "#fb923c",
        D: "#f87171",
        E: "#6b7280",
        F: "#1f2937",
    };
    const zoneLabels: Record<string, string> = {
        A: "Easily Visible",
        B: "Visible",
        C: "Optical Aid",
        D: "Telescope Only",
        E: "Not Visible",
        F: "Below Horizon",
    };

    const color = zoneColors[zone] || "#c8a030";
    const label = zoneLabels[zone] || "";

    return new ImageResponse(
        (
            <div
                style={{
                    width: "1200px",
                    height: "630px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    background: "linear-gradient(135deg, #0a0e1a 0%, #12182a 50%, #0a0e1a 100%)",
                    padding: "80px",
                    fontFamily: "sans-serif",
                }}
            >
                {/* Decorative crescent */}
                <div
                    style={{
                        position: "absolute",
                        right: "100px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "200px",
                        height: "200px",
                        borderRadius: "50%",
                        background: `radial-gradient(circle at 35% 40%, #c8a030 0%, transparent 60%)`,
                        opacity: 0.6,
                    }}
                />

                {/* Title */}
                <div style={{ fontSize: "20px", color: "#8a7a5a", letterSpacing: "2px", marginBottom: "16px" }}>
                    HILAL VISION
                </div>

                {/* City */}
                <div style={{ fontSize: "56px", color: "#e8d5a0", fontWeight: 300, marginBottom: "8px" }}>
                    {city}
                </div>

                {/* Date */}
                <div style={{ fontSize: "22px", color: "#8a7a5a", marginBottom: "32px" }}>
                    {date}
                </div>

                {/* Zone badge */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        padding: "16px 32px",
                        borderRadius: "16px",
                        background: `rgba(${zone === "A" ? "74,222,128" : zone === "B" ? "250,204,21" : "200,160,48"}, 0.1)`,
                        border: `2px solid ${color}`,
                    }}
                >
                    <div
                        style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "50%",
                            background: color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "24px",
                            fontWeight: 700,
                            color: "#0a0e1a",
                        }}
                    >
                        {zone}
                    </div>
                    <div>
                        <div style={{ fontSize: "24px", fontWeight: 600, color }}>
                            Zone {zone}
                        </div>
                        <div style={{ fontSize: "16px", color: "#8a7a5a" }}>
                            {label}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div
                    style={{
                        position: "absolute",
                        bottom: "40px",
                        left: "80px",
                        fontSize: "14px",
                        color: "#5a5040",
                    }}
                >
                    moon-dashboard-one.vercel.app · Islamic Moon Visibility & Sighting
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    );
}
