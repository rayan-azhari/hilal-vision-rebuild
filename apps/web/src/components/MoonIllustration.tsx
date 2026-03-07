"use client";

export function MoonIllustration({ phase, size = 200 }: { phase: number; size?: number }) {
    const r = size / 2 - 4;
    const cx = size / 2;
    const cy = size / 2;

    const isWaxing = phase <= 0.5;
    const k = phase * 2;
    const rx = Math.abs(r * Math.cos(Math.PI * k));
    const baseSweep = isWaxing ? 1 : 0;

    let termSweep;
    if (phase <= 0.25) termSweep = 0;
    else if (phase <= 0.5) termSweep = 1;
    else if (phase <= 0.75) termSweep = 0;
    else termSweep = 1;

    const litPath = `
    M ${cx} ${cy - r}
    A ${r} ${r} 0 0 ${baseSweep} ${cx} ${cy + r}
    A ${rx} ${r} 0 0 ${termSweep} ${cx} ${cy - r}
    Z
  `;

    const craters = [
        { x: cx - r * 0.3, y: cy - r * 0.2, r: r * 0.08 },
        { x: cx + r * 0.15, y: cy + r * 0.3, r: r * 0.06 },
        { x: cx - r * 0.1, y: cy + r * 0.1, r: r * 0.04 },
        { x: cx + r * 0.35, y: cy - r * 0.35, r: r * 0.07 },
        { x: cx - r * 0.4, y: cy + r * 0.4, r: r * 0.05 },
    ];

    return (
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} suppressHydrationWarning>
            <defs>
                <radialGradient id={`moonGlow-${size}`} cx="50%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="color-mix(in oklch, var(--gold) 60%, white)" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="var(--gold)" stopOpacity="0.7" />
                </radialGradient>
                <radialGradient id={`darkSide-${size}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="oklch(0.12 0.02 265)" />
                    <stop offset="100%" stopColor="oklch(0.10 0.018 265)" />
                </radialGradient>
                <clipPath id={`moonClip-${size}`}>
                    <circle cx={cx} cy={cy} r={r} />
                </clipPath>
            </defs>

            <circle cx={cx} cy={cy} r={r + 8} fill="none" stroke="var(--gold)" strokeWidth="1" opacity="0.1" />
            <circle cx={cx} cy={cy} r={r + 16} fill="none" stroke="var(--gold)" strokeWidth="0.5" opacity="0.05" />

            <circle cx={cx} cy={cy} r={r} fill={`url(#darkSide-${size})`} />
            <path d={litPath} fill={`url(#moonGlow-${size})`} clipPath={`url(#moonClip-${size})`} suppressHydrationWarning />

            <g clipPath={`url(#moonClip-${size})`} opacity="0.3">
                {craters.map((c, i) => (
                    <circle key={i} cx={c.x} cy={c.y} r={c.r} fill="none" stroke="color-mix(in oklch, var(--gold) 40%, black)" strokeWidth="1" />
                ))}
            </g>

            <ellipse
                cx={cx}
                cy={cy}
                rx={rx < 1 ? 0.5 : rx}
                ry={r}
                fill="none"
                stroke="var(--gold)"
                strokeWidth="0.5"
                opacity="0.4"
                suppressHydrationWarning
            />
        </svg>
    );
}
