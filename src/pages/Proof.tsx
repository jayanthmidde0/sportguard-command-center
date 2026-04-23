import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Download, FileBadge2, Link2, ShieldCheck, Copy, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { GlassCard } from "@/components/sg/GlassCard";
import { StatusBadge } from "@/components/sg/StatusBadge";
import { detectionsApi, proofApi } from "@/lib/api";

export default function ProofPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | number>("");
  const [kind, setKind] = useState<"pirated" | "original">("pirated");
  const [copied, setCopied] = useState<string | null>(null);

  const detectionsQuery = useQuery({
    queryKey: ["proof-detections"],
    queryFn: () => detectionsApi.list(),
    refetchInterval: 30000,
  });

  const detections = (detectionsQuery.data ?? []) as any[];

  useEffect(() => {
    const idFromQuery = searchParams.get("id");
    const kindFromQuery = searchParams.get("kind");

    if (idFromQuery) {
      setSelectedId(idFromQuery);
    }

    if (kindFromQuery === "pirated" || kindFromQuery === "original") {
      setKind(kindFromQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!selectedId && detections.length > 0) {
      setSelectedId(detections[0].id);
    }
  }, [detections, selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    const next = new URLSearchParams(searchParams);
    next.set("id", String(selectedId));
    next.set("kind", kind);
    setSearchParams(next, { replace: true });
  }, [selectedId, kind]);

  const reportQuery = useQuery({
    queryKey: ["proof-report", selectedId, kind],
    queryFn: () => proofApi.report(selectedId, kind),
    enabled: Boolean(selectedId),
    refetchInterval: 30000,
  });

  const report = reportQuery.data as any;
  const downloadHref = selectedId ? proofApi.downloadUrl(selectedId, kind) : "";

  const selectedDetection = useMemo(
    () => detections.find((row) => String(row.id) === String(selectedId)),
    [detections, selectedId]
  );

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const onDownload = () => {
    if (!selectedId) return toast.error("Select a detection first");
    void (async () => {
      try {
        const blob = await proofApi.download(selectedId, kind);
        const objectUrl = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = objectUrl;
        anchor.download = `proof-${selectedId}-${kind}.json`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(objectUrl);
        toast.success("Proof bundle downloaded");
      } catch (error: any) {
        toast.error(error?.message || "Proof download failed");
      }
    })();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Proof</h1>
          <p className="text-secondary mt-1">Download pirated evidence and creator proof bundles from the same verified flow.</p>
        </div>
        <div className="rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-mono uppercase tracking-wider text-success">
          Blockchain-ready evidence packs
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <GlassCard className="xl:col-span-1 p-5">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-grad-cyber grid place-items-center shadow-[0_0_20px_hsl(var(--primary)/0.4)]">
              <FileBadge2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold">Detections</h2>
              <p className="text-xs text-muted-foreground">Choose an item to generate proof.</p>
            </div>
          </div>

          <div className="mt-4 space-y-2 max-h-[72vh] overflow-y-auto pr-1 scrollbar-thin">
            {detectionsQuery.isLoading && (
              <div className="rounded-xl border border-border/60 bg-surface-1/60 p-4 text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading detections…
              </div>
            )}

            {detections.map((d: any) => {
              const active = String(d.id) === String(selectedId);
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedId(d.id)}
                  className={`w-full text-left rounded-xl border p-3 transition-colors ${
                    active ? "border-primary/50 bg-primary/10" : "border-border/60 bg-surface-1/60 hover:bg-surface-2/70"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{d.source_title || d.video_name || "Unknown video"}</div>
                      <div className="truncate text-xs text-muted-foreground">{d.source || "Unknown source"}</div>
                    </div>
                    <StatusBadge status={normalizeStatus(d.status)} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                    <span>#{d.id}</span>
                    <span>{Number(d.similarity ?? 0).toFixed(0)}%</span>
                  </div>
                </button>
              );
            })}

            {!detectionsQuery.isLoading && detections.length === 0 && (
              <div className="rounded-xl border border-border/60 bg-surface-1/60 p-4 text-sm text-muted-foreground">
                No detections yet. Run upload, broadcast, or link scans first.
              </div>
            )}
          </div>
        </GlassCard>

        <div className="xl:col-span-2 space-y-6">
          <GlassCard className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Selected proof</div>
                <h2 className="mt-1 font-display text-2xl font-semibold">{report?.source_title || selectedDetection?.source_title || selectedDetection?.video_name || "Proof bundle"}</h2>
                <p className="mt-1 text-sm text-secondary">{report?.creator_owned ? "Creator original available" : "Pirated evidence bundle available"}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setKind("pirated")}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${kind === "pirated" ? "bg-grad-pink shadow-[0_0_20px_hsl(var(--pink)/0.35)]" : "border border-border/60 bg-surface-2/70"}`}
                >
                  Pirated proof
                </button>
                <button
                  onClick={() => setKind("original")}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${kind === "original" ? "bg-grad-cyber shadow-[0_0_20px_hsl(var(--primary)/0.35)]" : "border border-border/60 bg-surface-2/70"}`}
                >
                  Creator original
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
              <InfoCard label="Status" value={report?.status || selectedDetection?.status || "-"} icon={<CheckCircle2 className="h-4 w-4" />} />
              <InfoCard label="Owner" value={report?.creator_owned ? "You" : "Not creator-owned"} icon={<ShieldCheck className="h-4 w-4" />} />
              <InfoCard label="Similarity" value={`${Number(report?.similarity ?? selectedDetection?.similarity ?? 0).toFixed(0)}%`} icon={<AlertTriangle className="h-4 w-4" />} />
            </div>

            <div className="mt-5 rounded-2xl border border-border/60 bg-surface-1/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Source link</div>
                  <a href={report?.source_url || selectedDetection?.source_url || "#"} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 truncate text-sm text-primary hover:underline">
                    {report?.source_url || selectedDetection?.source_url || "No source url"}
                    <Link2 className="h-3.5 w-3.5 shrink-0" />
                  </a>
                </div>
                <button
                  onClick={() => handleCopy(String(report?.source_url || selectedDetection?.source_url || ""), "source")}
                  className="rounded-lg border border-border/60 bg-surface-2/70 p-2 text-muted-foreground hover:text-foreground"
                >
                  {copied === "source" ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <KV label="Blockchain" value={typeof report?.blockchain === "object" ? (report.blockchain?.enabled ? "Recorded" : report.blockchain?.message || "Unavailable") : "Unavailable"} />
              <KV label="IPFS" value={report?.ipfs?.uploaded ? report.ipfs?.cid || "Uploaded" : report?.ipfs?.message || "Not uploaded"} />
              <KV label="Download" value={report?.download_url ? "Ready" : "Not available"} />
              <KV label="Kind" value={kind === "pirated" ? "Pirated evidence" : "Creator original"} />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={onDownload}
                disabled={!selectedId}
                className="inline-flex items-center gap-2 rounded-xl bg-grad-cyber px-4 py-3 text-sm font-semibold shadow-[0_0_24px_hsl(var(--primary)/0.35)] disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                Download proof JSON
              </button>

              {report?.creator_owned && report?.download_url && (
                <a
                  href={report.download_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm font-semibold text-success"
                >
                  <Download className="h-4 w-4" />
                  Download original video
                </a>
              )}

              {report?.source_url && (
                <a
                  href={report.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-surface-2/70 px-4 py-3 text-sm font-semibold"
                >
                  Open source
                  <Link2 className="h-4 w-4" />
                </a>
              )}

              <Link
                to={`/app/detections?id=${selectedId}`}
                className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-surface-2/70 px-4 py-3 text-sm font-semibold"
              >
                Back to detection
              </Link>
            </div>
          </GlassCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard className="p-5">
              <div className="font-display text-lg font-semibold">Pirated evidence</div>
              <p className="mt-1 text-sm text-secondary">Evidence package for the detected pirated copy. Downloadable as JSON and backed by blockchain/IPFS metadata when available.</p>
              <div className="mt-4 space-y-2 text-sm">
                <DetailRow label="Status" value={String(report?.status || "-")} />
                <DetailRow label="Source key" value={String(report?.source_key || "-")} />
                <DetailRow label="Blockchain" value={typeof report?.blockchain === "object" ? JSON.stringify(report.blockchain).slice(0, 72) : "-"} />
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <div className="font-display text-lg font-semibold">Creator original</div>
              <p className="mt-1 text-sm text-secondary">If the selected item is yours, you can download the original watermarked video and its proof bundle here.</p>
              <div className="mt-4 space-y-2 text-sm">
                <DetailRow label="Creator owned" value={report?.creator_owned ? "Yes" : "No"} />
                <DetailRow label="Watermark verification" value={report?.original_verification?.verified ? "Verified" : report?.original_verification?.message || "Unavailable"} />
                <DetailRow label="Download URL" value={report?.creator_owned ? String(report?.download_url || "-") : "Creator-only"} />
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-surface-1/60 p-4">
      <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 font-display text-lg font-semibold break-words">{value}</div>
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-surface-1/60 p-3">
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm break-words">{value}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-surface-1/60 p-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right break-all">{value}</span>
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
