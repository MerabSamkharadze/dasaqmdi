import { cn } from "@/lib/utils";

type DayNightProps = {
  className?: string;
};

export function DayNight({ className }: DayNightProps) {
  return <div className={cn("day-night-loader", className)} />;
}
