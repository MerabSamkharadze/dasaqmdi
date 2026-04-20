"use client";

import { useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Share2 } from "lucide-react";
import { siteConfig } from "@/lib/config";

type ShareJobButtonProps = {
  jobUrl: string;
  jobTitle: string;
  variant?: "icon" | "button";
};

const HOLD_DURATION = 500; // ms

export function ShareJobButton({ jobUrl, jobTitle, variant = "icon" }: ShareJobButtonProps) {
  const fullUrl = jobUrl.startsWith("http")
    ? jobUrl
    : typeof window !== "undefined"
      ? `${window.location.origin}${jobUrl}`
      : jobUrl;
  const t = useTranslations("jobs");
  const shareText = `${jobTitle} — ${siteConfig.domain}`;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef = useRef(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const doShare = useCallback(async () => {
    // Vibrate
    if (navigator.vibrate) navigator.vibrate(30);

    // Native share or fallback to clipboard
    if (navigator.share) {
      try {
        await navigator.share({ title: jobTitle, text: shareText, url: fullUrl });
      } catch {
        // cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(fullUrl);
      } catch {
        // ignore
      }
    }
  }, [jobTitle, shareText, fullUrl]);

  const startPress = useCallback(() => {
    firedRef.current = false;
    const btn = btnRef.current;
    if (btn) btn.style.transform = "scale(1.25)";

    timerRef.current = setTimeout(() => {
      firedRef.current = true;
      if (btn) btn.style.transform = "";
      doShare();
    }, HOLD_DURATION);
  }, [doShare]);

  const endPress = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const btn = btnRef.current;
    if (btn) btn.style.transform = "";
  }, []);

  // Desktop: simple click
  const handleClick = useCallback(() => {
    if (!firedRef.current && !("ontouchstart" in window)) {
      doShare();
    }
  }, [doShare]);

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={() => doShare()}
        className="inline-flex items-center gap-1.5 h-8 rounded-xl px-3.5 text-[12px] font-medium border border-border bg-card text-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
      >
        <Share2 className="h-3.5 w-3.5" />
        {t("share")}
      </button>
    );
  }

  return (
    <button
      ref={btnRef}
      type="button"
      aria-label={t("share")}
      onClick={handleClick}
      onTouchStart={startPress}
      onTouchEnd={endPress}
      onTouchCancel={endPress}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-muted/50 transition-all duration-200"
      style={{ transition: "transform 0.4s ease, color 0.2s, background 0.2s" }}
    >
      <Share2 className="h-4 w-4" />
    </button>
  );
}
