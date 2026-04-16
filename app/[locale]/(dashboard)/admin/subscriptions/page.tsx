import { getAllSubscriptions } from "@/lib/queries/admin";
import { getTranslations, getLocale } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { CountBadge } from "@/components/shared/count-badge";
import { AdminSubscriptionFilters } from "@/components/dashboard/admin-subscription-filters";
import { CreditCard, Calendar } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Subscriptions" };

function formatDate(d: string | null, locale: string): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(
    locale === "ka" ? "ka-GE" : "en-US",
    { day: "numeric", month: "short", year: "numeric" },
  );
}

const planColors: Record<string, string> = {
  free: "text-[11px]",
  pro: "text-[11px] border-primary/30 text-primary",
  verified: "text-[11px] border-emerald-300/50 text-emerald-600 dark:border-emerald-500/30 dark:text-emerald-400",
};

const statusColors: Record<string, string> = {
  active: "text-[11px] bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  cancelled: "text-[11px] bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  past_due: "text-[11px] bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  expired: "text-[11px] bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
};

export default async function AdminSubscriptionsPage({
  searchParams,
}: {
  searchParams: { status?: string; plan?: string };
}) {
  const t = await getTranslations("admin");
  const locale = await getLocale();
  const subscriptions = await getAllSubscriptions({
    status: searchParams.status,
    plan: searchParams.plan,
  });

  const activeCount = subscriptions.filter((s) => s.status === "active").length;
  const paidCount = subscriptions.filter((s) => s.plan !== "free").length;

  const filterTranslations = {
    allStatuses: t("allStatuses"),
    active: t("active"),
    cancelled: t("subscriptionCancelled"),
    pastDue: t("subscriptionPastDue"),
    expired: t("expired"),
    allPlans: t("allPlans"),
    free: "Free",
    pro: "Pro",
    verified: "Verified",
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-lg font-semibold tracking-tight">{t("subscriptionsTitle")}</h1>
        <CountBadge>{subscriptions.length}</CountBadge>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-soft text-center">
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{activeCount}</p>
          <p className="text-[11px] text-muted-foreground mt-1">{t("activeSubscriptions")}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-soft text-center">
          <p className="text-2xl font-bold text-primary tabular-nums">{paidCount}</p>
          <p className="text-[11px] text-muted-foreground mt-1">{t("paidSubscriptions")}</p>
        </div>
      </div>

      <Suspense>
        <AdminSubscriptionFilters translations={filterTranslations} />
      </Suspense>

      {subscriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/30 py-16">
          <CreditCard className="h-7 w-7 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground/60">{t("noResults")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {subscriptions.map((sub, i) => {
            const companyName = sub.company
              ? sub.company.name
              : "—";

            return (
              <div
                key={sub.id}
                className="flex items-center gap-4 rounded-xl border border-border/60 bg-card px-5 py-3.5 shadow-soft animate-fade-in"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <CreditCard className="h-4 w-4 text-muted-foreground/40 shrink-0" />

                <div className="flex-1 min-w-0">
                  {sub.company ? (
                    <Link
                      href={`/admin/companies/${sub.company.id}`}
                      className="text-[13px] font-medium truncate hover:text-primary transition-colors"
                    >
                      {companyName}
                    </Link>
                  ) : (
                    <p className="text-[13px] font-medium text-muted-foreground">—</p>
                  )}
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground/60">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 opacity-50" />
                      {formatDate(sub.current_period_end, locale)}
                    </span>
                  </div>
                </div>

                <Badge variant="outline" className={planColors[sub.plan] ?? "text-[11px]"}>
                  {sub.plan.toUpperCase()}
                </Badge>

                <Badge className={statusColors[sub.status] ?? "text-[11px]"}>
                  {sub.status}
                </Badge>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
