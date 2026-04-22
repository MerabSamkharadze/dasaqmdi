"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { VipBadge } from "@/components/shared/vip-badge";
import { LogoMark } from "@/components/brand/logo";

type VipCardProps = {
  jobId: string;
  jobTitle: string;
  companyName: string;
  companyLogoUrl: string | null;
  isExternal: boolean;
  vipLevel: "silver" | "gold";
  city: string | null;
  salary: string | null;
  index: number;
};

export function VipCard({
  jobId,
  jobTitle,
  companyName,
  companyLogoUrl,
  isExternal,
  vipLevel,
  city,
  salary,
  index,
}: VipCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="group relative flex-shrink-0 w-[280px] sm:w-[320px] rounded-xl border border-amber-300/50 bg-gradient-to-br from-amber-50/50 to-card p-4 shadow-soft transition-all duration-200 animate-fade-in dark:from-amber-500/5 dark:to-card dark:border-amber-500/20"
      style={{ animationDelay: `${index * 60}ms` }}
      onMouseEnter={() => {
        setHovered(true);
        // Pause carousel auto-scroll — bubble dispatches custom event
        window.dispatchEvent(new CustomEvent("vip-carousel-pause", { detail: true }));
      }}
      onMouseLeave={() => {
        setHovered(false);
        window.dispatchEvent(new CustomEvent("vip-carousel-pause", { detail: false }));
      }}
    >
      {/* Floating "See detail" bubble */}
      <Link
        href={`/jobs/${jobId}`}
        className={`absolute top-3 right-3 z-20 pointer-events-auto flex items-center justify-center h-7 w-7 rounded-lg bg-primary text-primary-foreground shadow-md transition-all duration-200 hover:bg-primary/90 ${
          hovered
            ? "md:opacity-100 md:scale-100"
            : "md:opacity-0 md:scale-75 md:pointer-events-none"
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
        </svg>
      </Link>

      <div className="flex items-start gap-3 mb-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/8 ring-1 ring-amber-200/50 dark:ring-amber-500/20">
          {isExternal ? (
            <LogoMark size={28} />
          ) : companyLogoUrl ? (
            <Image
              src={companyLogoUrl}
              alt={companyName}
              width={32}
              height={32}
              sizes="32px"
              priority={index === 0}
              className="h-8 w-8 rounded-md object-contain"
            />
          ) : (
            <LogoMark size={24} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold truncate text-foreground">
            {jobTitle}
          </p>
          <p className="text-[11px] text-muted-foreground truncate">
            {companyName}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <VipBadge level={vipLevel} />
        {city && (
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/60">
            <MapPin className="h-3 w-3" />
            {city}
          </span>
        )}
        {salary && (
          <span className="text-[11px] font-medium text-primary">
            {salary}
          </span>
        )}
      </div>
    </div>
  );
}
