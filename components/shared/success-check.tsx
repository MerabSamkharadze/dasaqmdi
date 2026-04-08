import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface SuccessCheckProps {
  message?: string;
  className?: string;
}

export function SuccessCheck({ message, className }: SuccessCheckProps) {
  return (
    <div className={cn("flex flex-col items-center gap-3 py-8", className)}>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 animate-scale-check">
        <Check className="h-7 w-7 text-primary" strokeWidth={2.5} aria-hidden="true" />
      </div>
      {message && (
        <p className="text-sm font-medium text-foreground animate-fade-in" style={{ animationDelay: "200ms" }}>
          {message}
        </p>
      )}
    </div>
  );
}
