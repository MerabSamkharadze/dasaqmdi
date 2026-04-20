"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { Share2 } from "lucide-react";
import { siteConfig } from "@/lib/config";

type ShareJobButtonProps = {
  jobUrl: string;
  jobTitle: string;
  variant?: "icon" | "button";
};

export function ShareJobButton({ jobUrl, jobTitle, variant = "icon" }: ShareJobButtonProps) {
  const fullUrl = jobUrl.startsWith("http")
    ? jobUrl
    : typeof window !== "undefined"
      ? `${window.location.origin}${jobUrl}`
      : jobUrl;
  const t = useTranslations("jobs");
  const shareText = `${jobTitle} — ${siteConfig.domain}`;

  const doShare = useCallback(async () => {
    if (navigator.vibrate) navigator.vibrate(30);
    if (navigator.share) {
      try {
        await navigator.share({ title: jobTitle, text: shareText, url: fullUrl });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(fullUrl);
      } catch {}
    }
  }, [jobTitle, shareText, fullUrl]);

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={doShare}
        className="inline-flex items-center gap-1.5 h-8 rounded-xl px-3.5 text-[12px] font-medium border border-border bg-card text-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
      >
        <Share2 className="h-3.5 w-3.5" />
        {t("share")}
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label={t("share")}
      onClick={doShare}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-muted/50 transition-all duration-200"
    >
      <Share2 className="h-4 w-4" />
    </button>
  );
}
