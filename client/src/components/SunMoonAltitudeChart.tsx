import { useState, useMemo, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceDot } from "recharts";
import * as Astronomy from "astronomy-engine";
import { formatAzimuth } from "@/lib/astronomy";
import { Sun, Moon } from "lucide-react";

interface Props {
    date: Date;
    location: { lat: number; lng: number };
    minutes: number;
    onMinutesChange: (minutes: number) => void;
}

export function SunMoonAltitudeChart({ date, location, minutes, onMinutesChange }: Props) {

    const data = useMemo(() => {
        const points = [];
        const obs = new Astronomy.Observer(location.lat, location.lng, 0);
        // Generate data for every 15 minutes
        for (let m = 0; m < 24 * 60; m += 15) {
            const t = new Date(date.getFullYear(), date.getMonth(), date.getDate(), Math.floor(m / 60), m % 60);
            const eqSun = Astronomy.Equator(Astronomy.Body.Sun, t, obs, true, true);
            const eqMoon = Astronomy.Equator(Astronomy.Body.Moon, t, obs, true, true);
            const hcSun = Astronomy.Horizon(t, obs, eqSun.ra, eqSun.dec, "normal");
            const hcMoon = Astronomy.Horizon(t, obs, eqMoon.ra, eqMoon.dec, "normal");

            points.push({
                time: m,
                timeStr: `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`,
                sunAlt: hcSun.altitude,
                sunAz: hcSun.azimuth,
                moonAlt: hcMoon.altitude,
                moonAz: hcMoon.azimuth,
            });
        }
        return points;
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

    const formatXAxis = (tickItem: number) => {
        const hrs = Math.floor(tickItem / 60);
        const mins = tickItem % 60;
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col gap-6 w-full h-full">
            <div className="w-full flex items-center justify-between">
                <div className="flex flex-col">

                    <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
                        Drag slider to change time
                    </p>
                </div>
                <div className="text-right font-mono text-sm data-text" style={{ color: "var(--foreground)" }}>
                    {formatXAxis(minutes)}
                </div>
            </div>

            {/* Chart */}
            <div className="relative h-72 w-full mt-2" style={{ background: "var(--space-mid)", borderRadius: "12px", padding: "16px 16px 0 0" }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="time" type="number" domain={[0, 1440]} ticks={[0, 360, 720, 1080, 1440]} tickFormatter={formatXAxis} stroke="var(--muted-foreground)" fontSize={11} tickMargin={10} />
                        <YAxis domain={[-90, 90]} ticks={[-90, -60, -30, 0, 30, 60, 90]} stroke="var(--muted-foreground)" fontSize={11} tickMargin={10} />
                        <Tooltip
                            contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }}
                            labelFormatter={(val) => formatXAxis(val as number)}
                            formatter={(value, name) => [`${(value as number).toFixed(1)}°`, name === "sunAlt" ? "Sun Altitude" : "Moon Altitude"]}
                        />
                        {/* Horizon Line at 0 */}
                        <ReferenceLine y={0} stroke="var(--muted-foreground)" strokeDasharray="3 3" opacity={0.5} />
                        {/* Current Time Line */}
                        <ReferenceLine x={minutes} stroke="var(--foreground)" strokeDasharray="3 3" opacity={0.4} />

                        <Area type="monotone" dataKey="sunAlt" stroke="#facc15" fill="#facc15" fillOpacity={0.15} strokeWidth={2} isAnimationActive={false} />
                        <Area type="monotone" dataKey="moonAlt" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.1} strokeWidth={2} isAnimationActive={false} />

                        {/* Sun Current Position */}
                        <ReferenceDot x={minutes} y={sunAlt} r={0} stroke="none" shape={(props: any) => (
                            <g transform={`translate(${props.cx - 10}, ${props.cy - 10})`}>
                                <circle cx="10" cy="10" r="14" fill="var(--background)" stroke="#facc15" strokeWidth="1" opacity={0.8} />
                                <Sun className="w-5 h-5" color="#facc15" />
                            </g>
                        )} />

                        {/* Moon Current Position */}
                        <ReferenceDot x={minutes} y={moonAlt} r={0} stroke="none" shape={(props: any) => (
                            <g transform={`translate(${props.cx - 10}, ${props.cy - 10})`}>
                                <circle cx="10" cy="10" r="14" fill="var(--background)" stroke="#60a5fa" strokeWidth="1" opacity={0.8} />
                                <Moon className="w-5 h-5" color="#60a5fa" />
                            </g>
                        )} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Slider */}
            <div className="px-4 mt-2">
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
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
