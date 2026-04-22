import { getAdminLogs } from "@/lib/queries/admin";
import { getTranslations, getLocale } from "next-intl/server";
import { CountBadge } from "@/components/shared/count-badge";
import { AdminLogRow } from "@/components/dashboard/admin-log-row";
import { ScrollText, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Activity Logs" };

const PER_PAGE = 20;

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const t = await getTranslations("admin");
  const locale = await getLocale();
  const page = Math.max(Number(searchParams.page) || 1, 1);
  const { logs, total } = await getAdminLogs(page, PER_PAGE);
  const totalPages = Math.ceil(total / PER_PAGE);

  const translations = {
    by: t("logBy"),
    posted: t("logPosted"),
    postedBy: t("logPostedBy"),
    deleted: t("logDeleted"),
    becameVipAt: t("logBecameVipAt"),
    vipUntilWas: t("logVipUntilWas"),
    from: t("logFrom"),
    to: t("logTo"),
    level: {
      gold: "GOLD",
      silver: "SILVER",
      normal: t("logLevelNormal"),
    },
    source: {
      upgrade_vip: t("logSourceAdmin"),
      boost_purchased: t("logSourcePurchase"),
    },
    category: t("logCategory"),
    owner: t("logOwner"),
    status: {
      active: t("active"),
      closed: t("closed"),
      expired: t("expired"),
      pending: t("pending"),
      rejected: t("rejected"),
    },
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-lg font-semibold tracking-tight">{t("logsTitle")}</h1>
        <CountBadge>{total}</CountBadge>
      </div>

      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/30 py-20">
          <ScrollText className="h-7 w-7 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground/60">{t("noLogs")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {logs.map((log, i) => (
            <div
              key={log.id}
              className="animate-fade-in"
              style={{ animationDelay: `${i * 20}ms` }}
            >
              <AdminLogRow log={log} locale={locale} t={translations} />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/logs?page=${page - 1}`}>
                <ChevronLeft className="h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
          <span className="text-[12px] text-muted-foreground tabular-nums">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/logs?page=${page + 1}`}>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
