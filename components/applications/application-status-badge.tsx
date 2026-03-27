import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ApplicationStatusBadgeProps = {
  status: string;
  isViewed: boolean;
  label: string;
  seenLabel: string;
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400/90",
  reviewed: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400/90",
  shortlisted: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400/90",
  rejected: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400/90",
  accepted: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400/90",
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
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" />
      )}
      {displayLabel}
    </Badge>
  );
}
