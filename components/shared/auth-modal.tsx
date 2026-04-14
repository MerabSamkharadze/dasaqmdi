"use client";

import { useEffect } from "react";
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

  // ESC to close + block body scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, close]);

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
      <div className="relative w-full max-w-sm rounded-2xl border border-border/60 bg-card p-6 sm:p-8 shadow-xl animate-fade-in">
        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-5 w-5 text-primary" />
          </div>
        </div>

        {/* Text */}
        <div className="text-center mb-6">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            {t("modalTitle")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
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
