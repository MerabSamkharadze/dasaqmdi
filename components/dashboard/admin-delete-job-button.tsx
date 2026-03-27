"use client";

import { Button } from "@/components/ui/button";
import { deleteJobAdminAction } from "@/lib/actions/admin";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";

export function AdminDeleteJobButton({ jobId }: { jobId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Delete this job?")) return;
    startTransition(async () => {
      await deleteJobAdminAction(jobId);
    });
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={isPending}
      className="h-8 w-8 rounded-xl text-destructive/60 hover:text-destructive hover:bg-destructive/5"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}
