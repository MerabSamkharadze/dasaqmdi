"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Watermelon } from "@/components/shared/loaders/watermelon";

export function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("home");

  function handleRefresh() {
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleRefresh}
        disabled={isPending}
        className="gap-2 text-[13px] mt-5 border-border bg-card/80 text-muted-foreground hover:text-foreground hover:bg-card"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} />
        {isPending ? t("refreshing") : t("refresh")}
      </Button>

      {isPending && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <Watermelon />
        </div>
      )}
    </>
  );
}
