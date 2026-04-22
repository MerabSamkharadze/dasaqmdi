import { getAdminLogs, ADMIN_LOG_ACTIONS, type AdminLogAction } from "@/lib/queries/admin";
import { getTranslations, getLocale } from "next-intl/server";
import { CountBadge } from "@/components/shared/count-badge";
import { AdminLogsList } from "@/components/dashboard/admin-logs-list";
import { AdminLogsCleanup } from "@/components/dashboard/admin-logs-cleanup";
import { AdminLogsFilters } from "@/components/dashboard/admin-logs-filters";
import { ScrollText, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Activity Logs" };

const PER_PAGE = 20;

function buildPageHref(page: number, action?: string): string {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (action) params.set("action", action);
  return `/admin/logs?${params.toString()}`;
}

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: { page?: string; action?: string };
}) {
  const t = await getTranslations("admin");
  const locale = await getLocale();
  const page = Math.max(Number(searchParams.page) || 1, 1);
  const { logs, total } = await getAdminLogs(page, PER_PAGE, searchParams.action);
  const totalPages = Math.ceil(total / PER_PAGE);

  const actionLabels: Record<AdminLogAction, string> = {
    verify_company: t("logActionVerifyCompany"),
    change_role: t("logActionChangeRole"),
    approve_job: t("logActionApproveJob"),
    reject_job: t("logActionRejectJob"),
    delete_job: t("logActionDeleteJob"),
    upgrade_vip: t("logActionUpgradeVip"),
    remove_vip: t("logActionRemoveVip"),
    boost_purchased: t("logActionBoostPurchased"),
    create_external_job: t("logActionCreateExternalJob"),
    purge_logs: t("logActionPurgeLogs"),
  };

  const filterTranslations = {
    allActions: t("logAllActions"),
    filterByAction: t("logFilterByAction"),
    actionLabels,
  };

  const rowTranslations = {
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

  const bulkTranslations = {
    selectAll: t("selectAll"),
    deleteSelected: t("deleteSelected"),
    cancel: t("cancelSelection"),
    confirmDelete: t("confirmBulkDelete"),
  };

  const cleanupTranslations = {
    cleanupTitle: t("logCleanupTitle"),
    cleanupDescription: t("logCleanupDescription"),
    cleanupOlderThan: t("logCleanupOlderThan"),
    days: t("logCleanupDays"),
    confirmClearTitle: t("logCleanupConfirmTitle"),
    confirmClearDescription: t("logCleanupConfirmDescription"),
    confirmClearAction: t("logCleanupConfirmAction"),
    cancel: t("cancelSelection"),
    cleared: t("logCleanupCleared"),
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-lg font-semibold tracking-tight">{t("logsTitle")}</h1>
        <CountBadge>{total}</CountBadge>
      </div>

      <AdminLogsCleanup t={cleanupTranslations} />

      <Suspense>
        <AdminLogsFilters actions={ADMIN_LOG_ACTIONS} translations={filterTranslations} />
      </Suspense>

      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/30 py-20">
          <ScrollText className="h-7 w-7 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground/60">{t("noLogs")}</p>
        </div>
      ) : (
        <AdminLogsList
          logs={logs}
          locale={locale}
          rowT={rowTranslations}
          bulkT={bulkTranslations}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Button variant="outline" size="sm" asChild>
              <Link href={buildPageHref(page - 1, searchParams.action)}>
                <ChevronLeft className="h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
          <span className="text-[12px] text-muted-foreground tabular-nums">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Button variant="outline" size="sm" asChild>
              <Link href={buildPageHref(page + 1, searchParams.action)}>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
