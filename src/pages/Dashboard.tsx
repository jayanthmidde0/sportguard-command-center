import { GlassCard } from "@/components/sg/GlassCard";
import { MetricCard } from "@/components/sg/MetricCard";
import { StatusBadge } from "@/components/sg/StatusBadge";
import { analyticsApi, detectionsApi, monitoringApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Activity, ShieldAlert, ShieldCheck, Zap, ArrowRight, Radar, Server } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell, Legend } from "recharts";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const overviewQuery = useQuery({ queryKey: ["dashboard-overview"], queryFn: analyticsApi.overview, refetchInterval: 30000 });
  const timelineQuery = useQuery({ queryKey: ["dashboard-timeline"], queryFn: analyticsApi.timeline, refetchInterval: 30000 });
  const platformsQuery = useQuery({ queryKey: ["dashboard-platforms"], queryFn: analyticsApi.platforms, refetchInterval: 30000 });
  const detectionsQuery = useQuery({ queryKey: ["dashboard-detections"], queryFn: () => detectionsApi.list(), refetchInterval: 30000 });
  const eventsQuery = useQuery({ queryKey: ["dashboard-events"], queryFn: () => monitoringApi.events(20), refetchInterval: 15000 });

  const overview = {
    total_scans: Number(overviewQuery.data?.total_detections ?? 0),
    detections: Number(overviewQuery.data?.pirated ?? 0),
    verified_piracy: Number(overviewQuery.data?.viral ?? 0),
    takedowns: 0,
    trend: { scans: 0, detections: 0, verified: 0, takedowns: 0 },
  };

  const timeline = (timelineQuery.data ?? []).map((row: any, index: number) => ({
    hour: row?.date ? String(row.date) : `T${index + 1}`,
    scans: Number(row?.count ?? 0),
    detections: Number(row?.count ?? 0),
    verified: 0,
  }));

  const palette = ["#FF4D8D", "#2D9CDB", "#7B61FF", "#22C55E", "#F59E0B", "#F97316"];
  const platforms = (platformsQuery.data ?? []).map((p: any, index: number) => ({
    name: p?.platform || "Unknown",
    value: Number(p?.count ?? 0),
    color: palette[index % palette.length],
  }));

  const detections = ((detectionsQuery.data ?? []) as any[]).map((d: any) => ({
    id: `DET-${d.id}`,
    title: d.video_name || "Unknown video",
    platform: d.source || "Unknown",
    score: Number(d.similarity ?? 0) / 100,
    status: normalizeStatus(d.status),
  }));

  const alerts = (eventsQuery.data ?? []).slice(-4).reverse().map((e: any, index: number) => ({
    id: `evt-${index}`,
    at: formatAgo(e?.received_at),
    level: inferLevel(stringifyPayload(e?.payload)),
    text: stringifyPayload(e?.payload),
  }));

  const platformCounts = {
    youtube: platforms.find((p: any) => String(p.name).toLowerCase().includes("youtube"))?.value ?? 0,
    telegram: platforms.find((p: any) => String(p.name).toLowerCase().includes("telegram"))?.value ?? 0,
  };

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl border border-border/60 bg-grad-hero p-8 md:p-10">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-pink/40 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-info/40 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.25em] text-white/70">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" /> Live · Edge nodes 14/14
            </div>
            <h1 className="mt-3 font-display text-3xl md:text-5xl font-semibold tracking-tight">
              Threat intelligence — <span className="text-white/80">last 24 hours</span>
            </h1>
            <p className="mt-2 text-white/70 max-w-xl">
              Continuous AI fingerprint matching across monitored platforms. {overview.verified_piracy} verified piracy events detected today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/app/detect" className="rounded-xl bg-white text-background px-4 py-2.5 text-sm font-semibold shadow-lg hover:bg-white/90 transition-colors">
              Run detection
            </Link>
            <Link to="/app/detections" className="rounded-xl border border-white/30 px-4 py-2.5 text-sm font-semibold backdrop-blur hover:bg-white/10 transition-colors">
              View detections
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard index={0} label="Total scans" value={overview.total_scans.toLocaleString()} delta={overview.trend.scans} accent="blue" icon={<Activity className="h-4 w-4" />} />
        <MetricCard index={1} label="Detections" value={overview.detections.toLocaleString()} delta={overview.trend.detections} accent="primary" icon={<ShieldAlert className="h-4 w-4" />} />
        <MetricCard index={2} label="Verified piracy" value={overview.verified_piracy.toLocaleString()} delta={overview.trend.verified} accent="pink" icon={<Zap className="h-4 w-4" />} />
        <MetricCard index={3} label="Takedowns" value={overview.takedowns.toLocaleString()} delta={overview.trend.takedowns} accent="success" icon={<ShieldCheck className="h-4 w-4" />} />
      </div>

      {/* Chart + side panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-lg font-semibold">Detection activity · 24h</h2>
              <p className="text-xs text-muted-foreground">Scans, detections & verified piracy</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <Legend2 color="#7B61FF" label="Scans" />
              <Legend2 color="#FF4D8D" label="Detections" />
              <Legend2 color="#22C55E" label="Verified" />
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7B61FF" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#7B61FF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF4D8D" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#FF4D8D" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 6" stroke="hsl(var(--divider))" vertical={false} />
                <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--surface-1))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="scans" stroke="#7B61FF" fill="url(#g1)" strokeWidth={2} />
                <Area type="monotone" dataKey="detections" stroke="#FF4D8D" fill="url(#g2)" strokeWidth={2} />
                <Area type="monotone" dataKey="verified" stroke="#22C55E" fill="url(#g3)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold">Live alerts</h2>
            <Radar className="h-4 w-4 text-pink animate-pulse" />
          </div>
          <div className="space-y-3">
            {alerts.map(a => (
              <div key={a.id} className="rounded-xl border border-border/60 bg-surface-1/60 p-3 hover:border-primary/40 transition-colors">
                <div className="flex items-start gap-2.5">
                  <span className={`mt-1.5 h-2 w-2 rounded-full ${
                    a.level === "danger" ? "bg-danger animate-pulse" :
                    a.level === "warning" ? "bg-warning" : "bg-info"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{a.text}</p>
                    <p className="text-[11px] font-mono text-muted-foreground mt-1">{a.at}</p>
                  </div>
                </div>
              </div>
            ))}
            {alerts.length === 0 && <div className="text-sm text-muted-foreground">No webhook events yet.</div>}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <MiniStat icon={<Server className="h-3.5 w-3.5" />} label="YouTube" value={platformCounts.youtube.toLocaleString()} />
            <MiniStat icon={<Server className="h-3.5 w-3.5" />} label="Telegram" value={platformCounts.telegram.toLocaleString()} />
          </div>
        </GlassCard>
      </div>

      {/* Recent + platforms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 p-0 overflow-hidden">
          <div className="flex items-center justify-between p-5">
            <div>
              <h2 className="font-display text-lg font-semibold">Recent detections</h2>
              <p className="text-xs text-muted-foreground">Most recent fingerprint matches</p>
            </div>
            <Link to="/app/detections" className="flex items-center gap-1 text-xs text-primary hover:underline">
              All detections <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead className="bg-surface-1/60 border-y border-border/60">
                <tr className="text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-2.5">ID</th>
                  <th className="px-3 py-2.5">Title</th>
                  <th className="px-3 py-2.5">Platform</th>
                  <th className="px-3 py-2.5">Score</th>
                  <th className="px-5 py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {detections.slice(0, 6).map(d => (
                  <tr key={d.id} className="border-b border-border/40 hover:bg-surface-3/40 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{d.id}</td>
                    <td className="px-3 py-3 max-w-[260px] truncate">{d.title}</td>
                    <td className="px-3 py-3 text-secondary">{d.platform}</td>
                    <td className="px-3 py-3 font-mono">{(d.score * 100).toFixed(1)}%</td>
                    <td className="px-5 py-3 text-right"><StatusBadge status={d.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {detections.length === 0 && <div className="px-5 py-10 text-sm text-muted-foreground">No detections available.</div>}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="font-display text-lg font-semibold mb-1">Platforms</h2>
          <p className="text-xs text-muted-foreground mb-3">Detections by source</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={platforms} dataKey="value" innerRadius={48} outerRadius={78} paddingAngle={3} stroke="none">
                  {platforms.map((p: any, i: number) => <Cell key={i} fill={p.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--surface-1))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1.5">
            {platforms.map((p: any) => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
                  <span className="text-secondary">{p.name}</span>
                </div>
                <span className="font-mono">{p.value}</span>
              </div>
            ))}
            {platforms.length === 0 && <div className="text-xs text-muted-foreground">No platform stats yet.</div>}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function normalizeStatus(status: string) {
  const s = String(status || "").toUpperCase();
  if (s.includes("SAFE")) return "SAFE";
  if (s.includes("VERIFIED")) return "VERIFIED_PIRACY";
  if (s.includes("PIRATED")) return "PIRATED";
  if (s.includes("REVIEW")) return "REVIEW";
  return "PROCESSING";
}

function stringifyPayload(payload: unknown) {
  if (!payload) return "Webhook event received";
  if (typeof payload === "string") return payload;
  try {
    return JSON.stringify(payload).slice(0, 120);
  } catch {
    return "Webhook event received";
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

function inferLevel(text: string): "danger" | "warning" | "info" {
  const t = text.toLowerCase();
  if (t.includes("verified") || t.includes("piracy") || t.includes("blocked")) return "danger";
  if (t.includes("high") || t.includes("suspicious") || t.includes("match")) return "warning";
  return "info";
}

function Legend2({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-muted-foreground">
      <span className="h-2 w-2 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
      {label}
    </span>
  );
}
function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-surface-1/60 p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        {icon}{label}
      </div>
      <div className="mt-1 font-display text-lg font-semibold">{value}</div>
    </div>
  );
}
