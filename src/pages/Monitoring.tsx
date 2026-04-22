import { GlassCard } from "@/components/sg/GlassCard";
import { monitoringApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Radar, Youtube, Send, Activity, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export default function Monitoring() {
  const statusQuery = useQuery({ queryKey: ["monitoring-status"], queryFn: monitoringApi.status, refetchInterval: 30000 });
  const eventsQuery = useQuery({ queryKey: ["monitoring-events"], queryFn: () => monitoringApi.events(50), refetchInterval: 15000 });

  const platformRows = statusQuery.data ?? [];
  const youtubeHits = Number(platformRows.find((p: any) => String(p.platform || "").toLowerCase().includes("youtube"))?.count ?? 0);
  const telegramHits = Number(platformRows.find((p: any) => String(p.platform || "").toLowerCase().includes("telegram"))?.count ?? 0);
  const youtubeData = { active: true, scanned_24h: youtubeHits, hits: youtubeHits, latency_ms: 0 };
  const telegramData = { active: true, scanned_24h: telegramHits, hits: telegramHits, latency_ms: 0 };
  const alerts = (eventsQuery.data ?? []).slice(-12).reverse().map((a: any, idx: number) => ({
    id: `evt-${idx}`,
    at: formatAgo(a?.received_at),
    level: "info" as const,
    text: stringifyPayload(a?.payload),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Monitoring</h1>
        <p className="text-secondary mt-1">Live status of platform crawlers and webhook events.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Crawler name="YouTube scanner" icon={<Youtube className="h-5 w-5" />} accent="from-pink/30 to-pink/0" data={youtubeData} />
        <Crawler name="Telegram scanner" icon={<Send className="h-5 w-5" />} accent="from-info/30 to-info/0" data={telegramData} />
      </div>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Radar className="h-5 w-5 text-pink animate-pulse" />
            <h2 className="font-display text-lg font-semibold">Live event stream</h2>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-success">● connected</span>
        </div>
        <div className="space-y-2.5">
          {alerts.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
              className="flex items-start gap-3 rounded-xl border border-border/60 bg-surface-1/60 p-4">
              <span className={`mt-1.5 h-2 w-2 rounded-full ${
                a.level === "danger" ? "bg-danger animate-pulse" :
                a.level === "warning" ? "bg-warning" : "bg-info"
              }`} />
              <div className="flex-1">
                <p className="text-sm">{a.text}</p>
                <p className="text-[11px] font-mono text-muted-foreground mt-1">{a.at} ago · webhook delivered</p>
              </div>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-mono uppercase ${
                a.level === "danger" ? "border-danger/40 text-danger bg-danger/10" :
                a.level === "warning" ? "border-warning/40 text-warning bg-warning/10" :
                "border-info/40 text-info bg-info/10"
              }`}>{a.level}</span>
            </motion.div>
          ))}
          {alerts.length === 0 && <div className="text-sm text-muted-foreground">No webhook events received yet.</div>}
        </div>
      </GlassCard>
    </div>
  );
}

function Crawler({ name, icon, accent, data }: { name: string; icon: React.ReactNode; accent: string; data: any }) {
  return (
    <GlassCard className="relative overflow-hidden p-6">
      <div className={`absolute -top-20 -right-20 h-48 w-48 rounded-full bg-gradient-to-br blur-2xl opacity-60 ${accent}`} />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-surface-2 grid place-items-center text-pink">{icon}</div>
            <div>
              <div className="font-semibold">{name}</div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-success">● {data.active ? "active" : "offline"}</div>
            </div>
          </div>
          <button className="rounded-lg border border-border/60 bg-surface-2/70 px-3 py-1.5 text-xs hover:bg-surface-3/70">Configure</button>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          <Stat icon={<Activity className="h-3.5 w-3.5" />} label="Scanned 24h" value={data.scanned_24h.toLocaleString()} />
          <Stat icon={<ShieldAlert className="h-3.5 w-3.5" />} label="Hits" value={data.hits.toString()} />
          <Stat label="Latency" value={`${data.latency_ms}ms`} />
        </div>
      </div>
    </GlassCard>
  );
}

function Stat({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-surface-1/60 p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{icon}{label}</div>
      <div className="mt-1 font-display text-lg font-semibold">{value}</div>
    </div>
  );
}

function stringifyPayload(payload: unknown) {
  if (!payload) return "Webhook event";
  if (typeof payload === "string") return payload;
  try {
    return JSON.stringify(payload).slice(0, 140);
  } catch {
    return "Webhook event";
  }
}

function formatAgo(iso?: string) {
  if (!iso) return "just now";
  const ts = Date.parse(iso);
  if (!Number.isFinite(ts)) return "just now";
  const mins = Math.max(0, Math.floor((Date.now() - ts) / 60000));
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}
