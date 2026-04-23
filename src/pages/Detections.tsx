import { GlassCard } from "@/components/sg/GlassCard";
import { StatusBadge } from "@/components/sg/StatusBadge";
import { detectionsApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, Download, X, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const STATUS_OPTS = ["All", "SAFE", "PIRATED", "VERIFIED_PIRACY", "REVIEW", "PROCESSING"];

type DetectionRow = {
  id: string;
  title: string;
  platform: string;
  source_title: string;
  similarity: { video: number; audio: number; watermark: boolean };
  status: "SAFE" | "PIRATED" | "VERIFIED_PIRACY" | "REVIEW" | "PROCESSING";
  score: number;
  detected_at: string;
  source_url: string;
  source_key: string;
};

export default function Detections() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const [minScore, setMinScore] = useState(0);
  const [open, setOpen] = useState<DetectionRow | null>(null);
  const detectionsQuery = useQuery({ queryKey: ["detections-list"], queryFn: () => detectionsApi.list(), refetchInterval: 5000, refetchIntervalInBackground: true });

  const apiRows: DetectionRow[] = ((detectionsQuery.data ?? []) as any[]).map((d: any) => {
    const score = Number(d?.similarity ?? 0) / 100;
    const sourceTitle = d?.source_title || d?.suspect_video_name || d?.video_name || "Unknown video";
    const sourceUrl = d?.source_url || inferSourceUrl(d);
    return {
      id: `DET-${d?.id ?? "N/A"}`,
      title: sourceTitle,
      platform: d?.source || "Unknown",
      source_title: sourceTitle,
      similarity: {
        video: Math.round(Number(d?.similarity ?? 0)),
        audio: Math.round(Number(d?.similarity ?? 0)),
        watermark: String(d?.status || "").toUpperCase().includes("WATERMARK"),
      },
      status: normalizeStatus(d?.status),
      score,
      detected_at: d?.created_at || new Date().toISOString(),
      source_url: sourceUrl,
      source_key: d?.source_key || "",
    };
  });

  const rows = useMemo(() => apiRows.filter(d =>
    (status === "All" || d.status === status) &&
    d.score * 100 >= minScore &&
    (q === "" || d.title.toLowerCase().includes(q.toLowerCase()) || d.source_title.toLowerCase().includes(q.toLowerCase()) || d.id.toLowerCase().includes(q.toLowerCase()) || d.source_url.toLowerCase().includes(q.toLowerCase()))
  ).sort((a, b) => Number(b.id.replace(/^DET-/, "") || 0) - Number(a.id.replace(/^DET-/, "") || 0)), [apiRows, q, status, minScore]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Detections</h1>
          <p className="text-secondary mt-1">Reports & matches across all monitored sources.</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-border/60 bg-surface-2/70 px-4 py-2.5 text-sm hover:bg-surface-3/70 transition-colors">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <GlassCard className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 flex items-center gap-2 rounded-xl border border-border/60 bg-surface-1/70 px-3.5 py-2.5 focus-within:border-primary/60">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by title or ID…" className="w-full bg-transparent text-sm focus:outline-none" />
          </div>
          <select value={status} onChange={e => setStatus(e.target.value)} className="rounded-xl border border-border/60 bg-surface-1/70 px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary/60">
            {STATUS_OPTS.map(s => <option key={s} value={s} className="bg-surface-1">{s.replace("_", " ")}</option>)}
          </select>
          <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-surface-1/70 px-3.5 py-2.5">
            <span className="text-[10px] font-mono uppercase text-muted-foreground">Min score</span>
            <input type="range" min={0} max={100} value={minScore} onChange={e => setMinScore(+e.target.value)} className="flex-1 accent-primary" />
            <span className="font-mono text-sm w-10 text-right">{minScore}%</span>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead className="bg-surface-1/60 border-b border-border/60">
              <tr className="text-left text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3">ID</th>
                <th className="px-3 py-3">Title</th>
                <th className="px-3 py-3">Platform</th>
                <th className="px-3 py-3">Video</th>
                <th className="px-3 py-3">Audio</th>
                <th className="px-3 py-3">Watermark</th>
                <th className="px-3 py-3">Score</th>
                <th className="px-3 py-3">When</th>
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(d => (
                <tr key={d.id} onClick={() => setOpen(d)} className="border-b border-border/40 hover:bg-surface-3/40 transition-colors cursor-pointer">
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{d.id}</td>
                  <td className="px-3 py-3 max-w-[260px]">
                    <div className="truncate font-medium">{d.source_title}</div>
                    {d.title !== d.source_title && <div className="truncate text-[11px] text-muted-foreground">Matched: {d.title}</div>}
                  </td>
                  <td className="px-3 py-3 text-secondary">{d.platform}</td>
                  <td className="px-3 py-3 font-mono">{d.similarity.video}%</td>
                  <td className="px-3 py-3 font-mono">{d.similarity.audio}%</td>
                  <td className="px-3 py-3">{d.similarity.watermark ? <span className="text-success">✓</span> : <span className="text-muted-foreground">—</span>}</td>
                  <td className="px-3 py-3 font-mono">{(d.score * 100).toFixed(1)}%</td>
                  <td className="px-3 py-3 text-xs text-muted-foreground font-mono">{new Date(d.detected_at).toLocaleString()}</td>
                  <td className="px-5 py-3 text-right"><StatusBadge status={d.status} /></td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={9} className="px-5 py-16 text-center text-muted-foreground">No detections match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Detail drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)} className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm" />
            <motion.aside
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", duration: 0.3 }}
              className="fixed right-0 top-0 z-50 h-screen w-full max-w-md glass-strong border-l border-border/60 p-6 overflow-y-auto scrollbar-thin"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-mono text-xs text-muted-foreground">{open.id}</p>
                  <h2 className="font-display text-xl font-semibold mt-1">{open.title}</h2>
                </div>
                <button onClick={() => setOpen(null)} className="grid h-8 w-8 place-items-center rounded-lg border border-border/60 hover:bg-surface-3/60"><X className="h-4 w-4" /></button>
              </div>
              <StatusBadge status={open.status} />
              <div className="mt-5 grid grid-cols-3 gap-3">
                <Mini label="Video" value={`${open.similarity.video}%`} />
                <Mini label="Audio" value={`${open.similarity.audio}%`} />
                <Mini label="Score" value={`${(open.score * 100).toFixed(0)}%`} />
              </div>
              <div className="mt-4 rounded-xl border border-border/60 bg-surface-1/70 p-4 space-y-2 text-sm">
                <Row k="Platform" v={open.platform} />
                <Row k="Source title" v={open.source_title} />
                <Row k="Watermark" v={open.similarity.watermark ? "Verified" : "Not detected"} />
                <Row k="Detected" v={new Date(open.detected_at).toLocaleString()} />
                <Row k="Source" v={open.source_url ? <a href={open.source_url} target="_blank" rel="noreferrer" className="text-primary inline-flex items-center gap-1">Open <ExternalLink className="h-3 w-3" /></a> : <span className="text-muted-foreground">Not available</span>} />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button className="rounded-xl bg-grad-pink px-4 py-2.5 text-sm font-semibold shadow-[0_0_20px_hsl(var(--pink)/0.4)]">Issue takedown</button>
                <button className="rounded-xl border border-border/60 bg-surface-2/70 px-4 py-2.5 text-sm hover:bg-surface-3/70">Mark reviewed</button>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2">
                <Link
                  to={`/app/proof?id=${open.id.replace("DET-", "")}&kind=pirated`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/20 transition-colors"
                >
                  Open proof bundle
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-surface-1/70 p-3">
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-lg font-semibold">{value}</div>
    </div>
  );
}
function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">{k}</span><span>{v}</span></div>;
}

function normalizeStatus(status: string): DetectionRow["status"] {
  const s = String(status || "").toUpperCase();
  if (s.includes("SAFE")) return "SAFE";
  if (s.includes("VERIFIED")) return "VERIFIED_PIRACY";
  if (s.includes("PIRATED")) return "PIRATED";
  if (s.includes("REVIEW")) return "REVIEW";
  return "PROCESSING";
}

function inferSourceUrl(d: any) {
  const source = String(d?.source || "").toLowerCase();
  const key = String(d?.source_key || "");
  if (source.includes("youtube") && key) {
    const videoId = key.split(":").pop();
    return videoId ? `https://www.youtube.com/watch?v=${videoId}` : "";
  }
  if (source.includes("telegram") && key) {
    const [channel, messageId] = key.split(":");
    return channel && messageId ? `https://t.me/${channel}/${messageId}` : "";
  }
  return "";
}
