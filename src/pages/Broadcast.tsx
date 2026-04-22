import { GlassCard } from "@/components/sg/GlassCard";
import { useRef, useState } from "react";
import { Upload, RadioTower, CheckCircle2, Loader2, FileVideo, X, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { videosApi } from "@/lib/api";
import { toast } from "sonner";

export default function BroadcastPage() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<"idle" | "upload" | "watermark" | "save" | "done">("idle");
  const [result, setResult] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const run = async () => {
    if (!file) return toast.error("Choose a broadcast source video first");
    setStage("upload");
    setProgress(0);
    setResult(null);

    const t1 = setTimeout(() => setStage("watermark"), 1200);
    const t2 = setTimeout(() => setStage("save"), 2600);

    try {
      const data = await videosApi.uploadReference(file, { title: file.name }, (p) => setProgress(p));
      setStage("done");
      setProgress(100);
      setResult(data);
      toast.success("Broadcast version ready with watermark");
    } catch (e: any) {
      setStage("idle");
      setProgress(0);
      toast.error(e?.message || "Broadcast preparation failed");
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
    }
  };

  return (
    <div className="space-y-6">
      <Header
        title="Broadcast Pipeline"
        subtitle="Upload source video, embed robust DWT watermark, then broadcast only the protected version."
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <GlassCard className="xl:col-span-2 p-6">
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) setFile(f);
            }}
            className="min-h-[260px] rounded-2xl border-2 border-dashed border-border/70 bg-surface-1/50 p-8 grid place-items-center text-center cursor-pointer hover:border-primary/60 transition-colors"
          >
            <input
              ref={inputRef}
              type="file"
              accept="video/*"
              hidden
              onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
            />
            <div>
              <div className="mx-auto h-14 w-14 rounded-2xl bg-grad-cyber grid place-items-center mb-4 shadow-[0_0_30px_hsl(var(--primary)/0.4)]">
                <Upload className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-semibold">Drop source video for broadcast</h3>
              <p className="text-sm text-muted-foreground mt-1">We will embed DWT watermark and store the broadcast-safe asset.</p>
              {file && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2">
                  <FileVideo className="h-4 w-4 text-primary" />
                  <span className="text-sm">{file.name}</span>
                  <button className="text-muted-foreground hover:text-danger" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {stage !== "idle" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-3">
              <Stage label="Upload video" active={stage === "upload"} done={["watermark", "save", "done"].includes(stage)} progress={progress} />
              <Stage label="Embed watermark (DWT)" active={stage === "watermark"} done={["save", "done"].includes(stage)} />
              <Stage label="Save + register" active={stage === "save"} done={stage === "done"} />
            </motion.div>
          )}

          {result && (
            <div className="mt-5 rounded-xl border border-success/30 bg-success/10 p-4">
              <p className="text-sm font-medium text-success">Broadcast version is ready.</p>
              <p className="text-xs text-muted-foreground mt-1">Broadcast this protected asset only.</p>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <MetaItem k="Method" v={result?.watermark?.method || "DWT-QIM"} />
                <MetaItem k="Embedded frames" v={String(result?.watermark?.embedded_frames ?? "-")} />
                <MetaItem k="Broadcast video" v={String(result?.broadcast_video ?? "-")} />
                <MetaItem k="Embeddings" v={String(result?.embeddings_count ?? 0)} />
              </div>
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="font-display text-lg font-semibold">Flow</h3>
          <div className="mt-4 space-y-3 text-sm">
            <FlowStep text="Upload video" done={stage !== "idle"} />
            <ArrowLine />
            <FlowStep text="Embed watermark (DWT)" done={["watermark", "save", "done"].includes(stage)} />
            <ArrowLine />
            <FlowStep text="Save + register" done={["save", "done"].includes(stage)} />
            <ArrowLine />
            <div className="rounded-xl border border-primary/30 bg-primary/10 p-3 font-semibold">
              🎥 Broadcast THIS version
            </div>
          </div>

          <button
            onClick={run}
            disabled={!file || stage === "upload" || stage === "watermark" || stage === "save"}
            className="mt-6 w-full rounded-xl bg-grad-cyber px-4 py-3 text-sm font-semibold shadow-[0_0_24px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_36px_hsl(var(--primary)/0.7)] transition-shadow disabled:opacity-50"
          >
            {stage === "idle" || stage === "done" ? "Prepare Broadcast Version" : "Preparing..."}
          </button>
        </GlassCard>
      </div>
    </div>
  );
}

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="text-secondary mt-1">{subtitle}</p>
    </div>
  );
}

function Stage({ label, active, done, progress }: { label: string; active?: boolean; done?: boolean; progress?: number }) {
  return (
    <div className="rounded-xl border border-border/60 bg-surface-1/60 p-3">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2.5">
          {done ? <CheckCircle2 className="h-4 w-4 text-success" /> : active ? <Loader2 className="h-4 w-4 text-primary animate-spin" /> : <span className="h-4 w-4 rounded-full border border-border" />}
          <span className={done || active ? "text-foreground" : "text-muted-foreground"}>{label}</span>
        </div>
        {typeof progress === "number" && active && <span className="font-mono text-xs text-primary">{progress}%</span>}
      </div>
      {typeof progress === "number" && active && (
        <div className="mt-2 h-1.5 rounded-full bg-surface-3 overflow-hidden">
          <div className="h-full bg-grad-cyber transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}

function FlowStep({ text, done }: { text: string; done: boolean }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-surface-1/60 px-3 py-2.5">
      {done ? <CheckCircle2 className="h-4 w-4 text-success" /> : <RadioTower className="h-4 w-4 text-muted-foreground" />}
      <span>{text}</span>
    </div>
  );
}

function ArrowLine() {
  return <div className="mx-2 h-4 border-l border-border/60" />;
}

function MetaItem({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-surface-2/50 px-3 py-2">
      <div className="text-muted-foreground">{k}</div>
      <div className="truncate">{v}</div>
    </div>
  );
}
