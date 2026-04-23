import { ExternalLink } from "lucide-react";

export function VercelBadge() {
  return (
    <a
      href="https://vercel.com?utm_source=sportguard&utm_campaign=oss"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black border border-white/20 hover:border-white/40 transition-all hover:shadow-lg"
      title="Deployed on Vercel"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 116 100"
        className="h-3 w-auto"
        fill="white"
      >
        <path fillRule="evenodd" clipRule="evenodd" d="M57.5 0L115 100H0L57.5 0Z" />
      </svg>
      <span className="text-xs font-medium text-white/80">Powered by Vercel</span>
      <ExternalLink className="h-3.5 w-3.5 text-white/60" />
    </a>
  );
}
