# Internationalization (i18n) & Localization Guide

This document explains how the multi-language support (English, Arabic, Urdu) and Right-to-Left (RTL) formatting is implemented in Hilal Vision, and provides a step-by-step guide on how to add or update translations for future development.

## 1. Technology Stack

- **[react-i18next](https://react.i18next.com/)**: The core internationalization framework for React.
- **[i18next-browser-languagedetector](https://github.com/i18next/i18next-browser-languageDetector)**: Automatically detects the user's preferred language from browser settings or `localStorage`.
- **JSON files**: Used to store translation key-value pairs for each language.

## 2. File Structure

All translation-related files are located in the `client/src/` directory:

```text
client/src/
├── i18n.ts                    # i18next initialization and configuration
├── components/
│   └── LanguageSwitcher.tsx   # Dropdown UI component to switch languages
└── locales/
    ├── en/
    │   └── common.json        # English translation keys (Default)
    ├── ar/
    │   └── common.json        # Arabic translation keys (RTL)
    └── ur/
        └── common.json        # Urdu translation keys (RTL)
```

## 3. How It Works

### Initialization (`i18n.ts`)
The `i18n.ts` file imports the JSON files and initializes the `i18next` instance. It configures the fallback language (`en`) and sets up the browser language detector to cache the user's choice in `localStorage` under the key `i18nextLng`.

### RTL Direction Handling
Arabic and Urdu are Right-to-Left (RTL) languages. When the language changes, the `LanguageSwitcher` (or an app-level `useEffect`) listens to `i18n.on('languageChanged')` and updates the HTML `dir` attribute:

```javascript
document.documentElement.dir = i18n.dir(newLang); // Sets dir="rtl" or "ltr"
document.documentElement.lang = newLang;          // Sets lang="ar", "ur", or "en"
```

Tailwind CSS natively supports RTL when the HTML `dir="rtl"` attribute is set. We use logical CSS properties (like `ms-2` for `margin-inline-start`, `pe-4` for `padding-inline-end`) instead of physical properties (`ml-2`, `pr-4`) to ensure the layout flips correctly.

## 4. How to Add or Update Translations

To replicate the translation setup for new features or pages, follow this workflow:

### Step 1: Add the Keys to JSON Locales
Whenever you write hardcoded English text in a component, extract it into a key-value pair in `client/src/locales/en/common.json`.

```json
// client/src/locales/en/common.json
{
  "myFeature": {
    "title": "Welcome to the Moon Dashboard",
    "description": "Calculate visibility accurately."
  }
}
```

Then, provide the exact same keys in the Arabic (`ar/common.json`) and Urdu (`ur/common.json`) files with their translated equivalents:

```json
// client/src/locales/ar/common.json
{
  "myFeature": {
    "title": "مرحباً بكم في لوحة معلومات القمر",
    "description": "احسب الرؤية بدقة."
  }
}
```

### Step 2: Use the `useTranslation` Hook in Components
In your React component (`.tsx`), import the `useTranslation` hook and replace the hardcoded text with the `t()` function.

```tsx
import { useTranslation } from "react-i18next";

export function MyFeatureComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("myFeature.title")}</h1>
      <p>{t("myFeature.description")}</p>
    </div>
  );
}
```

### Step 3: Handle Dynamic Values (Variables)
If you need to inject variables into a translation, use double curly braces in the JSON file:

```json
// en/common.json
{
  "status": "The moon is {{age}} hours old."
}
```

Then pass the variable in the component:

```tsx
<p>{t("status", { age: 24 })}</p>
```

## 5. Summary Checklist for New Pages

When creating a entirely new page:
1. Strip all hardcoded English strings (headers, paragraphs, button labels, SEO descriptions, tooltips).
2. Create a new section object in `en/common.json` (e.g., `"contactPage": { ... }`) and populate it.
3. Mirror that exact structure into `ar/common.json` and `ur/common.json` with translations.
4. Ensure the component imports `useTranslation` **inside** the React component boundary (not outside).
5. Ensure structural CSS uses Tailwind logical properties (`start`/`end` instead of `left`/`right`) so the RTL flip works automatically.
