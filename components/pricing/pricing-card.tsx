import { Check, X } from "lucide-react";
import { CheckoutButton } from "@/components/pricing/checkout-button";
import Link from "next/link";
import { cn } from "@/lib/utils";

type PricingCardProps = {
  name: string;
  price: string;
  period: string;
  features: string[];
  disabledFeatures?: string[];
  highlighted?: boolean;
  popularLabel?: string;
  ctaLabel: string;
  ctaHref?: string;
  plan?: "pro" | "verified";
  isLoggedIn?: boolean;
  currentPlanLabel?: string;
  isCurrent?: boolean;
};

export function PricingCard({
  name,
  price,
  period,
  features,
  disabledFeatures = [],
  highlighted = false,
  popularLabel,
  ctaLabel,
  ctaHref,
  plan,
  isLoggedIn,
  currentPlanLabel,
  isCurrent,
}: PricingCardProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-xl border bg-card p-6 shadow-soft transition-shadow hover:shadow-soft-md",
        highlighted
          ? "border-primary/40 shadow-md"
          : "border-border/60"
      )}
    >
      {popularLabel && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-primary px-3 py-1 text-[11px] font-medium text-primary-foreground">
            {popularLabel}
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-[15px] font-semibold text-foreground">{name}</h3>
        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-3xl font-bold tracking-tight text-foreground">
            {price}
          </span>
          <span className="text-sm text-muted-foreground">{period}</span>
        </div>
      </div>

      <ul className="mb-8 flex flex-1 flex-col gap-2.5">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span className="text-foreground">{feature}</span>
          </li>
        ))}
        {disabledFeatures.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2 text-sm text-muted-foreground/50"
          >
            <X className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {isCurrent ? (
        <div className="rounded-lg border border-border/60 bg-muted/30 py-2.5 text-center text-sm font-medium text-muted-foreground">
          {currentPlanLabel}
        </div>
      ) : ctaHref ? (
        <Link
          href={ctaHref}
          className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-border/60 bg-background text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
        >
          {ctaLabel}
        </Link>
      ) : plan && isLoggedIn ? (
        <CheckoutButton
          plan={plan}
          label={ctaLabel}
          variant={highlighted ? "default" : "outline"}
        />
      ) : plan ? (
        <Link
          href="/auth/login"
          className={cn(
            "inline-flex h-10 w-full items-center justify-center rounded-lg text-sm font-medium transition-colors",
            highlighted
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "border border-border/60 bg-background text-foreground hover:bg-muted/50"
          )}
        >
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  );
}
