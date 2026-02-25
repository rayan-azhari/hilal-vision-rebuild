import { SEO } from "@/components/SEO";
import { PageHeader } from "@/components/PageHeader";
import { BookOpen, Mail } from "lucide-react";
import { Link } from "wouter";

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
    const updated = "23 February 2026";

    return (
        <div className="min-h-screen" style={{ background: "var(--space)" }}>
            <SEO
                title="Terms of Service"
                description="Hilal Vision Terms of Service - acceptable use, liability, and End-User License Agreement."
                path="/terms"
            />

            <div
                className="border-b"
                style={{ borderColor: "color-mix(in oklch, var(--gold) 10%, transparent)" }}
            >
                <PageHeader
                    icon={<BookOpen />}
                    title="Terms of Service"
                    subtitle={`Last updated: ${updated}`}
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
                        These Terms of Service ("Terms") govern your use of Hilal Vision ("the Platform").
                        By accessing or using the Platform you agree to these Terms. If you do not agree,
                        please do not use the Platform.
                    </Para>
                    <Para>
                        Questions? Contact us at{" "}
                        <span style={{ color: "var(--gold-dim)" }}>moonsightinglive@gmail.com</span>
                    </Para>
                </div>

                <Heading>1. Acceptance of Terms</Heading>
                <Para>
                    By using Hilal Vision - whether as a guest or a registered account holder - you confirm
                    that you are at least 13 years of age and that you accept these Terms. If you are using
                    the Platform on behalf of an organisation, you represent that you have authority to bind
                    that organisation.
                </Para>

                <Heading>2. Description of Service</Heading>
                <Para>
                    Hilal Vision is a precision astronomical web platform for predicting and visualising Islamic
                    crescent moon (hilal) sightings. It provides:
                </Para>
                <Ul>
                    <li>Mathematical crescent visibility predictions based on Yallop and Odeh criteria.</li>
                    <li>Interactive 3D globe and 2D map visualisations.</li>
                    <li>A Hijri calendar with multiple calculation engines.</li>
                    <li>A historical ICOP sighting archive.</li>
                    <li>A crowdsourced sighting report system for authenticated users.</li>
                </Ul>
                <Para>
                    The Platform is provided for informational and scientific purposes only. It is{" "}
                    <strong style={{ color: "var(--foreground)" }}>not a religious authority</strong> and does
                    not issue official Hijri calendar rulings. Users should consult qualified Islamic scholars
                    for religious determinations.
                </Para>

                <Heading>3. Acceptable Use</Heading>
                <Para>You agree not to:</Para>
                <Ul>
                    <li>Submit false crescent sighting reports with the intent to deceive or corrupt the dataset.</li>
                    <li>Attempt to bypass the mathematical Zone F validation or rate-limiting safeguards.</li>
                    <li>Use the Platform to conduct or facilitate DDoS attacks, scraping abuse, or automated spam.</li>
                    <li>Impersonate another user or misrepresent your identity.</li>
                    <li>Use the Platform for any unlawful purpose or in violation of applicable law.</li>
                    <li>Attempt to reverse-engineer, decompile, or tamper with the Platform's security measures.</li>
                </Ul>
                <Para>
                    We reserve the right to suspend or terminate accounts that violate these rules without notice.
                </Para>

                <Heading>4. User-Generated Content</Heading>
                <Para>
                    When you submit a crescent sighting report, you grant Hilal Vision a worldwide,
                    royalty-free, irrevocable licence to display, store, and use that report as part of the
                    Platform's public scientific dataset. Sighting reports may be visible to all users of
                    the Platform.
                </Para>
                <Para>
                    You are responsible for the accuracy of reports you submit. Submitting knowingly false
                    reports is a violation of these Terms and may result in account suspension.
                </Para>

                <Heading>5. Accuracy Disclaimer</Heading>
                <Para>
                    Hilal Vision provides mathematical predictions based on established astronomical algorithms
                    (Yallop 1997, Odeh 2004, SunCalc). While we strive for accuracy, we make no warranties -
                    express or implied - regarding the correctness, completeness, or fitness for any particular
                    purpose of any prediction, calendar date, or sighting data.
                </Para>
                <Para>
                    Atmospheric conditions, local topography, and human visual acuity can cause actual sighting
                    outcomes to differ from predictions. The Platform should not be used as the sole basis for
                    any religious or civic decision.
                </Para>

                <Heading>6. Intellectual Property & End-User License Agreement</Heading>
                <Para>
                    All content, features, and functionality of Hilal Vision are owned by its developers
                    and are protected by international copyright, trademark, patent, trade secret, and other
                    intellectual property laws. You are granted a limited, non-exclusive, non-transferable
                    licence to access and use the Platform. You may not copy, modify, distribute, sell, or
                    lease any part of our Platform or its underlying software.
                </Para>
                <Para>
                    Third-party data included in the Platform (e.g., ICOP sighting records, Umm al-Qura
                    calendar tables) remains subject to the original terms of their respective sources. See our{" "}
                    <Link href="/about">
                        <span className="underline cursor-pointer" style={{ color: "var(--gold-dim)" }}>About page</span>
                    </Link>{" "}
                    for full attribution.
                </Para>

                <Heading>7. Limitation of Liability</Heading>
                <Para>
                    To the maximum extent permitted by applicable law, Hilal Vision and its contributors shall
                    not be liable for any indirect, incidental, special, consequential, or punitive damages
                    arising out of your use of (or inability to use) the Platform - including but not limited
                    to loss of data, missed religious observances, or reliance on incorrect predictions.
                </Para>
                <Para>
                    The Platform is provided "as is" and "as available" without warranty of any kind.
                </Para>

                <Heading>8. Third-Party Services</Heading>
                <Para>
                    The Platform integrates third-party services including Clerk Auth, Open-Meteo, Upstash,
                    and Sentry. Your use of these services is subject to their respective terms and privacy
                    policies. We are not responsible for the practices of third-party service providers.
                </Para>

                <Heading>9. Modifications to Terms</Heading>
                <Para>
                    We may update these Terms from time to time. The "Last updated" date at the top reflects
                    the most recent revision. Continued use of the Platform after any changes constitutes
                    acceptance of the revised Terms. Significant changes will be announced via an in-app
                    notification.
                </Para>

                <Heading>10. Governing Law</Heading>
                <Para>
                    These Terms are governed by and construed in accordance with applicable law. Any disputes
                    shall be resolved through good-faith negotiation in the first instance.
                </Para>

                {/* Footer links */}
                <div className="breezy-card mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <Mail className="w-5 h-5 shrink-0" style={{ color: "var(--gold-dim)" }} />
                    <div>
                        <div className="text-sm font-medium mb-0.5" style={{ color: "var(--foreground)" }}>
                            Questions about these Terms?
                        </div>
                        <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                            Email{" "}
                            <span style={{ color: "var(--gold-dim)" }}>moonsightinglive@gmail.com</span>
                            {" "}- Also see our{" "}
                            <Link href="/privacy">
                                <span className="underline cursor-pointer" style={{ color: "var(--gold-dim)" }}>Privacy Policy</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
