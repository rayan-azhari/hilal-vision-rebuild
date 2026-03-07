"use client";

const ZONE_COLOURS = {
    A: "#4ade80", // Green
    B: "#60a5fa", // Blue
    C: "#c084fc", // Purple
    D: "#f87171", // Red
    E: "#9ca3af", // Grey
    F: "transparent", // Not visible
};

export function MoonArcVisual({
    riseTime, setTime, currentTime, altitude,
}: {
    riseTime: Date | null; setTime: Date | null; currentTime: Date; altitude: number;
}) {
    const progress = riseTime && setTime
        ? Math.max(0, Math.min(1,
            (currentTime.getTime() - riseTime.getTime()) /
            (setTime.getTime() - riseTime.getTime())
        ))
        : (altitude > 0 ? 0.5 : -0.1); // Fallback logic

    const cx = 80, cy = 80, r = 60;
    const startAngle = Math.PI;
    const endAngle = 0;
    // If progress < 0 it hasn't risen yet.
    const angle = progress >= 0 ? startAngle + progress * (endAngle - startAngle) : startAngle;
    // Make sure it doesn't dip below visually when active
    const clampedAngle = Math.max(0, Math.min(Math.PI, angle));

    const moonX = cx + r * Math.cos(clampedAngle);
    const moonY = cy - r * Math.sin(clampedAngle);

    return (
        <svg viewBox="0 0 160 100" className="w-full max-w-[160px] overflow-visible">
            <defs>
                <linearGradient id="moonArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#C1A87D" stopOpacity="0.2" />
                    <stop offset="50%" stopColor="#C1A87D" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#C1A87D" stopOpacity="0.2" />
                </linearGradient>
            </defs>

            {/* Background Arc */}
            <path
                d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                fill="none"
                stroke="oklch(0.62 0.11 75 / 0.35)"
                strokeWidth="2"
                strokeDasharray="4 4"
            />
            {/* Active Arc up to current position */}
            {progress >= 0 && progress <= 1 && (
                <path
                    d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${moonX} ${moonY}`}
                    fill="none"
                    stroke="url(#moonArcGrad)"
                    strokeWidth="2.5"
                />
            )}

            {/* Horizon Line */}
            <line x1="10" y1="80" x2="150" y2="80" stroke="#333" strokeWidth="1" />

            {/* Moon Dot (Only show if actually up, or show at horizon edge if not) */}
            <circle
                cx={moonX} cy={moonY} r="4"
                fill={altitude > 0 ? "#E5D3B3" : "transparent"}
                style={{
                    boxShadow: altitude > 0 ? "0 0 12px #C1A87D" : "none",
                }}
            />
            <circle cx={moonX} cy={moonY} r="1.5" fill="#111" />
        </svg>
    );
}

export function VisibilityDotScale({ zone }: { zone: keyof typeof ZONE_COLOURS | "None" }) {
    const zones: (keyof typeof ZONE_COLOURS)[] = ["A", "B", "C", "D", "E", "F"];
    return (
        <div className="flex items-center gap-1.5 justify-center mt-2">
            {zones.map((z) => {
                const isActive = zone === z || (zone === "None" && z === "F");
                return (
                    <div
                        key={z}
                        className="w-3 h-3 rounded-full transition-all duration-300 border border-white/5"
                        style={{
                            backgroundColor: isActive ? ZONE_COLOURS[z] : "rgba(255,255,255,0.05)",
                            boxShadow: isActive ? `0 0 8px ${ZONE_COLOURS[z]}` : "none",
                            transform: isActive ? "scale(1.2)" : "scale(1)",
                            opacity: isActive ? 1 : 0.4,
                        }}
                        title={isActive ? `Zone ${z}` : undefined}
                    />
                );
            })}
        </div>
    );
}


export function IlluminationArc({ illumination }: { illumination: number }) {
    const cx = 50, cy = 50, r = 40;
    // Circumference
    const c = 2 * Math.PI * r;
    const activeLength = (illumination / 100) * c;

    return (
        <div className="relative w-16 h-16 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                <circle
                    cx={cx} cy={cy} r={r}
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="6"
                />
                <circle
                    cx={cx} cy={cy} r={r}
                    fill="none"
                    stroke="#C1A87D"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={c}
                    strokeDashoffset={c - activeLength}
                    className="transition-all duration-1000 ease-out"
                    suppressHydrationWarning
                />
            </svg>
        </div>
    );
}

export function LunarAgeProgress({ age }: { age: number }) {
    const cycle = 29.53059;
    const progress = Math.min(100, Math.max(0, (age / cycle) * 100));

    return (
        <div className="h-1 w-full max-w-[80px] bg-white/5 rounded-full overflow-hidden self-center">
            <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                    width: `${progress}%`,
                    background: "linear-gradient(90deg, #A88D5D, #E5D3B3)"
                }}
                suppressHydrationWarning
            />
        </div>
    );
}

export function AzimuthCompass({ azimuth }: { azimuth: number }) {
    return (
        <div className="relative w-12 h-12 flex items-center justify-center rounded-full border border-white/10">
            {/* Compass ticks */}
            {[0, 90, 180, 270].map((deg) => (
                <div
                    key={deg}
                    className="absolute w-0.5 h-1.5 bg-white/10"
                    style={{
                        transform: `rotate(${deg}deg) translateY(-20px)`
                    }}
                />
            ))}
            {/* The needle pointing to the azimuth angle. */}
            <div
                className="absolute w-0.5 h-5 bg-[#4ade80] origin-bottom transition-transform duration-1000 ease-out"
                style={{
                    transform: `rotate(${azimuth}deg) translateY(-10px)`,
                    boxShadow: "0 0 6px #4ade80"
                }}
            />
            {/* Center dot */}
            <div className="absolute w-1.5 h-1.5 bg-[#4ade80] rounded-full z-10" />
        </div>
    );
}

export function ElongationVisual({ elongation }: { elongation: number }) {
    // Elongation is 0-180 degrees.
    // Let's sweep an arc.
    const cx = 50, cy = 50, r = 40;
    const c = Math.PI * r; // half circle representation
    const activeLength = (elongation / 180) * c;

    return (
        <div className="relative w-16 h-12 flex items-center justify-center -mb-4">
            <svg viewBox="0 0 100 60" className="w-full h-full">
                <path
                    d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="6"
                    strokeLinecap="round"
                />
                <path
                    d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                    fill="none"
                    stroke="#c084fc"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={c}
                    strokeDashoffset={c - activeLength}
                    className="transition-all duration-1000 ease-out"
                />
                {/* Sun & Moon Icons at ends */}
                <circle cx={cx - r} cy={cy} r="4" fill="#fb923c" />
                <circle cx={cx + r} cy={cy} r="3" fill="#818cf8" />
            </svg>
        </div>
    );
}

export function CountdownCircle({ daysLeft, totalDays = 29.53 }: { daysLeft: number, totalDays?: number }) {
    const cx = 50, cy = 50, r = 40;
    const c = 2 * Math.PI * r;
    const progress = Math.min(1, Math.max(0, 1 - (daysLeft / totalDays)));
    const activeLength = progress * c;

    return (
        <div className="relative w-16 h-16 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                <circle
                    cx={cx} cy={cy} r={r}
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="4"
                    strokeDasharray="4 4"
                />
                <circle
                    cx={cx} cy={cy} r={r}
                    fill="none"
                    stroke="#C1A87D"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={c}
                    strokeDashoffset={c - activeLength}
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col leading-none">
                <span className="text-xs font-bold text-[#C1A87D]">{daysLeft}d</span>
            </div>
        </div>
    );
}
