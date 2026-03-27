"use client";

import { Button } from "@/components/ui/button";
import { verifyCompanyAction } from "@/lib/actions/admin";
import { CheckCircle } from "lucide-react";
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
      className="gap-1.5 text-[12px]"
    >
      <CheckCircle className="h-3 w-3" />
      Verify
    </Button>
  );
}
