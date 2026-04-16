"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { createCheckoutAction } from "@/lib/actions/subscriptions";
import { Spinner } from "@/components/shared/spinner";

type CheckoutButtonProps = {
  plan: "pro" | "verified";
  label: string;
  variant?: "default" | "outline";
};

export function CheckoutButton({ plan, label, variant = "default" }: CheckoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await createCheckoutAction(plan);
      if (result.data?.checkoutUrl) {
        window.location.href = result.data.checkoutUrl;
      }
    });
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isPending}
      variant={variant}
      className="w-full"
    >
      {isPending ? <Spinner /> : label}
    </Button>
  );
}
