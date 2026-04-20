"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const CONSENT_KEY = "cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const t = useTranslations("cookies");

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      // Small delay for smooth entrance
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  function handleAccept() {
    localStorage.setItem(CONSENT_KEY, "accepted");
    dismiss();
  }

  function handleDecline() {
    localStorage.setItem(CONSENT_KEY, "declined");
    // Disable FB Pixel if declined
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("consent", "revoke" as string);
    }
    dismiss();
  }

  function dismiss() {
    setClosing(true);
    setTimeout(() => setVisible(false), 300);
  }

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 transition-all duration-300",
        closing
          ? "translate-y-full opacity-0"
          : "translate-y-0 opacity-100",
      )}
    >
      <div className="rounded-xl border border-border/60 bg-card p-5 shadow-lg backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Cookie className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-foreground mb-1">
              {t("title")}
            </p>
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              {t("description")}
            </p>
          </div>
          <button
            onClick={handleDecline}
            className="shrink-0 text-muted-foreground/40 hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <Button
            size="sm"
            onClick={handleAccept}
            className="flex-1 text-[12px] h-8"
          >
            {t("accept")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDecline}
            className="flex-1 text-[12px] h-8"
          >
            {t("decline")}
          </Button>
        </div>
      </div>
    </div>
  );
}
