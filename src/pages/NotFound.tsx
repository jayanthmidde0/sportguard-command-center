import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ShieldOff, Home } from "lucide-react";
import { AmbientBackground } from "@/components/sg/AmbientBackground";

const NotFound = () => {
  const location = useLocation();
  useEffect(() => {
    console.error("404: route not found", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6">
      <AmbientBackground />
      <div className="relative text-center">
        <div className="mx-auto h-20 w-20 rounded-2xl bg-grad-pink grid place-items-center shadow-[0_0_40px_hsl(var(--pink)/0.6)] mb-6">
          <ShieldOff className="h-9 w-9" />
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-pink">Error · 404</p>
        <h1 className="mt-3 font-display text-6xl md:text-7xl font-semibold">Signal lost</h1>
        <p className="mt-4 max-w-md mx-auto text-secondary">The page you tried to reach is not part of the PICKPIRE network.</p>
        <Link to="/" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-grad-cyber px-5 py-3 text-sm font-semibold shadow-[0_0_30px_hsl(var(--primary)/0.5)]">
          <Home className="h-4 w-4" /> Return to base
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
