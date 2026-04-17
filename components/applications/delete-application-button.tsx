"use client";

import { useState } from "react";
import { deleteApplicationAction } from "@/lib/actions/applications";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { Spinner } from "@/components/shared/spinner";
import { useTranslations } from "next-intl";

export function DeleteApplicationButton({
  applicationId,
}: {
  applicationId: string;
}) {
  const t = useTranslations("applications");
  const tCommon = useTranslations("common");
  const [pending, setPending] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleConfirm() {
    setPending(true);
    await deleteApplicationAction(applicationId);
    setOpen(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={pending}
          className="text-destructive/70 hover:text-destructive hover:bg-destructive/5"
        >
          {pending ? <Spinner /> : <Trash2 className="h-3.5 w-3.5 mr-1.5" />}
          <span className="text-[13px]">{t("deleteApplication")}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("confirmDelete")}</AlertDialogTitle>
          <AlertDialogDescription>{t("confirmDeleteDescription")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {tCommon("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
