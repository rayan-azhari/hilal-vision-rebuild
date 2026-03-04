/**
 * IslamicCountdown - Displays days remaining until the next major Islamic events.
 * Uses Umm al-Qura calendar for date calculation.
 */
import { useMemo } from "react";
import { getUmmAlQuraHijri, getUmmAlQuraMonthStart } from "@/lib/astronomy";

interface CountdownEvent {
    name: string;
    nameAr: string;
    emoji: string;
    date: Date;
}

function computeCountdowns(today: Date): CountdownEvent[] {
    const todayNoon = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0);
    const hijri = getUmmAlQuraHijri(todayNoon);
    const currentYear = hijri.year;

    function nextOccurrence(hijriYear: number, month: number, extraDays = 0): Date {
        const start = getUmmAlQuraMonthStart(hijriYear, month);
        const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + extraDays, 12, 0, 0);
        // If already past today, advance to next Hijri year
        if (date < todayNoon) {
            const nextStart = getUmmAlQuraMonthStart(hijriYear + 1, month);
            return new Date(nextStart.getFullYear(), nextStart.getMonth(), nextStart.getDate() + extraDays, 12, 0, 0);
        }
        return date;
    }

    return [
        {
            name: "Ramadan",
            nameAr: "رَمَضَان",
            emoji: "🌙",
            date: nextOccurrence(currentYear, 9),
        },
        {
            name: "Eid al-Fitr",
            nameAr: "عيد الفطر",
            emoji: "🎉",
            date: nextOccurrence(currentYear, 10),
        },
        {
            name: "Eid al-Adha",
            nameAr: "عيد الأضحى",
            emoji: "🐑",
            date: nextOccurrence(currentYear, 12, 9), // 10th of Dhul-Hijjah = month start + 9 days
        },
    ];
}

function daysUntil(target: Date, today: Date): number {
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    return Math.round((targetMidnight.getTime() - todayMidnight.getTime()) / 86400000);
}

function formatDays(days: number): { label: string; urgency: "today" | "soon" | "upcoming" } {
    if (days === 0) return { label: "Today!", urgency: "today" };
    if (days === 1) return { label: "Tomorrow", urgency: "soon" };
    if (days <= 7) return { label: `${days} days`, urgency: "soon" };
    return { label: `${days} days`, urgency: "upcoming" };
}

export function IslamicCountdown() {
    const today = useMemo(() => new Date(), []);
    const todayStr = today.toDateString();
    const events = useMemo(() => computeCountdowns(today), [todayStr]);

    return (
        <div className="grid grid-cols-3 gap-3 mb-6 animate-breezy-enter">
            {events.map((event) => {
                const days = daysUntil(event.date, today);
                const { label, urgency } = formatDays(days);

                const accentColor =
                    urgency === "today"
                        ? "#4ade80"
                        : urgency === "soon"
                        ? "#facc15"
                        : "var(--gold)";

                return (
                    <div
                        key={event.name}
                        className="breezy-card text-center py-3 px-2"
                        style={{
                            border: urgency === "today"
                                ? "1px solid color-mix(in oklch, #4ade80 30%, transparent)"
                                : "1px solid color-mix(in oklch, var(--gold) 10%, transparent)",
                        }}
                    >
                        <div className="text-2xl mb-1">{event.emoji}</div>
                        <div
                            className="text-[10px] font-bold uppercase tracking-wider mb-0.5"
                            style={{ color: "var(--muted-foreground)" }}
                        >
                            {event.name}
                        </div>
                        <div
                            className="text-[9px] mb-2"
                            style={{ color: "var(--muted-foreground)", fontFamily: "serif" }}
                        >
                            {event.nameAr}
                        </div>
                        <div
                            className="text-lg font-bold font-mono"
                            style={{ color: accentColor }}
                        >
                            {label}
                        </div>
                        <div
                            className="text-[10px] mt-0.5"
                            style={{ color: "var(--muted-foreground)" }}
                        >
                            {event.date.toLocaleDateString([], { month: "short", day: "numeric" })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
