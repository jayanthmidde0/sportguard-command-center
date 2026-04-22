import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Shield, Mail, Lock, User, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { AmbientBackground } from "@/components/sg/AmbientBackground";

export default function Register() {
  const { register, user } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/app" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(email, password, name);
      toast.success("Account created. Welcome to SportGuard.");
      nav("/app");
    } catch (err: any) {
      toast.error(err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6">
      <AmbientBackground />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md glass-strong rounded-3xl p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-10 w-10 rounded-xl bg-grad-cyber grid place-items-center"><Shield className="h-5 w-5" /></div>
          <span className="font-display text-lg font-semibold">SportGuard</span>
        </div>
        <h2 className="font-display text-2xl font-semibold">Create operator account</h2>
        <p className="text-sm text-muted-foreground mt-1">Join the SportGuard intelligence network.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <Field icon={<User className="h-4 w-4" />} label="Full name">
            <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-transparent focus:outline-none text-sm" placeholder="Jordan Vega" />
          </Field>
          <Field icon={<Mail className="h-4 w-4" />} label="Email">
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-transparent focus:outline-none text-sm" placeholder="you@team.com" />
          </Field>
          <Field icon={<Lock className="h-4 w-4" />} label="Password">
            <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-transparent focus:outline-none text-sm" placeholder="At least 6 characters" />
          </Field>

          <button type="submit" disabled={loading} className="group w-full rounded-xl bg-grad-cyber px-4 py-3 text-sm font-semibold text-white shadow-[0_0_30px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_40px_hsl(var(--primary)/0.7)] disabled:opacity-60">
            <span className="flex items-center justify-center gap-2">
              {loading ? "Creating…" : <>Create account <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>}
            </span>
          </button>
        </form>
        <p className="mt-5 text-sm text-muted-foreground text-center">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </motion.div>
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
