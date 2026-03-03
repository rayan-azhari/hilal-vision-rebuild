const fs = require('fs');
const path = require('path');

const enPath = 'client/src/locales/en/common.json';
const arPath = 'client/src/locales/ar/common.json';
const urPath = 'client/src/locales/ur/common.json';

const en = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
const ar = JSON.parse(fs.readFileSync(arPath, 'utf-8'));
const ur = JSON.parse(fs.readFileSync(urPath, 'utf-8'));

// Extend nav
const newNavEN = { homeBase: "Home Base", globeAndMaps: "3D Globe & Maps", moonPhase: "Moon Phase", hijriCalendar: "Hijri Calendar", horizonView: "Horizon View", icopArchive: "ICOP Archive" };
const newNavAR = { homeBase: "الرئيسية", globeAndMaps: "خرائط ثلاثية الأبعاد", moonPhase: "أطوار القمر", hijriCalendar: "التقويم الهجري", horizonView: "الرؤية في الأفق", icopArchive: "أرشيف ICOP" };
const newNavUR = { homeBase: "ہوم بیس", globeAndMaps: "تھری ڈی گلوب اور نقشے", moonPhase: "چاند کے مراحل", hijriCalendar: "ہجری کیلنڈر", horizonView: "افق کا منظر", icopArchive: "آئی سی او پی آرکائیو" };

Object.assign(en.nav, newNavEN);
Object.assign(ar.nav, newNavAR);
Object.assign(ur.nav, newNavUR);

// Visibility missing buttons
en.visibility = en.visibility || {};
ar.visibility = ar.visibility || {};
ur.visibility = ur.visibility || {};
en.visibility.globeBtn = "3D Globe";
en.visibility.mapBtn = "2D Map";
ar.visibility.globeBtn = "كرة 3D";
ar.visibility.mapBtn = "خريطة 2D";
ur.visibility.globeBtn = "تھری ڈی گلوب";
ur.visibility.mapBtn = "ٹو ڈی نقشہ";

// Terms
en.terms = {
    title: "Terms of Service",
    description: "Hilal Vision Terms of Service - acceptable use, liability, and End-User License Agreement.",
    lastUpdated: "Last updated: {{date}}",
    intro1: "These Terms of Service (\"Terms\") govern your use of Hilal Vision (\"the Platform\"). By accessing or using the Platform you agree to these Terms. If you do not agree, please do not use the Platform.",
    intro2: "Questions? Contact us at ",
    h1: "1. Acceptance of Terms",
    p1: "By using Hilal Vision - whether as a guest or a registered account holder - you confirm that you have read, understood, and agree to be bound by these Terms and our Privacy Policy.",
    h2: "2. The Service",
    p2: "Hilal Vision is an astronomical tool designed to calculate and visualise crescent moon visibility based on Yallop and Odeh criteria. It features:",
    service1: "Interactive global visibility maps",
    service2: "Best-Time-to-Observe calculations",
    service3: "Historical sighting archives (ICOP data)",
    service4: "Local horizon simulations",
    service5: "Crowdsourced sighting reports mechanism",
    p2_1: "Hilal Vision is a scientific calculation platform. It is ",
    p2_not: "not",
    p2_2: " a religious authority. The platform provides astronomical possibilities, not legal or authoritative religious declarations of the Islamic month start. Users should continue to consult their local authorities and scholars.",
    h3: "3. Acceptable Use",
    use_intro: "You agree not to:",
    use1: "Use the Platform for any unlawful purpose.",
    use2: "Attempt to probe, scan, or test the vulnerability of the service or breach any security or authentication measures.",
    use3: "Interfere with, or attempt to interfere with, the access of any user, host, or network, including sending a virus, overloading, or spamming.",
    use4: "Use automated systems (bots, scrapers) to extract data from the Platform without prior written consent.",
    use5: "Upload false, misleading, or malicious sighting reports to the public map.",
    use6: "Sell, resell, or commercially exploit any part of the service.",
    use_outro: "We reserve the right to suspend or terminate your account and block IP addresses if you violate these rules.",
    h4: "4. User-Generated Content",
    content1: "When you submit a crescent sighting report (including text, GPS coordinates, and photos), you grant us a worldwide, non-exclusive, royalty-free licence to use, reproduce, display, and distribute that data publicly as part of our scientific sighting repository.",
    content2: "You warrant that any reports you submit are truthful to the best of your knowledge and do not infringe on any third-party rights.",
    h5: "5. Accounts and Security",
    acc1: "Authentication is provided via Clerk. You are responsible for safeguarding your login credentials (or third-party OAuth accounts like Google/Apple).",
    acc2: "We cannot and will not be liable for any loss or damage arising from your failure to protect your account.",
    h6: "6. Intellectual Property",
    ip1: "The Hilal Vision brand, logos, UI designs, code architecture, and proprietary data processing algorithms are the exclusive property of Hilal Vision. You may not copy, modify, distribute, or reverse engineer them.",
    ip2_1: "Historical sighting data belongs to the Islamic Crescents' Observation Project (ICOP) and is used with attribution. Third-party libraries (e.g., astronomy-engine) are used under their respective open-source licenses. See the ",
    aboutLink: "About",
    ip2_2: " page for full attributions.",
    h7: "7. Disclaimer of Warranties and Liability",
    liab1: "Hilal Vision is provided on an \"AS IS\" and \"AS AVAILABLE\" basis. We make no warranties regarding the absolute accuracy of the astronomical predictions, Yallop/Odeh criteria outcomes, or weather/cloud-cover data.",
    liab2: "To the maximum extent permitted by law, Hilal Vision shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.",
    h8: "8. Third-Party Services",
    third1: "The Platform relies on external APIs (e.g., Open-Meteo for weather, Clerk for authentication, Vercel for hosting). We are not responsible for outages, inaccuracies, or changes in these third-party services.",
    h9: "9. Modifications to the Terms",
    mod1: "We reserve the right to modify these Terms at any time. Changes will be posted on this page with an updated date. Continued use of the Platform after changes constitutes acceptance of the new Terms.",
    h10: "10. Governing Law",
    gov1: "These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which the creators operate, without regard to its conflict of law provisions.",
    footer_title: "Legal Questions?",
    footer_email: "Email ",
    footer_alsoSee: " - Also see our ",
    footer_privacy: "Privacy Policy"
};

en.privacy = {
    title: "Privacy Policy",
    description: "Hilal Vision Privacy Policy - how we collect, use, and protect your data.",
    lastUpdated: "Last updated: {{date}}",
    intro1: "Hilal Vision (\"we\", \"us\", \"our\") is committed to protecting your privacy. This policy explains what data we collect, how we use it, and your rights regarding that data. By using Hilal Vision you agree to the practices described below.",
    intro2: "If you have questions, contact us at ",
    h1: "1. Data We Collect",
    p1: "We collect the minimum data necessary to provide the service:",
    collect1_1: " - Name and email address, collected by Clerk Auth when you sign in with Google, Apple, or email/password. We do not store passwords directly.",
    collect2_1: " - GPS coordinates you voluntarily provide when using the Auto-Detect feature or submitting a sighting report. Location is not stored continuously; it is used only at the moment of calculation or report submission.",
    collect3_1: " - Observation time, GPS coordinates, sighting result (Seen / Not Seen), and optional notes that you submit voluntarily.",
    collect4_1: " - Anonymised event telemetry via Sentry (error reports, page performance metrics). No personally identifiable information is attached.",
    collect5_1: " - Temporarily logged by Upstash Redis for rate-limiting submitted sighting reports (sliding window, 5 requests/minute). Not stored permanently.",
    collect1_str: "Account information",
    collect2_str: "Location data",
    collect3_str: "Sighting reports",
    collect4_str: "Usage data",
    collect5_str: "IP address",
    h2: "2. How We Use Your Data",
    use1: "To provide crescent visibility predictions for your location.",
    use2: "To store and display your voluntary crescent sighting reports on the public map.",
    use3: "To authenticate and manage your account securely via Clerk.",
    use4: "To prevent abuse via IP-based rate limiting (Upstash Redis).",
    use5: "To diagnose application errors and improve performance (Sentry).",
    p2: "We do ",
    p2_not: "not",
    p2_2: " sell your data, use it for advertising, or share it with third parties beyond the sub-processors listed below.",
    h3: "3. Third-Party Sub-Processors",
    svc: "Service",
    purpose: "Purpose",
    data: "Data Shared",
    c1: "User authentication",
    c2: "Name, email, session tokens",
    u1: "Rate limiting",
    u2: "IP address (temporary)",
    s1: "Error monitoring",
    s2: "Anonymised error events",
    o1: "Weather / cloud data",
    o2: "Latitude & longitude only",
    v1: "Hosting & CDN",
    v2: "Request logs (standard)",
    h4: "4. Cookies",
    cookie1: "Hilal Vision uses only functional cookies - specifically the Clerk authentication session cookie required to keep you signed in. We do not use tracking or advertising cookies. Blocking cookies will prevent sign-in but will not affect astronomical calculations, which are fully client-side and require no account.",
    cookie2: "If you access Hilal Vision from the European Union, the UK, or another jurisdiction that requires cookie consent, we will request your explicit consent before setting any cookies beyond strictly necessary ones.",
    h5: "5. Data Retention",
    ret1: " - Retained until you delete your account via Clerk.",
    ret2: " - Retained indefinitely as part of the public scientific dataset. Reports you submit are attributed to your account and visible on the map.",
    ret3: " - IP entries expire automatically after 60 seconds.",
    ret4: " - Retained for 30 days by Sentry.",
    ret1_str: "Account data",
    ret2_str: "Sighting reports",
    ret3_str: "Rate-limit records",
    ret4_str: "Error logs",
    h6: "6. Your Rights",
    right_intro: "Depending on your jurisdiction (GDPR, UK DPA 2018, CCPA, etc.), you may have rights to:",
    right1: "Access the personal data we hold about you.",
    right2: "Correct inaccurate data.",
    right3: "Request deletion of your account and associated data.",
    right4: "Export your sighting reports.",
    right5: "Object to or restrict processing.",
    right_outro1: "To exercise any of these rights, contact ",
    right_outro2: ". We will respond within 30 days.",
    h7: "7. Children",
    child: "Hilal Vision is not directed at children under 13. We do not knowingly collect personal data from children. If you believe a child has submitted data, contact us immediately.",
    h8: "8. Changes to This Policy",
    changes: "We may update this policy from time to time. The \"Last updated\" date at the top of this page reflects the most recent revision. Significant changes will be announced via an in-app notification.",
    footer_title: "Privacy questions?",
    footer_email: "Email ",
    footer_alsoSee: " - Also see our ",
    footer_terms: "Terms of Service"
};

en.about = {
    title: "About",
    description: "About Hilal Vision - a precision astronomical platform for predicting Islamic crescent moon sightings worldwide using Yallop & Odeh criteria.",
    header: "About Hilal Vision",
    subtitle: "Mission, tools, technology & attributions",
    hero_ar: "رؤية الهلال - About Hilal Vision",
    hero_title1: "Bridging Ancient Tradition",
    hero_title2: "with Modern Astronomy",
    hero_p1: "Hilal Vision is a precision astronomical web platform dedicated to predicting and visualising Islamic crescent moon (",
    hero_artext: "هلال",
    hero_p2: ") sightings worldwide. It is built for the 1.8 billion Muslims who rely on the lunar calendar for religious observances, and for the astronomers and scholars who study it.",
    mission: "Our Mission",
    m1: "The Islamic lunar calendar is one of humanity's oldest scientific traditions - the beginning of each sacred month has been determined by the physical sighting of the new crescent moon for over 1,400 years. Yet in the modern world, this practice is fragmented: different countries announce the start of Ramadan on different days, and communities lack transparent, data-driven tools to understand why.",
    m2: "Hilal Vision exists to answer one question with the precision it deserves: ",
    m2_bold: "\"Will the new crescent moon be visible tonight from my location - and why?\"",
    m3_1: "We implement the internationally recognised ",
    m3_y: "Yallop (1997)",
    m3_2: " and ",
    m3_o: "Odeh (2004)",
    m3_3: " visibility criteria - the same standards used by Islamic calendar authorities in the UK, Malaysia, and the international astronomical community - and present the results with the visual clarity and interactivity that a 21st-century audience expects.",
    m4: "This platform is not a religious authority. It is a scientific instrument. It presents mathematical predictions, historical data, and comparative calendrical analysis side-by-side, empowering individuals and communities to engage critically and transparently with Islamic timekeeping.",
    who: "Who Is It For?",
    w1_t: "Muslim Communities",
    w1_d: "Get a clear, location-specific prediction for crescent visibility before Ramadan, Eid, and every new Hijri month - without jargon.",
    w2_t: "Astronomers & Researchers",
    w2_d: "Access raw q-values, ARCV/DAZ parameters, Odeh V-values, and the full ICOP historical dataset for validation and research.",
    w3_t: "Islamic Calendar Scholars",
    w3_d: "Compare Astronomical, Umm al-Qura, and Tabular Hijri calendars side-by-side. Understand exactly where and why civic calendars diverge from physical astronomy.",
    tools: "Platform Tools",
    t_desc: "Six dedicated tools, each engineered for a specific aspect of lunar astronomy.",
    tool1: "3D Globe & Visibility Map",
    tool1_d: "Interactive WebGL globe and 2D Leaflet map showing crescent visibility zones worldwide using Yallop q-values. Includes real-time cloud cover overlay and Best-Time-to-Observe calculator.",
    tool2: "Moon Phase Dashboard",
    tool2_d: "Current lunar phase, illumination, age, Sun & Moon altitude chart, 30-day phase calendar strip, and Yallop/Danjon methodology charts.",
    tool3: "Hijri Calendar",
    tool3_d: "Triple-engine calendar supporting Astronomical (astronomy-engine), Umm al-Qura (KACST), and Tabular algorithms. Includes a 'Compare to Heavens' divergence overlay.",
    tool4: "Horizon View",
    tool4_d: "Local horizon simulator showing the crescent moon's position relative to the setting sun, with ARCV and DAZ annotations.",
    tool5: "ICOP Archive",
    tool5_d: "1,000+ authentic historical crescent sighting records from the Islamic Crescents' Observation Project (ICOP), spanning 1438–1465 AH.",
    tech: "Technology",
    tech_d: "Built with modern web technologies for performance, accuracy, and global reach.",
    meth_title: "Deep Dive: Scientific Methodology",
    meth_d: "Read the full technical documentation - Yallop and Odeh criteria derivations, triple-engine Hijri calendar algorithms, the Best-Time-to-Observe scoring function, atmospheric refraction physics, and ICOP data sourcing.",
    meth_btn: "Read Methodology",
    comp: "How We Compare",
    comp_d: "No competitor combines all of: 3D globe, weather overlay, real ICOP data, and a Best-Time-to-Observe engine. Hilal Vision uniquely owns this combination.",
    comp_t1: "Feature",
    comp_f1: "3D Interactive Globe",
    comp_f2: "2D Visibility Map",
    comp_f3: "Weather / Cloud Overlay",
    comp_f4: "Best-Time Calculator",
    comp_f5: "Real ICOP Sighting Data",
    comp_f6: "Crowdsourced Reports",
    comp_f7: "Triple-Engine Hijri Cal.",
    comp_f8: "Scientific Detail (q/V)",
    comp_f9: "Mobile App",
    comp_f10: "Push Notifications",
    comp_f11: "Photo Sightings",
    comp_f12: "AR Moon Finder",
    comp_f13: "Multi-Language",
    comp_f14: "Animated Timeline",
    comp_soon: "Coming Soon",
    comp_footer: "Table reflects publicly available features as of February 2026. ✓ = available, - = not available.",
    credit: "Data Sources & Attributions",
    credit_d: "Hilal Vision stands on the shoulders of decades of peer-reviewed astronomical research.",
    cr1_t: "Yallop (1997) Criterion",
    cr1_d: "B.D. Yallop, HM Nautical Almanac Office - foundational q-value crescent visibility formula.",
    cr2_t: "Odeh (2004) Criterion",
    cr2_d: "Mohammad Odeh - V-value refinement trained on 737 ICOP sighting observations.",
    cr3_t: "Islamic Crescents' Observation Project (ICOP)",
    cr3_d: "International Astronomical Center - over 1,000 historical crescent sighting records used in the Archive.",
    cr4_t: "astronomy-engine by Don Cross",
    cr4_d: "High-precision VSOP87/ELP2000 planetary and lunar position library for JavaScript.",
    cr5_t: "Umm al-Qura Calendar (@umalqura/core)",
    cr5_d: "KACST pre-computed tables for the official Saudi Arabian civic Hijri calendar.",
    cr6_t: "Open-Meteo",
    cr6_d: "Free, open-source weather API providing real-time cloud cover data.",
    lic: "Proprietary Software",
    lic_d: "Hilal Vision is proprietary software. All rights are reserved. The source code is closed-source and protected by copyright law.",
    lic_btn: "View on GitHub",
    contact_t: "Contact & Feedback",
    contact_d: "Found a bug, have a question about the methodology, or want to contribute sighting data? We welcome feedback from the astronomical and Islamic community.",
    cprivacy: "Privacy Policy",
    cterms: "Terms of Service"
};

en.moon = en.moon || {};
Object.assign(en.moon, {
    title: "Moon Phase Dashboard",
    subtitle: "Real-time lunar tracking and daily phase analysis",
    moonPhaseStatus: "Moon Phase Status",
    illuminated: "Illuminated",
    age: "Age",
    days: "days",
    distance: "Distance",
    km: "km",
    altitudeChart: "Sun & Moon Altitude",
    altitudeDesc: "relative to horizon today",
    physicsData: "Physics & Positional Data",
    phasePhysics: "Phase & Physics",
    orbitalPosition: "Orbital Position",
    azimuth: "Azimuth",
    altitude: "Altitude",
    elongation: "Elongation"
});

const translate = (sourceObj, arOverrides, urOverrides) => {
    const arOut = JSON.parse(JSON.stringify(sourceObj));
    const urOut = JSON.parse(JSON.stringify(sourceObj));
    Object.assign(arOut, arOverrides);
    Object.assign(urOut, urOverrides);
    return { ar: arOut, ur: urOut };
};

const moonTrans = translate(en.moon, {
    title: "لوحة تحكم طور القمر",
    subtitle: "تتبع قمري في الوقت الفعلي وتحليل الطور اليومي",
    moonPhaseStatus: "حالة طور القمر",
    illuminated: "النسبة المضاءة",
    age: "العمر",
    days: "يوم",
    distance: "المسافة",
    km: "كم",
    altitudeChart: "ارتفاع الشمس والقمر",
    altitudeDesc: "بالنسبة للأفق اليوم",
    physicsData: "بيانات الفيزياء والموقع",
    phasePhysics: "الطور والفيزياء",
    orbitalPosition: "الموقع المداري",
    azimuth: "السمت",
    altitude: "الارتفاع",
    elongation: "الاستطالة"
}, {
    title: "چاند کے مرحلے کا ڈیش بورڈ",
    subtitle: "چاند کی ریئل ٹائم ٹریکنگ اور روزانہ مرحلے کا تجزیہ",
    moonPhaseStatus: "چاند کے مرحلے کی حیثیت",
    illuminated: "روشن",
    age: "عمر",
    days: "دن",
    distance: "فاصلہ",
    km: "کلومیٹر",
    altitudeChart: "سورج اور چاند کی اونچائی",
    altitudeDesc: "آج افق کے لحاظ سے",
    physicsData: "طبیعیات اور پوزیشن کا ڈیٹا",
    phasePhysics: "مرحلہ اور طبیعیات",
    orbitalPosition: "مداری پوزیشن",
    azimuth: "سمت",
    altitude: "اونچائی",
    elongation: "تطویل"
});
ar.moon = moonTrans.ar;
ur.moon = moonTrans.ur;

const termsTrans = translate(en.terms, {
    title: "شروط الخدمة",
    lastUpdated: "آخر تحديث: {{date}}",
    h1: "1. قبول الشروط",
    h2: "2. الخدمة",
    h3: "3. الاستخدام المقبول",
    h4: "4. المحتوى الذي ينشئه المستخدم",
    h5: "5. الحسابات والأمان",
    h6: "6. الملكية الفكرية",
    h7: "7. إخلاء المسؤولية عن الضمانات",
    h8: "8. خدمات الطرف الثالث",
    h9: "9. التعديلات على الشروط",
    h10: "10. القانون الحاكم",
    footer_title: "أسئلة قانونية؟",
    footer_alsoSee: " - راجع أيضاً "
}, {
    title: "سروس کی شرائط",
    lastUpdated: "آخری اپ ڈیٹ: {{date}}",
    h1: "1. شرائط کی قبولیت",
    h2: "2. سروس",
    h3: "3. قابل قبول استعمال",
    h4: "4. صارف کا تیار کردہ مواد",
    h5: "5. اکاؤنٹس اور سیکیورٹی",
    h6: "6. دانشورانہ املاک",
    h7: "7. وارنٹی اور ذمہ داری سے دستبرداری",
    h8: "8. فریق ثالث کی خدمات",
    h9: "9. شرائط میں ترامیم",
    h10: "10. گورننگ قانون",
    footer_title: "قانونی سوالات؟",
    footer_alsoSee: " - یہ بھی دیکھیں "
});
ar.terms = termsTrans.ar;
ur.terms = termsTrans.ur;

const privacyTrans = translate(en.privacy, {
    title: "سياسة الخصوصية",
    lastUpdated: "آخر تحديث: {{date}}",
    h1: "1. البيانات التي نجمعها",
    h2: "2. كيف نستخدم بياناتك",
    h3: "3. المعالجون الفرعيون من أطراف ثالثة",
    h4: "4. ملفات تعريف الارتباط (Cookies)",
    h5: "5. الاحتفاظ بالبيانات",
    h6: "6. حقوقك",
    h7: "7. الأطفال",
    h8: "8. التغييرات على هذه السياسة",
    footer_title: "أسئلة حول الخصوصية؟",
    footer_alsoSee: " - راجع أيضاً "
}, {
    title: "رازداری کی پالیسی",
    lastUpdated: "آخری اپ ڈیٹ: {{date}}",
    h1: "1. ڈیٹا جو ہم جمع کرتے ہیں",
    h2: "2. ہم آپ کا ڈیٹا کیسے استعمال کرتے ہیں",
    h3: "3. تھرڈ پارٹی سب پروسیسرز",
    h4: "4. کوکیز",
    h5: "5. ڈیٹا کو برقرار رکھنا",
    h6: "6. آپ کے حقوق",
    h7: "7. بچّے",
    h8: "8. اس پالیسی میں تبدیلیاں",
    footer_title: "رازداری کے سوالات؟",
    footer_alsoSee: " - یہ بھی دیکھیں "
});
ar.privacy = privacyTrans.ar;
ur.privacy = privacyTrans.ur;

const aboutTrans = translate(en.about, {
    title: "حول النظام",
    header: "حول هلال فيجن",
    mission: "مهمتنا",
    who: "لمن هذا الموقع؟",
    tools: "أدوات المنصة",
    tech: "التكنولوجيا الأساسية",
    meth_title: "تعمق: المنهجية العلمية",
    comp: "كيف نقارن",
    credit: "مصادر البيانات والاعتمادات",
    lic: "برمجيات احتكارية",
    contact_t: "التواصل والتعليقات"
}, {
    title: "کے بارے میں",
    header: "ہلال ویژن کے بارے میں",
    mission: "ہمارا مشن",
    who: "یہ کس کے لیے ہے؟",
    tools: "پلیٹ فارم ٹولز",
    tech: "ٹیکنالوجی",
    meth_title: "سائنسی طریقہ کار",
    comp: "ہم کیسے موازنہ کرتے ہیں",
    credit: "ڈیٹا کے ذرائع اور انتساب",
    lic: "ملکیتی سافٹ ویئر",
    contact_t: "رابطہ اور تاثرات"
});
ar.about = aboutTrans.ar;
ur.about = aboutTrans.ur;

fs.writeFileSync(enPath, JSON.stringify(en, null, 4));
fs.writeFileSync(arPath, JSON.stringify(ar, null, 4));
fs.writeFileSync(urPath, JSON.stringify(ur, null, 4));

console.log('Translations merged successfully!');
