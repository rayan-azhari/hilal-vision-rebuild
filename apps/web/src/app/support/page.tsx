import type { Metadata } from "next";
import { Heart, Shield, Gauge, MonitorSmartphone, CreditCard } from "lucide-react";

export const metadata: Metadata = {
    title: "Support — Hilal Vision",
    description: "Support Hilal Vision — upgrade to Pro, make a donation, and help keep Islamic astronomy accessible.",
};

export default function SupportPage() {
    const features = [
        { icon: <Heart className="w-5 h-5" />, title: "Keep It Running", desc: "Server costs, API calls, weather data, and real-time ephemeris computation — science isn't free." },
        { icon: <Shield className="w-5 h-5" />, title: "Keep It Accurate", desc: "Continuous calibration against ICOP observations, new criterion research, and multi-engine calendar validation." },
        { icon: <Gauge className="w-5 h-5" />, title: "Keep It Ad-Free", desc: "Your support replaces the need for intrusive advertising. A clean, respectful experience for all." },
    ];

    const plans = [
        { name: "Monthly", price: "$2.99", period: "/month", desc: "Try Pro with no commitment", highlight: false },
        { name: "Annual", price: "$14.99", period: "/year", desc: "Best recurring value — Save 58%", highlight: true },
        { name: "Lifetime", price: "$49.99", period: "one-time", desc: "Unlock forever — the Astronomer plan", highlight: false },
    ];

    return (
        <div className="pt-24 pb-16 max-w-[1200px] mx-auto px-4 min-h-screen">
            {/* Hero */}
            <div className="text-center mb-16">
                <p className="text-sm font-bold text-primary-400 uppercase tracking-widest mb-4">
                    صدقة جارية — Sadaqah Jariyah
                </p>
                <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-6">
                    Help Keep Hilal Vision{" "}
                    <span className="bg-gradient-to-br from-primary-400 to-primary-600 text-transparent bg-clip-text">
                        Accessible to All
                    </span>
                </h1>
                <p className="text-foreground/60 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
                    Hilal Vision serves 1.8 billion Muslims who rely on the lunar calendar. Your support — whether through Pro or a one-time contribution — helps keep the platform running, accurate, and ad-free.
                </p>
            </div>

            {/* Why Support */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                {features.map((f) => (
                    <div key={f.title} className="glass p-6 rounded-3xl border border-foreground/10 shadow-xl text-center">
                        <div className="w-12 h-12 rounded-2xl bg-primary-500/20 text-primary-400 flex items-center justify-center mx-auto mb-4">
                            {f.icon}
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-2">{f.title}</h3>
                        <p className="text-sm text-foreground/60 font-medium">{f.desc}</p>
                    </div>
                ))}
            </div>

            {/* Plans */}
            <div className="text-center mb-10">
                <h2 className="text-3xl font-display font-bold text-foreground mb-3">Choose Your Plan</h2>
                <p className="text-foreground/50 font-medium">Unlock every feature. Support Islamic astronomy.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                {plans.map((p) => (
                    <div
                        key={p.name}
                        className={`glass p-8 rounded-3xl border shadow-xl text-center transition-all hover:scale-[1.02] ${p.highlight
                                ? "border-primary-500/50 shadow-primary-500/10 ring-2 ring-primary-500/20"
                                : "border-foreground/10"
                            }`}
                    >
                        {p.highlight && (
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary-400 bg-primary-500/20 px-3 py-1 rounded-full mb-4 inline-block">
                                Most Popular
                            </span>
                        )}
                        <h3 className="text-xl font-bold text-foreground mb-2">{p.name}</h3>
                        <div className="text-4xl font-display font-black text-foreground mb-1">
                            {p.price}
                            <span className="text-sm font-semibold text-foreground/40">{p.period}</span>
                        </div>
                        <p className="text-sm text-foreground/50 font-medium mb-6">{p.desc}</p>
                        <button className="w-full py-3 rounded-2xl font-bold text-sm transition-all bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/30">
                            Get Started
                        </button>
                    </div>
                ))}
            </div>

            {/* Donation CTA */}
            <div className="glass p-8 rounded-3xl border border-foreground/10 shadow-xl text-center max-w-2xl mx-auto">
                <CreditCard className="w-8 h-8 text-primary-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-3">One-Time Donation</h3>
                <p className="text-sm text-foreground/60 font-medium mb-6">
                    Not ready for Pro? A one-time donation of any amount helps cover server costs and keeps Hilal Vision freely accessible to communities worldwide. Donors who give $10+ receive a <strong className="text-primary-400">Golden Crescent</strong> patron badge on their sighting reports.
                </p>
                <p className="text-xs text-foreground/40 font-medium">
                    Secure payment via Stripe · 🔒 End-to-end encrypted
                </p>
            </div>
        </div>
    );
}
