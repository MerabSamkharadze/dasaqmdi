"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/shared/spinner";
import { useFormStatus } from "react-dom";
import type { ComponentPropsWithoutRef } from "react";

type SubmitButtonProps = ComponentPropsWithoutRef<typeof Button> & {
  pendingText?: string;
};

export function SubmitButton({
  children,
  pendingText,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="transition-all duration-200 active:scale-[0.97]"
      {...props}
    >
      {pending ? (
        <>
          <Spinner />
          {pendingText ?? children}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
