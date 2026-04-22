import { GlassCard } from "@/components/sg/GlassCard";
import { StatusBadge } from "@/components/sg/StatusBadge";
import { useEffect, useRef, useState } from "react";
import { ScanSearch, FileVideo, X, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { videosApi } from "@/lib/api";
import { toast } from "sonner";

type Match = {
  id: string; title: string; platform: string;
  video: number; audio: number; watermark: boolean;
  status: "SAFE" | "PIRATED" | "VERIFIED_PIRACY" | "REVIEW";
  score: number;
};

export default function DetectPage() {
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<"idle" | "uploading" | "frames" | "audio" | "match" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<Match[]>([]);
  const [statusText, setStatusText] = useState("Waiting for upload");
  const [elapsedSec, setElapsedSec] = useState(0);
  const [inFlight, setInFlight] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) setFile(f);
  };

  const run = async () => {
    if (!file) return toast.error("Choose a suspicious video first");
    setStage("uploading"); setProgress(0); setResults([]);
    setStatusText("Uploading file to detection service...");
    setElapsedSec(0);
    setInFlight(true);

    const t1 = setTimeout(() => {
      setStage("frames");
      setStatusText("Extracting frames and building visual fingerprint...");
    }, 1500);
    const t2 = setTimeout(() => {
      setStage("audio");
      setStatusText("Analyzing audio spectrogram + frequency peaks...");
    }, 5000);
    const t3 = setTimeout(() => {
      setStage("match");
      setStatusText("Matching against reference catalog and fusing confidence...");
    }, 9000);

    try {
      const res = await videosApi.detect(file, { title: file.name }, p => setProgress(p));
      if (progress < 100) {
        setProgress(100);
      }
      const matches: Match[] = ((res?.results ?? []) as any[]).map((m: any, index: number) => ({
        id: `REF-${index + 1}`,
        title: m?.video || "Unknown reference",
        platform: "Reference Library",
        video: Math.round(Number(m?.video_similarity ?? 0)),
        audio: Math.round(Number(m?.audio_similarity ?? 0)),
        watermark: Boolean(m?.watermark_verified),
        status: normalizeStatus(m?.status),
        score: Math.max(0, Math.min(1, Math.max(Number(m?.video_similarity ?? 0), Number(m?.audio_similarity ?? 0)) / 100)),
      }));
      setStage("done");
      setStatusText("Detection finished.");
      setResults(matches);
      toast.success("Detection complete");
    } catch (e: any) {
      setStage("idle");
      setProgress(0);
      setStatusText("Detection failed.");
      toast.error(e?.message || "Detection failed");
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setInFlight(false);
    }
  };

  useEffect(() => {
    if (!inFlight) return;
    const timer = setInterval(() => {
      setElapsedSec((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [inFlight]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Detect suspicious video</h1>
        <p className="text-secondary mt-1">Compare any clip against your indexed reference library.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 p-6">
          <div
            onDrop={onDrop} onDragOver={(e) => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center justify-center min-h-[260px] rounded-2xl border-2 border-dashed border-border/70 bg-surface-1/40 p-8 text-center cursor-pointer hover:border-pink/60 hover:bg-pink/5 transition-all"
          >
            <input ref={inputRef} type="file" accept="video/*" hidden onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
            <div className="h-14 w-14 rounded-2xl bg-grad-pink grid place-items-center mb-4 shadow-[0_0_30px_hsl(var(--pink)/0.4)]">
              <ScanSearch className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-semibold">Drop suspicious clip here</h3>
            <p className="text-sm text-muted-foreground mt-1">We'll fingerprint and match it instantly.</p>
            {file && (
              <div className="mt-5 inline-flex items-center gap-3 rounded-xl border border-pink/40 bg-pink/10 px-4 py-2.5">
                <FileVideo className="h-4 w-4 text-pink" />
                <span className="text-sm">{file.name}</span>
                <button onClick={(e) => { e.stopPropagation(); setFile(null); setStage("idle"); setResults([]); }} className="text-muted-foreground hover:text-danger"><X className="h-3.5 w-3.5" /></button>
              </div>
            )}
          </div>

          {stage !== "idle" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              <Stage label="Upload" active={stage === "uploading"} done={["frames","audio","match","done"].includes(stage)} progress={progress} />
              <Stage label="Frames" active={stage === "frames"} done={["audio","match","done"].includes(stage)} />
              <Stage label="Audio" active={stage === "audio"} done={["match","done"].includes(stage)} />
              <Stage label="Match" active={stage === "match"} done={stage === "done"} />
            </motion.div>
          )}

          {stage !== "idle" && (
            <div className="mt-4 rounded-xl border border-border/60 bg-surface-2/50 p-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-secondary">{statusText}</p>
                <p className="text-xs font-mono text-muted-foreground">Elapsed: {formatElapsed(elapsedSec)}</p>
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="font-display text-lg font-semibold">Ranked matches</h3>
              {results.map((m, i) => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="rounded-2xl border border-border/60 bg-surface-1/70 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div>
                      <div className="font-semibold">{m.title}</div>
                      <div className="text-xs text-muted-foreground font-mono">{m.id} · {m.platform}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm">{(m.score * 100).toFixed(1)}%</span>
                      <StatusBadge status={m.status} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Bar label="Video" value={m.video} color="#7B61FF" />
                    <Bar label="Audio" value={m.audio} color="#2D9CDB" />
                    <div className="rounded-xl border border-border/60 bg-surface-2/60 p-3">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Watermark</div>
                      <div className="mt-1 flex items-center gap-2">
                        {m.watermark ? <><CheckCircle2 className="h-4 w-4 text-success" /><span className="text-success font-semibold text-sm">Verified</span></>
                          : <><X className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground text-sm">Not found</span></>}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="font-display text-lg font-semibold mb-4">Run detection</h3>
          <p className="text-sm text-secondary mb-4">Detection compares the uploaded clip against every indexed reference using:</p>
          <ul className="text-sm space-y-2 mb-5">
            {["Perceptual frame hashing", "Audio chromaprint", "Embedded watermark verification", "Confidence fusion model"].map(t => (
              <li key={t} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> {t}</li>
            ))}
          </ul>
          <button onClick={run} disabled={!file || (stage !== "idle" && stage !== "done")} className="w-full rounded-xl bg-grad-pink px-4 py-3 text-sm font-semibold shadow-[0_0_24px_hsl(var(--pink)/0.4)] hover:shadow-[0_0_36px_hsl(var(--pink)/0.7)] transition-shadow disabled:opacity-50">
            {(stage !== "idle" && stage !== "done") ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Analyzing…</span> : "Run detection"}
          </button>
        </GlassCard>
      </div>
    </div>
  );
}

function Stage({ label, active, done, progress }: { label: string; active?: boolean; done?: boolean; progress?: number }) {
  return (
    <div className={`rounded-xl border p-3 transition-colors ${active ? "border-primary/60 bg-primary/10" : done ? "border-success/40 bg-success/5" : "border-border/60 bg-surface-1/60"}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</span>
        {done ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> : active ? <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" /> : <span className="h-3.5 w-3.5 rounded-full border border-border" />}
      </div>
      {typeof progress === "number" && active && (
        <div className="mt-2 h-1 rounded-full bg-surface-3 overflow-hidden">
          <div className="h-full bg-grad-cyber" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-surface-2/60 p-3">
      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        <span>{label}</span><span style={{ color }}>{value}%</span>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-surface-3 overflow-hidden">
        <div className="h-full" style={{ width: `${value}%`, background: color, boxShadow: `0 0 10px ${color}` }} />
      </div>
    </div>
  );
}

function normalizeStatus(status: string): Match["status"] {
  const s = String(status || "").toUpperCase();
  if (s.includes("SAFE")) return "SAFE";
  if (s.includes("VERIFIED")) return "VERIFIED_PIRACY";
  if (s.includes("PIRATED")) return "PIRATED";
  return "REVIEW";
}

function formatElapsed(totalSec: number) {
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
