import { SEO } from "@/components/SEO";
import { PageHeader } from "@/components/PageHeader";
import { BookOpen, Mail } from "lucide-react";
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

export default function TermsPage() {
    const { t } = useTranslation();
    const updated = "23 February 2026";

    return (
        <div className="min-h-screen" style={{ background: "var(--space)" }}>
            <SEO
                title={t("terms.title")}
                description={t("terms.description")}
                path="/terms"
            />

            <div
                className="border-b"
                style={{ borderColor: "color-mix(in oklch, var(--gold) 10%, transparent)" }}
            >
                <PageHeader
                    icon={<BookOpen />}
                    title={t("terms.title")}
                    subtitle={t("terms.lastUpdated", { date: updated })}
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
                        {t("terms.intro1")}
                    </Para>
                    <Para>
                        {t("terms.intro2")}
                        <span style={{ color: "var(--gold-dim)" }}>moonsightinglive@gmail.com</span>
                    </Para>
                </div>

                <Heading>{t("terms.h1")}</Heading>
                <Para>
                    {t("terms.p1")}
                </Para>

                <Heading>{t("terms.h2")}</Heading>
                <Para>{t("terms.p2")}</Para>
                <Ul>
                    <li>{t("terms.service1")}</li>
                    <li>{t("terms.service2")}</li>
                    <li>{t("terms.service3")}</li>
                    <li>{t("terms.service4")}</li>
                    <li>{t("terms.service5")}</li>
                </Ul>
                <Para>
                    {t("terms.p2_1")}<strong style={{ color: "var(--foreground)" }}>{t("terms.p2_not")}</strong>{t("terms.p2_2")}
                </Para>

                <Heading>{t("terms.h3")}</Heading>
                <Para>{t("terms.use_intro")}</Para>
                <Ul>
                    <li>{t("terms.use1")}</li>
                    <li>{t("terms.use2")}</li>
                    <li>{t("terms.use3")}</li>
                    <li>{t("terms.use4")}</li>
                    <li>{t("terms.use5")}</li>
                    <li>{t("terms.use6")}</li>
                </Ul>
                <Para>
                    {t("terms.use_outro")}
                </Para>

                <Heading>{t("terms.h4")}</Heading>
                <Para>{t("terms.content1")}</Para>
                <Para>{t("terms.content2")}</Para>

                <Heading>{t("terms.h5")}</Heading>
                <Para>{t("terms.acc1")}</Para>
                <Para>{t("terms.acc2")}</Para>

                <Heading>{t("terms.h6")}</Heading>
                <Para>{t("terms.ip1")}</Para>
                <Para>
                    {t("terms.ip2_1")}
                    <Link href="/about">
                        <span className="underline cursor-pointer" style={{ color: "var(--gold-dim)" }}>{t("terms.aboutLink")}</span>
                    </Link>
                    {t("terms.ip2_2")}
                </Para>

                <Heading>{t("terms.h7")}</Heading>
                <Para>{t("terms.liab1")}</Para>
                <Para>{t("terms.liab2")}</Para>

                <Heading>{t("terms.h8")}</Heading>
                <Para>{t("terms.third1")}</Para>

                <Heading>{t("terms.h9")}</Heading>
                <Para>{t("terms.mod1")}</Para>

                <Heading>{t("terms.h10")}</Heading>
                <Para>{t("terms.gov1")}</Para>

                {/* Footer links */}
                <div className="breezy-card mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <Mail className="w-5 h-5 shrink-0" style={{ color: "var(--gold-dim)" }} />
                    <div>
                        <div className="text-sm font-medium mb-0.5" style={{ color: "var(--foreground)" }}>
                            {t("terms.footer_title")}
                        </div>
                        <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                            {t("terms.footer_email")}
                            <span style={{ color: "var(--gold-dim)" }}>moonsightinglive@gmail.com</span>
                            {t("terms.footer_alsoSee")}
                            <Link href="/privacy">
                                <span className="underline cursor-pointer" style={{ color: "var(--gold-dim)" }}>{t("terms.footer_privacy")}</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
