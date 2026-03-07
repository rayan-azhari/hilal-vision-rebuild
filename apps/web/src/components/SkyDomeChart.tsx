"use client";

import { useMemo } from "react";
import * as Astronomy from "astronomy-engine";
import { Sun, Moon } from "lucide-react";

interface Props {
    date: Date;
    location: { lat: number; lng: number };
    minutes: number;
    onMinutesChange: (minutes: number) => void;
}

export function SkyDomeChart({ date, location, minutes, onMinutesChange }: Props) {
    const { sunPath, moonPath } = useMemo(() => {
        const sun = [];
        const moon = [];
        const obs = new Astronomy.Observer(location.lat, location.lng, 0);
        for (let m = 0; m < 24 * 60; m += 10) {
            const t = new Date(date.getFullYear(), date.getMonth(), date.getDate(), Math.floor(m / 60), m % 60);
            const eqSun = Astronomy.Equator(Astronomy.Body.Sun, t, obs, true, true);
            const eqMoon = Astronomy.Equator(Astronomy.Body.Moon, t, obs, true, true);
            const hcSun = Astronomy.Horizon(t, obs, eqSun.ra, eqSun.dec, "normal");
            const hcMoon = Astronomy.Horizon(t, obs, eqMoon.ra, eqMoon.dec, "normal");

            sun.push({ alt: hcSun.altitude, az: hcSun.azimuth });
            moon.push({ alt: hcMoon.altitude, az: hcMoon.azimuth });
        }
        return { sunPath: sun, moonPath: moon };
    }, [date, location]);

    const currentT = new Date(date.getFullYear(), date.getMonth(), date.getDate(), Math.floor(minutes / 60), minutes % 60);
    const obsCurrent = new Astronomy.Observer(location.lat, location.lng, 0);
    const eqSunCurr = Astronomy.Equator(Astronomy.Body.Sun, currentT, obsCurrent, true, true);
    const eqMoonCurr = Astronomy.Equator(Astronomy.Body.Moon, currentT, obsCurrent, true, true);
    const hcSunCurr = Astronomy.Horizon(currentT, obsCurrent, eqSunCurr.ra, eqSunCurr.dec, "normal");
    const hcMoonCurr = Astronomy.Horizon(currentT, obsCurrent, eqMoonCurr.ra, eqMoonCurr.dec, "normal");

    const sunAlt = hcSunCurr.altitude;
    const sunAz = hcSunCurr.azimuth;
    const moonAlt = hcMoonCurr.altitude;
    const moonAz = hcMoonCurr.azimuth;

    const SIZE = 400;
    const CX = SIZE / 2;
    const CY = SIZE / 2;
    const R_HORIZON = 180;

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
                    <p className="text-sm mt-1 text-muted-foreground">
                        Drag the slider to visualize sky position
                    </p>
                </div>
                <div className="text-right font-mono text-sm text-foreground">
                    {formatXAxis(minutes)}
                </div>
            </div>

            <div className="relative w-full h-72 flex items-center justify-center pt-2 mt-2">
                <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-full drop-shadow-xl" style={{ maxHeight: "100%", filter: "drop-shadow(0 0 20px rgba(0,0,0,0.2))" }} suppressHydrationWarning>
                    <defs>
                        <clipPath id="horizonClip">
                            <circle cx={CX} cy={CY} r={R_HORIZON} />
                        </clipPath>
                        <radialGradient id="skyDomeGradient" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="oklch(0.25 0.07 245)" />
                            <stop offset="100%" stopColor="oklch(0.12 0.04 245)" />
                        </radialGradient>
                    </defs>

                    <circle cx={CX} cy={CY} r={R_HORIZON} fill="url(#skyDomeGradient)" stroke="color-mix(in oklch, var(--border) 40%, transparent)" strokeWidth="1" />

                    {[15, 30, 45, 60, 75].map(alt => (
                        <circle
                            key={`alt-${alt}`}
                            cx={CX} cy={CY}
                            r={R_HORIZON * (90 - alt) / 90}
                            fill="none"
                            stroke="currentColor"
                            className="text-foreground"
                            strokeWidth="1"
                            strokeDasharray={alt === 0 ? "" : "2 4"}
                            opacity={0.15}
                        />
                    ))}

                    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(az => {
                        const theta = (az - 90) * (Math.PI / 180);
                        const x2 = CX + R_HORIZON * Math.cos(theta);
                        const y2 = CY + R_HORIZON * Math.sin(theta);
                        return (
                            <line
                                key={`az-${az}`}
                                x1={CX} y1={CY}
                                x2={x2} y2={y2}
                                stroke="currentColor"
                                className="text-foreground"
                                strokeWidth="1"
                                opacity={0.15}
                                strokeDasharray="2 4"
                                suppressHydrationWarning
                            />
                        );
                    })}

                    <line x1={CX} y1={CY - R_HORIZON} x2={CX} y2={CY + R_HORIZON} stroke="currentColor" className="text-foreground" strokeWidth="1" opacity={0.3} />
                    <line x1={CX - R_HORIZON} y1={CY} x2={CX + R_HORIZON} y2={CY} stroke="currentColor" className="text-foreground" strokeWidth="1" opacity={0.3} />

                    <g fontSize="12" fill="currentColor" className="text-muted-foreground" textAnchor="middle" dominantBaseline="middle" fontWeight="600" letterSpacing="1">
                        <text x={CX} y={CY - R_HORIZON - 14}>N</text>
                        <text x={CX + R_HORIZON + 14} y={CY}>E</text>
                        <text x={CX} y={CY + R_HORIZON + 14}>S</text>
                        <text x={CX - R_HORIZON - 14} y={CY}>W</text>
                    </g>

                    <path d={sunPathD} fill="none" stroke="#facc15" strokeWidth="2" strokeDasharray="4 4" opacity="0.15" suppressHydrationWarning />
                    <path d={moonPathD} fill="none" stroke="#60a5fa" strokeWidth="2" strokeDasharray="4 4" opacity="0.1" suppressHydrationWarning />

                    <g clipPath="url(#horizonClip)">
                        <path d={sunPathD} fill="none" stroke="#facc15" strokeWidth="2" opacity="0.6" suppressHydrationWarning />
                        <path d={moonPathD} fill="none" stroke="#60a5fa" strokeWidth="2" opacity="0.5" suppressHydrationWarning />

                        <g transform={`translate(${currentSunPos.x}, ${currentSunPos.y})`} opacity={sunAlt >= 0 ? 1 : 0} suppressHydrationWarning>
                            <circle cx="0" cy="0" r="14" fill="transparent" stroke="#facc15" strokeWidth="1" opacity={0.8} />
                            <Sun className="w-5 h-5" color="#facc15" x="-10" y="-10" />
                        </g>

                        <g transform={`translate(${currentMoonPos.x}, ${currentMoonPos.y})`} opacity={moonAlt >= 0 ? 1 : 0} suppressHydrationWarning>
                            <circle cx="0" cy="0" r="14" fill="transparent" stroke="#60a5fa" strokeWidth="1" opacity={0.8} />
                            <Moon className="w-5 h-5" color="#60a5fa" x="-10" y="-10" />
                        </g>
                    </g>

                    <g transform={`translate(${currentSunPos.x}, ${currentSunPos.y})`} opacity={sunAlt < 0 ? 0.4 : 0} suppressHydrationWarning>
                        <circle cx="0" cy="0" r="8" fill="transparent" stroke="#facc15" strokeWidth="1" />
                        <Sun className="w-3 h-3" color="#facc15" x="-6" y="-6" />
                    </g>

                    <g transform={`translate(${currentMoonPos.x}, ${currentMoonPos.y})`} opacity={moonAlt < 0 ? 0.4 : 0} suppressHydrationWarning>
                        <circle cx="0" cy="0" r="8" fill="transparent" stroke="#60a5fa" strokeWidth="1" />
                        <Moon className="w-3 h-3" color="#60a5fa" x="-6" y="-6" />
                    </g>
                </svg>
            </div>

            <div className="w-full px-2 mt-2">
                <input
                    type="range"
                    min="0"
                    max="1439"
                    value={minutes}
                    onChange={(e) => onMinutesChange(Number(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-foreground/10"
                />
                <div className="flex justify-between text-xs mt-2 text-muted-foreground">
                    <span>00:00</span>
                    <span>06:00</span>
                    <span>12:00</span>
                    <span>18:00</span>
                    <span>24:00</span>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4 w-full">
                <div className="border rounded-xl p-4 flex flex-col items-center justify-center border-[#facc15]/20 bg-[#facc15]/5">
                    <span className="text-xs mb-1 text-[#facc15]/70">Sun Alt</span>
                    <span className="text-xl font-mono font-semibold text-[#facc15]">{sunAlt.toFixed(1)}°</span>
                </div>
                <div className="border rounded-xl p-4 flex flex-col items-center justify-center border-[#facc15]/20 bg-[#facc15]/5">
                    <span className="text-xs mb-1 text-[#facc15]/70">Sun Azimuth</span>
                    <span className="text-xl font-mono font-semibold text-[#facc15]">{sunAz.toFixed(1)}°</span>
                </div>
                <div className="border rounded-xl p-4 flex flex-col items-center justify-center border-[#60a5fa]/20 bg-[#60a5fa]/5">
                    <span className="text-xs mb-1 text-[#60a5fa]/70">Moon Alt</span>
                    <span className="text-xl font-mono font-semibold text-[#60a5fa]">{moonAlt.toFixed(1)}°</span>
                </div>
                <div className="border rounded-xl p-4 flex flex-col items-center justify-center border-[#60a5fa]/20 bg-[#60a5fa]/5">
                    <span className="text-xs mb-1 text-[#60a5fa]/70">Moon Azimuth</span>
                    <span className="text-xl font-mono font-semibold text-[#60a5fa]">{moonAz.toFixed(1)}°</span>
                </div>
            </div>
        </div>
    );
}
