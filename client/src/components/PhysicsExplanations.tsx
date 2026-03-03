import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { useTranslation, Trans } from "react-i18next";
import { BreezyFullCard } from "./BreezyFullCard";
import { Info, BookOpen, Calculator, Sparkles } from "lucide-react";

// Generate points for the Yallop f(W) curve
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

// Generate points for the Odeh (2004) V-value curve
function generateOdehData() {
    const data = [];
    for (let W = 0; W <= 2.5; W += 0.1) {
        // Odeh uses same polynomial shape but different intercept: 7.1651
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
    const { t } = useTranslation();

    return (
        <div className="space-y-6 mt-8">
            <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h2 className="text-xl font-semibold" style={{ fontFamily: "Cinzel, serif", color: "var(--foreground)" }}>
                    {t("physicsExplanations.title")}
                </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BreezyFullCard title={t("physicsExplanations.yallopTitle")} icon={<BookOpen />}>
                    <div className="p-4 space-y-4 text-sm" style={{ color: "var(--muted-foreground)" }}>
                        <p>
                            <Trans i18nKey="physicsExplanations.yallopDesc1">
                                The Hilal Dashboard employs the rigorous <strong>Yallop (1997) criterion</strong> to predict lunar crescent visibility.
                                Dr. B.D. Yallop of the HM Nautical Almanac Office developed this statistical model based on 295 historical observations.
                            </Trans>
                        </p>
                        <div className="p-4 rounded-xl font-mono text-xs" style={{ background: "var(--space-dark)", color: "var(--gold)" }}>
                            q = [ ARCV - (11.8371 - 6.3226W + 0.7319W² - 0.1018W³) ] / 10
                        </div>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>{t("physicsExplanations.yallopQ")}</strong>{t("physicsExplanations.yallopQDesc")}</li>
                            <li><strong>{t("physicsExplanations.yallopARCV")}</strong>{t("physicsExplanations.yallopARCVDesc")}</li>
                            <li><strong>{t("physicsExplanations.yallopW")}</strong>{t("physicsExplanations.yallopWDesc")}</li>
                        </ul>
                        <p>
                            <Trans i18nKey="physicsExplanations.yallopDesc2">
                                The <em>q-value</em> elegantly predicts visibility across specific zones ranging from naked-eye certain (Zone A) to wholly invisible (Zone F).
                            </Trans>
                        </p>
                    </div>
                </BreezyFullCard>

                <BreezyFullCard title={t("physicsExplanations.yallopCurveTitle")} icon={<Calculator />}>
                    <div className="p-4 h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={yallopData} margin={{ top: 5, right: 20, bottom: 30, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--space-light)" />
                                <XAxis dataKey="w" stroke="var(--muted-foreground)" fontSize={12} label={{ value: t("physicsExplanations.chartWidth"), position: 'insideBottom', fill: 'var(--muted-foreground)', offset: -15 }} />
                                <YAxis stroke="var(--muted-foreground)" fontSize={12} label={{ value: t("physicsExplanations.chartArcv"), angle: -90, position: 'insideLeft', fill: 'var(--muted-foreground)' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--space-mid)', borderColor: 'var(--gold-dim)', borderRadius: '8px' }}
                                    itemStyle={{ fontSize: '12px' }}
                                />
                                <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }} formatter={(value) => {
                                    if (value === "Zone A (q≥0.216)") return t("physicsExplanations.zoneA");
                                    if (value === "Zone C (q≥−0.16)") return t("physicsExplanations.zoneC");
                                    if (value === "Threshold (q=0)") return t("physicsExplanations.thresholdQ");
                                    return value;
                                }} />
                                <Line name="Zone A (q≥0.216)" type="monotone" dataKey="Zone A (q≥0.216)" stroke="#4ade80" strokeWidth={2} dot={false} />
                                <Line name="Threshold (q=0)" type="monotone" dataKey="Threshold (q=0)" stroke="var(--gold)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                <Line name="Zone C (q≥−0.16)" type="monotone" dataKey="Zone C (q≥−0.16)" stroke="#fb923c" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </BreezyFullCard>

                <BreezyFullCard title={t("physicsExplanations.odehTitle")} icon={<BookOpen />}>
                    <div className="p-4 space-y-4 text-sm" style={{ color: "var(--muted-foreground)" }}>
                        <p>
                            <Trans i18nKey="physicsExplanations.odehDesc1">
                                The <strong>Odeh (2004) criterion</strong> was developed by Mohammad Sh. Odeh of the Islamic Crescents' Observation Project (ICOP),
                                refining Yallop's model with 737 observations including modern CCD and telescopic sightings.
                            </Trans>
                        </p>
                        <div className="p-4 rounded-xl font-mono text-xs" style={{ background: "var(--space-dark)", color: "var(--gold)" }}>
                            V = ARCV - (7.1651 - 6.3226W + 0.7319W² - 0.1018W³)
                        </div>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>{t("physicsExplanations.odehV1")}</strong>{t("physicsExplanations.odehV1Desc")}</li>
                            <li><strong>{t("physicsExplanations.odehV2")}</strong>{t("physicsExplanations.odehV2Desc")}</li>
                            <li><strong>{t("physicsExplanations.odehV3")}</strong>{t("physicsExplanations.odehV3Desc")}</li>
                            <li><strong>{t("physicsExplanations.odehV4")}</strong>{t("physicsExplanations.odehV4Desc")}</li>
                        </ul>
                    </div>
                </BreezyFullCard>

                <BreezyFullCard title={t("physicsExplanations.odehCurveTitle")} icon={<Calculator />}>
                    <div className="p-4 h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={odehData} margin={{ top: 5, right: 20, bottom: 30, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--space-light)" />
                                <XAxis dataKey="w" stroke="var(--muted-foreground)" fontSize={12} label={{ value: t("physicsExplanations.chartWidth"), position: 'insideBottom', fill: 'var(--muted-foreground)', offset: -15 }} />
                                <YAxis stroke="var(--muted-foreground)" fontSize={12} label={{ value: t("physicsExplanations.chartArcv"), angle: -90, position: 'insideLeft', fill: 'var(--muted-foreground)' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--space-mid)', borderColor: 'var(--gold-dim)', borderRadius: '8px' }}
                                    itemStyle={{ fontSize: '12px' }}
                                />
                                <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }} formatter={(value) => {
                                    if (value === "Easily Visible (V≥5.65)") return t("physicsExplanations.easilyVisible");
                                    if (value === "Visible (V≥2.0)") return t("physicsExplanations.visible");
                                    if (value === "Threshold (V=0)") return t("physicsExplanations.thresholdV");
                                    if (value === "Optical Aid (V≥−0.96)") return t("physicsExplanations.opticalAid");
                                    return value;
                                }} />
                                <Line name="Easily Visible (V≥5.65)" type="monotone" dataKey="Easily Visible (V≥5.65)" stroke="#4ade80" strokeWidth={2} dot={false} />
                                <Line name="Visible (V≥2.0)" type="monotone" dataKey="Visible (V≥2.0)" stroke="#facc15" strokeWidth={2} dot={false} />
                                <Line name="Threshold (V=0)" type="monotone" dataKey="Threshold (V=0)" stroke="var(--gold)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                <Line name="Optical Aid (V≥−0.96)" type="monotone" dataKey="Optical Aid (V≥−0.96)" stroke="#fb923c" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </BreezyFullCard>

                <BreezyFullCard title={t("physicsExplanations.danjonTitle")} icon={<Info />}>
                    <div className="p-4 space-y-4 text-sm" style={{ color: "var(--muted-foreground)" }}>
                        <p>
                            <Trans i18nKey="physicsExplanations.danjonDesc1">
                                In 1932, French astronomer André Danjon discovered that sighting a crescent is physically impossible if the lunar elongation (angular distance between the sun and moon) is less than <strong>7 degrees</strong>.
                            </Trans>
                        </p>
                        <p>
                            {t("physicsExplanations.danjonDesc2")}
                        </p>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <div className="p-3 rounded-lg border text-center" style={{ borderColor: "color-mix(in oklch, var(--gold) 10%, transparent)" }}>
                                <div className="text-xl font-mono text-red-400">&lt; 7.0°</div>
                                <div className="text-xs uppercase tracking-wider mt-1">{t("physicsExplanations.danjonLimit")}</div>
                            </div>
                            <div className="p-3 rounded-lg border text-center" style={{ borderColor: "color-mix(in oklch, var(--gold) 10%, transparent)" }}>
                                <div className="text-xl font-mono text-green-400">&gt; 10.0°</div>
                                <div className="text-xs uppercase tracking-wider mt-1">{t("physicsExplanations.nakedEyeThreshold")}</div>
                            </div>
                        </div>
                    </div>
                </BreezyFullCard>

                <BreezyFullCard title={t("physicsExplanations.refractionTitle")} icon={<Sparkles />}>
                    <div className="p-4 space-y-4 text-sm" style={{ color: "var(--muted-foreground)" }}>
                        <p>
                            <Trans i18nKey="physicsExplanations.refractionDesc1">
                                Our geometry computations via <em>astronomy-engine</em> (VSOP87/ELP2000) account for standard atmospheric refraction — which "lifts" objects above the true horizon.
                            </Trans>
                        </p>
                        <p>
                            {t("physicsExplanations.refractionDesc2")}
                        </p>
                        <p className="text-xs italic mt-4" style={{ color: "var(--gold-dim)" }}>
                            {t("physicsExplanations.refractionNote")}
                        </p>
                    </div>
                </BreezyFullCard>
            </div>
        </div>
    );
}
