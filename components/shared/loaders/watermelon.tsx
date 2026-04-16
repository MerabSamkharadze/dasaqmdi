import { cn } from "@/lib/utils";

type WatermelonProps = {
  className?: string;
};

export function Watermelon({ className }: WatermelonProps) {
  return <div className={cn("watermelon-loader", className)} />;
}
