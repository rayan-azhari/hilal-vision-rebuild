const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'client/src/pages/MethodologyPage.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

const enPath = path.join(__dirname, 'client/src/locales/en/common.json');
const arPath = path.join(__dirname, 'client/src/locales/ar/common.json');
const urPath = path.join(__dirname, 'client/src/locales/ur/common.json');

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const arData = JSON.parse(fs.readFileSync(arPath, 'utf8'));
const urData = JSON.parse(fs.readFileSync(urPath, 'utf8'));

const replacements = [
    { key: "zoneA_mean", en: "Easily visible with naked eye", ar: "يرى بالعين المجردة بسهولة", ur: "آسانی سے ننگی آنکھ سے دیکھا جا سکتا ہے" },
    { key: "zoneB_mean", en: "Visible under perfect conditions", ar: "يرى بالعين المجردة في ظروف مثالية", ur: "بہترین حالات میں انسانی آنکھ سے نظر آتا ہے" },
    { key: "zoneC_mean", en: "Binoculars may be needed to find crescent", ar: "قد يحتاج إلى منظار للعثور على الهلال", ur: "ہلال تلاش کرنے کے لئے دوربین کی ضرورت ہو سکتی ہے" },
    { key: "zoneD_mean", en: "Visible only with telescope", ar: "يرى بالمنظار فقط", ur: "صرف ٹیلی سکوپ کے ذریعے دیکھا جا سکتا ہے" },
    { key: "zoneE_mean", en: "Not visible even with optical aid", ar: "لا يرى حتى باستخدام المنظار", ur: "آپٹیکل ایڈ کے ساتھ بھی نظر نہیں آتا" },
    { key: "zoneF_mean", en: "Impossible - below horizon at sunset", ar: "مستحيل - الهلال تحت الأفق وقت الغروب", ur: "ناممکن - غروب آفتاب کے وقت افق سے نیچے" },

    { key: "odehA_mean", en: "Visible by naked eye", ar: "يرى بالعين المجردة", ur: "ننگی آنکھ سے نظر آتا ہے" },
    { key: "odehB_mean", en: "Visible by optical aid; possibly naked eye", ar: "يرى بالمنظار؛ وربما بالعين المجردة", ur: "آپٹیکل آلات کے ذریعے؛ ممکنہ طور پر ننگی آنکھ سے بھی" },
    { key: "odehC_mean", en: "Visible by optical aid only", ar: "يرى بالمنظار فقط", ur: "صرف آپٹیکل ایڈ کے ذریعے دیکھا جا سکتا ہے" },

    { key: "tableH_zone", en: "Zone", ar: "الفئة", ur: "زون" },
    { key: "tableH_range", en: "q-value Range", ar: "نطاق قيمة q", ur: "q-value کی حد" },
    { key: "tableH_range2", en: "V-value Range", ar: "نطاق قيمة V", ur: "V-value کی حد" },
    { key: "tableH_interp", en: "Interpretation", ar: "التفسير", ur: "تشریح" },
];

replacements.forEach(r => {
    enData.methodology[r.key] = r.en;
    arData.methodology[r.key] = r.ar;
    urData.methodology[r.key] = r.ur;

    // String replacement in TSX
    // Use a precise replace to avoid messing up jsx
    pageContent = pageContent.split(`"${r.en}"`).join(`t("methodology.${r.key}")`);
    pageContent = pageContent.split(`>${r.en}<`).join(`>{t("methodology.${r.key}")}<`);
});

fs.writeFileSync(pagePath, pageContent);
fs.writeFileSync(enPath, JSON.stringify(enData, null, 4));
fs.writeFileSync(arPath, JSON.stringify(arData, null, 4));
fs.writeFileSync(urPath, JSON.stringify(urData, null, 4));

console.log("Methodology tables translated and patched successfully!");
