export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-[0.35]" />
      <div className="absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full bg-primary/30 blur-3xl animate-blob" />
      <div className="absolute top-1/3 -right-40 h-[520px] w-[520px] rounded-full bg-pink/25 blur-3xl animate-blob" style={{ animationDelay: "3s" }} />
      <div className="absolute bottom-0 left-1/3 h-[460px] w-[460px] rounded-full bg-info/25 blur-3xl animate-blob" style={{ animationDelay: "6s" }} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background/80" />
    </div>
  );
}
