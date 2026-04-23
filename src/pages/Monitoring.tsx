import { GlassCard } from "@/components/sg/GlassCard";
import { monitoringApi } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Radar, Youtube, Send, Activity, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function Monitoring() {
  const queryClient = useQueryClient();
  const statusQuery = useQuery({ queryKey: ["monitoring-status"], queryFn: monitoringApi.status, refetchInterval: 10000 });
  const eventsQuery = useQuery({ queryKey: ["monitoring-events"], queryFn: () => monitoringApi.events(50), refetchInterval: 15000 });
  const controlMutation = useMutation({
    mutationFn: monitoringApi.control,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitoring-status"] });
      toast.success("Monitoring settings updated");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update monitoring settings");
    },
  });

  const status = statusQuery.data ?? {};
  const youtubeData = {
    active: Boolean(status?.youtube_enabled),
    scanned_24h: 0,
    hits: 0,
    latency_ms: 0,
    lastRun: status?.last_youtube_run,
    error: status?.youtube_last_error,
  };
  const telegramData = {
    active: Boolean(status?.telegram_enabled),
    scanned_24h: 0,
    hits: 0,
    latency_ms: 0,
    lastRun: status?.last_telegram_run,
    error: status?.telegram_last_error,
  };
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
        <p className="text-secondary mt-1">Live status of platform crawlers and webhook events. Toggle scanners to control API token usage.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Crawler
          name="YouTube scanner"
          icon={<Youtube className="h-5 w-5" />}
          accent="from-pink/30 to-pink/0"
          data={youtubeData}
          onToggle={() => controlMutation.mutate({ youtube_enabled: !youtubeData.active })}
          busy={controlMutation.isPending}
          quotaHint={`max ${Number(status?.youtube_max_queries ?? 1)} query/cycle, ${Number(status?.youtube_max_results_per_query ?? 3)} results/query`}
        />
        <Crawler
          name="Telegram scanner"
          icon={<Send className="h-5 w-5" />}
          accent="from-info/30 to-info/0"
          data={telegramData}
          onToggle={() => controlMutation.mutate({ telegram_enabled: !telegramData.active })}
          busy={controlMutation.isPending}
          quotaHint={`max ${Number(status?.telegram_max_videos_per_channel ?? 1)} video/channel/cycle`}
        />
      </div>

      <GlassCard className="p-4 text-sm">
        <div className="font-medium">Production-safe monitor profile</div>
        <div className="text-muted-foreground mt-1">
          Interval: {Number(status?.interval_seconds ?? 0)}s · YouTube queries: {(status?.youtube_queries ?? []).join(", ") || "none"} · Telegram channels: {(status?.telegram_channels ?? []).join(", ") || "none"}
        </div>
      </GlassCard>

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

function Crawler({ name, icon, accent, data, onToggle, busy, quotaHint }: { name: string; icon: React.ReactNode; accent: string; data: any; onToggle: () => void; busy: boolean; quotaHint: string }) {
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
          <button
            onClick={onToggle}
            disabled={busy}
            className="rounded-lg border border-border/60 bg-surface-2/70 px-3 py-1.5 text-xs hover:bg-surface-3/70 disabled:opacity-50"
          >
            {data.active ? "Turn off" : "Turn on"}
          </button>
        </div>
        <div className="mt-2 text-[11px] text-muted-foreground">{quotaHint}</div>
        <div className="mt-1 text-[11px] text-muted-foreground">
          Last run: {data.lastRun ? new Date(data.lastRun).toLocaleString() : "never"}
          {data.error ? ` · Error: ${String(data.error).slice(0, 80)}` : ""}
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
