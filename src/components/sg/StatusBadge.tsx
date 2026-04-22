import { cn } from "@/lib/utils";

type Status = "SAFE" | "PIRATED" | "VERIFIED_PIRACY" | "REVIEW" | "PROCESSING" | string;

const styles: Record<string, string> = {
  SAFE:            "bg-success/15 text-success border-success/40",
  PIRATED:         "bg-danger/15 text-danger border-danger/40",
  VERIFIED_PIRACY: "bg-pink/15 text-pink border-pink/40",
  REVIEW:          "bg-warning/15 text-warning border-warning/40",
  PROCESSING:      "bg-info/15 text-info border-info/40",
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const cls = styles[status] || "bg-muted text-muted-foreground border-border";
  const label = status.replace("_", " ");
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-mono uppercase tracking-wider",
      cls, className
    )}>
      <span className={cn("h-1.5 w-1.5 rounded-full",
        status === "SAFE" && "bg-success",
        status === "PIRATED" && "bg-danger animate-pulse",
        status === "VERIFIED_PIRACY" && "bg-pink animate-pulse",
        status === "REVIEW" && "bg-warning",
        status === "PROCESSING" && "bg-info animate-pulse",
      )} />
      {label}
    </span>
  );
}
