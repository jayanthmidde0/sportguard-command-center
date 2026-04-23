import { GlassCard } from "@/components/sg/GlassCard";
import { useRef, useState } from "react";
import { Upload, RadioTower, CheckCircle2, Loader2, FileVideo, Download, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { videosApi } from "@/lib/api";
import { toast } from "sonner";

type BroadcastItem = {
  id: string;
  file: File;
  status: "queued" | "uploading" | "done" | "error";
  progress: number;
  result?: any;
  error?: string;
};

export default function BroadcastPage() {
  const [items, setItems] = useState<BroadcastItem[]>([]);
  const [running, setRunning] = useState(false);
  const [playbackMode, setPlaybackMode] = useState<"single" | "replay" | "multi">("single");
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (fileList?: FileList | null) => {
    const selected = Array.from(fileList || []).filter((file) => file.type.startsWith("video/"));
    if (!selected.length) return;

    setItems((current) => [
      ...current,
      ...selected.map((file, index) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${index}-${current.length}`,
        file,
        status: "queued" as const,
        progress: 0,
      })),
    ]);
  };

  const updateItem = (id: string, patch: Partial<BroadcastItem>) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const run = async () => {
    if (!items.length) return toast.error("Choose one or more broadcast source videos first");

    setRunning(true);

    for (const item of items) {
      updateItem(item.id, { status: "uploading", progress: 0, error: undefined });

      try {
        const data = await videosApi.uploadReference(
          item.file,
          { title: item.file.name, playback_mode: playbackMode },
          (progress) => updateItem(item.id, { progress })
        );

        updateItem(item.id, {
          status: "done",
          progress: 100,
          result: data,
        });
      } catch (e: any) {
        const message = e?.message || "Broadcast preparation failed";
        updateItem(item.id, {
          status: "error",
          error: message,
        });
        toast.error(`${item.file.name}: ${message}`);
      }
    }

    setRunning(false);
    toast.success("Broadcast queue processed");
  };

  const completedCount = items.filter((item) => item.status === "done").length;
  const erroredCount = items.filter((item) => item.status === "error").length;

  return (
    <div className="space-y-6">
      <Header
        title="Broadcast Pipeline"
        subtitle="Select one or more source videos, watermark each one, then download and broadcast the protected versions only."
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <GlassCard className="xl:col-span-2 p-6">
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              addFiles(e.dataTransfer.files);
            }}
            className="min-h-[260px] rounded-2xl border-2 border-dashed border-border/70 bg-surface-1/50 p-8 grid place-items-center text-center cursor-pointer hover:border-primary/60 transition-colors"
          >
            <input
              ref={inputRef}
              type="file"
              accept="video/*"
              multiple
              hidden
              onChange={(e) => addFiles(e.target.files)}
            />
            <div>
              <div className="mx-auto h-14 w-14 rounded-2xl bg-grad-cyber grid place-items-center mb-4 shadow-[0_0_30px_hsl(var(--primary)/0.4)]">
                <Upload className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-semibold">Drop source videos for broadcast</h3>
              <p className="text-sm text-muted-foreground mt-1">Each file is sent through the upload flow, watermarked, and returned as a downloadable protected copy.</p>
            </div>
          </div>

          {items.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-3">
              <div className="rounded-xl border border-border/60 bg-surface-1/60 p-3 flex items-center justify-between text-sm">
                <span>{items.length} file{items.length === 1 ? "" : "s"} queued</span>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <span>{completedCount} ready</span>
                  <span>{erroredCount} failed</span>
                </div>
              </div>

              {items.map((item) => (
                <BroadcastItemCard
                  key={item.id}
                  item={item}
                  playbackMode={playbackMode}
                  onRemove={() => setItems((current) => current.filter((currentItem) => currentItem.id !== item.id))}
                />
              ))}
            </motion.div>
          )}
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="font-display text-lg font-semibold">Flow</h3>
          <div className="mt-4 space-y-3 text-sm">
            <FlowStep text="Select one or more source videos" done={items.length > 0} />
            <ArrowLine />
            <FlowStep text="Upload each file through the reference flow" done={running || completedCount > 0} />
            <ArrowLine />
            <FlowStep text="Get the watermarked broadcast copy" done={completedCount > 0} />
            <ArrowLine />
            <div className="rounded-xl border border-primary/30 bg-primary/10 p-3 font-semibold">
              Download and broadcast only the watermarked file
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-border/60 bg-surface-1/60 p-3">
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Playback mode</label>
            <select
              value={playbackMode}
              onChange={(e) => setPlaybackMode(e.target.value as typeof playbackMode)}
              className="mt-2 w-full rounded-lg border border-border/60 bg-surface-2/80 px-3 py-2 text-sm outline-none"
            >
              <option value="single">Single view</option>
              <option value="replay">Replay allowed</option>
              <option value="multi">Multi video view</option>
            </select>
            <p className="mt-2 text-xs text-muted-foreground">
              The selected mode is attached to the upload request and shown with the broadcast result.
            </p>
          </div>

          <button
            onClick={run}
            disabled={!items.length || running}
            className="mt-6 w-full rounded-xl bg-grad-cyber px-4 py-3 text-sm font-semibold shadow-[0_0_24px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_36px_hsl(var(--primary)/0.7)] transition-shadow disabled:opacity-50"
          >
            {running ? "Preparing..." : "Prepare Broadcast Versions"}
          </button>

          <button
            onClick={() => setItems([])}
            disabled={!items.length || running}
            className="mt-3 w-full rounded-xl border border-border/60 bg-surface-1/70 px-4 py-3 text-sm font-semibold hover:border-primary/60 transition-colors disabled:opacity-50"
          >
            Clear queue
          </button>

          {playbackMode === "multi" && completedCount > 0 && (
            <div className="mt-5 rounded-xl border border-info/30 bg-info/10 p-3">
              <div className="text-xs font-mono uppercase tracking-wider text-info">Multi view preview</div>
              <div className="mt-3 grid grid-cols-1 gap-3">
                {items
                  .filter((item) => item.status === "done" && item.result?.broadcast_download_url)
                  .map((item) => (
                    <video
                      key={item.id}
                      src={item.result.broadcast_download_url}
                      controls
                      playsInline
                      className="w-full rounded-lg border border-border/60 bg-black"
                    />
                  ))}
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

function BroadcastItemCard({ item, playbackMode, onRemove }: { item: BroadcastItem; playbackMode: "single" | "replay" | "multi"; onRemove: () => void }) {
  const downloadUrl = item.result?.broadcast_download_url || item.result?.broadcast_video_url;

  return (
    <div className="rounded-xl border border-border/60 bg-surface-1/60 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex items-center gap-3">
          <FileVideo className="h-5 w-5 text-primary shrink-0" />
          <div className="min-w-0">
            <p className="truncate font-medium">{item.file.name}</p>
            <p className="text-xs text-muted-foreground font-mono">{(item.file.size / 1024 / 1024).toFixed(1)} MB</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {item.status === "done" && downloadUrl && (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-xs font-semibold text-success hover:bg-success/20 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </a>
          )}
          <button onClick={onRemove} className="rounded-lg border border-border/60 bg-surface-1/70 p-2 text-muted-foreground hover:text-danger transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <Stage
        label={item.status === "done" ? "Broadcast ready" : item.status === "error" ? item.error || "Broadcast failed" : item.status === "uploading" ? "Uploading & watermarking" : "Queued"}
        active={item.status === "uploading"}
        done={item.status === "done"}
        progress={item.status === "uploading" ? item.progress : undefined}
      />

      {item.status === "done" && (
        <div className="rounded-lg border border-success/30 bg-success/10 p-3 text-sm">
          <p className="font-medium text-success">Watermarked file ready for broadcast.</p>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
            <MetaItem k="Method" v={item.result?.watermark?.method || "DWT-QIM"} />
            <MetaItem k="Download" v={downloadUrl || "-"} />
          </div>
        </div>
      )}

      {item.status === "done" && downloadUrl && playbackMode !== "multi" && (
        <div className="rounded-xl border border-border/60 bg-surface-1/60 p-3">
          <div className="mb-2 flex items-center justify-between text-xs font-mono uppercase tracking-wider text-muted-foreground">
            <span>Playback preview</span>
            <span>{playbackMode === "single" ? "plays once" : "replay enabled"}</span>
          </div>
          <video
            src={downloadUrl}
            controls
            autoPlay={playbackMode === "single"}
            loop={playbackMode === "replay"}
            muted={playbackMode === "single"}
            playsInline
            className="w-full rounded-lg border border-border/60 bg-black"
          />
        </div>
      )}
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