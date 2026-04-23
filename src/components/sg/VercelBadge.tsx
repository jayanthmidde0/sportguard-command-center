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
        viewBox="0 0 283 64"
        className="h-4 w-auto"
        fill="white"
      >
        <path d="M141.04 16c-11.04 0-19 7.2-19 18s8.96 18 20 18c6.67 0 12.55-2.64 16.19-7.09l-7.65-4.42c-2.02 2.21-5.09 3.5-8.54 3.5-4.79 0-8.86-2.5-10.37-6.5h28.02c.22-1.12.35-2.28.35-3.5 0-10.79-7.96-17.99-19-17.99zm-9.46 14.5c1.52-4.04 5.29-6.75 11.07-6.75 5.54 0 9.29 2.67 10.88 6.75h-21.95z" />
        <path d="M185.52.63L142.3 64h-13.5L185.52.63z" />
      </svg>
      <span className="text-xs font-medium text-white/80">Powered by Vercel</span>
      <ExternalLink className="h-3.5 w-3.5 text-white/60" />
    </a>
  );
}
