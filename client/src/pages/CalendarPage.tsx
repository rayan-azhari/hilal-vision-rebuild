import { useState, useMemo, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import {
  gregorianToHijri,
  hijriToGregorian,
  HIJRI_MONTHS,
  getMoonPhaseInfo,
} from "@/lib/astronomy";

const ISLAMIC_EVENTS: Array<{ month: number; day: number; name: string; nameAr: string; type: "major" | "minor" }> = [
  { month: 1, day: 1, name: "Islamic New Year", nameAr: "رأس السنة الهجرية", type: "major" },
  { month: 1, day: 10, name: "Day of Ashura", nameAr: "يوم عاشوراء", type: "major" },
  { month: 3, day: 12, name: "Mawlid al-Nabi", nameAr: "المولد النبوي", type: "major" },
  { month: 7, day: 27, name: "Laylat al-Mi'raj", nameAr: "ليلة المعراج", type: "minor" },
  { month: 8, day: 15, name: "Laylat al-Bara'ah", nameAr: "ليلة البراءة", type: "minor" },
  { month: 9, day: 1, name: "Ramadan Begins", nameAr: "بداية رمضان", type: "major" },
  { month: 9, day: 27, name: "Laylat al-Qadr", nameAr: "ليلة القدر", type: "major" },
  { month: 10, day: 1, name: "Eid al-Fitr", nameAr: "عيد الفطر", type: "major" },
  { month: 12, day: 9, name: "Day of Arafah", nameAr: "يوم عرفة", type: "major" },
  { month: 12, day: 10, name: "Eid al-Adha", nameAr: "عيد الأضحى", type: "major" },
];

function getDaysInHijriMonth(year: number, month: number): number {
  // Approximate: odd months have 30 days, even have 29; last month of leap year has 30
  const leapYears = [2, 5, 7, 10, 13, 15, 18, 21, 24, 26, 29];
  if (month === 12 && leapYears.includes(year % 30)) return 30;
  return month % 2 === 1 ? 30 : 29;
}

function getHijriMonthStart(year: number, month: number): Date {
  return hijriToGregorian(year, month, 1);
}

export default function CalendarPage() {
  const today = new Date();
  const todayHijri = gregorianToHijri(today);

  const [viewYear, setViewYear] = useState(todayHijri.year);
  const [viewMonth, setViewMonth] = useState(todayHijri.month);
  const [selectedDay, setSelectedDay] = useState<number | null>(todayHijri.day);

  useEffect(() => {
    document.title = `Hijri Calendar \u2014 ${HIJRI_MONTHS[viewMonth - 1]?.en} ${viewYear} AH | Hilal Vision`;
  }, [viewMonth, viewYear]);

  const monthInfo = HIJRI_MONTHS[viewMonth - 1];
  const daysInMonth = getDaysInHijriMonth(viewYear, viewMonth);
  const monthStart = getHijriMonthStart(viewYear, viewMonth);

  // Day of week for month start (0=Sun)
  const startDow = monthStart.getDay();

  // Events this month
  const monthEvents = ISLAMIC_EVENTS.filter(e => e.month === viewMonth);

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const cells: Array<{ day: number | null; greg: Date | null; phase: number }> = [];
    // Leading empty cells
    for (let i = 0; i < startDow; i++) cells.push({ day: null, greg: null, phase: 0 });
    // Month days
    for (let d = 1; d <= daysInMonth; d++) {
      const greg = hijriToGregorian(viewYear, viewMonth, d);
      const illum = getMoonPhaseInfo(greg);
      cells.push({ day: d, greg, phase: illum.phase });
    }
    return cells;
  }, [viewYear, viewMonth, daysInMonth, startDow]);

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

  const selectedGreg = selectedDay ? hijriToGregorian(viewYear, viewMonth, selectedDay) : null;
  const selectedHijri = selectedGreg ? gregorianToHijri(selectedGreg) : null;
  const selectedMoon = selectedGreg ? getMoonPhaseInfo(selectedGreg) : null;
  const selectedEvent = selectedDay ? monthEvents.find(e => e.day === selectedDay) : null;

  // Phase mini moon
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
        <path d={litPath} fill="oklch(0.78 0.15 75)" opacity="0.8" />
      </svg>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--space)" }}>
      {/* Header */}
      <PageHeader
        icon={<Calendar />}
        title="Islamic Hijri Calendar"
        subtitle="Hijri ↔ Gregorian · Islamic events · Lunar phases"
      >
        <div className="text-right">
          <div className="text-sm font-medium" style={{ color: "var(--gold)" }}>
            {todayHijri.day} {todayHijri.monthName} {todayHijri.year} AH
          </div>
          <div className="text-xs font-arabic" style={{ color: "var(--gold-dim)" }}>
            {todayHijri.day} {todayHijri.monthNameArabic}
          </div>
        </div>
      </PageHeader>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Calendar */}
          <div className="breezy-card lg:col-span-2 overflow-hidden animate-breezy-enter p-0 pb-2">
            {/* Month navigation */}
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: "color-mix(in oklch, var(--gold) 10%, transparent)" }}
            >
              <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                <ChevronLeft className="w-5 h-5" style={{ color: "var(--gold-dim)" }} />
              </button>

              <div className="text-center">
                <div
                  className="text-xl font-bold"
                  style={{ fontFamily: "Cinzel, serif", color: "var(--foreground)" }}
                >
                  {monthInfo?.en}
                </div>
                <div className="text-sm font-arabic" style={{ color: "var(--gold)" }}>
                  {monthInfo?.ar}
                </div>
                <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  {viewYear} AH
                </div>
              </div>

              <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                <ChevronRight className="w-5 h-5" style={{ color: "var(--gold-dim)" }} />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 px-4 pt-3">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                <div key={d} className="text-center py-2 text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
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
                    className="relative flex flex-col items-center py-2 rounded-xl transition-all duration-150"
                    style={{
                      background: isSelected
                        ? "color-mix(in oklch, var(--gold) 15%, transparent)"
                        : isToday
                          ? "color-mix(in oklch, var(--gold) 8%, transparent)"
                          : "transparent",
                      border: isSelected
                        ? "1px solid color-mix(in oklch, var(--gold) 40%, transparent)"
                        : isToday
                          ? "1px solid color-mix(in oklch, var(--gold) 20%, transparent)"
                          : "1px solid transparent",
                    }}
                  >
                    <span
                      className="text-sm font-medium"
                      style={{
                        color: isSelected ? "var(--gold)" : isToday ? "var(--gold-glow)" : isFriday ? "#60a5fa" : "var(--foreground)",
                      }}
                    >
                      {cell.day}
                    </span>
                    <span className="text-xs" style={{ color: "var(--muted-foreground)", fontSize: "0.6rem" }}>
                      {cell.greg?.getDate()}
                    </span>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      <MiniMoon phase={cell.phase} />
                      {hasEvent && (
                        <div className="w-1 h-1 rounded-full" style={{ background: "var(--gold)" }} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Side panel */}
          <div className="space-y-4">
            {/* Selected day detail */}
            {selectedDay && selectedGreg && (
              <div
                className="breezy-card p-5 animate-breezy-enter"
                style={{ animationDelay: "50ms" }}
              >
                <div className="text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>Selected Day</div>
                <div className="text-2xl font-bold mb-1" style={{ fontFamily: "Cinzel, serif", color: "var(--gold)" }}>
                  {selectedDay} {monthInfo?.en}
                </div>
                <div className="text-base font-arabic mb-3" style={{ color: "var(--gold-dim)" }}>
                  {selectedDay} {monthInfo?.ar} {viewYear} هـ
                </div>
                <div className="text-sm" style={{ color: "var(--foreground)" }}>
                  {selectedGreg.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </div>
                {selectedMoon && (
                  <div className="mt-3 pt-3 border-t" style={{ borderColor: "color-mix(in oklch, var(--gold) 10%, transparent)" }}>
                    <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      Moon: {selectedMoon.phaseName} · {selectedMoon.illumination}% illuminated
                    </div>
                  </div>
                )}
                {selectedEvent && (
                  <div
                    className="mt-3 p-3 rounded-xl"
                    style={{
                      background: selectedEvent.type === "major"
                        ? "color-mix(in oklch, var(--gold) 10%, transparent)"
                        : "color-mix(in oklch, #60a5fa 10%, transparent)",
                      border: `1px solid color-mix(in oklch, ${selectedEvent.type === "major" ? "var(--gold)" : "#60a5fa"} 25%, transparent)`,
                    }}
                  >
                    <div
                      className="text-sm font-semibold"
                      style={{ color: selectedEvent.type === "major" ? "var(--gold)" : "#60a5fa" }}
                    >
                      ✦ {selectedEvent.name}
                    </div>
                    <div className="text-xs font-arabic mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                      {selectedEvent.nameAr}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Events this month */}
            <div
              className="breezy-card p-5 animate-breezy-enter"
              style={{ animationDelay: "100ms" }}
            >
              <div className="text-xs font-medium mb-3" style={{ color: "var(--muted-foreground)" }}>
                Events — {monthInfo?.en}
              </div>
              {monthEvents.length === 0 ? (
                <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>No major events this month</div>
              ) : (
                <div className="space-y-2">
                  {monthEvents.map(ev => (
                    <button
                      key={ev.day}
                      onClick={() => setSelectedDay(ev.day)}
                      className="w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all hover:bg-white/5"
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                        style={{
                          background: ev.type === "major"
                            ? "color-mix(in oklch, var(--gold) 20%, transparent)"
                            : "color-mix(in oklch, #60a5fa 15%, transparent)",
                          color: ev.type === "major" ? "var(--gold)" : "#60a5fa",
                        }}
                      >
                        {ev.day}
                      </div>
                      <div>
                        <div className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{ev.name}</div>
                        <div className="text-xs font-arabic" style={{ color: "var(--muted-foreground)" }}>{ev.nameAr}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Year navigation */}
            <div
              className="breezy-card p-5 animate-breezy-enter"
              style={{ animationDelay: "150ms" }}
            >
              <div className="text-xs font-medium mb-3" style={{ color: "var(--muted-foreground)" }}>Jump to Year</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewYear(y => y - 1)}
                  className="p-1.5 rounded-lg"
                  style={{ background: "var(--space-light)", color: "var(--gold-dim)" }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex-1 text-center">
                  <span className="text-lg font-bold" style={{ fontFamily: "Cinzel, serif", color: "var(--gold)" }}>
                    {viewYear} AH
                  </span>
                </div>
                <button
                  onClick={() => setViewYear(y => y + 1)}
                  className="p-1.5 rounded-lg"
                  style={{ background: "var(--space-light)", color: "var(--gold-dim)" }}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => { setViewYear(todayHijri.year); setViewMonth(todayHijri.month); setSelectedDay(todayHijri.day); }}
                className="w-full mt-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: "color-mix(in oklch, var(--gold) 10%, transparent)",
                  border: "1px solid color-mix(in oklch, var(--gold) 20%, transparent)",
                  color: "var(--gold)",
                }}
              >
                Today
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
