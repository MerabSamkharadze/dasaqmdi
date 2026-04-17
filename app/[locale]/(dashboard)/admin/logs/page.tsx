import { getAdminLogs } from "@/lib/queries/admin";
import { getTranslations, getLocale } from "next-intl/server";
import { CountBadge } from "@/components/shared/count-badge";
import { Badge } from "@/components/ui/badge";
import { ScrollText, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Activity Logs" };

function formatDate(d: string, locale: string): string {
  return new Date(d).toLocaleDateString(
    locale === "ka" ? "ka-GE" : "en-US",
    { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" },
  );
}

const ACTION_COLORS: Record<string, string> = {
  verify_company: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  approve_job: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  reject_job: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  delete_job: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  change_role: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
};

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
        <div className="flex flex-col gap-1.5">
          {logs.map((log, i) => {
            const meta = log.metadata as Record<string, string>;
            return (
              <div
                key={log.id}
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 shadow-soft animate-fade-in"
                style={{ animationDelay: `${i * 20}ms` }}
              >
                <Badge className={`text-[10px] shrink-0 ${ACTION_COLORS[log.action] ?? "text-[10px]"}`}>
                  {log.action.replace(/_/g, " ")}
                </Badge>

                <div className="flex-1 min-w-0 text-[12px] text-muted-foreground">
                  <span className="text-foreground font-medium">{log.target_type}</span>
                  <span className="mx-1 text-muted-foreground/40">·</span>
                  <span className="font-mono text-[11px] text-muted-foreground/50">
                    {log.target_id.slice(0, 8)}
                  </span>
                  {(meta.title || meta.company_name) && (
                    <span className="ml-2 text-[11px] text-foreground/70">
                      {locale === "ka" ? (meta.title_ka || meta.title) : meta.title}
                      {meta.company_name && (
                        <span className="text-muted-foreground/50">
                          {" — "}{locale === "ka" ? (meta.company_name_ka || meta.company_name) : meta.company_name}
                        </span>
                      )}
                    </span>
                  )}
                  {meta.old_role && meta.new_role && (
                    <span className="ml-2 text-[11px]">
                      {meta.old_role} → {meta.new_role}
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-muted-foreground/40 shrink-0 tabular-nums">
                  {formatDate(log.created_at, locale)}
                </span>
              </div>
            );
          })}
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
