const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'client/src/pages/MethodologyPage.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

// We will inject `useTranslation` if it's not and add `{t('methodology.xxx')}`
if (!pageContent.includes('useTranslation')) {
    pageContent = pageContent.replace('import { ExternalLink', 'import { useTranslation } from "react-i18next";\nimport { ExternalLink');
    pageContent = pageContent.replace('export default function MethodologyPage() {', 'export default function MethodologyPage() {\n    const { t } = useTranslation();');
}

const enPath = path.join(__dirname, 'client/src/locales/en/common.json');
const arPath = path.join(__dirname, 'client/src/locales/ar/common.json');
const urPath = path.join(__dirname, 'client/src/locales/ur/common.json');

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const arData = JSON.parse(fs.readFileSync(arPath, 'utf8'));
const urData = JSON.parse(fs.readFileSync(urPath, 'utf8'));

enData.methodology = {};
arData.methodology = {};
urData.methodology = {};

function addTranslation(key, en, ar, ur) {
    enData.methodology[key] = en;
    arData.methodology[key] = ar;
    urData.methodology[key] = ur;

    // Attempt to replace exact string in the TSX file
    // Handle specific JSX structures
    const searchString1 = `>{"${en}"}<`;
    const searchString2 = `>${en}<`;
    const searchString3 = `"${en}"`; // For attributes like title=""

    if (pageContent.includes(searchString1)) {
        pageContent = pageContent.split(searchString1).join(`>{t("methodology.${key}")}<`);
    } else if (pageContent.includes(searchString2)) {
        pageContent = pageContent.split(searchString2).join(`>{t("methodology.${key}")}<`);
    } else if (pageContent.includes(searchString3)) {
        pageContent = pageContent.split(searchString3).join(`{t("methodology.${key}")}`);
    } else {
        // More complex replace for paragraphs with newlines
        const cleanEn = en.replace(/\n/g, '').trim();
        // Regex to loosely match the inside of tags
        // This is tricky so we just replace it manually using string replacement for known clean strings
    }
}

// Manually replace known large paragraphs using explicit string replacement
const replacements = [
    {
        key: "heroSubtitle",
        en: "Scientific Documentation - علم الفلك",
        ar: "التوثيق العلمي - علم الفلك",
        ur: "سائنسی دستاویزات - علم الفلك"
    },
    {
        key: "heroTitle",
        en: "Methodology & Algorithms",
        ar: "المنهجية والخوارزميات",
        ur: "طریقہ کار اور الگورتھم"
    },
    {
        key: "heroDesc",
        en: "A complete technical reference for every algorithm, formula, and data source powering Hilal Vision's astronomical calculations.",
        ar: "مرجع تقني كامل لكل خوارزمية ومعادلة ومصدر بيانات يشغل الحسابات الفلكية لمنصة هلال فيجن.",
        ur: "ہلال وژن کی فلکیاتی حسابات کو طاقت بخشنے والے ہر الگورتھم، فارمولے اور ڈیٹا سورس کے لیے ایک مکمل تکنیکی حوالہ۔"
    },
    {
        key: "headerSubtitle",
        en: "Algorithms, formulas, and data sources",
        ar: "الخوارزميات والمعادلات ومصادر البيانات",
        ur: "الگورتھم، فارمولے، اور ڈیٹا کے ذرائع"
    },
    {
        key: "toc_title",
        en: "Contents",
        ar: "المحتويات",
        ur: "فہرست"
    },
    {
        key: "toc_1", en: "1. The Crescent Visibility Problem", ar: "1. مشكلة رؤية الهلال", ur: "1. ہلال کی رویت کا مسئلہ"
    },
    {
        key: "toc_2", en: "2. Yallop (1997) Criterion", ar: "2. معيار يالوب (1997)", ur: "2. یالپ (1997) کا معیار"
    },
    {
        key: "toc_3", en: "3. Odeh (2004) Criterion", ar: "3. معيار عودة (2004)", ur: "3. عودہ (2004) کا معیار"
    },
    {
        key: "toc_4", en: "4. Triple-Engine Hijri Calendar", ar: "4. التقويم الهجري ثلاثي المحركات", ur: "4. ٹرپل انجن ہجری کیلنڈر"
    },
    {
        key: "toc_5", en: "5. Best-Time-to-Observe Calculator", ar: "5. حاسبة أفضل وقت للرؤية", ur: "5. دیکھنے کا بہترین وقت نکالنے والا"
    },
    {
        key: "toc_6", en: "6. World Visibility Grid", ar: "6. شبكة الرؤية العالمية", ur: "6. عالمی رویت کا گرڈ"
    },
    {
        key: "toc_7", en: "7. ICOP Archive", ar: "7. أرشيف المشروع الإسلامي لرصد الأهلة (ICOP)", ur: "7. ICOP آرکائیو"
    },
    {
        key: "toc_8", en: "8. Crowdsourced Telemetry & Validation", ar: "8. القياس عن بعد والتحقق الجماعي", ur: "8. کراؤڈ سورس ویلیڈیشن"
    },
    {
        key: "toc_9", en: "9. Atmospheric Refraction & DEM", ar: "9. الانكسار الجوي ونموذج الارتفاع الرقمي", ur: "9. ماحولیاتی انعطاف اور DEM"
    },
    {
        key: "toc_10", en: "10. Data Export & Public API", ar: "10. تصدير البيانات وواجهة برمجة التطبيقات (API)", ur: "10. ڈیٹا ایکسپورٹ اور پبلک API"
    },
    {
        key: "toc_11", en: "11. References", ar: "11. المراجع", ur: "11. حوالہ جات"
    }
];

// Apply replacements to the translations file
replacements.forEach(r => {
    enData.methodology[r.key] = r.en;
    arData.methodology[r.key] = r.ar;
    urData.methodology[r.key] = r.ur;
});

// Since the TOC is an array of objects in the file:
// { id: "problem", label: "1. The Crescent Visibility Problem" }
// We can use regex to replace it
for (let i = 1; i <= 11; i++) {
    const enText = replacements.find(r => r.key === `toc_${i}`).en;
    pageContent = pageContent.replace(`label: "${enText}"`, `label: t("methodology.toc_${i}")`);
}

// Replace Hero and Headers
pageContent = pageContent.replace('Scientific Documentation - علم الفلك', '{t("methodology.heroSubtitle")}');
pageContent = pageContent.replace('>Methodology & Algorithms<', '>{t("methodology.heroTitle")}<');
pageContent = pageContent.replace('>Methodology<', '>{t("methodology.heroTitle")}<'); // For SEO and PageHeader
pageContent = pageContent.replace('title="Methodology"', 'title={t("methodology.heroTitle")}');
pageContent = pageContent.replace('subtitle="Algorithms, formulas, and data sources"', 'subtitle={t("methodology.headerSubtitle")}');
pageContent = pageContent.replace('>Contents<', '>{t("methodology.toc_title")}<');
pageContent = pageContent.replace('A complete technical reference for every algorithm, formula, and data source powering\n                        Hilal Vision\'s astronomical calculations.', '{t("methodology.heroDesc")}');

// Section 1 Heading
pageContent = pageContent.replace('>1. The Crescent Visibility Problem<', '>{t("methodology.toc_1")}<');

// Section 2 Heading
pageContent = pageContent.replace('>2. Yallop (1997) Criterion<', '>{t("methodology.toc_2")}<');

// Section 3 Heading
pageContent = pageContent.replace('>3. Odeh (2004) Criterion<', '>{t("methodology.toc_3")}<');

// Section 4 Heading
pageContent = pageContent.replace('>4. Triple-Engine Hijri Calendar<', '>{t("methodology.toc_4")}<');

// Section 5 Heading
pageContent = pageContent.replace('>5. Best-Time-to-Observe Calculator<', '>{t("methodology.toc_5")}<');

// Section 6 Heading
pageContent = pageContent.replace('>6. World Visibility Grid<', '>{t("methodology.toc_6")}<');

// Section 7 Heading
pageContent = pageContent.replace('>7. ICOP Archive<', '>{t("methodology.toc_7")}<');

// Section 8 Heading
pageContent = pageContent.replace('>8. Crowdsourced Telemetry & Validation<', '>{t("methodology.toc_8")}<');

// Section 9 Heading
pageContent = pageContent.replace('>9. Atmospheric Refraction & DEM<', '>{t("methodology.toc_9")}<');

// Section 10 Heading
pageContent = pageContent.replace('>10. Data Export & Public API<', '>{t("methodology.toc_10")}<');

// Section 11 Heading
pageContent = pageContent.replace('>11. References<', '>{t("methodology.toc_11")}<');

fs.writeFileSync(pagePath, pageContent);
fs.writeFileSync(enPath, JSON.stringify(enData, null, 4));
fs.writeFileSync(arPath, JSON.stringify(arData, null, 4));
fs.writeFileSync(urPath, JSON.stringify(urData, null, 4));

console.log("Methodology headers and basic strings translated and patched successfully!");
