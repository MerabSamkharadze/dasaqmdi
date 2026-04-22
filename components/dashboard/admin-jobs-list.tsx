"use client";

import { AdminSelectableList } from "@/components/dashboard/admin-selectable-list";
import { batchDeleteJobsAction } from "@/lib/actions/admin";
import { Badge } from "@/components/ui/badge";
import { AdminDeleteJobButton } from "@/components/dashboard/admin-delete-job-button";
import { AdminVipButton } from "@/components/dashboard/admin-vip-button";
import { Calendar, Star } from "lucide-react";
import Link from "next/link";
import { isVipActive } from "@/lib/vip";

type AdminJob = {
  id: string;
  title: string;
  created_at: string;
  views_count: number;
  status: string;
  expires_at: string;
  is_featured: boolean;
  vip_level: string;
  vip_until: string | null;
};

type AdminJobsListProps = {
  jobs: AdminJob[];
  locale: string;
  translations: {
    active: string;
    closed: string;
    expired: string;
    pending: string;
    views: string;
    selectAll: string;
    deleteSelected: string;
    cancel: string;
    confirmDelete: string;
  };
};

function formatDate(d: string, locale: string): string {
  return new Date(d).toLocaleDateString(
    locale === "ka" ? "ka-GE" : "en-US",
    { day: "numeric", month: "short", year: "numeric" },
  );
}

function StatusBadge({
  status,
  isExpired,
  t,
}: {
  status: string;
  isExpired: boolean;
  t: AdminJobsListProps["translations"];
}) {
  if (status === "pending") {
    return (
      <Badge className="text-[11px] bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/20">
        {t.pending}
      </Badge>
    );
  }
  if (status === "active" && !isExpired) {
    return (
      <Badge className="text-[11px] bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/20">
        {t.active}
      </Badge>
    );
  }
  if (status === "closed") {
    return (
      <Badge className="text-[11px] bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/20">
        {t.closed}
      </Badge>
    );
  }
  return (
    <Badge className="text-[11px] bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/20">
      {t.expired}
    </Badge>
  );
}

export function AdminJobsList({ jobs, locale, translations: t }: AdminJobsListProps) {
  const items = jobs.map((job) => {
    const isExpired = new Date(job.expires_at) < new Date();
    const vipActive = isVipActive({ vip_level: job.vip_level, vip_until: job.vip_until });
    return {
      id: job.id,
      node: (
        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-5 py-3.5 shadow-soft">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              {job.is_featured && (
                <Star className="h-3 w-3 shrink-0 fill-amber-500 text-amber-500" aria-label="Featured" />
              )}
              {vipActive && (
                <Badge
                  className={
                    job.vip_level === "gold"
                      ? "text-[9px] shrink-0 bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 px-1.5 py-0"
                      : "text-[9px] shrink-0 bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-400 px-1.5 py-0"
                  }
                >
                  {job.vip_level === "gold" ? "🥇" : "🥈"}
                </Badge>
              )}
              <Link
                href={`/jobs/${job.id}`}
                className="text-[13px] font-medium truncate hover:text-primary transition-colors"
              >
                {job.title}
              </Link>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground/60">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 opacity-50" />
                {formatDate(job.created_at, locale)}
              </span>
              <span>
                {job.views_count} {t.views}
              </span>
            </div>
          </div>
          <StatusBadge status={job.status} isExpired={isExpired} t={t} />
          <AdminVipButton jobId={job.id} currentLevel={job.vip_level} vipUntil={job.vip_until} />
          <AdminDeleteJobButton jobId={job.id} />
        </div>
      ),
    };
  });

  return (
    <AdminSelectableList
      items={items}
      onBulkDelete={batchDeleteJobsAction}
      translations={{
        selectAll: t.selectAll,
        deleteSelected: t.deleteSelected,
        cancel: t.cancel,
        confirmDelete: t.confirmDelete,
      }}
    />
  );
}
