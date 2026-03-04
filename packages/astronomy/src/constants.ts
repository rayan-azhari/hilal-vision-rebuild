import { VisibilityZone } from "@hilal/types";

export const SYNODIC_MS = 29.53058867 * 24 * 60 * 60 * 1000;

export const HIJRI_MONTHS = [
    { en: "Muharram", ar: "مُحَرَّم", short: "MUH" },
    { en: "Safar", ar: "صَفَر", short: "SFR" },
    { en: "Rabi al-Awwal", ar: "رَبِيع الأَوَّل", short: "RBA" },
    { en: "Rabi al-Thani", ar: "رَبِيع الثَّانِي", short: "RBT" },
    { en: "Jumada al-Ula", ar: "جُمَادَى الأُولَى", short: "JMO" },
    { en: "Jumada al-Akhira", ar: "جُمَادَى الآخِرَة", short: "JMT" },
    { en: "Rajab", ar: "رَجَب", short: "RJB" },
    { en: "Sha'ban", ar: "شَعْبَان", short: "SHB" },
    { en: "Ramadan", ar: "رَمَضَان", short: "RMD" },
    { en: "Shawwal", ar: "شَوَّال", short: "SHW" },
    { en: "Dhu al-Qi'dah", ar: "ذُو الْقَعْدَة", short: "ZQD" },
    { en: "Dhu al-Hijjah", ar: "ذُو الْحِجَّة", short: "ZHJ" },
];

export const VISIBILITY_LABELS: Record<VisibilityZone, { label: string; color: string; desc: string }> = {
    A: { label: "Easily Visible", color: "#4ade80", desc: "The moon is high and thick enough at sunset that seeing it with the naked eye is highly probable." },
    B: { label: "Visible", color: "#facc15", desc: "Sightings are possible with the naked eye, but usually require perfect weather conditions." },
    C: { label: "Optical Aid Helpful", color: "#fb923c", desc: "You will likely need binoculars or a telescope to find the moon initially." },
    D: { label: "Optical Aid Only", color: "#f87171", desc: "The moon is too faint or low; telescopes or binoculars are strictly required to see it." },
    E: { label: "Not Visible", color: "#6b7280", desc: "Slightly above the horizon, but below the threshold of human or optical visibility." },
    F: { label: "Below Horizon", color: "#374151", desc: "Moon sets before or simultaneously with the sun, or conjunction hasn't occurred yet." },
};

export const YALLOP_ZONE_LABELS: Record<VisibilityZone, { label: string; threshold: string; desc: string }> = {
    A: { label: "Easily Visible", threshold: "q ≥ +0.216", desc: "Crescent easily visible to the naked eye." },
    B: { label: "Visible", threshold: "q ≥ −0.014", desc: "Visible under perfect atmospheric conditions." },
    C: { label: "Optical Aid Helpful", threshold: "q ≥ −0.160", desc: "May need binoculars to locate the crescent initially." },
    D: { label: "Optical Aid Only", threshold: "q ≥ −0.232", desc: "Only visible through a telescope or binoculars." },
    E: { label: "Not Visible", threshold: "q < −0.232", desc: "Below the visibility threshold for any method." },
    F: { label: "Below Horizon", threshold: "—", desc: "Moon sets before the sun, or conjunction has not occurred." },
};

export const ODEH_ZONE_LABELS: Record<VisibilityZone, { label: string; threshold: string; desc: string }> = {
    A: { label: "Easily Visible", threshold: "V ≥ 5.65", desc: "Crescent easily visible to the naked eye." },
    B: { label: "Visible", threshold: "V ≥ 2.00", desc: "Visible under perfect atmospheric conditions." },
    C: { label: "Optical Aid May Help", threshold: "V ≥ −0.96", desc: "May need optical aid to sight the crescent." },
    D: { label: "Not Visible", threshold: "V < −0.96", desc: "Not visible even with optical aid." },
    E: { label: "Not Visible", threshold: "V < −0.96", desc: "Far below any visibility threshold." },
    F: { label: "Below Horizon", threshold: "—", desc: "Moon sets before the sun, or conjunction has not occurred." },
};

export const ZONE_RGB: Record<VisibilityZone, [number, number, number]> = {
    A: [74, 222, 128],
    B: [250, 204, 21],
    C: [251, 146, 60],
    D: [248, 113, 113],
    E: [107, 114, 128],
    F: [35, 51, 66],
};

export const HIGH_CONTRAST_ZONE_RGB: Record<VisibilityZone, [number, number, number]> = {
    A: [234, 240, 24],   /* Bright Yellow oklch(0.92 0.16 95) */
    B: [225, 120, 30],   /* Orange oklch(0.75 0.14 60) */
    C: [160, 60, 40],    /* Reddish Brown oklch(0.55 0.12 25) */
    D: [60, 40, 150],    /* Deep Blue/Purple oklch(0.35 0.10 280) */
    E: [20, 10, 60],     /* Very Dark Navy oklch(0.18 0.05 260) */
    F: [35, 51, 66],     /* Deep Navy background tone */
};

export const MAJOR_CITIES: Array<{ name: string; country: string; lat: number; lng: number }> = [
    { name: "Mecca", country: "Saudi Arabia", lat: 21.3891, lng: 39.8579 },
    { name: "Medina", country: "Saudi Arabia", lat: 24.5247, lng: 39.5692 },
    { name: "Riyadh", country: "Saudi Arabia", lat: 24.6877, lng: 46.7219 },
    { name: "Abu Dhabi", country: "UAE", lat: 24.4539, lng: 54.3773 },
    { name: "Dubai", country: "UAE", lat: 25.2048, lng: 55.2708 },
    { name: "Kuwait City", country: "Kuwait", lat: 29.3759, lng: 47.9774 },
    { name: "Doha", country: "Qatar", lat: 25.2854, lng: 51.5310 },
    { name: "Manama", country: "Bahrain", lat: 26.2285, lng: 50.5860 },
    { name: "Muscat", country: "Oman", lat: 23.5859, lng: 58.4059 },
    { name: "Sanaa", country: "Yemen", lat: 15.3694, lng: 44.1910 },
    { name: "Baghdad", country: "Iraq", lat: 33.3152, lng: 44.3661 },
    { name: "Tehran", country: "Iran", lat: 35.6892, lng: 51.3890 },
    { name: "Kabul", country: "Afghanistan", lat: 34.5553, lng: 69.2075 },
    { name: "Islamabad", country: "Pakistan", lat: 33.6844, lng: 73.0479 },
    { name: "Karachi", country: "Pakistan", lat: 24.8607, lng: 67.0011 },
    { name: "Lahore", country: "Pakistan", lat: 31.5204, lng: 74.3587 },
    { name: "New Delhi", country: "India", lat: 28.6139, lng: 77.2090 },
    { name: "Dhaka", country: "Bangladesh", lat: 23.8103, lng: 90.4125 },
    { name: "Male", country: "Maldives", lat: 4.1755, lng: 73.5093 },
    { name: "Colombo", country: "Sri Lanka", lat: 6.9271, lng: 79.8612 },
    { name: "Jakarta", country: "Indonesia", lat: -6.2088, lng: 106.8456 },
    { name: "Kuala Lumpur", country: "Malaysia", lat: 3.1390, lng: 101.6869 },
    { name: "Bandar Seri Begawan", country: "Brunei", lat: 4.9031, lng: 114.9398 },
    { name: "Singapore", country: "Singapore", lat: 1.3521, lng: 103.8198 },
    { name: "Bangkok", country: "Thailand", lat: 13.7563, lng: 100.5018 },
    { name: "Beijing", country: "China", lat: 39.9042, lng: 116.4074 },
    { name: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503 },
    { name: "Seoul", country: "South Korea", lat: 37.5665, lng: 126.9780 },
    { name: "Manila", country: "Philippines", lat: 14.5995, lng: 120.9842 },
    { name: "Canberra", country: "Australia", lat: -35.2809, lng: 149.1300 },
    { name: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093 },
    { name: "Wellington", country: "New Zealand", lat: -41.2865, lng: 174.7762 },
    { name: "Amman", country: "Jordan", lat: 31.9454, lng: 35.9284 },
    { name: "Damascus", country: "Syria", lat: 33.5138, lng: 36.2765 },
    { name: "Beirut", country: "Lebanon", lat: 33.8938, lng: 35.5018 },
    { name: "Jerusalem", country: "Palestine", lat: 31.7683, lng: 35.2137 },
    { name: "Ramallah", country: "Palestine", lat: 31.9038, lng: 35.2034 },
    { name: "Cairo", country: "Egypt", lat: 30.0444, lng: 31.2357 },
    { name: "Tripoli", country: "Libya", lat: 32.8872, lng: 13.1913 },
    { name: "Tunis", country: "Tunisia", lat: 36.8065, lng: 10.1815 },
    { name: "Algiers", country: "Algeria", lat: 36.7372, lng: 3.0868 },
    { name: "Rabat", country: "Morocco", lat: 34.0209, lng: -6.8416 },
    { name: "Casablanca", country: "Morocco", lat: 33.5731, lng: -7.5898 },
    { name: "Nouakchott", country: "Mauritania", lat: 18.0735, lng: -15.9582 },
    { name: "Khartoum", country: "Sudan", lat: 15.5007, lng: 32.5599 },
    { name: "Mogadishu", country: "Somalia", lat: 2.0469, lng: 45.3182 },
    { name: "Djibouti", country: "Djibouti", lat: 11.8251, lng: 42.5903 },
    { name: "Asmara", country: "Eritrea", lat: 15.3229, lng: 38.9251 },
    { name: "Addis Ababa", country: "Ethiopia", lat: 9.0222, lng: 38.7468 },
    { name: "Nairobi", country: "Kenya", lat: -1.2921, lng: 36.8219 },
    { name: "Kampala", country: "Uganda", lat: 0.3476, lng: 32.5825 },
    { name: "Dar es Salaam", country: "Tanzania", lat: -6.7924, lng: 39.2083 },
    { name: "Pretoria", country: "South Africa", lat: -25.7479, lng: 28.2293 },
    { name: "Abuja", country: "Nigeria", lat: 9.0579, lng: 7.4951 },
    { name: "Lagos", country: "Nigeria", lat: 6.5244, lng: 3.3792 },
    { name: "Accra", country: "Ghana", lat: 5.6037, lng: -0.1870 },
    { name: "Dakar", country: "Senegal", lat: 14.7167, lng: -17.4677 },
    { name: "Bamako", country: "Mali", lat: 12.6392, lng: -8.0029 },
    { name: "Niamey", country: "Niger", lat: 13.5116, lng: 2.1254 },
    { name: "N'Djamena", country: "Chad", lat: 12.1348, lng: 15.0557 },
    { name: "Istanbul", country: "Turkey", lat: 41.0082, lng: 28.9784 },
    { name: "Ankara", country: "Turkey", lat: 39.9334, lng: 32.8597 },
    { name: "Baku", country: "Azerbaijan", lat: 40.4093, lng: 49.8671 },
    { name: "Tashkent", country: "Uzbekistan", lat: 41.2995, lng: 69.2401 },
    { name: "Astana", country: "Kazakhstan", lat: 51.1694, lng: 71.4491 },
    { name: "Ashgabat", country: "Turkmenistan", lat: 37.9601, lng: 58.3261 },
    { name: "Dushanbe", country: "Tajikistan", lat: 38.5598, lng: 68.7870 },
    { name: "Bishkek", country: "Kyrgyzstan", lat: 42.8746, lng: 74.5698 },
    { name: "Moscow", country: "Russia", lat: 55.7558, lng: 37.6173 },
    { name: "London", country: "UK", lat: 51.5074, lng: -0.1278 },
    { name: "Paris", country: "France", lat: 48.8566, lng: 2.3522 },
    { name: "Berlin", country: "Germany", lat: 52.5200, lng: 13.4050 },
    { name: "Rome", country: "Italy", lat: 41.9028, lng: 12.4964 },
    { name: "Madrid", country: "Spain", lat: 40.4168, lng: -3.7038 },
    { name: "Athens", country: "Greece", lat: 37.9838, lng: 23.7275 },
    { name: "Sarajevo", country: "Bosnia & Herzegovina", lat: 43.8563, lng: 18.4131 },
    { name: "Washington, D.C.", country: "USA", lat: 38.8951, lng: -77.0364 },
    { name: "New York", country: "USA", lat: 40.7128, lng: -74.0060 },
    { name: "Los Angeles", country: "USA", lat: 34.0522, lng: -118.2437 },
    { name: "Ottawa", country: "Canada", lat: 45.4215, lng: -75.6972 },
    { name: "Toronto", country: "Canada", lat: 43.6532, lng: -79.3832 },
    { name: "Mexico City", country: "Mexico", lat: 19.4326, lng: -99.1332 },
    { name: "Brasilia", country: "Brazil", lat: -15.7975, lng: -47.8919 },
    { name: "Buenos Aires", country: "Argentina", lat: -34.6037, lng: -58.3816 },
    { name: "Santiago", country: "Chile", lat: -33.4489, lng: -70.6693 },
    { name: "Bogota", country: "Colombia", lat: 4.7110, lng: -74.0721 }
];
