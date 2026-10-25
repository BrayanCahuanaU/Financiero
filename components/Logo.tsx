import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="yupay-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#56f2be" />
          <stop offset="1" stopColor="#1fc793" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="url(#yupay-mark)" />
      <path
        d="M20 19l12 14 12-14M32 33v14"
        fill="none"
        stroke="#04130d"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({
  href = "/",
  className,
  showWordmark = true,
}: {
  href?: string;
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="Yupay, ir al inicio"
    >
      <LogoMark className="h-9 w-9 transition group-hover:brightness-110" />
      {showWordmark && (
        <span className="text-[1.35rem] font-semibold tracking-tight text-white">
          yupay<span className="text-mint">.</span>
        </span>
      )}
    </Link>
  );
}
