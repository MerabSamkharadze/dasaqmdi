import { cn } from "@/lib/utils";

type IceCreamProps = {
  className?: string;
};

export function IceCream({ className }: IceCreamProps) {
  return <div className={cn("ice-cream-loader", className)} />;
}
