import { Bell, Menu, Search, ChevronDown, LogOut, User, Settings as Cog } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const nav = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-background/60 px-4 backdrop-blur-xl md:px-6">
      <button
        onClick={onMenu}
        className="md:hidden grid h-9 w-9 place-items-center rounded-lg border border-border/60 bg-surface-2/60"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Command-style search */}
      <div className="flex-1 max-w-xl">
        <div className="group relative flex items-center gap-2 rounded-xl border border-border/60 bg-surface-1/60 px-3.5 py-2 transition-colors focus-within:border-primary/50 focus-within:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search detections, videos, channels…"
            className="w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
          />
          <kbd className="hidden md:inline-flex items-center gap-1 rounded-md border border-border/60 bg-surface-3/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); }}
            className="relative grid h-9 w-9 place-items-center rounded-lg border border-border/60 bg-surface-2/60 hover:bg-surface-3/60 transition-colors"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-pink shadow-[0_0_10px_hsl(var(--pink))] animate-pulse" />
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-border/60 bg-surface-1/95 backdrop-blur-xl shadow-2xl overflow-hidden animate-scale-in origin-top-right">
              <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
                <span className="text-sm font-semibold">Live alerts</span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-success">3 active</span>
              </div>
              <div className="max-h-80 overflow-y-auto scrollbar-thin">
                {[
                  { l: "danger", t: "Verified piracy on Telegram @sport_hd", a: "2m" },
                  { l: "warning", t: "94% similarity match — YouTube upload", a: "11m" },
                  { l: "info", t: "New reference fingerprint indexed", a: "32m" },
                ].map((n, i) => (
                  <div key={i} className="px-4 py-3 border-b border-border/40 last:border-b-0 hover:bg-surface-3/40">
                    <div className="flex items-start gap-2.5">
                      <span className={cn("mt-1.5 h-2 w-2 rounded-full",
                        n.l === "danger" && "bg-danger",
                        n.l === "warning" && "bg-warning",
                        n.l === "info" && "bg-info",
                      )} />
                      <div className="flex-1">
                        <p className="text-sm">{n.t}</p>
                        <p className="text-[11px] font-mono text-muted-foreground mt-0.5">{n.a} ago</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); }}
            className="flex items-center gap-2 rounded-lg border border-border/60 bg-surface-2/60 pl-1 pr-2.5 py-1 hover:bg-surface-3/60 transition-colors"
          >
            <div className="h-7 w-7 rounded-md bg-grad-purple grid place-items-center text-xs font-semibold">
              {(user?.name || user?.email || "U").slice(0, 1).toUpperCase()}
            </div>
            <span className="hidden sm:block text-sm max-w-[120px] truncate">{user?.name || user?.email}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border/60 bg-surface-1/95 backdrop-blur-xl shadow-2xl overflow-hidden animate-scale-in origin-top-right">
              <div className="px-4 py-3 border-b border-border/60">
                <p className="text-sm font-semibold truncate">{user?.name || "Operator"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <div className="p-1.5">
                <button onClick={() => { nav("/app/settings"); setProfileOpen(false); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-surface-3/60">
                  <User className="h-4 w-4" /> Profile
                </button>
                <button onClick={() => { nav("/app/settings"); setProfileOpen(false); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-surface-3/60">
                  <Cog className="h-4 w-4" /> Settings
                </button>
                <button onClick={() => { logout(); nav("/login"); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-danger hover:bg-danger/10">
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
