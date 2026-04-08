"use client";

import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";

interface LogoProps {
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
      className="logo-mark"
    >
      {/* Brush circle */}
      <path
        d="M60 6C30 4 8 26 6 56c-2 32 22 54 52 58 32 4 56-18 58-48C118 34 94 8 60 6Z"
        fill="#362828"
        className="transition-all duration-500"
      />
      <path
        d="M22 14c-6 4-3 2 2-1s8-4 10-3-6 1-12 4Z"
        fill="#362828"
      />

      {/* Geometric D — outer */}
      <path
        d="M60 24 L84 42 L78 80 L42 80 L36 48 Z"
        fill="none"
        stroke="#fbf7e1"
        strokeWidth="2.5"
        strokeLinejoin="round"
        className="logo-shape"
      />

      {/* Facet lines */}
      <path d="M60 24 L60 54" stroke="#fbf7e1" strokeWidth="1.8" strokeLinecap="round" className="logo-line logo-line-1" />
      <path d="M36 48 L84 42" stroke="#fbf7e1" strokeWidth="1.8" strokeLinecap="round" className="logo-line logo-line-2" />
      <path d="M60 54 L42 80" stroke="#fbf7e1" strokeWidth="1.8" strokeLinecap="round" className="logo-line logo-line-3" />
      <path d="M60 54 L78 80" stroke="#fbf7e1" strokeWidth="1.8" strokeLinecap="round" className="logo-line logo-line-4" />

      {/* Play triangle */}
      <path
        d="M53 48 L53 66 L67 57 Z"
        fill="#C7AE6A"
        className="logo-play"
      />

      {/* Gold shimmer accent — visible on hover */}
      <circle cx="75" cy="35" r="3" fill="#C7AE6A" fillOpacity="0" className="logo-sparkle logo-sparkle-1" />
      <circle cx="40" cy="72" r="2" fill="#C7AE6A" fillOpacity="0" className="logo-sparkle logo-sparkle-2" />
    </svg>
  );
}

export function Logo({ variant = "full", className }: LogoProps) {
  const locale = useLocale();

  if (variant === "icon") {
    return (
      <span className={cn("logo-hover", className)}>
        <LogoMark size={32} />
      </span>
    );
  }

  return (
    <span className={cn("logo-hover inline-flex items-center gap-2.5", className)}>
      <LogoMark size={36} />
      <span className="hidden sm:inline text-[15px] font-extrabold tracking-wide uppercase text-foreground">
        {locale === "ka" ? "დასაქმდი" : "dasaqmdi"}
      </span>
    </span>
  );
}
