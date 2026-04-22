import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Shield, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { AmbientBackground } from "@/components/sg/AmbientBackground";

export default function Login() {
  const { login, user } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("operator@sportguard.io");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/app" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back, operator.");
      nav((location.state as any)?.from || "/app");
    } catch (err: any) {
      // Offline-friendly: allow demo entry so the UI is usable.
      if (err?.status === 0) {
        const { tokenStore } = await import("@/lib/api");
        tokenStore.set("demo-token");
        localStorage.setItem("sg_user", JSON.stringify({ email, name: "Demo Operator" }));
        toast.message("Backend offline — entering demo mode");
        window.location.href = "/app";
        return;
      }
      toast.error(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6">
      <AmbientBackground />
      <div className="relative grid w-full max-w-5xl grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Brand panel */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="hidden md:block">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-2xl bg-grad-cyber grid place-items-center shadow-[0_0_30px_hsl(var(--primary)/0.6)]">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="font-display text-xl font-semibold">SportGuard</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">command center</div>
            </div>
          </div>
          <h1 className="font-display text-5xl leading-tight font-semibold">
            <span className="grad-text">AI-powered</span><br />
            sports anti-piracy<br />
            in real time.
          </h1>
          <p className="mt-5 text-secondary max-w-md">
            Monitor, detect and verify pirated broadcasts across YouTube, Telegram and the open web — with watermarked precision and audio/video fingerprinting.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3 max-w-md">
            {[
              { k: "18.4K", v: "Scans / 24h" },
              { k: "1,287", v: "Detections" },
              { k: "98.4%", v: "Accuracy" },
            ].map(s => (
              <div key={s.v} className="glass rounded-xl p-3">
                <div className="font-display text-lg font-semibold">{s.k}</div>
                <div className="text-[11px] text-muted-foreground">{s.v}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="glass-strong rounded-3xl p-8">
          <div className="md:hidden flex items-center gap-2 mb-6">
            <div className="h-10 w-10 rounded-xl bg-grad-cyber grid place-items-center"><Shield className="h-5 w-5" /></div>
            <span className="font-display text-lg font-semibold">SportGuard</span>
          </div>
          <h2 className="font-display text-2xl font-semibold">Sign in</h2>
          <p className="text-sm text-muted-foreground mt-1">Access the SportGuard command center.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <Field icon={<Mail className="h-4 w-4" />} label="Email">
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-transparent focus:outline-none text-sm" placeholder="you@team.com" />
            </Field>
            <Field icon={<Lock className="h-4 w-4" />} label="Password">
              <input type={show ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-transparent focus:outline-none text-sm" placeholder="••••••••" />
              <button type="button" onClick={() => setShow(s => !s)} className="text-muted-foreground hover:text-foreground">
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </Field>

            <button
              type="submit" disabled={loading}
              className="group relative w-full overflow-hidden rounded-xl bg-grad-cyber px-4 py-3 text-sm font-semibold text-white shadow-[0_0_30px_hsl(var(--primary)/0.4)] transition-all hover:shadow-[0_0_40px_hsl(var(--primary)/0.7)] disabled:opacity-60"
            >
              <span className="relative flex items-center justify-center gap-2">
                {loading ? "Authenticating…" : <>Enter command center <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>}
              </span>
            </button>
          </form>
          <p className="mt-5 text-sm text-muted-foreground text-center">
            New operator? <Link to="/register" className="text-primary hover:underline">Create an account</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <div className="mt-1.5 flex items-center gap-2.5 rounded-xl border border-border/60 bg-surface-1/70 px-3.5 py-3 transition-all focus-within:border-primary/60 focus-within:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]">
        <span className="text-muted-foreground">{icon}</span>
        {children}
      </div>
    </label>
  );
}
