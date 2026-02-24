import { useState, useMemo, useEffect } from "react";
import * as SunCalc from "suncalc";
import { Sun, Moon } from "lucide-react";

interface Props {
    date: Date;
    location: { lat: number; lng: number };
    minutes: number;
    onMinutesChange: (minutes: number) => void;
}

export function SkyDomeChart({ date, location, minutes, onMinutesChange }: Props) {

    // Path generation
    const { sunPath, moonPath } = useMemo(() => {
        const sun = [];
        const moon = [];
        for (let m = 0; m < 24 * 60; m += 10) {
            const t = new Date(date.getFullYear(), date.getMonth(), date.getDate(), Math.floor(m / 60), m % 60);
            const sunP = SunCalc.getPosition(t, location.lat, location.lng);
            const moonP = SunCalc.getMoonPosition(t, location.lat, location.lng);

            sun.push({
                alt: (sunP.altitude * 180) / Math.PI,
                az: (sunP.azimuth * 180) / Math.PI + 180,
            });
            moon.push({
                alt: (moonP.altitude * 180) / Math.PI,
                az: (moonP.azimuth * 180) / Math.PI + 180,
            });
        }
        return { sunPath: sun, moonPath: moon };
    }, [date, location]);

    const currentT = new Date(date.getFullYear(), date.getMonth(), date.getDate(), Math.floor(minutes / 60), minutes % 60);
    const currentSun = SunCalc.getPosition(currentT, location.lat, location.lng);
    const currentMoon = SunCalc.getMoonPosition(currentT, location.lat, location.lng);

    const sunAlt = (currentSun.altitude * 180) / Math.PI;
    const sunAz = (currentSun.azimuth * 180) / Math.PI + 180;
    const moonAlt = (currentMoon.altitude * 180) / Math.PI;
    const moonAz = (currentMoon.azimuth * 180) / Math.PI + 180;

    const SIZE = 400;
    const CX = SIZE / 2;
    const CY = SIZE / 2;
    const R_HORIZON = 160;

    const getCoords = (alt: number, az: number) => {
        const r = (R_HORIZON * (90 - alt)) / 90;
        const theta = (az - 90) * (Math.PI / 180);
        return {
            x: CX + r * Math.cos(theta),
            y: CY + r * Math.sin(theta)
        };
    };

    const sunPathPts = sunPath.map(p => getCoords(p.alt, p.az));
    const moonPathPts = moonPath.map(p => getCoords(p.alt, p.az));

    // To prevent the line from connecting the last point to the first point across the chart when azimuth wraps,
    // we can draw paths smoothly by moving to the first point and line to the rest.
    // However, since we are plotting Altitude and Azimuth mapped to X/Y with cos/sin, there is no wrap discontinuity in 2D space.
    // The points are physically close in Cartesian space, so joining them with Lines is perfectly fine.
    const sunPathD = "M " + sunPathPts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ");
    const moonPathD = "M " + moonPathPts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ");

    const currentSunPos = getCoords(sunAlt, sunAz);
    const currentMoonPos = getCoords(moonAlt, moonAz);

    const formatXAxis = (tickItem: number) => {
        const hrs = Math.floor(tickItem / 60);
        const mins = tickItem % 60;
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col gap-6 w-full h-full items-center">
            <div className="w-full flex items-center justify-between">
                <div className="flex flex-col">
                    <h3 className="text-xl font-medium" style={{ color: "var(--foreground)" }}>
                        The Sky Dome
                    </h3>
                    <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
                        Drag slider to change time
                    </p>
                </div>
                <div className="text-right font-mono text-sm data-text" style={{ color: "var(--foreground)" }}>
                    {formatXAxis(minutes)}
                </div>
            </div>

            <div className="relative w-full h-72 flex items-center justify-center pt-2 mt-2">
                <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-full drop-shadow-xl" style={{ maxHeight: "100%", filter: "drop-shadow(0 0 20px rgba(0,0,0,0.2))" }}>
                    <defs>
                        <clipPath id="horizonClip">
                            <circle cx={CX} cy={CY} r={R_HORIZON} />
                        </clipPath>
                    </defs>

                    {/* Base circle background */}
                    <circle cx={CX} cy={CY} r={R_HORIZON} fill="var(--space-mid)" stroke="var(--border)" strokeWidth="1" />

                    {/* Altitude rings */}
                    {[15, 30, 45, 60, 75].map(alt => (
                        <circle
                            key={`alt-${alt}`}
                            cx={CX} cy={CY}
                            r={R_HORIZON * (90 - alt) / 90}
                            fill="none"
                            stroke="var(--foreground)"
                            strokeWidth="1"
                            strokeDasharray={alt === 0 ? "" : "2 4"}
                            opacity={0.15}
                        />
                    ))}

                    {/* Azimuth radial lines */}
                    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(az => {
                        const theta = (az - 90) * (Math.PI / 180);
                        const x2 = CX + R_HORIZON * Math.cos(theta);
                        const y2 = CY + R_HORIZON * Math.sin(theta);
                        return (
                            <line
                                key={`az-${az}`}
                                x1={CX} y1={CY}
                                x2={x2} y2={y2}
                                stroke="var(--foreground)"
                                strokeWidth="1"
                                opacity={0.15}
                                strokeDasharray="2 4"
                            />
                        );
                    })}

                    {/* Crosshairs (N-S, E-W) */}
                    <line x1={CX} y1={CY - R_HORIZON} x2={CX} y2={CY + R_HORIZON} stroke="var(--foreground)" strokeWidth="1" opacity={0.3} />
                    <line x1={CX - R_HORIZON} y1={CY} x2={CX + R_HORIZON} y2={CY} stroke="var(--foreground)" strokeWidth="1" opacity={0.3} />

                    {/* Labels */}
                    <g fontSize="12" fill="var(--muted-foreground)" textAnchor="middle" dominantBaseline="middle" fontWeight="600" letterSpacing="1">
                        <text x={CX} y={CY - R_HORIZON - 14}>N</text>
                        <text x={CX + R_HORIZON + 14} y={CY}>E</text>
                        <text x={CX} y={CY + R_HORIZON + 14}>S</text>
                        <text x={CX - R_HORIZON - 14} y={CY}>W</text>
                    </g>

                    {/* Dashed paths below horizon */}
                    <path d={sunPathD} fill="none" stroke="#facc15" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.15" />
                    <path d={moonPathD} fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.1" />

                    {/* Track paths clipped to horizon */}
                    <g clipPath="url(#horizonClip)">
                        <path d={sunPathD} fill="none" stroke="#facc15" strokeWidth="2.5" opacity="0.4" />
                        <path d={moonPathD} fill="none" stroke="#60a5fa" strokeWidth="2.5" opacity="0.3" />

                        {/* Sun Current Position (Only visible above horizon) */}
                        <g transform={`translate(${currentSunPos.x}, ${currentSunPos.y})`} opacity={sunAlt >= 0 ? 1 : 0}>
                            <circle cx="0" cy="0" r="12" fill="var(--background)" stroke="#facc15" strokeWidth="1" />
                            <Sun className="w-5 h-5" color="#facc15" x="-10" y="-10" />
                        </g>

                        {/* Moon Current Position (Only visible above horizon) */}
                        <g transform={`translate(${currentMoonPos.x}, ${currentMoonPos.y})`} opacity={moonAlt >= 0 ? 1 : 0}>
                            <circle cx="0" cy="0" r="12" fill="var(--background)" stroke="#60a5fa" strokeWidth="1" />
                            <Moon className="w-5 h-5" color="#60a5fa" x="-10" y="-10" />
                        </g>
                    </g>

                    {/* Position indicators that are visible below the horizon (faded and smaller) */}
                    <g transform={`translate(${currentSunPos.x}, ${currentSunPos.y})`} opacity={sunAlt < 0 ? 0.4 : 0}>
                        <circle cx="0" cy="0" r="8" fill="var(--background)" stroke="#facc15" strokeWidth="1" />
                        <Sun className="w-3 h-3" color="#facc15" x="-6" y="-6" />
                    </g>

                    <g transform={`translate(${currentMoonPos.x}, ${currentMoonPos.y})`} opacity={moonAlt < 0 ? 0.4 : 0}>
                        <circle cx="0" cy="0" r="8" fill="var(--background)" stroke="#60a5fa" strokeWidth="1" />
                        <Moon className="w-3 h-3" color="#60a5fa" x="-6" y="-6" />
                    </g>
                </svg>
            </div>

            {/* Slider */}
            <div className="w-full px-2 mt-2">
                <input
                    type="range"
                    min="0"
                    max="1439"
                    value={minutes}
                    onChange={(e) => onMinutesChange(Number(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{ background: "var(--space-light)" }}
                />
                <div className="flex justify-between text-xs mt-2" style={{ color: "var(--muted-foreground)" }}>
                    <span>00:00</span>
                    <span>06:00</span>
                    <span>12:00</span>
                    <span>18:00</span>
                    <span>24:00</span>
                </div>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4 w-full">
                <div className="border rounded-xl p-4 flex flex-col items-center justify-center" style={{ borderColor: "color-mix(in oklch, #facc15 20%, var(--border))", background: "color-mix(in oklch, #facc15 2%, transparent)" }}>
                    <span className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Sun Alt</span>
                    <span className="text-xl font-mono font-semibold" style={{ color: "#facc15" }}>{sunAlt.toFixed(1)}°</span>
                </div>
                <div className="border rounded-xl p-4 flex flex-col items-center justify-center" style={{ borderColor: "color-mix(in oklch, #facc15 20%, var(--border))", background: "color-mix(in oklch, #facc15 2%, transparent)" }}>
                    <span className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Sun Az</span>
                    <span className="text-xl font-mono font-semibold" style={{ color: "#facc15" }}>{sunAz.toFixed(1)}°</span>
                </div>
                <div className="border rounded-xl p-4 flex flex-col items-center justify-center" style={{ borderColor: "color-mix(in oklch, #60a5fa 20%, var(--border))", background: "color-mix(in oklch, #60a5fa 2%, transparent)" }}>
                    <span className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Moon Alt</span>
                    <span className="text-xl font-mono font-semibold" style={{ color: "#60a5fa" }}>{moonAlt.toFixed(1)}°</span>
                </div>
                <div className="border rounded-xl p-4 flex flex-col items-center justify-center" style={{ borderColor: "color-mix(in oklch, #60a5fa 20%, var(--border))", background: "color-mix(in oklch, #60a5fa 2%, transparent)" }}>
                    <span className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Moon Az</span>
                    <span className="text-xl font-mono font-semibold" style={{ color: "#60a5fa" }}>{moonAz.toFixed(1)}°</span>
                </div>
            </div>
        </div>
    );
}
