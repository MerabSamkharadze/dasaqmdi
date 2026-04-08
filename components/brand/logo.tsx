"use client";

import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";

interface LogoProps {
  /** "full" = icon + wordmark, "icon" = symbol only */
  variant?: "full" | "icon";
  className?: string;
}

function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Organic brush-stroke circle */}
      <path
        d="M60 6C30 4 8 26 6 56c-2 32 22 54 52 58 32 4 56-18 58-48C118 34 94 8 60 6Z"
        fill="#362828"
      />
      <path
        d="M22 14c-6 4-3 2 2-1s8-4 10-3-6 1-12 4Z"
        fill="#362828"
      />

      {/* Geometric "D" icon — cream on chocolate */}
      <path d="M60 24 L84 42 L78 80 L42 80 L36 48 Z" fill="none" stroke="#fbf7e1" strokeWidth="2.5" strokeLinejoin="round" />

      {/* Diagonal facet lines */}
      <path d="M60 24 L60 54" stroke="#fbf7e1" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M36 48 L84 42" stroke="#fbf7e1" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M60 54 L42 80" stroke="#fbf7e1" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M60 54 L78 80" stroke="#fbf7e1" strokeWidth="1.8" strokeLinecap="round" />

      {/* Center play triangle */}
      <path d="M53 48 L53 66 L67 57 Z" fill="#f5ebb4" />
    </svg>
  );
}

export function Logo({ variant = "full", className }: LogoProps) {
  const locale = useLocale();

  if (variant === "icon") {
    return (
      <span className={className}>
        <LogoMark size={32} />
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={36} />
      <span className="hidden sm:inline text-[15px] font-extrabold tracking-wide uppercase text-foreground">
        {locale === "ka" ? "დასაქმდი" : "dasaqmdi"}
      </span>
    </span>
  );
}
