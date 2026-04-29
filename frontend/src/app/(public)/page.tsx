import Link from "next/link";
import {
  Music,
  Mic2,
  Camera,
  Video,
  Clock,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Headphones,
  Star,
} from "lucide-react";

const FEATURES = [
  {
    icon: Headphones,
    title: "Pro-Grade Equipment",
    description:
      "Industry-standard microphones, mixers, cameras, and lighting rigs ready for your session.",
  },
  {
    icon: Shield,
    title: "Acoustically Treated",
    description:
      "Professionally soundproofed rooms ensuring crystal-clear recordings every time.",
  },
  {
    icon: Clock,
    title: "Flexible Scheduling",
    description:
      "Morning, afternoon, or evening sessions — book the slot that works for you.",
  },
  {
    icon: Sparkles,
    title: "Premium Experience",
    description:
      "Comfortable, inspiring spaces designed to bring out your best creative work.",
  },
];

const SESSION_TYPES = [
  {
    icon: Music,
    title: "Music Recording",
    description: "Multi-track recording with professional monitoring",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: Mic2,
    title: "Podcast",
    description: "Crystal-clear voice capture for engaging episodes",
    color: "bg-blue-600",
  },
  {
    icon: Camera,
    title: "Photography",
    description: "Studio lighting setups for stunning portrait and product shots",
    color: "bg-amber-600",
  },
  {
    icon: Video,
    title: "Video Shoot",
    description: "4K-ready studio with green screen and lighting rigs",
    color: "from-emerald-500 to-teal-500",
  },
];

const STEPS = [
  { step: "01", title: "Choose a Date", description: "Browse our calendar and select an available date" },
  { step: "02", title: "Pick a Time Slot", description: "Morning, afternoon, or evening — your choice" },
  { step: "03", title: "Fill Your Details", description: "Tell us about your project and session needs" },
  { step: "04", title: "Get Confirmed", description: "Instant confirmation with email receipt" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ============ HERO ============ */}
      <section className="relative min-h-[80vh] flex items-center bg-primary pb-32">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-secondary/30 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="w-fit flex items-center gap-2 p-6 rounded-full text-white font-bold mb-12 animate-fade-in">
              <Star className="w-4 h-4 text-accent" />
              <span>Lagos&apos; Premier Creative Space</span>
            </div>

            <h1 className="text-6xl sm:text-7xl lg:text-9xl font-black !text-white mb-10 tracking-tighter animate-fade-in-up leading-[0.95]">
              Your Vision. <br />
              <span className="gradient-text">Our Studio.</span>
            </h1>

            <p className="text-xl sm:text-2xl text-white/70 leading-relaxed max-w-2xl mb-14 font-medium animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              Professional-grade space for recording, podcasts, photography, and video. 
              Elevate your content at LuxeLoft.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 mb-24 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <Link
                href="/login"
                className="flex items-center justify-center gap-4 px-10 py-5 text-xl font-bold text-white rounded-full gradient-accent shadow-2xl shadow-accent/40 hover:scale-105 transition-all duration-300"
              >
                <p>Book a Session</p>
                <ArrowRight className="w-6 h-6" />
              </Link>
              <a
                href="#sessions"
                className="inline-flex items-center justify-center gap-4 px-12 py-5 text-xl font-bold text-white rounded-full border-2 border-white/20 hover:bg-white/10 transition-all"
              >
                Explore
              </a>
            </div>

            <div className="flex flex-wrap gap-12 sm:gap-24 pt-14 border-t border-white/10 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              {[
                { value: "500+", label: "Happy Clients" },
                { value: "4.9★", label: "Rating" },
                { value: "24/7", label: "Access" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col gap-2">
                  <div className="text-5xl sm:text-6xl font-black text-white">
                    {stat.value}
                  </div>
                  <div className="text-xs font-bold uppercase tracking-[0.4em] text-white/40">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ SESSION TYPES ============ */}
      <section id="sessions" className="relative py-40 bg-surface border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-24">
            <h2 className="text-5xl sm:text-6xl font-black mb-6">
              Session <span className="gradient-text">Types</span>
            </h2>
            <p className="text-muted text-xl font-medium">
              Professional setups for every creative need.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SESSION_TYPES.map((session, i) => {
              const Icon = session.icon;
              return (
                <div
                  key={session.title}
                  className="group relative bg-card rounded-2xl border border-border p-6 hover:border-accent/30 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${session.color} flex items-center justify-center mb-5 shadow-md transition-transform group-hover:scale-110`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-primary">
                    {session.title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">
                    {session.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="relative py-40 bg-white border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-24">
            <h2 className="text-5xl sm:text-6xl font-black mb-6">
              Book in <span className="gradient-text">4 Simple Steps</span>
            </h2>
            <p className="text-muted text-xl font-medium">
              Our streamlined process gets you in the studio faster.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((step, i) => (
              <div
                key={step.step}
                className="relative text-center animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-accent/30 to-accent/5" />
                )}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 text-accent text-xl font-bold mb-5 font-[family-name:var(--font-heading)]">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-primary">
                  {step.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="relative py-40 bg-surface border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <h2 className="text-5xl sm:text-6xl font-black mb-6">
              Why <span className="gradient-text">LuxeLoft?</span>
            </h2>
            <p className="text-muted text-xl font-medium">
              We provide the perfect blend of high-end technology and creative comfort.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="flex gap-5 bg-card rounded-2xl border border-border p-6 hover:border-accent/30 hover:shadow-card-hover transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1.5 text-primary">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="relative py-40 bg-primary overflow-hidden border-t border-white/10">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl sm:text-7xl font-black text-white mb-10 tracking-tight">
            Ready to Create?
          </h2>
          <p className="text-xl text-white/60 mb-14 max-w-xl mx-auto font-medium">
            Join 500+ creatives who have elevated their work at LuxeLoft Studio.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-3 px-12 py-5 text-lg font-bold text-primary bg-white rounded-full shadow-2xl hover:scale-105 transition-all duration-300"
            >
              Book Your Session Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 mt-10 text-sm text-white/50">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-available" /> Instant
              confirmation
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-available" /> Free
              cancellation
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
