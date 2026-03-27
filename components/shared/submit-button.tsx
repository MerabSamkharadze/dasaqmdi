"use client";

import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";
import type { ComponentPropsWithoutRef } from "react";

type SubmitButtonProps = ComponentPropsWithoutRef<typeof Button> & {
  pendingText?: string;
};

export function SubmitButton({
  children,
  pendingText = "...",
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending ? pendingText : children}
    </Button>
  );
}
