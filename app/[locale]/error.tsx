"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center gap-6 max-w-md text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/5">
          <AlertCircle className="h-5 w-5 text-destructive/70" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-base font-semibold tracking-tight text-foreground">
            Something went wrong
          </h1>
          <p className="text-[13px] text-muted-foreground/70 leading-relaxed">
            An unexpected error occurred. Please try again.
          </p>
        </div>
        <Button onClick={reset} variant="outline">
          Try again
        </Button>
      </div>
    </div>
  );
}
