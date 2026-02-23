import { SEO } from "@/components/SEO";
import { PageHeader } from "@/components/PageHeader";
import { Shield, Mail } from "lucide-react";
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

export default function PrivacyPage() {
    const updated = "23 February 2026";

    return (
        <div className="min-h-screen" style={{ background: "var(--space)" }}>
            <SEO
                title="Privacy Policy"
                description="Hilal Vision Privacy Policy — how we collect, use, and protect your data."
                path="/privacy"
            />

            <div
                className="border-b"
                style={{ borderColor: "color-mix(in oklch, var(--gold) 10%, transparent)" }}
            >
                <PageHeader
                    icon={<Shield />}
                    title="Privacy Policy"
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
                        Hilal Vision ("we", "us", "our") is committed to protecting your privacy. This policy
                        explains what data we collect, how we use it, and your rights regarding that data. By
                        using Hilal Vision you agree to the practices described below.
                    </Para>
                    <Para>
                        If you have questions, contact us at{" "}
                        <span style={{ color: "var(--gold-dim)" }}>privacy@hilalvision.app</span>.
                    </Para>
                </div>

                <Heading>1. Data We Collect</Heading>
                <Para>
                    We collect the minimum data necessary to provide the service:
                </Para>
                <Ul>
                    <li>
                        <strong style={{ color: "var(--foreground)" }}>Account information</strong> — Name and
                        email address, collected by Clerk Auth when you sign in with Google, Apple, or email/password.
                        We do not store passwords directly.
                    </li>
                    <li>
                        <strong style={{ color: "var(--foreground)" }}>Location data</strong> — GPS coordinates
                        you voluntarily provide when using the Auto-Detect feature or submitting a sighting report.
                        Location is not stored continuously; it is used only at the moment of calculation or
                        report submission.
                    </li>
                    <li>
                        <strong style={{ color: "var(--foreground)" }}>Sighting reports</strong> — Observation
                        time, GPS coordinates, sighting result (Seen / Not Seen), and optional notes that you
                        submit voluntarily.
                    </li>
                    <li>
                        <strong style={{ color: "var(--foreground)" }}>Usage data</strong> — Anonymised event
                        telemetry via Sentry (error reports, page performance metrics). No personally identifiable
                        information is attached.
                    </li>
                    <li>
                        <strong style={{ color: "var(--foreground)" }}>IP address</strong> — Temporarily logged
                        by Upstash Redis for rate-limiting submitted sighting reports (sliding window, 5 requests/minute).
                        Not stored permanently.
                    </li>
                </Ul>

                <Heading>2. How We Use Your Data</Heading>
                <Ul>
                    <li>To provide crescent visibility predictions for your location.</li>
                    <li>To store and display your voluntary crescent sighting reports on the public map.</li>
                    <li>To authenticate and manage your account securely via Clerk.</li>
                    <li>To prevent abuse via IP-based rate limiting (Upstash Redis).</li>
                    <li>To diagnose application errors and improve performance (Sentry).</li>
                </Ul>
                <Para>
                    We do <strong style={{ color: "var(--foreground)" }}>not</strong> sell your data, use it
                    for advertising, or share it with third parties beyond the sub-processors listed below.
                </Para>

                <Heading>3. Third-Party Sub-Processors</Heading>
                <div className="overflow-x-auto my-4">
                    <table className="w-full text-xs border-collapse">
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--border)" }}>
                                <th className="text-left py-2 px-3 font-semibold" style={{ color: "var(--foreground)" }}>Service</th>
                                <th className="text-left py-2 px-3 font-semibold" style={{ color: "var(--foreground)" }}>Purpose</th>
                                <th className="text-left py-2 px-3 font-semibold" style={{ color: "var(--foreground)" }}>Data Shared</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                ["Clerk Auth", "User authentication", "Name, email, session tokens"],
                                ["Upstash Redis", "Rate limiting", "IP address (temporary)"],
                                ["Sentry", "Error monitoring", "Anonymised error events"],
                                ["Open-Meteo", "Weather / cloud data", "Latitude & longitude only"],
                                ["Vercel", "Hosting & CDN", "Request logs (standard)"],
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

                <Heading>4. Cookies</Heading>
                <Para>
                    Hilal Vision uses only functional cookies — specifically the Clerk authentication session
                    cookie required to keep you signed in. We do not use tracking or advertising cookies.
                    Blocking cookies will prevent sign-in but will not affect astronomical calculations, which
                    are fully client-side and require no account.
                </Para>
                <Para>
                    If you access Hilal Vision from the European Union, the UK, or another jurisdiction that
                    requires cookie consent, we will request your explicit consent before setting any cookies
                    beyond strictly necessary ones.
                </Para>

                <Heading>5. Data Retention</Heading>
                <Ul>
                    <li>
                        <strong style={{ color: "var(--foreground)" }}>Account data</strong> — Retained until
                        you delete your account via Clerk.
                    </li>
                    <li>
                        <strong style={{ color: "var(--foreground)" }}>Sighting reports</strong> — Retained
                        indefinitely as part of the public scientific dataset. Reports you submit are attributed
                        to your account and visible on the map.
                    </li>
                    <li>
                        <strong style={{ color: "var(--foreground)" }}>Rate-limit records</strong> — IP entries
                        expire automatically after 60 seconds.
                    </li>
                    <li>
                        <strong style={{ color: "var(--foreground)" }}>Error logs</strong> — Retained for 30
                        days by Sentry.
                    </li>
                </Ul>

                <Heading>6. Your Rights</Heading>
                <Para>
                    Depending on your jurisdiction (GDPR, UK DPA 2018, CCPA, etc.), you may have rights to:
                </Para>
                <Ul>
                    <li>Access the personal data we hold about you.</li>
                    <li>Correct inaccurate data.</li>
                    <li>Request deletion of your account and associated data.</li>
                    <li>Export your sighting reports.</li>
                    <li>Object to or restrict processing.</li>
                </Ul>
                <Para>
                    To exercise any of these rights, contact{" "}
                    <span style={{ color: "var(--gold-dim)" }}>privacy@hilalvision.app</span>. We will
                    respond within 30 days.
                </Para>

                <Heading>7. Children</Heading>
                <Para>
                    Hilal Vision is not directed at children under 13. We do not knowingly collect personal
                    data from children. If you believe a child has submitted data, contact us immediately.
                </Para>

                <Heading>8. Changes to This Policy</Heading>
                <Para>
                    We may update this policy from time to time. The "Last updated" date at the top of this
                    page reflects the most recent revision. Significant changes will be announced via an
                    in-app notification.
                </Para>

                {/* Links */}
                <div
                    className="breezy-card mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                >
                    <Mail className="w-5 h-5 shrink-0" style={{ color: "var(--gold-dim)" }} />
                    <div>
                        <div className="text-sm font-medium mb-0.5" style={{ color: "var(--foreground)" }}>
                            Privacy questions?
                        </div>
                        <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                            Email{" "}
                            <span style={{ color: "var(--gold-dim)" }}>privacy@hilalvision.app</span>
                            {" "}— Also see our{" "}
                            <Link href="/terms">
                                <span className="underline cursor-pointer" style={{ color: "var(--gold-dim)" }}>Terms of Service</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
