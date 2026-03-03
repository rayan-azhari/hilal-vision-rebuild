const fs = require('fs');
const path = require('path');

const enPath = 'client/src/locales/en/common.json';
const arPath = 'client/src/locales/ar/common.json';
const urPath = 'client/src/locales/ur/common.json';

const en = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
const ar = JSON.parse(fs.readFileSync(arPath, 'utf-8'));
const ur = JSON.parse(fs.readFileSync(urPath, 'utf-8'));

// MoonPage exact keys from MoonPage.tsx
const moonEN = {
    now: "Now!",
    countdownFormat: "{{d}}d {{h}}h {{m}}m {{s}}s",
    titleName: "{{phase}} · {{illum}}% Illuminated - Hilal Vision",
    descriptionDesc: "Live lunar phase: {{phase}}, {{illum}}% illuminated, age {{age}} days. Track the moon's position, altitude, and upcoming crescent visibility.",
    dashboardTitle: "Moon Phase Dashboard",
    dashboardSubtitle: "Real-time lunar tracking and daily phase analysis",
    sunMoonAltitudeTracker: "Sun & Moon Altitude Tracker",
    theSkyDome: "The Sky Dome (Local)",
    ephemeris: "Ephemeris Data (Local)",
    sunrise: "Sunrise",
    sunset: "Sunset",
    moonrise: "Moonrise",
    moonset: "Moonset",
    illuminatedAndAge: "{{illum}}% Illuminated · {{age}} days old",
    throughLunarCycle: "{{percent}}% through lunar cycle",
    illumination: "Illumination",
    lunarAge: "Lunar Age",
    days: "days",
    phaseAngle: "Phase ∠ {{angle}}°",
    visibilityCity: "Visibility in {{city}}",
    zone: "Zone",
    yallopQ: "Yallop q = {{q}}",
    moonAltitude: "Moon Altitude",
    azimuth: "Azimuth {{az}}°",
    elongation: "Elongation",
    nextNewMoon: "Next New Moon",
    thirtyDayPhaseCalendar: "30-Day Phase Calendar"
};

const phasesEN = {
    newMoon: "New Moon",
    waxingCrescent: "Waxing Crescent",
    firstQuarter: "First Quarter",
    waxingGibbous: "Waxing Gibbous",
    fullMoon: "Full Moon",
    waningGibbous: "Waning Gibbous",
    thirdQuarter: "Third Quarter",
    waningCrescent: "Waning Crescent"
};

const moonAR = {
    now: "الآن!",
    countdownFormat: "{{d}}ي {{h}}س {{m}}د {{s}}ث",
    titleName: "{{phase}} · نوره {{illum}}% - هلال فيجن",
    descriptionDesc: "الطور الحالي: {{phase}}, إضاءة {{illum}}% , عمر {{age}} أيام. تتبع موقع القمر، الارتفاع، ورؤية الهلال.",
    dashboardTitle: "لوحة تتبع طور القمر",
    dashboardSubtitle: "تتبع قمري في الوقت الفعلي وتحليل الطور اليومي",
    sunMoonAltitudeTracker: "متتبع ارتفاع الشمس والقمر",
    theSkyDome: "قبة السماء (محلي)",
    ephemeris: "بيانات التقويم الفلكي",
    sunrise: "شروق الشمس",
    sunset: "غروب الشمس",
    moonrise: "شروق القمر",
    moonset: "غروب القمر",
    illuminatedAndAge: "{{illum}}% مضاء · عمره {{age}} أيام",
    throughLunarCycle: "{{percent}}% من الدورة القمرية",
    illumination: "نسبة الإضاءة",
    lunarAge: "عمر القمر",
    days: "يوم",
    phaseAngle: "الزاوية {{angle}}°",
    visibilityCity: "الرؤية في {{city}}",
    zone: "نطاق",
    yallopQ: "معيار يالوب q = {{q}}",
    moonAltitude: "ارتفاع القمر",
    azimuth: "السمت {{az}}°",
    elongation: "الاستطالة",
    nextNewMoon: "ولادة الهلال الجديد",
    thirtyDayPhaseCalendar: "تقويم الأطوار لمدة 30 يوماً"
};

const phasesAR = {
    newMoon: "محاق",
    waxingCrescent: "هلال متزايد",
    firstQuarter: "تربيع أول",
    waxingGibbous: "أحدب متزايد",
    fullMoon: "بدر",
    waningGibbous: "أحدب متناقص",
    thirdQuarter: "تربيع أخير",
    waningCrescent: "هلال متناقص"
};

const moonUR = {
    now: "ابھی!",
    countdownFormat: "{{d}}د {{h}}گھ {{m}}م {{s}}س",
    titleName: "{{phase}} · روشنی {{illum}}% - ہلال ویژن",
    descriptionDesc: "موجودہ مرحلہ: {{phase}}, روشنی {{illum}}%, عمر {{age}} دن۔ چاند کی پوزیشن، اونچائی، اور رویت کو ٹریک کریں۔",
    dashboardTitle: "چاند کے مرحلے کا ڈیش بورڈ",
    dashboardSubtitle: "ریئل ٹائم ٹریکنگ اور روزانہ تجزیہ",
    sunMoonAltitudeTracker: "سورج اور چاند کی اونچائی",
    theSkyDome: "آسمانی گنبد (مقامی)",
    ephemeris: "فلکیاتی ڈیٹا",
    sunrise: "طلوع آفتاب",
    sunset: "غروب آفتاب",
    moonrise: "طلوع قمر",
    moonset: "غروب قمر",
    illuminatedAndAge: "{{illum}}% روشن · عمر {{age}} دن",
    throughLunarCycle: "قمری چکر کا {{percent}}%",
    illumination: "روشنی کی مقدار",
    lunarAge: "چاند کی عمر",
    days: "دن",
    phaseAngle: "زاویہ {{angle}}°",
    visibilityCity: "{{city}} میں رویت",
    zone: "زون",
    yallopQ: "یالوپ معیار q = {{q}}",
    moonAltitude: "چاند کی بلندی",
    azimuth: "سمت {{az}}°",
    elongation: "تطویل",
    nextNewMoon: "نیا چاند (ولادت)",
    thirtyDayPhaseCalendar: "30 دن کا کیلنڈر"
};

const phasesUR = {
    newMoon: "نیا چاند (محاق)",
    waxingCrescent: "بڑھتا ہوا ہلال",
    firstQuarter: "پہلی سہ ماہی",
    waxingGibbous: "بڑھتا ہوا کوبڑ دار",
    fullMoon: "پورا چاند (بدر)",
    waningGibbous: "گھٹتا ہوا کوبڑ دار",
    thirdQuarter: "آخری سہ ماہی",
    waningCrescent: "گھٹتا ہوا ہلال"
};

en.moonPage = moonEN;
en.phases = phasesEN;
ar.moonPage = moonAR;
ar.phases = phasesAR;
ur.moonPage = moonUR;
ur.phases = phasesUR;

fs.writeFileSync(enPath, JSON.stringify(en, null, 4));
fs.writeFileSync(arPath, JSON.stringify(ar, null, 4));
fs.writeFileSync(urPath, JSON.stringify(ur, null, 4));

console.log('MoonPage exact keys merged successfully!');
