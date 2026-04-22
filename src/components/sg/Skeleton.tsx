import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg bg-gradient-to-r from-surface-2 via-surface-3 to-surface-2 bg-[length:1000px_100%] animate-shimmer",
        className
      )}
    />
  );
}
