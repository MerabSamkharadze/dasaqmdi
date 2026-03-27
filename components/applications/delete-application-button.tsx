"use client";

import { deleteApplicationAction } from "@/lib/actions/applications";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function DeleteApplicationButton({
  applicationId,
}: {
  applicationId: string;
}) {
  const t = useTranslations("applications");
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!confirm(t("confirmDelete"))) return;

    setPending(true);
    await deleteApplicationAction(applicationId);
    setPending(false);
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={pending}
      className="text-destructive/70 hover:text-destructive hover:bg-destructive/5"
    >
      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
      <span className="text-[13px]">{t("deleteApplication")}</span>
    </Button>
  );
}
