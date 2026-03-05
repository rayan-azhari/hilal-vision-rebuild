"use client";

import { useAppStore } from "@/store/useAppStore";
import { ObservationForm } from "@/components/ObservationForm";
import { X, MoonStar } from "lucide-react";

export function SightingModal() {
    const show = useAppStore((s) => s.showSightingModal);
    const setShow = useAppStore((s) => s.setShowSightingModal);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 backdrop-blur-md"
                style={{ background: "color-mix(in oklch, var(--space) 60%, transparent)" }}
                onClick={() => setShow(false)}
            />

            <div className="relative w-full max-w-lg bg-card border border-foreground/10 rounded-2xl shadow-2xl overflow-hidden animate-breezy-enter max-h-[90vh] flex flex-col">
                <button
                    onClick={() => setShow(false)}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-foreground/5 text-foreground/50 hover:text-foreground transition-colors z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                <div
                    className="p-6 border-b border-foreground/5 shrink-0"
                    style={{ background: "linear-gradient(135deg, color-mix(in oklch, var(--gold) 8%, transparent), color-mix(in oklch, var(--space-mid) 100%, transparent))" }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                            style={{ background: "var(--accent)", color: "var(--primary-foreground)" }}
                        >
                            <MoonStar className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-display font-bold">Report Sighting</h2>
                    </div>
                    <p className="text-xs text-foreground/70">
                        Did you see the crescent? Log your observation to help improve global predictive models.
                    </p>
                </div>

                <div className="p-6 overflow-y-auto">
                    <ObservationForm onSuccess={() => setShow(false)} />
                </div>
            </div>
        </div>
    );
}
