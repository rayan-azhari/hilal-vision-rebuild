import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

interface SEOProps {
    titleKey?: string;
    descriptionKey?: string;
    path?: string;
    ogImage?: string;
    type?: "website" | "article";
}

const SITE_NAME = "Hilal Vision";
const BASE_URL = "https://moonsighting.live";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-default.png`;

export function SEO({
    titleKey = "seo.home.title",
    descriptionKey = "seo.home.desc",
    path = "/",
    ogImage = DEFAULT_OG_IMAGE,
    type = "website",
}: SEOProps) {
    const { t, i18n } = useTranslation();

    const title = t(titleKey);
    const description = t(descriptionKey);

    const isHome = titleKey === "seo.home.title";
    const fullTitle = isHome
        ? `${SITE_NAME} - ${t('home.tagline', { defaultValue: 'Islamic Moon Visibility & Sighting' })}`
        : `${title} | ${SITE_NAME}`;

    const canonicalUrl = `${BASE_URL}${path}`;

    const ogLocale = i18n.language === 'ar' ? 'ar_AR' : i18n.language === 'ur' ? 'ur_PK' : 'en_US';

    return (
        <Helmet>
            <html lang={i18n.language} dir={i18n.dir()} />
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
            <meta property="og:locale" content={ogLocale} />

            {/* JSON-LD Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": type === "article" ? "TechArticle" : "SoftwareApplication",
                    "name": fullTitle,
                    "description": description,
                    "applicationCategory": "EducationalApplication",
                    "operatingSystem": "Web",
                    "url": canonicalUrl,
                    "author": {
                        "@type": "Organization",
                        "name": SITE_NAME
                    }
                })}
            </script>

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
