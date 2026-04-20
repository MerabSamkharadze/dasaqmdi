"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { upgradeToVipAction, removeVipAction } from "@/lib/actions/admin";
import { Star, X } from "lucide-react";
import { Spinner } from "@/components/shared/spinner";
import { useTranslations } from "next-intl";

type AdminVipButtonProps = {
  jobId: string;
  currentLevel: string;
  vipUntil: string | null;
};

export function AdminVipButton({ jobId, currentLevel, vipUntil }: AdminVipButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [level, setLevel] = useState<"silver" | "gold">("gold");
  const t = useTranslations("admin");

  const isVip = currentLevel !== "normal" && vipUntil && new Date(vipUntil) > new Date();

  function handleUpgrade() {
    setOpen(false);
    startTransition(async () => {
      await upgradeToVipAction(jobId, level, 14);
    });
  }

  function handleRemove() {
    startTransition(async () => {
      await removeVipAction(jobId);
    });
  }

  if (isVip) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRemove}
        disabled={isPending}
        className="gap-1 text-[11px] text-amber-600 hover:text-red-600 dark:text-amber-400"
      >
        {isPending ? <Spinner /> : <X className="h-3 w-3" />}
        VIP
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        disabled={isPending}
        className="gap-1 text-[11px] border-amber-300/50 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-500/30 dark:text-amber-400"
      >
        {isPending ? <Spinner /> : <Star className="h-3 w-3" />}
        VIP
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("upgradeToVip")}</AlertDialogTitle>
            <AlertDialogDescription>{t("upgradeToVipDescription")}</AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-2">
            <Select value={level} onValueChange={(v) => setLevel(v as "silver" | "gold")}>
              <SelectTrigger className="h-9 text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="silver" className="text-[13px]">Silver (VIP) — 14 {t("days")}</SelectItem>
                <SelectItem value="gold" className="text-[13px]">Gold (PREMIUM) — 14 {t("days")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancelSelection")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUpgrade}
              className="bg-amber-600 text-white hover:bg-amber-700"
            >
              {t("upgradeToVip")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
