import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Privacy Policy — Hilal Vision",
    description: "Hilal Vision Privacy Policy — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
    return (
        <article className="pt-8 pb-16 max-w-3xl mx-auto px-6 prose dark:prose-invert prose-headings:font-display prose-headings:text-foreground prose-p:text-foreground/70 prose-li:text-foreground/70 prose-strong:text-foreground prose-a:text-accent prose-a:no-underline hover:prose-a:underline">
            <h1>Privacy Policy</h1>
            <p className="text-sm text-foreground/40">Last updated: 1 March 2026</p>

            <p>
                At Hilal Vision, we are committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, and protect your information when you visit our website or use our crescent tracking tools.
            </p>

            <h2>1. Information We Collect</h2>
            <p>We collect only the information necessary to operate, secure, and improve our scientific visibility platform. We do not sell your data.</p>
            <ul>
                <li><strong>Account &amp; Registration:</strong> Email, name, and profile photo via third-party authentication providers.</li>
                <li><strong>Location Data (optional):</strong> GPS or IP-based geolocation for city-specific moon altitude data. We do not track your location in the background.</li>
                <li><strong>Sighting Reports:</strong> Location, time, and any crescent photos you submit. This data becomes public as part of the scientific record.</li>
                <li><strong>Usage Analytics:</strong> Anonymous page views, clicks, and load times to improve the experience.</li>
                <li><strong>Server Security Logs:</strong> Short-lived IP access logs for abuse prevention.</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <ul>
                <li>To calculate and display accurate coordinate-dependent map and moon data.</li>
                <li>To operate authentication and protect user accounts.</li>
                <li>To power public maps showing community sightings.</li>
                <li>To improve our platform, detect issues, and fix bugs.</li>
                <li>To comply with legal requirements and security requests.</li>
            </ul>
            <p>
                <strong>Important:</strong> We do <strong>not</strong> sell your information to third parties.
            </p>

            <h2>3. Third-Party Data Processors</h2>
            <table>
                <thead>
                    <tr>
                        <th>Service</th>
                        <th>Purpose</th>
                        <th>Data Shared</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>Clerk</td><td>Authentication</td><td>Email, name, profile pic</td></tr>
                    <tr><td>Vercel</td><td>Hosting &amp; analytics</td><td>IP address (temporary)</td></tr>
                    <tr><td>Open-Meteo</td><td>Weather &amp; cloud data</td><td>Coordinates only</td></tr>
                    <tr><td>Sentry</td><td>Error monitoring</td><td>Page URLs, error messages, browser type</td></tr>
                </tbody>
            </table>

            <h2>4. Cookies</h2>
            <p>
                Hilal Vision uses one first-party session cookie for authentication (managed by Clerk). We do not use third-party marketing tracking cookies.
            </p>

            <h2>5. Data Retention</h2>
            <ul>
                <li><strong>Account data:</strong> Retained until you delete your account.</li>
                <li><strong>Sighting reports:</strong> Retained permanently as part of the scientific astronomical record.</li>
                <li><strong>Rate-limit logs:</strong> IP entries expire automatically after 60 seconds.</li>
                <li><strong>Error logs:</strong> Retained for 30 days, then auto-deleted.</li>
            </ul>

            <h2>6. Your Rights</h2>
            <p>
                Depending on your jurisdiction (GDPR, UK DPA 2018, CCPA, etc.), you may have the right to request a copy of your data, correct inaccuracies, delete your account, object to processing, or withdraw consent at any time.
            </p>

            <h2>7. Children</h2>
            <p>Hilal Vision is not directed at children under 13. We do not knowingly collect personal information from children.</p>

            <h2>8. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with a new updated date.</p>

            <hr />
            <p className="text-sm text-foreground/40">
                Questions about privacy? Contact us at <a href="mailto:support@hilalvision.com">support@hilalvision.com</a>.
                By using our services, you also agree to our <Link href="/terms" className="text-primary-400 hover:underline">Terms of Service</Link>.
            </p>
        </article>
    );
}
