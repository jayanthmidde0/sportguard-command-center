import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  glow?: "none" | "primary" | "pink" | "blue";
  strong?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, glow = "none", strong, children, ...props }, ref) => {
    const glowCls =
      glow === "primary" ? "hover:shadow-[0_0_40px_hsl(var(--primary)/0.35)]"
      : glow === "pink"  ? "hover:shadow-[0_0_40px_hsl(var(--pink)/0.35)]"
      : glow === "blue"  ? "hover:shadow-[0_0_40px_hsl(var(--info)/0.35)]"
      : "";
    return (
      <motion.div
        ref={ref}
        className={cn(
          strong ? "glass-strong" : "glass",
          "rounded-2xl p-5 transition-all duration-300",
          glowCls,
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
GlassCard.displayName = "GlassCard";
