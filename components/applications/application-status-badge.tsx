import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ApplicationStatusBadgeProps = {
  status: string;
  isViewed: boolean;
  label: string;
  seenLabel: string;
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  reviewed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  shortlisted: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  accepted: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

export function ApplicationStatusBadge({
  status,
  isViewed,
  label,
  seenLabel,
}: ApplicationStatusBadgeProps) {
  // If pending but viewed, show "Seen" instead of "Pending"
  const displayLabel = status === "pending" && isViewed ? seenLabel : label;
  const displayStatus = status === "pending" && isViewed ? "reviewed" : status;

  return (
    <Badge
      variant="secondary"
      className={cn("text-xs font-medium", statusColors[displayStatus])}
    >
      {isViewed && status === "pending" && (
        <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1.5" />
      )}
      {displayLabel}
    </Badge>
  );
}
