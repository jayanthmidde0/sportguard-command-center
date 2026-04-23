import { GlassCard } from "@/components/sg/GlassCard";
import { useEffect, useRef, useState } from "react";
import { Upload as UploadIcon, FileVideo, X, CheckCircle2, Loader2, Download } from "lucide-react";
import { motion } from "framer-motion";
import { videosApi } from "@/lib/api";
import { toast } from "sonner";

type UploadResult = {
  broadcast_download_url?: string;
  broadcast_video?: string;
  watermark?: {
    method?: string;
  };
  [key: string]: unknown;
};

const UPLOAD_STATE_KEY = "sg_upload_page_state";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<"idle" | "uploading" | "processing" | "done">("idle");
  const [result, setResult] = useState<UploadResult | null>(null);
  const [lastFileName, setLastFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(UPLOAD_STATE_KEY);
    if (!raw) return;

    try {
      const saved = JSON.parse(raw);
      if (saved?.result) {
        setResult(saved.result);
        setStage(saved.stage === "done" ? "done" : "idle");
        setProgress(Number(saved.progress ?? 0));
        setTitle(String(saved.title ?? ""));
        setDescription(String(saved.description ?? ""));
        setLastFileName(saved.lastFileName ? String(saved.lastFileName) : null);
      }
    } catch {
      sessionStorage.removeItem(UPLOAD_STATE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!result) {
      sessionStorage.removeItem(UPLOAD_STATE_KEY);
      return;
    }

    sessionStorage.setItem(
      UPLOAD_STATE_KEY,
      JSON.stringify({
        result,
        stage,
        progress,
        title,
        description,
        lastFileName,
      })
    );
  }, [description, lastFileName, progress, result, stage, title]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) {
      setFile(f);
      setLastFileName(f.name);
    }
  };

  const submit = async () => {
    if (!file) return toast.error("Choose a video first");
    setStage("uploading");
    setProgress(0);
    setResult(null);
    try {
      const data = await videosApi.uploadReference(file, { title, description }, (p) => setProgress(p));
      setResult(data as UploadResult);
      setStage("processing");
      setTimeout(() => { setStage("done"); toast.success("Reference fingerprint indexed"); }, 800);
    } catch (error: unknown) {
      setStage("idle");
      setProgress(0);
      const message = error instanceof Error ? error.message : "Upload failed";
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <Header title="Upload reference video" subtitle="Index a master broadcast for continuous fingerprint matching." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 p-6">
          <div
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
            className="group relative flex flex-col items-center justify-center min-h-[280px] rounded-2xl border-2 border-dashed border-border/70 bg-surface-1/40 p-8 text-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all"
          >
            <input
              ref={inputRef}
              type="file"
              accept="video/*"
              hidden
              onChange={(e) => {
                const nextFile = e.target.files?.[0];
                if (nextFile) {
                  setFile(nextFile);
                  setLastFileName(nextFile.name);
                }
              }}
            />
            <div className="h-14 w-14 rounded-2xl bg-grad-cyber grid place-items-center mb-4 shadow-[0_0_30px_hsl(var(--primary)/0.4)]">
              <UploadIcon className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-semibold">Drop your reference video here</h3>
            <p className="text-sm text-muted-foreground mt-1">MP4, MOV, MKV — up to 5 GB · audio + video fingerprint</p>
            {result && !file && (
              <div className="mt-4 rounded-xl border border-border/60 bg-surface-1/70 px-4 py-3 text-left text-sm">
                <div className="font-semibold">Last upload preserved</div>
                <div className="mt-1 text-muted-foreground">
                  {lastFileName ? `${lastFileName} · ` : ""}
                  Watermarked copy is still available below.
                </div>
              </div>
            )}
            {file && (
              <div className="mt-5 inline-flex items-center gap-3 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2.5">
                <FileVideo className="h-4 w-4 text-primary" />
                <span className="text-sm">{file.name}</span>
                <span className="text-xs text-muted-foreground font-mono">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                <button onClick={(e) => { e.stopPropagation(); setFile(null); setStage(result ? "done" : "idle"); setProgress(0); }} className="text-muted-foreground hover:text-danger"><X className="h-3.5 w-3.5" /></button>
              </div>
            )}
          </div>

          {stage !== "idle" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-3">
              <Stage label="Uploading" active={stage === "uploading"} done={stage !== "uploading"} progress={progress} />
              <Stage label="Extracting frames & audio" active={stage === "processing"} done={stage === "done"} />
              <Stage label="Indexing fingerprint" done={stage === "done"} />
            </motion.div>
          )}
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="font-display text-lg font-semibold mb-4">Metadata</h3>
          <label className="block mb-4">
            <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">Title</span>
            <input value={title} onChange={e => setTitle(e.target.value)} className="mt-1.5 w-full rounded-xl border border-border/60 bg-surface-1/70 px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary/60" placeholder="UEFA Final 2025 — Master" />
          </label>
          <label className="block mb-5">
            <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">Description</span>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="mt-1.5 w-full rounded-xl border border-border/60 bg-surface-1/70 px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary/60 resize-none" placeholder="Notes about the broadcast" />
          </label>
          <button onClick={submit} disabled={!file || stage === "uploading" || stage === "processing"} className="w-full rounded-xl bg-grad-cyber px-4 py-3 text-sm font-semibold shadow-[0_0_24px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_36px_hsl(var(--primary)/0.7)] transition-shadow disabled:opacity-50">
            {stage === "uploading" ? "Uploading…" : stage === "processing" ? "Processing…" : "Upload & index"}
          </button>

          {result?.broadcast_download_url && (
            <a
              href={result.broadcast_download_url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm font-semibold text-success hover:bg-success/20 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download watermarked copy
            </a>
          )}

          {result && (
            <div className="mt-3 rounded-xl border border-border/60 bg-surface-1/70 p-3 text-xs text-muted-foreground">
              <div className="font-semibold text-foreground">Last successful upload</div>
              <div className="mt-1 break-all">
                {lastFileName || "Unknown file"}
              </div>
            </div>
          )}
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
          <span className={done ? "text-foreground" : active ? "text-foreground" : "text-muted-foreground"}>{label}</span>
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
