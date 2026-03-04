import { Header } from "@/components/Header";
import { Calendar, Map, Activity } from "lucide-react";

export default function Home() {
  return (
    <div className="relative">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-8 animate-fade-in">
            <Activity className="w-4 h-4" />
            <span>Lunar Tracking Reimagined</span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent leading-tight">
            Observe the Moon, <br />
            <span className="text-primary-400">Master the Calendar.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-foreground/60 mb-10 leading-relaxed">
            AI-powered crescent visibility predictions, hyper-local weather conditions,
            and a precise Hijri calendar system built for the modern Muslim community.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button className="px-8 py-4 rounded-2xl bg-primary-600 text-white font-bold text-lg hover:bg-primary-500 transition-all hover:scale-105 shadow-xl shadow-primary-600/20">
              Check Local Visibility
            </button>
            <button className="px-8 py-4 rounded-2xl glass font-bold text-lg hover:bg-white/5 transition-all">
              Explore the Map
            </button>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 px-4 border-t border-foreground/5 bg-foreground/[0.02]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Map className="w-6 h-6" />}
            title="Global Visibility Maps"
            description="Interactive global charts powered by Yallop and Odeh criteria to determine moon appearance anywhere on Earth."
          />
          <FeatureCard
            icon={<Calendar className="w-6 h-6" />}
            title="Smarter Hijri Calendar"
            description="A conjunction-aware calendar system that aligns astronomical truth with community traditions."
          />
          <FeatureCard
            icon={<Activity className="w-6 h-6" />}
            title="Real-time Telemetry"
            description="Submit and view ground-truth crescent sightings with verified atmospheric data from observers globally."
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-3xl glass hover:border-primary-500/30 transition-all group">
      <div className="w-12 h-12 rounded-2xl bg-primary-600/10 flex items-center justify-center text-primary-400 mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 font-display">{title}</h3>
      <p className="text-foreground/60 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
