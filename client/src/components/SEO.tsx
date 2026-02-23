import { Helmet } from "react-helmet-async";

interface SEOProps {
    title?: string;
    description?: string;
    path?: string;
    ogImage?: string;
    type?: "website" | "article";
}

const SITE_NAME = "Hilal Vision";
const DEFAULT_DESCRIPTION =
    "Precision Islamic crescent moon visibility predictions, interactive 3D globe, Hijri calendar, and real-time sighting reports.";
const BASE_URL = "https://moon-dashboard-one.vercel.app";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-default.png`;

export function SEO({
    title,
    description = DEFAULT_DESCRIPTION,
    path = "/",
    ogImage = DEFAULT_OG_IMAGE,
    type = "website",
}: SEOProps) {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Islamic Moon Visibility & Sighting`;
    const canonicalUrl = `${BASE_URL}${path}`;

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={canonicalUrl} />

            {/* Open Graph */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:locale" content="en_US" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage} />

            {/* Additional SEO */}
            <meta name="application-name" content={SITE_NAME} />
            <meta name="apple-mobile-web-app-title" content={SITE_NAME} />
        </Helmet>
    );
}
