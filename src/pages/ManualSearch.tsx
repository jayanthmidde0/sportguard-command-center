import { GlassCard } from "@/components/sg/GlassCard";
import { StatusBadge } from "@/components/sg/StatusBadge";
import { detectionsApi } from "@/lib/api";
import { Search, Loader2 } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";

type SearchRow = { id: string; title: string; platform: string; url: string; risk: number; status: "SAFE" | "PIRATED" | "VERIFIED_PIRACY" | "REVIEW" | "PROCESSING" };

export default function ManualSearch() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchRow[]>([]);
  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      const rows = await detectionsApi.list();
      const value = query.toLowerCase().trim();
      return (rows ?? [])
        .filter((d: any) => !value || String(d?.video_name || "").toLowerCase().includes(value) || String(d?.source || "").toLowerCase().includes(value))
        .slice(0, 24)
        .map((d: any) => ({
          id: `S-${d?.id ?? "N/A"}`,
          title: d?.video_name || "Unknown video",
          platform: d?.source || "Unknown",
          url: "",
          risk: Math.max(0, Math.min(1, Number(d?.similarity ?? 0) / 100)),
          status: normalizeStatus(d?.status),
        }));
    },
    onSuccess: setResults,
  });

  const busy = searchMutation.isPending;

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    setResults([]);
    searchMutation.mutate(q);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Manual search</h1>
        <p className="text-secondary mt-1">Probe any keyword, channel or URL across the open web.</p>
      </div>

      <GlassCard className="p-5">
        <form onSubmit={search} className="flex gap-3">
          <div className="flex-1 flex items-center gap-2 rounded-xl border border-border/60 bg-surface-1/70 px-4 py-3 focus-within:border-primary/60 focus-within:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="UEFA Final, channel @sport_hd, https://…" className="w-full bg-transparent text-sm focus:outline-none" />
          </div>
          <button disabled={busy} className="rounded-xl bg-grad-cyber px-5 py-3 text-sm font-semibold shadow-[0_0_20px_hsl(var(--primary)/0.4)] disabled:opacity-60">
            {busy ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Scanning…</span> : "Search"}
          </button>
        </form>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {["YouTube", "Telegram", "TikTok", "Twitch", "X.com"].map(p => (
            <span key={p} className="rounded-full border border-border/60 bg-surface-1/60 px-3 py-1 text-secondary">{p}</span>
          ))}
        </div>
      </GlassCard>

      {busy && (
        <GlassCard className="p-10 text-center">
          <Loader2 className="h-8 w-8 mx-auto text-primary animate-spin" />
          <p className="mt-3 text-secondary">Crawling indexed platforms…</p>
        </GlassCard>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <GlassCard className="p-5" glow="primary">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground font-mono">{r.platform}</div>
                    <div className="font-semibold mt-0.5 truncate">{r.title}</div>
                    <div className="text-xs text-muted-foreground truncate mt-0.5">{r.url || "No source URL"}</div>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex-1 h-1.5 rounded-full bg-surface-3 overflow-hidden">
                    <div className="h-full bg-grad-pink" style={{ width: `${r.risk * 100}%` }} />
                  </div>
                  <span className="font-mono text-sm">{(r.risk * 100).toFixed(0)}%</span>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {!busy && results.length === 0 && (
        <GlassCard className="p-12 text-center">
          <div className="h-14 w-14 mx-auto rounded-2xl bg-grad-purple grid place-items-center mb-3"><Search className="h-6 w-6" /></div>
          <h3 className="font-display text-lg font-semibold">Search the open web</h3>
          <p className="text-sm text-muted-foreground mt-1">Enter a keyword, channel handle or URL above to begin.</p>
        </GlassCard>
      )}
    </div>
  );
}

function normalizeStatus(status: string): SearchRow["status"] {
  const s = String(status || "").toUpperCase();
  if (s.includes("SAFE")) return "SAFE";
  if (s.includes("VERIFIED")) return "VERIFIED_PIRACY";
  if (s.includes("PIRATED")) return "PIRATED";
  if (s.includes("REVIEW")) return "REVIEW";
  return "PROCESSING";
}
