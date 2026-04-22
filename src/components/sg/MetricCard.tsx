import { motion } from "framer-motion";
import { GlassCard } from "./GlassCard";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string | number;
  delta?: number;
  accent?: "primary" | "pink" | "blue" | "success";
  icon?: React.ReactNode;
  index?: number;
};

const accentRing: Record<string, string> = {
  primary: "from-primary/30 to-primary/0",
  pink: "from-pink/30 to-pink/0",
  blue: "from-info/30 to-info/0",
  success: "from-success/30 to-success/0",
};
const accentText: Record<string, string> = {
  primary: "text-primary",
  pink: "text-pink",
  blue: "text-info",
  success: "text-success",
};

export function MetricCard({ label, value, delta, accent = "primary", icon, index = 0 }: Props) {
  const positive = (delta ?? 0) >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: "easeOut" }}
    >
      <GlassCard glow={accent === "success" ? "blue" : (accent as any)} className="relative overflow-hidden group">
        <div className={cn("absolute -top-20 -right-20 h-48 w-48 rounded-full bg-gradient-to-br blur-2xl opacity-60 transition-opacity group-hover:opacity-90", accentRing[accent])} />
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
            <p className="mt-2 font-display text-3xl font-semibold tracking-tight">
              {value}
            </p>
            {delta !== undefined && (
              <div className={cn("mt-2 flex items-center gap-1 text-xs font-mono", positive ? "text-success" : "text-danger")}>
                {positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {Math.abs(delta).toFixed(1)}% <span className="text-muted-foreground">vs 7d</span>
              </div>
            )}
          </div>
          {icon && (
            <div className={cn("rounded-xl border border-border/60 bg-background/40 p-2.5", accentText[accent])}>
              {icon}
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
