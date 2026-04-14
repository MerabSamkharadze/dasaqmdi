import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ApplicationStatusBadgeProps = {
  status: string;
  isViewed: boolean;
  label: string;
  seenLabel: string;
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  reviewed: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  shortlisted: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  accepted: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
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
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 mr-1.5" />
      )}
      {displayLabel}
    </Badge>
  );
}
