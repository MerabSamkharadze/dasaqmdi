import Link from "next/link";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type ActiveBoost = {
  jobId: string;
  title: string;
  vipLevel: "silver" | "gold";
  vipUntil: string;
};

type ActiveBoostsCardProps = {
  boosts: ActiveBoost[];
  title: string;
  emptyLabel: string;
  untilLabel: string;
  locale: string;
};

export function ActiveBoostsCard({
  boosts,
  title,
  emptyLabel,
  untilLabel,
  locale,
}: ActiveBoostsCardProps) {
  if (boosts.length === 0) {
    return (
      <div className="rounded-xl border border-border/60 bg-card p-5 shadow-soft">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-3.5 w-3.5 text-amber-500/70" />
          <h3 className="text-[13px] font-semibold tracking-tight">{title}</h3>
        </div>
        <p className="text-[12px] text-muted-foreground/60">{emptyLabel}</p>
      </div>
    );
  }

  const locale_str = locale === "ka" ? "ka-GE" : "en-US";

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-soft">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-3.5 w-3.5 text-amber-500/70" />
        <h3 className="text-[13px] font-semibold tracking-tight">{title}</h3>
      </div>
      <div className="flex flex-col gap-2">
        {boosts.map((boost) => (
          <Link
            key={boost.jobId}
            href={`/employer/jobs/${boost.jobId}`}
            className="flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-background/60 px-3.5 py-2.5 hover:border-border hover:bg-background transition-all duration-200"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className={cn(
                  "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
                  boost.vipLevel === "gold"
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-400",
                )}
              >
                {boost.vipLevel === "gold" ? "🥇 GOLD" : "🥈 SILVER"}
              </span>
              <span className="text-[13px] font-medium text-foreground truncate">
                {boost.title}
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground/70 tabular-nums shrink-0">
              {untilLabel}{" "}
              {new Date(boost.vipUntil).toLocaleDateString(locale_str, {
                day: "numeric",
                month: "short",
              })}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
