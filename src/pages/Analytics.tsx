import { GlassCard } from "@/components/sg/GlassCard";
import { MetricCard } from "@/components/sg/MetricCard";
import { analyticsApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Activity, ShieldAlert, Zap, ShieldCheck, TrendingUp } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function Analytics() {
  const overviewQuery = useQuery({ queryKey: ["analytics-overview"], queryFn: analyticsApi.overview, refetchInterval: 30000 });
  const timelineQuery = useQuery({ queryKey: ["analytics-timeline"], queryFn: analyticsApi.timeline, refetchInterval: 30000 });
  const similarityQuery = useQuery({ queryKey: ["analytics-similarity"], queryFn: analyticsApi.similarity, refetchInterval: 30000 });
  const topVideosQuery = useQuery({ queryKey: ["analytics-top-videos"], queryFn: analyticsApi.topVideos, refetchInterval: 30000 });
  const platformsQuery = useQuery({ queryKey: ["analytics-platforms"], queryFn: analyticsApi.platforms, refetchInterval: 30000 });

  const overview = {
    total_scans: Number(overviewQuery.data?.total_detections ?? 0),
    detections: Number(overviewQuery.data?.pirated ?? 0),
    verified_piracy: Number(overviewQuery.data?.viral ?? 0),
    takedowns: 0,
    trend: { scans: 0, detections: 0, verified: 0, takedowns: 0 },
  };

  const timeline = (timelineQuery.data ?? []).map((row: any, idx: number) => ({
    hour: row?.date ? String(row.date) : `T${idx + 1}`,
    detections: Number(row?.count ?? 0),
    scans: Number(row?.count ?? 0),
  }));

  const palette = ["#FF4D8D", "#2D9CDB", "#7B61FF", "#22C55E", "#F59E0B", "#F97316"];
  const platforms = (platformsQuery.data ?? []).map((p: any, index: number) => ({
    name: p?.platform || "Unknown",
    value: Number(p?.count ?? 0),
    color: palette[index % palette.length],
  }));

  const sim = Number(similarityQuery.data?.avg ?? 0);
  const similarity = Array.from({ length: 14 }, (_, i) => ({
    day: `D${i + 1}`,
    video: Math.round(sim),
    audio: Math.max(0, Math.round(sim - 10)),
    watermark: Math.min(100, Math.round(sim + 10)),
  }));

  const topVideos = (topVideosQuery.data ?? []).map((v: any, i: number) => ({
    id: `v-${i}`,
    title: v?.video || "Unknown video",
    platform: "Catalog",
    views: Number(v?.detections ?? 0),
    risk: Math.min(1, Number(v?.detections ?? 0) / 100),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-secondary mt-1">Executive intelligence across your protected catalog.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Scans" value={overview.total_scans.toLocaleString()} delta={overview.trend.scans} accent="blue" icon={<Activity className="h-4 w-4" />} index={0} />
        <MetricCard label="Detections" value={overview.detections.toLocaleString()} delta={overview.trend.detections} accent="primary" icon={<ShieldAlert className="h-4 w-4" />} index={1} />
        <MetricCard label="Verified piracy" value={overview.verified_piracy.toLocaleString()} delta={overview.trend.verified} accent="pink" icon={<Zap className="h-4 w-4" />} index={2} />
        <MetricCard label="Takedowns" value={overview.takedowns.toLocaleString()} delta={overview.trend.takedowns} accent="success" icon={<ShieldCheck className="h-4 w-4" />} index={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 p-6">
          <h2 className="font-display text-lg font-semibold mb-1">Detections over time</h2>
          <p className="text-xs text-muted-foreground mb-3">Hourly · last 24 h</p>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={timeline}>
                <defs>
                  <linearGradient id="d1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF4D8D" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#FF4D8D" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--divider))" strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--surface-1))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                <Area type="monotone" dataKey="detections" stroke="#FF4D8D" fill="url(#d1)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="font-display text-lg font-semibold mb-1">Platform breakdown</h2>
          <p className="text-xs text-muted-foreground mb-3">Verified piracy sources</p>
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={platforms} dataKey="value" innerRadius={48} outerRadius={80} paddingAngle={3} stroke="none">
                  {platforms.map((p: any, i: number) => <Cell key={i} fill={p.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--surface-1))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {platforms.map((p: any) => (
              <div key={p.name} className="flex justify-between text-xs">
                <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: p.color }} />{p.name}</span>
                <span className="font-mono">{p.value}</span>
              </div>
            ))}
            {platforms.length === 0 && <div className="text-xs text-muted-foreground">No platform data.</div>}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 p-6">
          <h2 className="font-display text-lg font-semibold mb-1">Similarity trends</h2>
          <p className="text-xs text-muted-foreground mb-3">Video / audio / watermark · 14 days</p>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={similarity}>
                <CartesianGrid stroke="hsl(var(--divider))" strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--surface-1))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                <Line type="monotone" dataKey="video" stroke="#7B61FF" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="audio" stroke="#2D9CDB" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="watermark" stroke="#22C55E" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold">Top videos</h2>
            <TrendingUp className="h-4 w-4 text-pink" />
          </div>
          <div className="space-y-3">
            {topVideos.map((v: any, i: number) => (
              <div key={v.id} className="rounded-xl border border-border/60 bg-surface-1/60 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-mono text-[10px] text-muted-foreground">#{i + 1} · {v.platform}</div>
                    <div className="truncate text-sm font-medium mt-0.5">{v.title}</div>
                  </div>
                  <span className="shrink-0 rounded-md bg-pink/15 text-pink border border-pink/40 px-2 py-0.5 text-[10px] font-mono">{(v.risk * 100).toFixed(0)}%</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{v.views.toLocaleString()} views</span>
                  <div className="h-1 w-28 rounded-full bg-surface-3 overflow-hidden">
                    <div className="h-full bg-grad-pink" style={{ width: `${v.risk * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
            {topVideos.length === 0 && <div className="text-sm text-muted-foreground">No top videos yet.</div>}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <h2 className="font-display text-lg font-semibold mb-1">Daily scans</h2>
        <p className="text-xs text-muted-foreground mb-3">Volume across edge nodes</p>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={timeline}>
              <CartesianGrid stroke="hsl(var(--divider))" strokeDasharray="3 6" vertical={false} />
              <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--surface-1))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
              <Bar dataKey="scans" fill="#7B61FF" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
}
