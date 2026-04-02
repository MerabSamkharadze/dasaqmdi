import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getMyApplications } from "@/lib/queries/applications";
import { getTranslations, getLocale } from "next-intl/server";
import { localized, cn } from "@/lib/utils";
import { ApplicationStatusBadge } from "@/components/applications/application-status-badge";
import { DeleteApplicationButton } from "@/components/applications/delete-application-button";
import { Badge } from "@/components/ui/badge";
import { Building2, Calendar } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("applications");
  return { title: t("myApplications") };
}

function isJobExpired(deadline: string | null, status: string): boolean {
  if (status !== "active") return true;
  if (!deadline) return false;
  return new Date(deadline) < new Date();
}

function formatDate(dateString: string, locale: string): string {
  return new Date(dateString).toLocaleDateString(locale === "ka" ? "ka-GE" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function SeekerApplicationsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const locale = await getLocale();
  const t = await getTranslations("applications");
  const applications = await getMyApplications();

  if (applications.length === 0) {
    return (
      <div className="flex-1 flex flex-col gap-6">
        <h1 className="text-lg font-semibold tracking-tight">{t("myApplications")}</h1>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/30 py-24 text-muted-foreground/60">
          <p className="text-sm">{t("noApplications")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-lg font-semibold tracking-tight">{t("myApplications")}</h1>
        <span className="text-[12px] text-muted-foreground/70 tabular-nums">
          {applications.length}
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {applications.map((app, i) => {
          const expired = isJobExpired(
            app.job.application_deadline,
            app.job.status,
          );
          const jobTitle = localized(app.job, "title", locale);
          const companyName = localized(app.job.company, "name", locale);

          const statusKey = app.status as keyof typeof statusLabels;
          const statusLabels = {
            pending: t("status.pending"),
            reviewed: t("status.reviewed"),
            shortlisted: t("status.shortlisted"),
            rejected: t("status.rejected"),
            accepted: t("status.accepted"),
          };

          return (
            <div
              key={app.id}
              className={cn(
                "rounded-xl border bg-card px-5 py-4 sm:px-6 shadow-sm transition-all duration-200 animate-fade-in",
                expired
                  ? "border-red-200/60 dark:border-red-900/30 bg-red-50/30 dark:bg-red-950/10"
                  : "border-border/30",
              )}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-center gap-4">
                {/* Company logo */}
                <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                  {app.job.company.logo_url ? (
                    <img
                      src={app.job.company.logo_url}
                      alt={companyName}
                      className="h-8 w-8 rounded-md object-contain"
                    />
                  ) : (
                    <Building2 className="h-4 w-4 text-muted-foreground/50" />
                  )}
                </div>

                {/* Job info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/jobs/${app.job.id}`}
                      className="text-[15px] font-semibold leading-snug tracking-tight text-foreground hover:text-primary transition-colors duration-200 truncate"
                    >
                      {jobTitle}
                    </Link>
                    {expired ? (
                      <Badge variant="destructive" className="text-[11px]">
                        {t("expired")}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[11px] bg-primary/5 text-primary dark:bg-primary/10 dark:text-primary">
                        {t("jobActive")}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-[12px] text-muted-foreground/70">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="h-3 w-3 opacity-50" />
                      {companyName}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 opacity-50" />
                      {formatDate(app.created_at, locale)}
                    </span>
                  </div>
                </div>

                {/* Status + Seen indicator */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <ApplicationStatusBadge
                    status={app.status}
                    isViewed={app.is_viewed}
                    label={statusLabels[statusKey]}
                    seenLabel={t("seen")}
                  />
                  {!app.is_viewed && app.status === "pending" && (
                    <span className="text-[11px] text-muted-foreground/50">
                      {t("notSeen")}
                    </span>
                  )}
                </div>

                {/* Delete button for expired jobs */}
                {expired && (
                  <div className="shrink-0">
                    <DeleteApplicationButton applicationId={app.id} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
