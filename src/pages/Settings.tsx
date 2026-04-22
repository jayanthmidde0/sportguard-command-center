import { GlassCard } from "@/components/sg/GlassCard";
import { useAuth } from "@/lib/auth";
import { Bell, Key, Webhook, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Settings() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [webhook, setWebhook] = useState("https://hooks.sportguard.io/abc123");
  const [notif, setNotif] = useState({ verified: true, warning: true, info: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-secondary mt-1">Manage your operator profile, alerts and integrations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <SectionTitle icon={<User className="h-4 w-4" />} title="Profile" />
          <Field label="Full name"><input value={name} onChange={e => setName(e.target.value)} className="input" /></Field>
          <Field label="Email"><input value={email} onChange={e => setEmail(e.target.value)} className="input" /></Field>
          <button onClick={() => toast.success("Profile saved")} className="mt-2 rounded-xl bg-grad-cyber px-4 py-2.5 text-sm font-semibold shadow-[0_0_20px_hsl(var(--primary)/0.4)]">Save changes</button>
        </GlassCard>

        <GlassCard className="p-6">
          <SectionTitle icon={<Bell className="h-4 w-4" />} title="Alert preferences" />
          {([
            ["verified", "Verified piracy", "Critical pink alerts"],
            ["warning", "High-similarity matches", "Above 80%"],
            ["info", "Index updates", "New reference indexed"],
          ] as const).map(([k, l, d]) => (
            <label key={k} className="flex items-center justify-between rounded-xl border border-border/60 bg-surface-1/60 p-3 mb-3 cursor-pointer">
              <div>
                <div className="text-sm font-medium">{l}</div>
                <div className="text-xs text-muted-foreground">{d}</div>
              </div>
              <button type="button" onClick={() => setNotif(n => ({ ...n, [k]: !n[k] }))} className={`relative h-6 w-11 rounded-full transition-colors ${notif[k] ? "bg-grad-cyber" : "bg-surface-3"}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${notif[k] ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </label>
          ))}
        </GlassCard>

        <GlassCard className="p-6">
          <SectionTitle icon={<Webhook className="h-4 w-4" />} title="Webhook integration" />
          <Field label="Endpoint URL"><input value={webhook} onChange={e => setWebhook(e.target.value)} className="input font-mono" /></Field>
          <p className="text-xs text-muted-foreground">SportGuard posts JSON events for every verified piracy detection.</p>
          <div className="mt-3 flex gap-2">
            <button onClick={() => toast.success("Test event sent")} className="rounded-xl border border-border/60 bg-surface-2/70 px-4 py-2 text-sm hover:bg-surface-3/70">Send test</button>
            <button onClick={() => toast.success("Webhook saved")} className="rounded-xl bg-grad-cyber px-4 py-2 text-sm font-semibold">Save</button>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <SectionTitle icon={<Key className="h-4 w-4" />} title="API access" />
          <div className="rounded-xl border border-border/60 bg-surface-1/60 p-4 font-mono text-xs break-all">
            sg_live_•••••••••••••••••••••••••••••3a72
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={() => { navigator.clipboard.writeText("sg_live_demo"); toast.success("Copied"); }} className="rounded-xl border border-border/60 bg-surface-2/70 px-4 py-2 text-sm hover:bg-surface-3/70">Copy</button>
            <button onClick={() => toast.message("Key rotated")} className="rounded-xl bg-grad-pink px-4 py-2 text-sm font-semibold">Rotate</button>
          </div>
        </GlassCard>
      </div>

      <style>{`.input { width: 100%; border-radius: 0.75rem; border: 1px solid hsl(var(--border) / 0.6); background: hsl(var(--surface-1) / 0.7); padding: 0.625rem 0.875rem; font-size: 0.875rem; color: white; outline: none; }
        .input:focus { border-color: hsl(var(--primary) / 0.6); box-shadow: 0 0 0 3px hsl(var(--primary) / 0.15); }`}</style>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return <div className="flex items-center gap-2 mb-4"><span className="text-primary">{icon}</span><h2 className="font-display text-lg font-semibold">{title}</h2></div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block mb-3">
      <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
