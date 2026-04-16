import { getPendingJobs } from "@/lib/queries/admin";
import { getTranslations, getLocale } from "next-intl/server";
import { localized } from "@/lib/utils";
import { CountBadge } from "@/components/shared/count-badge";
import { ModerationButtons } from "@/components/dashboard/admin-moderation-buttons";
import { ShieldCheck, Calendar } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Moderation" };

function formatDate(d: string, locale: string): string {
  return new Date(d).toLocaleDateString(
    locale === "ka" ? "ka-GE" : "en-US",
    { day: "numeric", month: "short", year: "numeric" },
  );
}

export default async function AdminModerationPage() {
  const t = await getTranslations("admin");
  const locale = await getLocale();
  const pendingJobs = await getPendingJobs();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-lg font-semibold tracking-tight">{t("moderationTitle")}</h1>
        <CountBadge>{pendingJobs.length}</CountBadge>
      </div>

      {pendingJobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/30 py-20">
          <ShieldCheck className="h-7 w-7 text-emerald-500/40 mb-3" />
          <p className="text-sm text-muted-foreground/60">{t("noPendingJobs")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {pendingJobs.map((job, i) => {
            const title = localized(job, "title", locale);
            const companyName = job.company
              ? localized(job.company, "name", locale)
              : "—";

            return (
              <div
                key={job.id}
                className="flex items-center gap-4 rounded-xl border border-amber-200/60 dark:border-amber-500/20 bg-amber-50/30 dark:bg-amber-950/10 px-5 py-3.5 shadow-soft animate-fade-in"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate">{title}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground/60">
                    {job.company && (
                      <Link
                        href={`/companies/${job.company.slug}`}
                        className="hover:text-primary transition-colors"
                      >
                        {companyName}
                      </Link>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 opacity-50" />
                      {formatDate(job.created_at, locale)}
                    </span>
                  </div>
                </div>

                <ModerationButtons jobId={job.id} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
