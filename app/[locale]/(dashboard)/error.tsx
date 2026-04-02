"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/5">
        <AlertCircle className="h-5 w-5 text-destructive/70" />
      </div>
      <div className="text-center space-y-1.5">
        <h2 className="text-sm font-semibold tracking-tight">Something went wrong</h2>
        <p className="text-[13px] text-muted-foreground/70">
          An error occurred while loading this page.
        </p>
      </div>
      <Button onClick={reset} variant="outline" size="sm">
        Try again
      </Button>
    </div>
  );
}
