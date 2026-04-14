"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type ChartData = {
  name: string;
  min: number;
  max: number;
  avg: number;
  count: number;
};

const COLORS = ["#C7AE6A", "#543d3d", "#725252", "#362828", "#f5ebb4", "#8b7355"];

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartData }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-border/60 bg-card px-3 py-2 shadow-md text-[12px]">
      <p className="font-semibold text-foreground mb-1">{d.name}</p>
      <p className="text-muted-foreground">
        <span className="text-foreground font-medium">{d.min.toLocaleString()}</span>
        {" – "}
        <span className="text-foreground font-medium">{d.max.toLocaleString()}</span>
      </p>
      <p className="text-muted-foreground/60 mt-0.5">{d.count} jobs</p>
    </div>
  );
}

export function SalaryRangeChart({
  data,
  labels,
}: {
  data: ChartData[];
  labels: { title: string; avg: string };
}) {
  if (data.length === 0) return null;

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-soft">
      <h3 className="text-[14px] font-semibold text-foreground mb-4">{labels.title}</h3>
      <div className="h-[280px] sm:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 20, bottom: 0, left: 0 }}
            barGap={4}
          >
            <XAxis
              type="number"
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 11, fill: "hsl(0 16% 38%)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              tick={{ fontSize: 12, fill: "hsl(0 16% 38%)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(44 60% 90% / 0.3)" }} />
            <Bar dataKey="min" stackId="range" radius={[4, 0, 0, 4]} barSize={20} name="Min">
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.35} />
              ))}
            </Bar>
            <Bar dataKey="avg" stackId="range" radius={0} barSize={20} name={labels.avg}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.7} />
              ))}
            </Bar>
            <Bar dataKey="max" stackId="range" radius={[0, 4, 4, 0]} barSize={20} name="Max">
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.2} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function SalaryComparisonChart({
  data,
  labels,
}: {
  data: ChartData[];
  labels: { title: string };
}) {
  if (data.length === 0) return null;

  const maxVal = Math.max(...data.map((d) => d.max));

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-soft">
      <h3 className="text-[14px] font-semibold text-foreground mb-5">{labels.title}</h3>
      <div className="space-y-4">
        {data.map((d, i) => {
          const minPct = (d.min / maxVal) * 100;
          const avgPct = (d.avg / maxVal) * 100;
          const maxPct = (d.max / maxVal) * 100;
          return (
            <div key={d.name}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[13px] font-medium text-foreground">{d.name}</span>
                <span className="text-[12px] text-muted-foreground tabular-nums">
                  {d.avg.toLocaleString()}
                </span>
              </div>
              <div className="relative h-3 rounded-full bg-muted/50 overflow-hidden">
                {/* Full range — light */}
                <div
                  className="absolute top-0 h-full rounded-full transition-all duration-500"
                  style={{
                    left: `${minPct}%`,
                    width: `${maxPct - minPct}%`,
                    background: COLORS[i % COLORS.length],
                    opacity: 0.15,
                  }}
                />
                {/* Avg marker — solid */}
                <div
                  className="absolute top-0 h-full rounded-full transition-all duration-500"
                  style={{
                    left: 0,
                    width: `${avgPct}%`,
                    background: COLORS[i % COLORS.length],
                    opacity: 0.6,
                  }}
                />
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-muted-foreground/50 tabular-nums">
                <span>{d.min.toLocaleString()}</span>
                <span>{d.max.toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
