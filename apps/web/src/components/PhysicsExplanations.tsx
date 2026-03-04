"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { BreezyFullCard } from "./BreezyFullCard";
import { Info, BookOpen, Calculator, Sparkles } from "lucide-react";

function generateYallopData() {
    const data = [];
    for (let W = 0; W <= 2.5; W += 0.1) {
        const fW = 11.8371 - 6.3226 * W + 0.7319 * W * W - 0.1018 * W * W * W;
        data.push({
            w: W.toFixed(1),
            "Threshold (q=0)": parseFloat(fW.toFixed(2)),
            "Zone A (q≥0.216)": parseFloat((fW + 2.16).toFixed(2)),
            "Zone C (q≥−0.16)": parseFloat((fW - 1.6).toFixed(2)),
        });
    }
    return data;
}

function generateOdehData() {
    const data = [];
    for (let W = 0; W <= 2.5; W += 0.1) {
        const fW = 7.1651 - 6.3226 * W + 0.7319 * W * W - 0.1018 * W * W * W;
        data.push({
            w: W.toFixed(1),
            "Easily Visible (V≥5.65)": parseFloat((fW + 5.65).toFixed(2)),
            "Visible (V≥2.0)": parseFloat((fW + 2.0).toFixed(2)),
            "Threshold (V=0)": parseFloat(fW.toFixed(2)),
            "Optical Aid (V≥−0.96)": parseFloat((fW - 0.96).toFixed(2)),
        });
    }
    return data;
}

const yallopData = generateYallopData();
const odehData = generateOdehData();

export function PhysicsExplanations() {
    return (
        <div className="space-y-6 mt-8">
            <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h2 className="text-xl font-semibold font-display text-foreground">
                    Physical Models
                </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BreezyFullCard title={"Yallop Criterion"} icon={<BookOpen />}>
                    <div className="p-4 space-y-4 text-sm text-muted-foreground">
                        <p>
                            The Hilal Dashboard employs the rigorous <strong>Yallop (1997) criterion</strong> to predict lunar crescent visibility.
                            Dr. B.D. Yallop of the HM Nautical Almanac Office developed this statistical model based on 295 historical observations.
                        </p>
                        <div className="p-4 rounded-xl font-mono text-xs bg-foreground/5 text-[#C1A87D]">
                            q = [ ARCV - (11.8371 - 6.3226W + 0.7319W² - 0.1018W³) ] / 10
                        </div>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>q (Visibility Test Value):</strong> Determines crescent viability.</li>
                            <li><strong>ARCV (Arc of Vision):</strong> Altitude difference between the center of the Moon and Sun.</li>
                            <li><strong>W (Crescent Width):</strong> Topocentric width of the crescent in arcminutes.</li>
                        </ul>
                        <p>
                            The <em>q-value</em> elegantly predicts visibility across specific zones ranging from naked-eye certain (Zone A) to wholly invisible (Zone F).
                        </p>
                    </div>
                </BreezyFullCard>

                <BreezyFullCard title={"Yallop Curve (q vs ARCV & W)"} icon={<Calculator />}>
                    <div className="p-4 h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={yallopData} margin={{ top: 5, right: 20, bottom: 30, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="color-mix(in oklch, var(--border) 40%, transparent)" />
                                <XAxis dataKey="w" stroke="currentColor" className="text-muted-foreground" fontSize={12} label={{ value: "Crescent Width (W)", position: 'insideBottom', fill: 'currentColor', offset: -15 }} />
                                <YAxis stroke="currentColor" className="text-muted-foreground" fontSize={12} label={{ value: "Arc of Vision (ARCV)", angle: -90, position: 'insideLeft', fill: 'currentColor' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'oklch(0.15 0.02 265)', borderColor: '#C1A87D', borderRadius: '8px' }}
                                    itemStyle={{ fontSize: '12px' }}
                                />
                                <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }} />
                                <Line name="Zone A (q≥0.216)" type="monotone" dataKey="Zone A (q≥0.216)" stroke="#4ade80" strokeWidth={2} dot={false} />
                                <Line name="Threshold (q=0)" type="monotone" dataKey="Threshold (q=0)" stroke="#C1A87D" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                <Line name="Zone C (q≥−0.16)" type="monotone" dataKey="Zone C (q≥−0.16)" stroke="#fb923c" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </BreezyFullCard>

                <BreezyFullCard title={"Odeh Criterion"} icon={<BookOpen />}>
                    <div className="p-4 space-y-4 text-sm text-muted-foreground">
                        <p>
                            The <strong>Odeh (2004) criterion</strong> was developed by Mohammad Sh. Odeh of the Islamic Crescents&apos; Observation Project (ICOP),
                            refining Yallop&apos;s model with 737 observations including modern CCD and telescopic sightings.
                        </p>
                        <div className="p-4 rounded-xl font-mono text-xs bg-foreground/5 text-[#C1A87D]">
                            V = ARCV - (7.1651 - 6.3226W + 0.7319W² - 0.1018W³)
                        </div>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>V (Visibility Value):</strong> Predicts sighting odds without optical aids versus naked-eye.</li>
                            <li><strong>Easily Visible:</strong> V ≥ 5.65. Crescent should be easy to locate.</li>
                            <li><strong>Requires Aid:</strong> Visible only by optical aids when V drops into negative values before reaching Danjon limit.</li>
                        </ul>
                    </div>
                </BreezyFullCard>

                <BreezyFullCard title={"Odeh Curve"} icon={<Calculator />}>
                    <div className="p-4 h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={odehData} margin={{ top: 5, right: 20, bottom: 30, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="color-mix(in oklch, var(--border) 40%, transparent)" />
                                <XAxis dataKey="w" stroke="currentColor" className="text-muted-foreground" fontSize={12} label={{ value: "Crescent Width (W)", position: 'insideBottom', fill: 'currentColor', offset: -15 }} />
                                <YAxis stroke="currentColor" className="text-muted-foreground" fontSize={12} label={{ value: "Arc of Vision (ARCV)", angle: -90, position: 'insideLeft', fill: 'currentColor' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'oklch(0.15 0.02 265)', borderColor: '#C1A87D', borderRadius: '8px' }}
                                    itemStyle={{ fontSize: '12px' }}
                                />
                                <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }} />
                                <Line name="Easily Visible (V≥5.65)" type="monotone" dataKey="Easily Visible (V≥5.65)" stroke="#4ade80" strokeWidth={2} dot={false} />
                                <Line name="Visible (V≥2.0)" type="monotone" dataKey="Visible (V≥2.0)" stroke="#facc15" strokeWidth={2} dot={false} />
                                <Line name="Threshold (V=0)" type="monotone" dataKey="Threshold (V=0)" stroke="#C1A87D" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                <Line name="Optical Aid (V≥−0.96)" type="monotone" dataKey="Optical Aid (V≥−0.96)" stroke="#fb923c" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </BreezyFullCard>

                <BreezyFullCard title={"Danjon Limit"} icon={<Info />}>
                    <div className="p-4 space-y-4 text-sm text-muted-foreground">
                        <p>
                            In 1932, French astronomer André Danjon discovered that sighting a crescent is physically impossible if the lunar elongation (angular distance between the sun and moon) is less than <strong>7 degrees</strong>.
                        </p>
                        <p>
                            Due to the roughness of the lunar surface and shadowing from lunar mountains, the crescent simply does not extend enough to be visible when the moon is too close to the sun.
                        </p>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <div className="p-3 rounded-lg border text-center border-[#C1A87D]/20">
                                <div className="text-xl font-mono text-red-400">&lt; 7.0°</div>
                                <div className="text-xs uppercase tracking-wider mt-1">Danjon Limit</div>
                            </div>
                            <div className="p-3 rounded-lg border text-center border-[#C1A87D]/20">
                                <div className="text-xl font-mono text-green-400">&gt; 10.0°</div>
                                <div className="text-xs uppercase tracking-wider mt-1">Naked Eye (Safe)</div>
                            </div>
                        </div>
                    </div>
                </BreezyFullCard>

                <BreezyFullCard title={"Atmospheric Refraction"} icon={<Sparkles />}>
                    <div className="p-4 space-y-4 text-sm text-muted-foreground">
                        <p>
                            Our geometry computations account for standard atmospheric refraction — which &quot;lifts&quot; objects above the true horizon.
                        </p>
                        <p>
                            When the moon appears to just touch the horizon, its true geometric center is actually roughly 34 arcminutes below the horizon plane. The atmosphere bends the light, creating a mirage of the moon higher than it physically lies.
                        </p>
                        <p className="text-xs italic mt-4 text-[#C1A87D]/70">
                            Calculations employ the Bennett (1982) formula for astronomical refraction, using default standard temperature and pressure unless overridden in Pro settings.
                        </p>
                    </div>
                </BreezyFullCard>
            </div>
        </div>
    );
}
