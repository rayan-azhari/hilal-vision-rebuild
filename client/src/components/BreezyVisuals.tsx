const ZONE_COLOURS = {
    A: "var(--zone-a)",
    B: "var(--zone-b)",
    C: "var(--zone-c)",
    D: "var(--zone-d)",
    E: "var(--zone-e)",
    F: "var(--space-lighter)", // Not visible
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
                    <stop offset="0%" stopColor="var(--gold-dim)" stopOpacity="0.2" />
                    <stop offset="50%" stopColor="var(--gold)" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="var(--gold-dim)" stopOpacity="0.2" />
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
            <line x1="10" y1="80" x2="150" y2="80" stroke="var(--border)" strokeWidth="1" />

            {/* Moon Dot (Only show if actually up, or show at horizon edge if not) */}
            <circle
                cx={moonX} cy={moonY} r="4"
                fill={altitude > 0 ? "var(--gold-glow)" : "var(--space-lighter)"}
                style={{
                    boxShadow: altitude > 0 ? "0 0 12px var(--gold)" : "none",
                }}
            />
            <circle cx={moonX} cy={moonY} r="1.5" fill="var(--space)" />
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
                        className="w-3 h-3 rounded-full transition-all duration-300"
                        style={{
                            backgroundColor: isActive ? ZONE_COLOURS[z] : "var(--space-lighter)",
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
                    stroke="var(--space-lighter)"
                    strokeWidth="6"
                />
                <circle
                    cx={cx} cy={cy} r={r}
                    fill="none"
                    stroke="var(--gold)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={c}
                    strokeDashoffset={c - activeLength}
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            {/* Center percentage label could go here, but doing it in the card is fine */}
        </div>
    );
}
