import { Link } from "react-router-dom";
import { ArrowRight, Shield, Activity, Radar, ScanSearch, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { AmbientBackground } from "@/components/sg/AmbientBackground";

export default function Landing() {
  return (
    <div className="relative min-h-screen">
      <AmbientBackground />

      <header className="relative z-10 flex items-center justify-between px-6 md:px-10 py-5">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-grad-cyber grid place-items-center shadow-[0_0_20px_hsl(var(--primary)/0.5)]">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="font-display font-semibold">PICKPIRE</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">v3.2 // live</div>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/login" className="hidden sm:inline text-sm text-secondary hover:text-foreground transition-colors">Sign in</Link>
          <Link to="/register" className="rounded-xl bg-grad-cyber px-4 py-2 text-sm font-semibold shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.7)] transition-shadow">
            Launch console
          </Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-6xl px-6 pt-16 pb-24 text-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-mono uppercase tracking-[0.2em] text-primary">
            <Sparkles className="h-3 w-3" /> Real-time AI piracy intelligence
          </span>
          <h1 className="mt-6 font-display text-5xl md:text-7xl font-semibold leading-[1.05] tracking-tight">
            Defend every <span className="grad-text">broadcast</span>.<br />
            Detect every <span className="grad-text">leak</span>.
          </h1>
          <p className="mt-6 mx-auto max-w-2xl text-lg text-secondary">
            PICKPIRE fingerprints your live sports content and continuously hunts pirated copies across the open web — with video, audio and watermark verification in seconds.
          </p>
          <div className="mt-9 flex items-center justify-center gap-3">
            <Link to="/register" className="group flex items-center gap-2 rounded-xl bg-grad-cyber px-5 py-3 text-sm font-semibold shadow-[0_0_30px_hsl(var(--primary)/0.5)] hover:shadow-[0_0_50px_hsl(var(--primary)/0.8)] transition-shadow">
              Start protecting <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/login" className="rounded-xl border border-border/60 bg-surface-2/50 px-5 py-3 text-sm hover:bg-surface-3/60 transition-colors">
              Live demo
            </Link>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="mt-16 grid gap-4 md:grid-cols-3 text-left">
          {[
            { icon: ScanSearch, title: "Multi-modal fingerprinting", desc: "Frame, audio and watermark signals fused into one verdict." },
            { icon: Radar, title: "24/7 platform monitoring", desc: "YouTube, Telegram, TikTok, Twitch and beyond." },
            { icon: Activity, title: "Executive intelligence", desc: "Beautiful dashboards built for security & rights teams." },
          ].map((f, i) => (
            <div key={i} className="glass rounded-2xl p-6 hover:border-primary/40 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-grad-purple grid place-items-center mb-4">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
