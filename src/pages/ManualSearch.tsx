import { GlassCard } from "@/components/sg/GlassCard";
import { StatusBadge } from "@/components/sg/StatusBadge";
import { Search, Loader2 } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const sample = [
  { id: "S1", title: "[LIVE] UEFA Final HD 1080p", platform: "YouTube", url: "youtube.com/watch?v=abc", risk: 0.94, status: "VERIFIED_PIRACY" as const },
  { id: "S2", title: "UEFA Final replay full match", platform: "Telegram", url: "t.me/sport_hd/124", risk: 0.81, status: "PIRATED" as const },
  { id: "S3", title: "Champions League highlights", platform: "TikTok", url: "tiktok.com/@clipsdaily", risk: 0.62, status: "REVIEW" as const },
  { id: "S4", title: "Football Tactics Breakdown", platform: "YouTube", url: "youtube.com/watch?v=xyz", risk: 0.18, status: "SAFE" as const },
];

export default function ManualSearch() {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<typeof sample>([]);

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setResults([]);
    setTimeout(() => { setResults(sample); setBusy(false); }, 900);
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
                    <div className="text-xs text-muted-foreground truncate mt-0.5">{r.url}</div>
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
