import type { Metadata } from "next";
import { FileText, Shield, Scale, AlertTriangle, AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Terms of Service — Hilal Vision",
    description: "Hilal Vision Terms of Service — acceptable use, liability, and End-User License Agreement.",
};

export default function TermsPage() {
    return (
        <article className="pt-8 pb-16 max-w-3xl mx-auto px-6 prose dark:prose-invert prose-headings:font-display prose-headings:text-foreground prose-p:text-foreground/70 prose-li:text-foreground/70 prose-strong:text-foreground prose-a:text-accent prose-a:no-underline hover:prose-a:underline">
            <h1>Terms of Service</h1>
            <p className="text-sm text-foreground/40">Last updated: 1 March 2026</p>

            <p>
                These Terms of Service (&quot;Terms&quot;) govern your use of Hilal Vision (&quot;the Platform&quot;).
                By accessing or using the Platform you agree to these Terms. If you do not agree, please do not use the Platform.
            </p>

            <h2>1. Acceptance of Terms</h2>
            <p>
                By using Hilal Vision — whether as a guest or a registered account holder — you confirm that you have read, understood, and agree to be bound by these Terms and our Privacy Policy.
            </p>

            <h2>2. The Service</h2>
            <p>
                Hilal Vision is an astronomical tool designed to calculate and visualise crescent moon visibility based on Yallop and Odeh criteria. It features:
            </p>
            <ul>
                <li>Interactive global visibility maps</li>
                <li>Best-Time-to-Observe calculations</li>
                <li>Historical sighting archives (ICOP data)</li>
                <li>Local horizon simulations</li>
                <li>Crowdsourced sighting reports mechanism</li>
            </ul>
            <p>
                Hilal Vision is a scientific calculation platform. It is <strong>not</strong> a religious authority. The platform provides astronomical possibilities, not legal or authoritative religious declarations of the Islamic month start. Users should continue to consult their local authorities and scholars.
            </p>

            <h2>3. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul>
                <li>Use the Platform for any unlawful purpose.</li>
                <li>Attempt to probe, scan, or test the vulnerability of the service or breach any security or authentication measures.</li>
                <li>Interfere with, or attempt to interfere with, the access of any user, host, or network.</li>
                <li>Use automated systems (bots, scrapers) to extract data from the Platform without prior written consent.</li>
                <li>Upload false, misleading, or malicious sighting reports to the public map.</li>
                <li>Sell, resell, or commercially exploit any part of the service.</li>
            </ul>

            <h2>4. User-Generated Content</h2>
            <p>
                When you submit a crescent sighting report (including text, GPS coordinates, and photos), you grant us a worldwide, non-exclusive, royalty-free licence to use, reproduce, display, and distribute that data publicly as part of our scientific sighting repository.
            </p>

            <h2>5. Accounts and Security</h2>
            <p>
                Authentication is provided via Clerk. You are responsible for safeguarding your login credentials.
                For more information on how we handle your data, please see our <Link href="/privacy" className="text-primary-400 hover:underline">Privacy Policy</Link>.
            </p>

            <h2>6. Intellectual Property</h2>
            <p>
                The Hilal Vision brand, logos, UI designs, code architecture, and proprietary data processing algorithms are the exclusive property of Hilal Vision. You may not copy, modify, distribute, or reverse engineer them.
            </p>

            <h2>7. Disclaimer of Warranties and Liability</h2>
            <p>
                Hilal Vision is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. We make no warranties regarding the absolute accuracy of the astronomical predictions, Yallop/Odeh criteria outcomes, or weather/cloud-cover data.
            </p>

            <h2>8. Third-Party Services</h2>
            <p>
                The Platform relies on external APIs (e.g., Open-Meteo for weather, Clerk for authentication, Vercel for hosting). We are not responsible for outages, inaccuracies, or changes in these third-party services.
            </p>

            <h2>9. Modifications to the Terms</h2>
            <p>
                We reserve the right to modify these Terms at any time. Changes will be posted on this page with an updated date.
            </p>

            <h2>10. Governing Law</h2>
            <p>
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which the creators operate.
            </p>

            <hr />
            <p className="text-sm text-foreground/40">
                Questions? Contact us at <a href="mailto:support@hilalvision.com">support@hilalvision.com</a>.
                See also our <Link href="/privacy" className="text-primary-400 hover:underline">Privacy Policy</Link>.
            </p>
        </article>
    );
}
