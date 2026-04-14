"use client";

import { ExternalLink } from "lucide-react";
import { markApplicationViewedAction } from "@/lib/actions/applications";

export function ResumeLink({
  href,
  label,
  applicationId,
  isViewed,
}: {
  href: string;
  label: string;
  applicationId: string;
  isViewed: boolean;
}) {
  function handleClick() {
    if (!isViewed) {
      markApplicationViewedAction(applicationId);
    }
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="inline-flex items-center gap-1 text-[12px] text-primary/80 hover:text-primary hover:underline transition-colors duration-200"
    >
      {label} <ExternalLink className="h-3 w-3" />
    </a>
  );
}
