import { cn } from "@/lib/utils";

type CountBadgeProps = {
  children: React.ReactNode;
  className?: string;
};

export function CountBadge({ children, className }: CountBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center min-w-[26px] h-[22px] px-2 rounded-full",
        "bg-primary/10 text-primary border border-primary/20",
        "text-[11px] font-medium tabular-nums leading-none",
        className,
      )}
    >
      {children}
    </span>
  );
}
