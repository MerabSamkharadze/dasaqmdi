import { cn } from "@/lib/utils";

type VipBadgeProps = {
  level: "silver" | "gold";
  className?: string;
};

export function VipBadge({ level, className }: VipBadgeProps) {
  const isGold = level === "gold";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase",
        isGold
          ? "bg-gradient-to-r from-amber-100 to-yellow-50 text-amber-700 border border-amber-300/50 dark:from-amber-500/20 dark:to-yellow-500/10 dark:text-amber-400 dark:border-amber-500/30"
          : "bg-gradient-to-r from-slate-100 to-gray-50 text-slate-600 border border-slate-300/50 dark:from-slate-500/20 dark:to-gray-500/10 dark:text-slate-400 dark:border-slate-500/30",
        className,
      )}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        className="shrink-0"
      >
        <path
          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
          fill={isGold ? "#C7AE6A" : "#94a3b8"}
          stroke={isGold ? "#a08940" : "#64748b"}
          strokeWidth="1"
        />
      </svg>
      {isGold ? "PREMIUM" : "VIP"}
    </span>
  );
}
