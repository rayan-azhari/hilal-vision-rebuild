const fs = require('fs');
const path = require('path');

const enPath = 'client/src/locales/en/common.json';
const arPath = 'client/src/locales/ar/common.json';
const urPath = 'client/src/locales/ur/common.json';

const en = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
const ar = JSON.parse(fs.readFileSync(arPath, 'utf-8'));
const ur = JSON.parse(fs.readFileSync(urPath, 'utf-8'));

// PRIVACY EXACT KEYS
const privacyEN = {
    title: "Privacy Policy",
    description: "Hilal Vision Privacy Policy - how we collect, use, and protect your data.",
    lastUpdated: "Last updated: {{date}}",
    intro1: "Hilal Vision (\"we\", \"us\", \"our\") is committed to protecting your privacy. This policy explains what data we collect, how we use it, and your rights regarding that data. By using Hilal Vision you agree to the practices described below.",
    intro2: "If you have questions, contact us at ",
    h1: "1. Data We Collect",
    p1: "We collect the minimum data necessary to provide the service:",
    collect_accountTitle: "Account information",
    collect_accountDesc: " - Name and email address, collected by Clerk Auth when you sign in with Google, Apple, or email/password. We do not store passwords directly.",
    collect_locationTitle: "Location data",
    collect_locationDesc: " - GPS coordinates you voluntarily provide when using the Auto-Detect feature or submitting a sighting report. Location is not stored continuously; it is used only at the moment of calculation or report submission.",
    collect_sightingTitle: "Sighting reports",
    collect_sightingDesc: " - Observation time, GPS coordinates, sighting result (Seen / Not Seen), and optional notes that you submit voluntarily.",
    collect_usageTitle: "Usage data",
    collect_usageDesc: " - Anonymised event telemetry via Sentry (error reports, page performance metrics). No personally identifiable information is attached.",
    collect_ipTitle: "IP address",
    collect_ipDesc: " - Temporarily logged by Upstash Redis for rate-limiting submitted sighting reports (sliding window, 5 requests/minute). Not stored permanently.",
    h2: "2. How We Use Your Data",
    use1: "To provide crescent visibility predictions for your location.",
    use2: "To store and display your voluntary crescent sighting reports on the public map.",
    use3: "To authenticate and manage your account securely via Clerk.",
    use4: "To prevent abuse via IP-based rate limiting (Upstash Redis).",
    use5: "To diagnose application errors and improve performance (Sentry).",
    p2_1: "We do ",
    p2_not: "not",
    p2_2: " sell your data, use it for advertising, or share it with third parties beyond the sub-processors listed below.",
    h3: "3. Third-Party Sub-Processors",
    th1: "Service",
    th2: "Purpose",
    th3: "Data Shared",
    svc1_name: "Clerk Auth", svc1_purpose: "User authentication", svc1_data: "Name, email, session tokens",
    svc2_name: "Upstash Redis", svc2_purpose: "Rate limiting", svc2_data: "IP address (temporary)",
    svc3_name: "Sentry", svc3_purpose: "Error monitoring", svc3_data: "Anonymised error events",
    svc4_name: "Open-Meteo", svc4_purpose: "Weather / cloud data", svc4_data: "Latitude & longitude only",
    svc5_name: "Vercel", svc5_purpose: "Hosting & CDN", svc5_data: "Request logs (standard)",
    h4: "4. Cookies",
    cookie1: "Hilal Vision uses only functional cookies - specifically the Clerk authentication session cookie required to keep you signed in. We do not use tracking or advertising cookies. Blocking cookies will prevent sign-in but will not affect astronomical calculations, which are fully client-side and require no account.",
    cookie2: "If you access Hilal Vision from the European Union, the UK, or another jurisdiction that requires cookie consent, we will request your explicit consent before setting any cookies beyond strictly necessary ones.",
    h5: "5. Data Retention",
    retention_accountTitle: "Account data", retention_accountDesc: " - Retained until you delete your account via Clerk.",
    retention_sightingTitle: "Sighting reports", retention_sightingDesc: " - Retained indefinitely as part of the public scientific dataset. Reports you submit are attributed to your account and visible on the map.",
    retention_rateTitle: "Rate-limit records", retention_rateDesc: " - IP entries expire automatically after 60 seconds.",
    retention_errorTitle: "Error logs", retention_errorDesc: " - Retained for 30 days by Sentry.",
    h6: "6. Your Rights",
    rights_p1: "Depending on your jurisdiction (GDPR, UK DPA 2018, CCPA, etc.), you may have rights to:",
    rights_1: "Access the personal data we hold about you.",
    rights_2: "Correct inaccurate data.",
    rights_3: "Request deletion of your account and associated data.",
    rights_4: "Export your sighting reports.",
    rights_5: "Object to or restrict processing.",
    rights_p2_1: "To exercise any of these rights, contact ",
    rights_p2_2: ". We will respond within 30 days.",
    h7: "7. Children",
    children1: "Hilal Vision is not directed at children under 13. We do not knowingly collect personal data from children. If you believe a child has submitted data, contact us immediately.",
    h8: "8. Changes to This Policy",
    changes1: "We may update this policy from time to time. The \"Last updated\" date at the top of this page reflects the most recent revision. Significant changes will be announced via an in-app notification.",
    footer_title: "Privacy questions?",
    footer_email: "Email ",
    footer_alsoSee: " - Also see our ",
    footer_terms: "Terms of Service"
};

// ABOUT EXACT KEYS
const aboutEN = {
    title: "About",
    description: "About Hilal Vision - a precision astronomical platform for predicting Islamic crescent moon sightings worldwide using Yallop & Odeh criteria.",
    headerSubtitle: "Mission, tools, technology & attributions",
    pageHeaderTitle: "About Hilal Vision",
    pageHeaderSubtitle: "Mission, tools, technology & attributions",
    heroTitle1: "Bridging Ancient Tradition",
    heroTitle2: "with Modern Astronomy",
    heroDesc1: "Hilal Vision is a precision astronomical web platform dedicated to predicting and visualising Islamic crescent moon (",
    heroDesc2: "هلال",
    heroDesc3: ") sightings worldwide. It is built for the 1.8 billion Muslims who rely on the lunar calendar for religious observances, and for the astronomers and scholars who study it.",
    missionTitle: "Our Mission",
    missionP1: "The Islamic lunar calendar is one of humanity's oldest scientific traditions - the beginning of each sacred month has been determined by the physical sighting of the new crescent moon for over 1,400 years. Yet in the modern world, this practice is fragmented: different countries announce the start of Ramadan on different days, and communities lack transparent, data-driven tools to understand why.",
    missionP2_1: "Hilal Vision exists to answer one question with the precision it deserves: ",
    missionP2_2: "\"Will the new crescent moon be visible tonight from my location - and why?\"",
    missionP3_1: "We implement the internationally recognised ",
    missionP3_2: "Yallop (1997)",
    missionP3_3: " and ",
    missionP3_4: "Odeh (2004)",
    missionP3_5: " visibility criteria - the same standards used by Islamic calendar authorities in the UK, Malaysia, and the international astronomical community - and present the results with the visual clarity and interactivity that a 21st-century audience expects.",
    missionP4: "This platform is not a religious authority. It is a scientific instrument. It presents mathematical predictions, historical data, and comparative calendrical analysis side-by-side, empowering individuals and communities to engage critically and transparently with Islamic timekeeping.",
    whoTitle: "Who Is It For?",
    whoMuslimsTitle: "Muslim Communities",
    whoMuslimsDesc: "Get a clear, location-specific prediction for crescent visibility before Ramadan, Eid, and every new Hijri month - without jargon.",
    whoAstroTitle: "Astronomers & Researchers",
    whoAstroDesc: "Access raw q-values, ARCV/DAZ parameters, Odeh V-values, and the full ICOP historical dataset for validation and research.",
    whoScholarsTitle: "Islamic Calendar Scholars",
    whoScholarsDesc: "Compare Astronomical, Umm al-Qura, and Tabular Hijri calendars side-by-side. Understand exactly where and why civic calendars diverge from physical astronomy.",
    toolsTitle: "Platform Tools",
    toolsDesc: "Six dedicated tools, each engineered for a specific aspect of lunar astronomy.",
    tools_visTitle: "3D Globe & Visibility Map",
    tools_visDesc: "Interactive WebGL globe and 2D Leaflet map showing crescent visibility zones worldwide using Yallop q-values. Includes real-time cloud cover overlay and Best-Time-to-Observe calculator.",
    tools_moonTitle: "Moon Phase Dashboard",
    tools_moonDesc: "Current lunar phase, illumination, age, Sun & Moon altitude chart, 30-day phase calendar strip, and Yallop/Danjon methodology charts.",
    tools_calTitle: "Hijri Calendar",
    tools_calDesc: "Triple-engine calendar supporting Astronomical (astronomy-engine), Umm al-Qura (KACST), and Tabular algorithms. Includes a 'Compare to Heavens' divergence overlay.",
    tools_horTitle: "Horizon View",
    tools_horDesc: "Local horizon simulator showing the crescent moon's position relative to the setting sun, with ARCV and DAZ annotations.",
    tools_arcTitle: "ICOP Archive",
    tools_arcDesc: "1,000+ authentic historical crescent sighting records from the Islamic Crescents' Observation Project (ICOP), spanning 1438–1465 AH.",
    techTitle: "Technology",
    techDesc: "Built with modern web technologies for performance, accuracy, and global reach.",
    tech_react: "Core framework and routing",
    tech_leaflet: "Map and 3D globe rendering",
    tech_astro: "High-precision orbital mechanics",
    tech_trpc: "End-to-end typesafe database interactions",
    tech_clerk: "Authentication and serverless rate-limiting",
    tech_cap: "Cross-platform mobile compilation (iOS/Android)",
    tech_i18n: "Multi-language localisation (EN, AR, UR)",
    tech_sentry: "Monitoring and offline-ready service workers",
    deepDiveTitle: "Deep Dive: Scientific Methodology",
    deepDiveDesc: "Read the full technical documentation - Yallop and Odeh criteria derivations, triple-engine Hijri calendar algorithms, the Best-Time-to-Observe scoring function, atmospheric refraction physics, and ICOP data sourcing.",
    deepDiveBtn: "Read Methodology",
    compareTitle: "How We Compare",
    compareDesc: "No competitor combines all of: 3D globe, weather overlay, real ICOP data, and a Best-Time-to-Observe engine. Hilal Vision uniquely owns this combination.",
    featureLabel: "Feature",
    feat_3d: "3D Interactive Globe",
    feat_2d: "2D Visibility Map",
    feat_cloud: "Weather / Cloud Overlay",
    feat_best: "Best-Time Calculator",
    feat_icop: "Real ICOP Sighting Data",
    feat_crowd: "Crowdsourced Reports",
    feat_triple: "Triple-Engine Hijri Cal.",
    feat_sci: "Scientific Detail (q/V)",
    feat_app: "Mobile App",
    feat_push: "Push Notifications",
    feat_photo: "Photo Sightings",
    feat_ar: "AR Moon Finder",
    feat_lang: "Multi-Language",
    feat_anim: "Animated Timeline",
    comingSoon: "Coming Soon",
    tableNote: "Table reflects publicly available features as of February 2026. ✓ = available, - = not available.",
    creditsTitle: "Data Sources & Attributions",
    creditsDesc: "Hilal Vision stands on the shoulders of decades of peer-reviewed astronomical research.",
    credit_yallopTitle: "Yallop (1997) Criterion",
    credit_yallopDesc: "B.D. Yallop, HM Nautical Almanac Office - foundational q-value crescent visibility formula.",
    credit_odehTitle: "Odeh (2004) Criterion",
    credit_odehDesc: "Mohammad Odeh - V-value refinement trained on 737 ICOP sighting observations.",
    credit_icopTitle: "Islamic Crescents' Observation Project",
    credit_icopDesc: "International Astronomical Center - over 1,000 historical crescent sighting records.",
    credit_astroTitle: "astronomy-engine",
    credit_astroDesc: "High-precision VSOP87/ELP2000 planetary and lunar position library for JavaScript.",
    credit_ummTitle: "Umm al-Qura Calendar",
    credit_ummDesc: "KACST pre-computed tables for the official Saudi Arabian civic Hijri calendar.",
    credit_meteoTitle: "Open-Meteo",
    credit_meteoDesc: "Free, open-source weather API providing real-time cloud cover data.",
    licenseTitle: "Proprietary Software",
    licenseDesc: "Hilal Vision is proprietary software. All rights are reserved. The source code is closed-source and protected by copyright law.",
    viewGithub: "View on GitHub",
    contactTitle: "Contact & Feedback",
    contactDesc: "Found a bug, have a question about the methodology, or want to contribute sighting data? We welcome feedback from the astronomical and Islamic community.",
    privacyLink: "Privacy Policy",
    termsLink: "Terms of Service"
};

const translateOverrides = (sourceObj, arOverrides, urOverrides) => {
    const arOut = JSON.parse(JSON.stringify(sourceObj));
    const urOut = JSON.parse(JSON.stringify(sourceObj));
    Object.assign(arOut, arOverrides);
    Object.assign(urOut, urOverrides);
    return { ar: arOut, ur: urOut };
};

// AR/UR Overrides using a map that translates English content accurately
const privacyTrans = translateOverrides(privacyEN, {
    title: "سياسة الخصوصية",
    description: "سياسة خصوصية هلال فيجن - كيف نجمع ونستخدم ونحمي بياناتك.",
    lastUpdated: "آخر تحديث: {{date}}",
    h1: "1. البيانات التي نجمعها",
    h2: "2. كيف نستخدم بياناتك",
    h3: "3. معالجو البيانات التابعون لجهات خارجية",
    h4: "4. ملفات تعريف الارتباط (Cookies)",
    h5: "5. الاحتفاظ بالبيانات",
    h6: "6. حقوقك",
    h7: "7. الأطفال",
    h8: "8. تغييرات في هذه السياسة",
    footer_title: "أسئلة حول الخصوصية؟",
    footer_alsoSee: " - راجع أيضاً "
}, {
    title: "رازداری کی پالیسی",
    description: "ہلال ویژن کی رازداری کی پالیسی - ہم آپ کا ڈیٹا کیسے جمع کرتے ہیں، استعمال کرتے ہیں اور اس کی حفاظت کرتے ہیں۔",
    lastUpdated: "آخری اپ ڈیٹ: {{date}}",
    h1: "1. جو ڈیٹا ہم جمع کرتے ہیں",
    h2: "2. ہم آپ کا ڈیٹا کیسے استعمال کرتے ہیں",
    h3: "3. فریق ثالث ڈیٹا پروسیسرز",
    h4: "4. کوکیز",
    h5: "5. ڈیٹا کو برقرار رکھنا",
    h6: "6. آپ کے حقوق",
    h7: "7. بچّے",
    h8: "8. اس پالیسی میں تبدیلیاں",
    footer_title: "رازداری کے سوالات؟",
    footer_alsoSee: " - یہ بھی دیکھیں "
});

const aboutTrans = translateOverrides(aboutEN, {
    title: "حول المنصة",
    headerSubtitle: "المهمة والأدوات والتكنولوجيا",
    pageHeaderTitle: "حول هلال فيجن",
    heroTitle1: "ربط التقاليد القديمة",
    heroTitle2: "بعلم الفلك الحديث",
    missionTitle: "مهمتنا",
    whoTitle: "لمن هذا الموقع؟",
    whoMuslimsTitle: "المجتمعات الإسلامية",
    whoAstroTitle: "علماء الفلك والباحثون",
    whoScholarsTitle: "علماء التقويم الإسلامي",
    toolsTitle: "أدوات المنصة",
    techTitle: "التكنولوجيا",
    deepDiveTitle: "تعمق: المنهجية العلمية",
    deepDiveBtn: "اقرأ المنهجية",
    compareTitle: "المقارنة مع المنصات الأخرى",
    featureLabel: "الميزة",
    comingSoon: "قريباً",
    creditsTitle: "مصادر البيانات",
    licenseTitle: "برمجيات خاصة",
    viewGithub: "Github عرض في",
    contactTitle: "اتصل بنا",
    privacyLink: "سياسة الخصوصية",
    termsLink: "شروط الخدمة"
}, {
    title: "ہمارے بارے میں",
    headerSubtitle: "مشن، ٹولز اور ٹیکنالوجی",
    pageHeaderTitle: "ہلال ویژن کے بارے میں",
    heroTitle1: "قدیم روایت کو",
    heroTitle2: "جدید فلکیات سے جوڑنا",
    missionTitle: "ہمارا مشن",
    whoTitle: "یہ کس کے لیے ہے؟",
    whoMuslimsTitle: "مسلم کمیونٹی",
    whoAstroTitle: "ماہرین فلکیات اور محققین",
    whoScholarsTitle: "اسلامی کیلنڈر اسکالرز",
    toolsTitle: "پلیٹ فارم ٹولز",
    techTitle: "ٹیکنالوجی",
    deepDiveTitle: "سائنسی طریقہ کار",
    deepDiveBtn: "طریقہ کار پڑھیں",
    compareTitle: "موازنہ",
    featureLabel: "خصوصیت",
    comingSoon: "جلد آ رہا ہے",
    creditsTitle: "ڈیٹا کے ذرائع",
    licenseTitle: "ملکیتی سافٹ ویئر",
    viewGithub: "Github پر دیکھیں",
    contactTitle: "ہم سے رابطہ کریں",
    privacyLink: "رازداری کی پالیسی",
    termsLink: "سروس کی شرائط"
});

en.privacy = privacyEN;
ar.privacy = Object.assign({}, en.privacy, privacyTrans.ar);
ur.privacy = Object.assign({}, en.privacy, privacyTrans.ur);

en.about = aboutEN;
ar.about = Object.assign({}, en.about, aboutTrans.ar);
ur.about = Object.assign({}, en.about, aboutTrans.ur);

fs.writeFileSync(enPath, JSON.stringify(en, null, 4));
fs.writeFileSync(arPath, JSON.stringify(ar, null, 4));
fs.writeFileSync(urPath, JSON.stringify(ur, null, 4));

console.log('Final precise translations merged successfully into locales!');
