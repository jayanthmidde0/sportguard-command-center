import { GlassCard } from "@/components/sg/GlassCard";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, FileVideo, Loader2, Shield, Upload, X, AlertTriangle } from "lucide-react";
import { watermarkApi } from "@/lib/api";
import { toast } from "sonner";

type WatermarkResult = {
  verified?: boolean;
  extracted?: string;
  content_id?: string;
  owner?: string;
  embedded_at?: string;
  method?: string;
  [key: string]: unknown;
};

const WATERMARK_STATE_KEY = "sg_watermark_page_state";

export default function WatermarkPage() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<WatermarkResult | null>(null);
  const [lastFileName, setLastFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(WATERMARK_STATE_KEY);
    if (!raw) return;

    try {
      const saved = JSON.parse(raw);
      if (saved?.result) {
        setResult(saved.result);
        setProgress(Number(saved.progress ?? 0));
        setLastFileName(saved.lastFileName ? String(saved.lastFileName) : null);
      }
    } catch {
      sessionStorage.removeItem(WATERMARK_STATE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!result) {
      sessionStorage.removeItem(WATERMARK_STATE_KEY);
      return;
    }

    sessionStorage.setItem(
      WATERMARK_STATE_KEY,
      JSON.stringify({
        result,
        progress,
        lastFileName,
      })
    );
  }, [lastFileName, progress, result]);

  const verify = async () => {
    if (!file) return toast.error("Choose a suspect/broadcast video first");
    setPending(true);
    setProgress(0);
    setResult(null);
    try {
      const data = await watermarkApi.verify(file, undefined, (p) => setProgress(p));
      setResult(data as WatermarkResult);
      toast.success(data?.verified ? "Watermark verified" : "Watermark not found");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Verification failed";
      toast.error(message);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-6">
      <Header
        title="Watermark Verification"
        subtitle="Validate that the embedded watermark survives edits like crop, recolor, filters, and resize."
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
            className="min-h-[240px] rounded-2xl border-2 border-dashed border-border/70 bg-surface-1/50 p-8 grid place-items-center text-center cursor-pointer hover:border-primary/60 transition-colors"
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
            <div>
              <div className="mx-auto h-14 w-14 rounded-2xl bg-grad-cyber grid place-items-center mb-4 shadow-[0_0_30px_hsl(var(--primary)/0.4)]">
                <Upload className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-semibold">Drop video to verify watermark</h3>
              <p className="text-sm text-muted-foreground mt-1">DWT extraction uses multi-frame voting for higher robustness.</p>
              {result && !file && (
                <div className="mt-4 rounded-xl border border-border/60 bg-surface-1/70 px-4 py-3 text-left text-sm">
                  <div className="font-semibold">Last verification preserved</div>
                  <div className="mt-1 text-muted-foreground">
                    {lastFileName ? `${lastFileName} · ` : ""}
                    {result?.verified ? "Watermark verified" : "No valid watermark detected"}
                  </div>
                </div>
              )}
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

          {pending && (
            <div className="mt-4 rounded-xl border border-border/60 bg-surface-1/60 p-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-foreground"><Loader2 className="h-4 w-4 animate-spin text-primary" /> Verifying watermark</div>
                <span className="font-mono text-xs text-primary">{progress}%</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-surface-3 overflow-hidden">
                <div className="h-full bg-grad-cyber transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {result && (
            <div className="mt-4 rounded-xl border p-4 bg-surface-1/60 border-border/60">
              <div className="flex items-center gap-2">
                {result?.verified ? <CheckCircle2 className="h-5 w-5 text-success" /> : <AlertTriangle className="h-5 w-5 text-warning" />}
                <h3 className="font-display text-lg font-semibold">{result?.verified ? "Watermark verified" : "No valid watermark detected"}</h3>
              </div>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <MetaItem k="Method" v={String(result?.method || "-")} />
                <MetaItem k="Verified" v={String(Boolean(result?.verified))} />
                <MetaItem k="Content ID" v={String(result?.content_id || "-")} />
                <MetaItem k="Owner" v={String(result?.owner || "-")} />
                <MetaItem k="Embedded At" v={String(result?.embedded_at || "-")} />
              </div>
            </div>
          )}

          {result && (
            <div className="mt-3 rounded-xl border border-border/60 bg-surface-1/70 p-3 text-xs text-muted-foreground">
              <div className="font-semibold text-foreground">Last verification file</div>
              <div className="mt-1 break-all">{lastFileName || "Unknown file"}</div>
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="font-display text-lg font-semibold">Why this works</h3>
          <ul className="mt-4 space-y-2 text-sm text-secondary">
            <li className="rounded-lg border border-border/60 bg-surface-1/60 px-3 py-2">DWT embeds signal in low-frequency structure</li>
            <li className="rounded-lg border border-border/60 bg-surface-1/60 px-3 py-2">QIM bit placement improves tolerance to filtering/compression</li>
            <li className="rounded-lg border border-border/60 bg-surface-1/60 px-3 py-2">Multi-frame majority voting resists frame-level noise</li>
            <li className="rounded-lg border border-border/60 bg-surface-1/60 px-3 py-2">CRC packet validation reduces false positives</li>
          </ul>

          <button
            onClick={verify}
            disabled={!file || pending}
            className="mt-6 w-full rounded-xl bg-grad-cyber px-4 py-3 text-sm font-semibold shadow-[0_0_24px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_36px_hsl(var(--primary)/0.7)] transition-shadow disabled:opacity-50"
          >
            {pending ? "Verifying..." : "Verify Watermark"}
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

function MetaItem({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-surface-2/50 px-3 py-2">
      <div className="text-muted-foreground">{k}</div>
      <div className="truncate">{v}</div>
    </div>
  );
}
