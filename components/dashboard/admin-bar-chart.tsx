import type { TrendPoint, CategoryCount } from "@/lib/queries/admin";

type BarChartProps = {
  data: TrendPoint[];
  label: string;
  subtitle?: string;
};

export function BarChart({ data, label, subtitle }: BarChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight">{label}</h3>
          {subtitle && (
            <p className="text-[11px] text-muted-foreground/60 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        <span className="text-2xl font-bold text-primary tabular-nums">
          {total}
        </span>
      </div>
      <div className="flex items-end gap-[2px] h-32">
        {data.map((point, i) => {
          const pct = Math.max((point.count / max) * 100, 1.5);
          const day = new Date(point.date).getDate();
          return (
            <div
              key={point.date}
              className="group/bar relative flex-1 min-w-[3px]"
              style={{ height: "100%" }}
            >
              <div
                className="absolute bottom-0 w-full rounded-t-sm bg-primary/60 hover:bg-primary transition-colors duration-150"
                style={{ height: `${pct}%` }}
              />
              {/* Tooltip */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover/bar:flex flex-col items-center z-10">
                <span className="text-[10px] bg-foreground text-background px-1.5 py-0.5 rounded whitespace-nowrap font-medium">
                  {point.count}
                </span>
              </div>
              {/* X-axis labels at intervals */}
              {(i === 0 || day === 1 || day === 15 || i === data.length - 1) && (
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground/40 tabular-nums">
                  {day}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

type HBarChartProps = {
  data: CategoryCount[];
  label: string;
  locale: string;
};

export function HBarChart({ data, label, locale }: HBarChartProps) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div>
      <h3 className="text-[15px] font-semibold tracking-tight mb-4">
        {label}
      </h3>
      <div className="flex flex-col gap-2.5">
        {data.map((cat, i) => {
          const pct = Math.max((cat.count / max) * 100, 2);
          const name = locale === "ka" ? cat.name_ka : cat.name_en;
          return (
            <div
              key={cat.slug}
              className="animate-fade-in"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] text-foreground">{name}</span>
                <span className="text-[12px] text-muted-foreground tabular-nums">
                  {cat.count}
                </span>
              </div>
              <div className="h-5 w-full rounded-md bg-muted/30 overflow-hidden">
                <div
                  className="h-full rounded-md bg-primary/60 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
