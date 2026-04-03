import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ApplicationStatusBadgeProps = {
  status: string;
  isViewed: boolean;
  label: string;
  seenLabel: string;
};

const statusColors: Record<string, string> = {
  pending: "bg-gold/12 text-gold-foreground dark:bg-gold/15 dark:text-gold",
  reviewed: "bg-primary/12 text-primary dark:bg-primary/20",
  shortlisted: "bg-gold/18 text-gold-foreground dark:bg-gold/25 dark:text-gold",
  rejected: "bg-destructive/12 text-destructive dark:bg-destructive/20",
  accepted: "bg-primary/15 text-primary dark:bg-primary/20",
};

export function ApplicationStatusBadge({
  status,
  isViewed,
  label,
  seenLabel,
}: ApplicationStatusBadgeProps) {
  const displayLabel = status === "pending" && isViewed ? seenLabel : label;
  const displayStatus = status === "pending" && isViewed ? "reviewed" : status;

  return (
    <Badge
      variant="secondary"
      className={cn("text-[11px] font-medium", statusColors[displayStatus])}
    >
      {isViewed && status === "pending" && (
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mr-1.5" />
      )}
      {displayLabel}
    </Badge>
  );
}
