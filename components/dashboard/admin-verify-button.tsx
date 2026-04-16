"use client";

import { Button } from "@/components/ui/button";
import { verifyCompanyAction } from "@/lib/actions/admin";
import { ShieldCheck, Loader2 } from "lucide-react";
import { useTransition } from "react";

export function AdminVerifyButton({ companyId }: { companyId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleVerify() {
    startTransition(async () => {
      await verifyCompanyAction(companyId);
    });
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleVerify}
      disabled={isPending}
      className="gap-1.5 text-[12px] border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
    >
      {isPending ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <ShieldCheck className="h-3 w-3" />
      )}
      {isPending ? "..." : "Verify"}
    </Button>
  );
}
