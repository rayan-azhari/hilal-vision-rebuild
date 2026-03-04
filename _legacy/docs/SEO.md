# SEO Documentation

This document outlines the Search Engine Optimization (SEO) strategy and technical implementation for Hilal Vision. By treating SEO as a core feature rather than an afterthought, Hilal Vision is discoverable globally across English, Arabic, and Urdu searches.

## 1. Core Principles
- **Dynamic Localization:** SEO meta tags must reflect the user's active language choice (English, Arabic, or Urdu).
- **Semantics & Accessibility:** Correct usage of HTML `lang` and `dir` attributes to aid search engines and screen readers in text interpretation.
- **Rich Snippets via Structured Data:** Implementing JSON-LD schemas to represent the app, articles, and logical organization behind Hilal Vision.
- **Social Media Ready:** Full support for Open Graph (OG) and Twitter card rich previews out of the box.

## 2. Global SEO Component (`SEO.tsx`)

The central nervous system for all per-page metadata is the `<SEO />` component located at `client/src/components/SEO.tsx`. It acts as a wrapper around [`react-helmet-async`](https://github.com/staylor/react-helmet-async).

### Props Interface
When defining a new page component, you inject the SEO properties via translation keys:

```tsx
interface SEOProps {
    titleKey?: string;       // Translation key for page title (e.g. "seo.home.title")
    descriptionKey?: string; // Translation key for page description
    path?: string;           // Canonical relative path (e.g. "/visibility")
    ogImage?: string;        // Absolute URL to OG image
    type?: "website" | "article"; // OG type representing the page format
}
```

### Usage Example
For a page component, inject the component immediately inside the main wrapper:

```tsx
import { SEO } from "@/components/SEO";

export default function VisibilityPage() {
    return (
        <div className="page-container">
            <SEO 
                titleKey="seo.visibility.title"
                descriptionKey="seo.visibility.desc"
                path="/visibility"
            />
            {/* Page Content */}
        </div>
    );
}
```

## 3. Internationalization (i18n) Configuration
For search engines, changing text isn't enough; the document root must be updated.

### Document Lang & Dir Attributes
The `<SEO />` component uses `useTranslation` to append the currently selected language and standard direction property (`rtl` or `ltr`) exactly onto the `<html>` root node dynamically:

```tsx
<html lang={i18n.language} dir={i18n.dir()} />
```

### JSON Structure
Translations for the SEO titles and descriptions are housed in the `common.json` files for each supported locale:
- `client/src/locales/en/common.json` 
- `client/src/locales/ar/common.json` 
- `client/src/locales/ur/common.json` 

Example structure in `en/common.json`:
```json
{
  "seo": {
    "home": {
      "title": "Home",
      "desc": "Precision Islamic crescent moon visibility predictions with interactive 3D globe, Hijri calendar, and real-time sighting reports."
    },
    ...
  }
}
```

## 4. Open Graph & Twitter Cards

Social sharing on WhatsApp, Telegram, iMessage, Twitter, and LinkedIn relies heavily on Open Graph tags.

The SEO component injects these cleanly into the `<head>` block:
- `og:locale`: Maps directly from the selected `i18n` language (e.g., `en_US`, `ar_AR`, `ur_PK`).
- `og:image`: Defaults to `https://moonsighting.live/og-default.png` unless overridden via the `ogImage` prop.
- `twitter:card`: Defined as `summary_large_image` to ensure large previews populate on X/Twitter.

## 5. Structured Data (JSON-LD)
Schema Markup is injected natively into every page to classify Hilal Vision on Google Search properly.
The application injects the following properties dynamically:
- `@context`: `https://schema.org`
- `@type`: Swaps between `SoftwareApplication` and `TechArticle` (if the `type="article"` prop is passed to the SEO component, like in Methodology/About).
- `applicationCategory`: `EducationalApplication`

## 6. Pre-rendering & Hydration Notes (Vite)
Because Hilal Vision is primarily a React SPA built via Vite, search engines like Googlebot and Bingbot leverage their headless Chromium engines to execute the JavaScript (and wait for react-helmet-async) before indexing the final DOM output. 

*If maximum indexability is sought later, consider implementing SSR (Server Side Rendering), but most modern search engine bots natively parse Helmet-injected tags today.*

## 7. Adding SEO to New Pages
1. Open `client/src/locales/en/common.json` and add a new entry to the `"seo"` block.
    ```json
    "mypage": {
      "title": "My Page Title",
      "desc": "An informative description of my new page."
    }
    ```
2. Replicate and correctly translate this block in `ar/common.json` and `ur/common.json`.
3. In your new React component file, import `<SEO>` and pass the newly created translation keys:
    ```tsx
    <SEO titleKey="seo.mypage.title" descriptionKey="seo.mypage.desc" path="/mypage" />
    ```
