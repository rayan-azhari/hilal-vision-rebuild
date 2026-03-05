import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en/common.json";
import ar from "./locales/ar/common.json";
import ur from "./locales/ur/common.json";

i18n.use(initReactI18next).init({
    resources: {
        en: { translation: en },
        ar: { translation: ar },
        ur: { translation: ur },
    },
    lng: typeof window !== "undefined" ? localStorage.getItem("hilal-lang") || "en" : "en",
    fallbackLng: "en",
    interpolation: {
        escapeValue: false, // React escapes by default
    },
});

export default i18n;
