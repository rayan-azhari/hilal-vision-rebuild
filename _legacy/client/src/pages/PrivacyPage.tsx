import { SEO } from "@/components/SEO";
import { PageHeader } from "@/components/PageHeader";
import { Shield, Mail } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

function Heading({ children }: { children: React.ReactNode }) {
    return (
        <h2 className="text-base font-semibold mt-10 mb-3" style={{ color: "var(--foreground)" }}>
            {children}
        </h2>
    );
}

function Para({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--muted-foreground)" }}>
            {children}
        </p>
    );
}

function Ul({ children }: { children: React.ReactNode }) {
    return (
        <ul className="text-sm mb-4 space-y-1 pl-5" style={{ color: "var(--muted-foreground)", listStyleType: "disc" }}>
            {children}
        </ul>
    );
}

export default function PrivacyPage() {
    const { t } = useTranslation();
    const updated = "23 February 2026";

    return (
        <div className="min-h-screen" style={{ background: "var(--space)" }}>
            <SEO
                title={t("privacy.title")}
                description={t("privacy.description")}
                path="/privacy"
            />

            <div
                className="border-b"
                style={{ borderColor: "color-mix(in oklch, var(--gold) 10%, transparent)" }}
            >
                <PageHeader
                    icon={<Shield />}
                    title={t("privacy.title")}
                    subtitle={t("privacy.lastUpdated", { date: updated })}
                    className="max-w-2xl"
                />
            </div>

            <div className="container py-12 max-w-2xl">
                {/* Intro */}
                <div
                    className="breezy-card mb-8"
                    style={{
                        border: "1px solid color-mix(in oklch, var(--gold) 15%, transparent)",
                        background: "color-mix(in oklch, var(--gold) 2%, var(--space-mid))",
                    }}
                >
                    <Para>
                        {t("privacy.intro1")}
                    </Para>
                    <Para>
                        {t("privacy.intro2")}
                        <span style={{ color: "var(--gold-dim)" }}>moonsightinglive@gmail.com</span>.
                    </Para>
                </div>

                <Heading>{t("privacy.h1")}</Heading>
                <Para>
                    {t("privacy.p1")}
                </Para>
                <Ul>
                    <li>
                        <strong style={{ color: "var(--foreground)" }}>{t("privacy.collect_accountTitle")}</strong>{t("privacy.collect_accountDesc")}
                    </li>
                    <li>
                        <strong style={{ color: "var(--foreground)" }}>{t("privacy.collect_locationTitle")}</strong>{t("privacy.collect_locationDesc")}
                    </li>
                    <li>
                        <strong style={{ color: "var(--foreground)" }}>{t("privacy.collect_sightingTitle")}</strong>{t("privacy.collect_sightingDesc")}
                    </li>
                    <li>
                        <strong style={{ color: "var(--foreground)" }}>{t("privacy.collect_usageTitle")}</strong>{t("privacy.collect_usageDesc")}
                    </li>
                    <li>
                        <strong style={{ color: "var(--foreground)" }}>{t("privacy.collect_ipTitle")}</strong>{t("privacy.collect_ipDesc")}
                    </li>
                </Ul>

                <Heading>{t("privacy.h2")}</Heading>
                <Ul>
                    <li>{t("privacy.use1")}</li>
                    <li>{t("privacy.use2")}</li>
                    <li>{t("privacy.use3")}</li>
                    <li>{t("privacy.use4")}</li>
                    <li>{t("privacy.use5")}</li>
                </Ul>
                <Para>
                    {t("privacy.p2_1")}<strong style={{ color: "var(--foreground)" }}>{t("privacy.p2_not")}</strong>{t("privacy.p2_2")}
                </Para>

                <Heading>{t("privacy.h3")}</Heading>
                <div className="overflow-x-auto my-4">
                    <table className="w-full text-xs border-collapse">
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--border)" }}>
                                <th className="text-left py-2 px-3 font-semibold" style={{ color: "var(--foreground)" }}>{t("privacy.th1")}</th>
                                <th className="text-left py-2 px-3 font-semibold" style={{ color: "var(--foreground)" }}>{t("privacy.th2")}</th>
                                <th className="text-left py-2 px-3 font-semibold" style={{ color: "var(--foreground)" }}>{t("privacy.th3")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                [t("privacy.svc1_name"), t("privacy.svc1_purpose"), t("privacy.svc1_data")],
                                [t("privacy.svc2_name"), t("privacy.svc2_purpose"), t("privacy.svc2_data")],
                                [t("privacy.svc3_name"), t("privacy.svc3_purpose"), t("privacy.svc3_data")],
                                [t("privacy.svc4_name"), t("privacy.svc4_purpose"), t("privacy.svc4_data")],
                                [t("privacy.svc5_name"), t("privacy.svc5_purpose"), t("privacy.svc5_data")],
                            ].map(([svc, purpose, data]) => (
                                <tr key={svc} style={{ borderBottom: "1px solid color-mix(in oklch, var(--border) 50%, transparent)" }}>
                                    <td className="py-2 px-3 font-medium" style={{ color: "var(--foreground)" }}>{svc}</td>
                                    <td className="py-2 px-3" style={{ color: "var(--muted-foreground)" }}>{purpose}</td>
                                    <td className="py-2 px-3" style={{ color: "var(--muted-foreground)" }}>{data}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Heading>{t("privacy.h4")}</Heading>
                <Para>
                    {t("privacy.cookie1")}
                </Para>
                <Para>
                    {t("privacy.cookie2")}
                </Para>

                <Heading>{t("privacy.h5")}</Heading>
                <Ul>
                    <li>
                        <strong style={{ color: "var(--foreground)" }}>{t("privacy.retention_accountTitle")}</strong>{t("privacy.retention_accountDesc")}
                    </li>
                    <li>
                        <strong style={{ color: "var(--foreground)" }}>{t("privacy.retention_sightingTitle")}</strong>{t("privacy.retention_sightingDesc")}
                    </li>
                    <li>
                        <strong style={{ color: "var(--foreground)" }}>{t("privacy.retention_rateTitle")}</strong>{t("privacy.retention_rateDesc")}
                    </li>
                    <li>
                        <strong style={{ color: "var(--foreground)" }}>{t("privacy.retention_errorTitle")}</strong>{t("privacy.retention_errorDesc")}
                    </li>
                </Ul>

                <Heading>{t("privacy.h6")}</Heading>
                <Para>
                    {t("privacy.rights_p1")}
                </Para>
                <Ul>
                    <li>{t("privacy.rights_1")}</li>
                    <li>{t("privacy.rights_2")}</li>
                    <li>{t("privacy.rights_3")}</li>
                    <li>{t("privacy.rights_4")}</li>
                    <li>{t("privacy.rights_5")}</li>
                </Ul>
                <Para>
                    {t("privacy.rights_p2_1")}<span style={{ color: "var(--gold-dim)" }}>moonsightinglive@gmail.com</span>{t("privacy.rights_p2_2")}
                </Para>

                <Heading>{t("privacy.h7")}</Heading>
                <Para>
                    {t("privacy.children1")}
                </Para>

                <Heading>{t("privacy.h8")}</Heading>
                <Para>
                    {t("privacy.changes1")}
                </Para>

                {/* Links */}
                <div
                    className="breezy-card mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                >
                    <Mail className="w-5 h-5 shrink-0" style={{ color: "var(--gold-dim)" }} />
                    <div>
                        <div className="text-sm font-medium mb-0.5" style={{ color: "var(--foreground)" }}>
                            {t("privacy.footer_title")}
                        </div>
                        <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                            {t("privacy.footer_email")}
                            <span style={{ color: "var(--gold-dim)" }}>moonsightinglive@gmail.com</span>
                            {t("privacy.footer_alsoSee")}
                            <Link href="/terms">
                                <span className="underline cursor-pointer" style={{ color: "var(--gold-dim)" }}>{t("privacy.footer_terms")}</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
