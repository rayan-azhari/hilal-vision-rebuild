import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { VisibilityMap } from "@/components/VisibilityMap";

export default function VisibilityPage() {
    return (
        <div className="min-h-screen flex flex-col pt-20">
            <Header />

            <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-display font-bold mb-2">Global Visibility Map</h1>
                    <p className="text-foreground/60 max-w-2xl">
                        Interactive lunar visibility predictions based on the Yallop criterion.
                        Adjust the date to see how the crescent visibility arc shifts across the globe.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Map Sidebar / Controls */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="p-6 rounded-2xl glass">
                            <h3 className="font-bold mb-4">Observation Parameters</h3>
                            {/* Controls will hook into Zustand here */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-foreground/60 uppercase tracking-wide">Date</label>
                                    <input type="date" className="w-full mt-1 p-2 rounded-lg bg-background border border-foreground/10" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-foreground/60 uppercase tracking-wide">Criterion</label>
                                    <select className="w-full mt-1 p-2 rounded-lg bg-background border border-foreground/10">
                                        <option>Yallop (1997)</option>
                                        <option>Odeh (2004)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl glass">
                            <h3 className="font-bold mb-4">Legend</h3>
                            <div className="space-y-3 text-sm">
                                <LegendItem color="bg-vis-a" label="A: Easily visible" />
                                <LegendItem color="bg-vis-b" label="B: Visible under perfect conditions" />
                                <LegendItem color="bg-vis-c" label="C: May need optical aid to find" />
                                <LegendItem color="bg-vis-d" label="D: Optical aid required" />
                                <LegendItem color="bg-vis-e" label="E: Not visible" />
                                <LegendItem color="bg-vis-f" label="F: Below Danjon limit" />
                            </div>
                        </div>
                    </div>

                    {/* Main Map Area */}
                    <div className="lg:col-span-3">
                        <VisibilityMap />

                        <div className="mt-6 p-6 rounded-2xl bg-foreground/[0.02] border border-foreground/5">
                            <h3 className="font-bold mb-2">Local Observation Details</h3>
                            <p className="text-foreground/60 text-sm">
                                Click anywhere on the map to calculate exact sunset times,
                                moonset times, lunar age, and elongation for that specific location.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

function LegendItem({ color, label }: { color: string; label: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${color}`} />
            <span className="text-foreground/80">{label}</span>
        </div>
    );
}
