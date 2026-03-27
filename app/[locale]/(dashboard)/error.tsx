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
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <div className="text-center space-y-1.5">
        <h2 className="text-base font-semibold tracking-tight">Something went wrong</h2>
        <p className="text-sm text-muted-foreground">
          An error occurred while loading this page.
        </p>
      </div>
      <Button onClick={reset} variant="outline" size="sm" className="rounded-lg">
        Try again
      </Button>
    </div>
  );
}
