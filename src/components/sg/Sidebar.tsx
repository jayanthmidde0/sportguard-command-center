import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Upload, ScanSearch, BarChart3, ShieldAlert,
  Search, Radar, Settings, Shield, ChevronLeft, RadioTower
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const items = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/upload", label: "Upload Reference", icon: Upload },
  { to: "/app/broadcast", label: "Broadcast", icon: RadioTower },
  { to: "/app/watermark", label: "Watermark", icon: Shield },
  { to: "/app/detect", label: "Detect Video", icon: ScanSearch },
  { to: "/app/detections", label: "Detections", icon: ShieldAlert },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/app/search", label: "Manual Search", icon: Search },
  { to: "/app/monitoring", label: "Monitoring", icon: Radar },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-background/70 backdrop-blur-sm md:hidden transition-opacity",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed md:sticky top-0 left-0 z-50 h-screen flex-shrink-0 transition-all duration-300",
          collapsed ? "w-[80px]" : "w-[260px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col border-r border-border/60 bg-sidebar/80 backdrop-blur-xl">
          {/* Brand */}
          <div className="flex items-center justify-between p-4 border-b border-border/60">
            <NavLink to="/app" className="flex items-center gap-2.5 group" onClick={onClose}>
              <div className="relative h-9 w-9 rounded-xl bg-grad-cyber grid place-items-center shadow-[0_0_20px_hsl(var(--primary)/0.5)]">
                <Shield className="h-5 w-5 text-white" />
              </div>
              {!collapsed && (
                <div className="leading-tight">
                  <div className="font-display font-semibold text-sm tracking-tight">SportGuard</div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">v3.2 // live</div>
                </div>
              )}
            </NavLink>
            <button
              onClick={() => setCollapsed(c => !c)}
              className="hidden md:grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-3 transition-colors"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-1">
            {items.map((it) => {
              const active = it.end ? location.pathname === it.to : location.pathname.startsWith(it.to);
              return (
                <NavLink
                  key={it.to}
                  to={it.to}
                  end={it.end}
                  onClick={onClose}
                  className={cn(
                    "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    active
                      ? "bg-gradient-to-r from-primary/20 to-pink/10 text-foreground border border-primary/30 shadow-[inset_0_0_20px_hsl(var(--primary)/0.15)]"
                      : "text-secondary hover:text-foreground hover:bg-surface-3/60 border border-transparent"
                  )}
                >
                  {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-grad-cyber" />}
                  <it.icon className={cn("h-4.5 w-4.5 shrink-0", active && "text-primary")} />
                  {!collapsed && <span>{it.label}</span>}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer status */}
          {!collapsed && (
            <div className="p-3 border-t border-border/60">
              <div className="rounded-xl border border-border/60 bg-surface-1/70 p-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  <span className="font-mono uppercase tracking-wider text-muted-foreground">All systems</span>
                  <span className="ml-auto text-success font-semibold">Online</span>
                </div>
                <div className="mt-2 text-[10px] font-mono text-muted-foreground">
                  Edge nodes: 14/14 · Latency 412ms
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
