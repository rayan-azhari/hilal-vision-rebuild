"use client";

import { useState, useMemo, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
    gregorianToHijri,
    hijriToGregorian,
    HIJRI_MONTHS,
    getMoonPhaseInfo,
    gregorianToJD,
    jdToHijri,
    getUmmAlQuraHijri,
    getUmmAlQuraDaysInMonth,
    getUmmAlQuraMonthStart,
} from "@hilal/astronomy";
import { type HijriDate } from "@hilal/types";
import { IslamicCountdown } from "@/components/IslamicCountdown";
import { CrescentCountryList } from "@/components/CrescentCountryList";

const ISLAMIC_EVENTS: Array<{ month: number; day: number; key: string; nameAr: string; type: "major" | "minor" }> = [
    { month: 1, day: 1, key: "islamicNewYear", nameAr: "رأس السنة الهجرية", type: "major" },
    { month: 1, day: 10, key: "dayOfAshura", nameAr: "يوم عاشوراء", type: "major" },
    { month: 3, day: 12, key: "mawlidAlNabi", nameAr: "المولد النبوي", type: "major" },
    { month: 7, day: 27, key: "laylatAlMiraj", nameAr: "ليلة المعراج", type: "minor" },
    { month: 8, day: 15, key: "laylatAlBaraA", nameAr: "ليلة البراءة", type: "minor" },
    { month: 9, day: 1, key: "ramadanBegins", nameAr: "بداية رمضان", type: "major" },
    { month: 9, day: 27, key: "laylatAlQadr", nameAr: "ليلة القدر", type: "major" },
    { month: 10, day: 1, key: "eidAlFitr", nameAr: "عيد الفطر", type: "major" },
    { month: 12, day: 9, key: "dayOfArafah", nameAr: "يوم عرفة", type: "major" },
    { month: 12, day: 10, key: "eidAlAdha", nameAr: "عيد الأضحى", type: "major" },
];

function getTabularDaysInMonth(year: number, month: number): number {
    const leapYears = [2, 5, 7, 10, 13, 15, 18, 21, 24, 26, 29];
    if (month === 12 && leapYears.includes(year % 30)) return 30;
    return month % 2 === 1 ? 30 : 29;
}

function getAstronomicalDaysInMonth(year: number, month: number): number {
    const start = hijriToGregorian(year, month, 1);
    let ny = year, nm = month + 1;
    if (nm > 12) { nm = 1; ny++; }
    const nextStart = hijriToGregorian(ny, nm, 1);
    return Math.round((nextStart.getTime() - start.getTime()) / (24 * 3600 * 1000));
}

function getTabularHijri(greg: Date): HijriDate {
    // Use noon to avoid timezone shift issues across the Julian Date boundary
    const jd = gregorianToJD(greg.getFullYear(), greg.getMonth() + 1, greg.getDate() + 0.5);
    const result = jdToHijri(jd);
    const monthInfo = HIJRI_MONTHS[result.month - 1] || HIJRI_MONTHS[0];
    return {
        year: result.year,
        month: result.month,
        day: result.day,
        monthName: monthInfo.en,
        monthNameArabic: monthInfo.ar,
        monthNameShort: monthInfo.short,
    };
}

function getTabularMonthStart(year: number, month: number): Date {
    const guess = hijriToGregorian(year, month, 1);
    for (let i = -5; i <= 5; i++) {
        const d = new Date(guess.getFullYear(), guess.getMonth(), guess.getDate() + i);
        const tab = getTabularHijri(d);
        if (tab.year === year && tab.month === month && tab.day === 1) return d;
    }
    return guess; // Fallback
}

type CalendarSystem = "astronomical" | "tabular" | "ummalqura";

export default function CalendarPage() {
    const today = useMemo(() => new Date(new Date().setHours(12, 0, 0, 0)), []);

    const [calendarSystem, setCalendarSystem] = useState<CalendarSystem>("ummalqura");
    const [viewYear, setViewYear] = useState(() => gregorianToHijri(today).year);
    const [viewMonth, setViewMonth] = useState(() => gregorianToHijri(today).month);
    const [selectedDay, setSelectedDay] = useState<number | null>(() => gregorianToHijri(today).day);

    // Sync today's view when calendar system changes
    useEffect(() => {
        let newToday: HijriDate;
        if (calendarSystem === "astronomical") newToday = gregorianToHijri(today);
        else if (calendarSystem === "ummalqura") newToday = getUmmAlQuraHijri(today);
        else newToday = getTabularHijri(today);

        setViewYear(newToday.year);
        setViewMonth(newToday.month);
        setSelectedDay(newToday.day);
    }, [calendarSystem, today]);

    const monthInfo = HIJRI_MONTHS[viewMonth - 1] || HIJRI_MONTHS[0];

    const daysInMonth = useMemo(() => {
        if (calendarSystem === "astronomical") return getAstronomicalDaysInMonth(viewYear, viewMonth);
        if (calendarSystem === "ummalqura") return getUmmAlQuraDaysInMonth(viewYear, viewMonth);
        return getTabularDaysInMonth(viewYear, viewMonth);
    }, [calendarSystem, viewYear, viewMonth]);

    const monthStart = useMemo(() => {
        if (calendarSystem === "astronomical") return hijriToGregorian(viewYear, viewMonth, 1);
        if (calendarSystem === "ummalqura") return getUmmAlQuraMonthStart(viewYear, viewMonth);
        return getTabularMonthStart(viewYear, viewMonth);
    }, [calendarSystem, viewYear, viewMonth]);

    const startDow = monthStart.getDay();
    const monthEvents = ISLAMIC_EVENTS.filter(e => e.month === viewMonth);

    const calendarDays = useMemo(() => {
        const cells: Array<{ day: number | null; greg: Date | null; phase: number; differs?: boolean; otherDay?: number }> = [];
        for (let i = 0; i < startDow; i++) cells.push({ day: null, greg: null, phase: 0 });

        for (let d = 1; d <= daysInMonth; d++) {
            const greg = new Date(monthStart.getFullYear(), monthStart.getMonth(), monthStart.getDate() + d - 1, 12, 0, 0);
            const illum = getMoonPhaseInfo(greg);

            cells.push({ day: d, greg, phase: illum.phase });
        }
        return cells;
    }, [daysInMonth, startDow, monthStart]);

    const prevMonth = () => {
        if (viewMonth === 1) { setViewMonth(12); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
        setSelectedDay(null);
    };
    const nextMonth = () => {
        if (viewMonth === 12) { setViewMonth(1); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
        setSelectedDay(null);
    };

    const selectedGreg = useMemo(() => {
        if (!selectedDay) return null;
        return new Date(monthStart.getFullYear(), monthStart.getMonth(), monthStart.getDate() + selectedDay - 1, 12, 0, 0);
    }, [selectedDay, monthStart]);

    const selectedHijri = useMemo(() => {
        if (!selectedGreg) return null;
        if (calendarSystem === "astronomical") return gregorianToHijri(selectedGreg);
        if (calendarSystem === "ummalqura") return getUmmAlQuraHijri(selectedGreg);
        return getTabularHijri(selectedGreg);
    }, [selectedGreg, calendarSystem]);

    const selectedMoon = selectedGreg ? getMoonPhaseInfo(selectedGreg) : null;
    const selectedEvent = selectedDay ? monthEvents.find(e => e.day === selectedDay) : null;

    function MiniMoon({ phase }: { phase: number }) {
        const r = 5; const cx = 6; const cy = 6;
        const isWaxing = phase <= 0.5;
        const k = phase * 2;
        const rx = Math.abs(r * Math.cos(Math.PI * k));
        const baseSweep = isWaxing ? 1 : 0;
        let termSweep;
        if (phase <= 0.25) termSweep = 0;
        else if (phase <= 0.5) termSweep = 1;
        else if (phase <= 0.75) termSweep = 0;
        else termSweep = 1;

        const litPath = `M ${cx} ${cy - r} A ${r} ${r} 0 0 ${baseSweep} ${cx} ${cy + r} A ${rx} ${r} 0 0 ${termSweep} ${cx} ${cy - r} Z`;
        return (
            <svg viewBox="0 0 12 12" width={10} height={10} className="inline-block">
                <circle cx={cx} cy={cy} r={r} fill="oklch(0.14 0.022 265)" />
                <path d={litPath} fill="#C1A87D" opacity="0.8" />
            </svg>
        );
    }

    const todayDisplay = useMemo(() => {
        if (calendarSystem === "astronomical") return gregorianToHijri(today);
        if (calendarSystem === "ummalqura") return getUmmAlQuraHijri(today);
        return getTabularHijri(today);
    }, [calendarSystem, today]);

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-1 container pt-24 pb-8 max-w-7xl mx-auto px-4 border-l border-r border-border/20">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 relative">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-[#C1A87D]/5 rounded-full blur-[60px] pointer-events-none -translate-x-12 -translate-y-12" />
                    <div className="z-10 relative">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-foreground/5 border border-border/40 text-xs font-medium text-muted-foreground mb-4">
                            <Calendar className="w-3.5 h-3.5 text-[#C1A87D]" />
                            <span>Synchronized Ephemeris</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-display font-medium tracking-tight mb-3">
                            Hijri <span className="text-muted-foreground italic">Calendar</span>
                        </h1>
                        <p className="text-muted-foreground max-w-xl text-lg leading-relaxed">
                            Astronomical, Tabular, and Umm al-Qura predictions for {monthInfo?.en} {viewYear} AH.
                        </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <div className="flex flex-wrap items-center mt-2 lg:mt-0 gap-1 bg-foreground/5 p-1 rounded-xl border border-border/20">
                            <button
                                onClick={() => setCalendarSystem("astronomical")}
                                className={`text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${calendarSystem === "astronomical"
                                    ? "bg-[#C1A87D]/20 text-[#C1A87D]"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                Astronomical
                            </button>
                            <button
                                onClick={() => setCalendarSystem("ummalqura")}
                                className={`text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors ${calendarSystem === "ummalqura"
                                    ? "bg-[#C1A87D]/20 text-[#C1A87D]"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                Umm al-Qura
                            </button>
                            <button
                                onClick={() => setCalendarSystem("tabular")}
                                className={`text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${calendarSystem === "tabular"
                                    ? "bg-[#C1A87D]/20 text-[#C1A87D]"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                Tabular
                            </button>
                        </div>
                        <button
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors hover:opacity-80 border border-[#C1A87D]/20 text-[#C1A87D] bg-[#C1A87D]/10"
                            title={`Download ${viewYear} AH Hijri calendar as .ics`}
                        >
                            <Download className="w-3 h-3" />
                            Add to Calendar
                        </button>
                    </div>
                </div>

                <IslamicCountdown />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="breezy-card lg:col-span-2 overflow-hidden animate-breezy-enter p-0 pb-2">
                        <div
                            className="flex flex-row items-center justify-between px-6 py-4 border-b border-[#C1A87D]/10"
                        >
                            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                                <ChevronLeft className="w-5 h-5 text-[#C1A87D]/50" />
                            </button>

                            <div className="text-center">
                                <div
                                    className="text-xl font-bold flex items-center gap-2 justify-center font-display text-foreground"
                                >
                                    {monthInfo?.en}
                                    <span className="text-[0.6rem] px-1.5 py-0.5 rounded flex-shrink-0 border border-border bg-foreground/5 font-sans">
                                        {viewYear} AH
                                    </span>
                                </div>
                                <div className="text-sm font-arabic mt-0.5 text-[#C1A87D]">
                                    {monthInfo?.ar}
                                </div>
                            </div>

                            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                                <ChevronRight className="w-5 h-5 text-[#C1A87D]/50" />
                            </button>
                        </div>

                        <div className="grid grid-cols-7 px-4 pt-3">
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                                <div key={d} className="text-center py-2 text-xs font-medium text-muted-foreground">
                                    {d}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-0.5 px-4 pb-4">
                            {calendarDays.map((cell, i) => {
                                if (!cell.day) return <div key={i} />;

                                const isToday = cell.greg?.toDateString() === today.toDateString();
                                const isSelected = cell.day === selectedDay;
                                const hasEvent = monthEvents.some(e => e.day === cell.day);
                                const isFriday = cell.greg?.getDay() === 5;

                                return (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedDay(cell.day)}
                                        className="relative flex flex-col items-center py-2 rounded-xl transition-all duration-150 group"
                                        style={{
                                            background: isSelected
                                                ? "color-mix(in oklch, #C1A87D 15%, transparent)"
                                                : isToday
                                                    ? "color-mix(in oklch, #C1A87D 8%, transparent)"
                                                    : "transparent",
                                            border: isSelected
                                                ? "1px solid color-mix(in oklch, #C1A87D 40%, transparent)"
                                                : isToday
                                                    ? "1px solid color-mix(in oklch, #C1A87D 20%, transparent)"
                                                    : "1px solid transparent",
                                        }}
                                    >
                                        <span
                                            className="text-sm font-medium"
                                            style={{
                                                color: isSelected ? "#C1A87D" : isToday ? "#C1A87D" : isFriday ? "#60a5fa" : "var(--foreground)",
                                            }}
                                        >
                                            {cell.day}
                                        </span>
                                        <span className="text-xs text-muted-foreground" style={{ fontSize: "0.6rem" }}>
                                            {cell.greg?.getDate()}
                                        </span>
                                        <div className="flex items-center gap-0.5 mt-0.5">
                                            <MiniMoon phase={cell.phase} />
                                            {hasEvent && (
                                                <div className="w-1 h-1 rounded-full bg-[#C1A87D]" />
                                            )}
                                        </div>
                                        {isToday && (
                                            <div className="absolute -bottom-1 w-1/3 h-0.5 rounded-full bg-[#C1A87D]" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {selectedDay && selectedGreg && selectedHijri && (
                            <div
                                className="breezy-card p-5 animate-breezy-enter"
                                style={{ animationDelay: "50ms" }}
                            >
                                <div className="text-xs mb-3 flex items-center justify-between text-muted-foreground">
                                    <span>Selected Day</span>
                                    <span className="text-[0.6rem] uppercase tracking-wide border border-border px-1.5 py-0.5 rounded bg-foreground/5">
                                        {calendarSystem === "astronomical" ? "Astronomical" : calendarSystem === "ummalqura" ? "Umm al-Qura" : "Tabular"}
                                    </span>
                                </div>
                                <div className="text-2xl font-bold mb-1 font-display text-[#C1A87D]">
                                    {selectedHijri.day} {selectedHijri.monthName}
                                </div>
                                <div className="text-base font-arabic mb-3 text-[#C1A87D]/80">
                                    {selectedHijri.day} {selectedHijri.monthNameArabic} {selectedHijri.year} هـ
                                </div>
                                <div className="text-sm text-foreground">
                                    {selectedGreg.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                                </div>
                                {selectedMoon && (() => {
                                    return (
                                        <div className="mt-3 pt-3 border-t border-[#C1A87D]/10">
                                            <div className="text-xs text-muted-foreground">
                                                {selectedMoon.phaseName} • {Math.round(selectedMoon.illuminatedFraction * 100)}% Illuminated
                                            </div>
                                        </div>
                                    );
                                })()}
                                {selectedEvent && (
                                    <div
                                        className="mt-3 p-3 rounded-xl border border-[#C1A87D]/20 bg-[#C1A87D]/10"
                                    >
                                        <div
                                            className="text-sm font-semibold text-[#C1A87D]"
                                        >
                                            ✦ {selectedEvent.nameAr}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div
                            className="breezy-card p-5 animate-breezy-enter"
                            style={{ animationDelay: "150ms" }}
                        >
                            <div className="text-xs font-medium mb-3 text-muted-foreground">Jump to Year</div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setViewYear(y => y - 1)}
                                    className="p-1.5 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 bg-foreground/5 text-[#C1A87D]/80"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <div className="flex-1 text-center">
                                    <span className="text-lg font-bold font-display text-[#C1A87D]">
                                        {viewYear}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setViewYear(y => y + 1)}
                                    className="p-1.5 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 bg-foreground/5 text-[#C1A87D]/80"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                            <button
                                onClick={() => { setViewYear(todayDisplay.year); setViewMonth(todayDisplay.month); setSelectedDay(todayDisplay.day); }}
                                className="w-full mt-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-[#C1A87D]/20 bg-[#C1A87D]/10 border border-[#C1A87D]/20 text-[#C1A87D]"
                            >
                                Go to Today
                            </button>
                        </div>

                        <CrescentCountryList viewYear={viewYear} viewMonth={viewMonth} />
                    </div>
                </div>
            </main>
        </div>
    );
}
