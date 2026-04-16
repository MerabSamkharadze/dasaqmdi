import { cn } from "@/lib/utils";

type ChocoDrinkProps = {
  className?: string;
};

export function ChocoDrink({ className }: ChocoDrinkProps) {
  return <div className={cn("choco-drink", className)} />;
}
