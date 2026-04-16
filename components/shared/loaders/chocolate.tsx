import { cn } from "@/lib/utils";

type ChocolateProps = {
  className?: string;
};

export function Chocolate({ className }: ChocolateProps) {
  return <div className={cn("chocolate-loader", className)} />;
}
