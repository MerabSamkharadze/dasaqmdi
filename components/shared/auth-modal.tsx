"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAuthModal } from "@/lib/hooks/use-auth-modal";
import { useTranslations } from "next-intl";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Validate returnUrl — only allow relative paths (prevent open redirect)
function sanitizeReturnUrl(url: string): string {
  if (!url || !url.startsWith("/") || url.startsWith("//")) return "/dashboard";
  return url;
}

export function AuthModal() {
  const { isOpen, action, returnUrl, close } = useAuthModal();
  const t = useTranslations("auth");
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Focus trap: cycle Tab/Shift+Tab within modal
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }

      if (e.key !== "Tab") return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [close]
  );

  // Auto-focus on open, restore focus on close, block body scroll
  useEffect(() => {
    if (!isOpen) return;

    // Save the element that had focus before modal opened
    previousFocusRef.current = document.activeElement as HTMLElement | null;

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    // Auto-focus first focusable element
    requestAnimationFrame(() => {
      const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(
        'a[href], button:not([disabled])'
      );
      firstFocusable?.focus();
    });

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);

      // Restore focus to trigger element
      previousFocusRef.current?.focus();
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const actionText = t(`action${action.charAt(0).toUpperCase() + action.slice(1)}` as "actionApply" | "actionSave" | "actionBookmark");
  const safeReturnUrl = sanitizeReturnUrl(returnUrl);
  const loginUrl = `/auth/login?returnUrl=${encodeURIComponent(safeReturnUrl)}`;
  const signUpUrl = `/auth/sign-up?returnUrl=${encodeURIComponent(safeReturnUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        aria-describedby="auth-modal-desc"
        className="relative w-full max-w-sm rounded-2xl border border-border/60 bg-card p-6 sm:p-8 shadow-xl animate-fade-in"
      >
        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
        </div>

        {/* Text */}
        <div className="text-center mb-6">
          <h2 id="auth-modal-title" className="text-lg font-semibold tracking-tight text-foreground">
            {t("modalTitle")}
          </h2>
          <p id="auth-modal-desc" className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {t("modalDescription", { action: actionText })}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button asChild className="w-full h-11 rounded-xl text-[14px]">
            <Link href={loginUrl} onClick={close}>
              {t("modalLogin")}
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full h-11 rounded-xl text-[14px]">
            <Link href={signUpUrl} onClick={close}>
              {t("modalSignUp")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
