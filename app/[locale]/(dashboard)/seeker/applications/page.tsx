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

export const metadata: Metadata = {
  title: "My Applications",
};

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
  const applications = await getMyApplications(user.id);

  if (applications.length === 0) {
    return (
      <div className="flex-1 flex flex-col gap-4">
        <h1 className="text-2xl font-bold">{t("myApplications")}</h1>
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <p className="text-lg">{t("noApplications")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("myApplications")}</h1>
        <span className="text-sm text-muted-foreground">
          {applications.length} {t("title").toLowerCase()}
        </span>
      </div>

      <div className="border rounded-lg overflow-hidden">
        {applications.map((app) => {
          const expired = isJobExpired(
            app.job.application_deadline,
            app.job.status,
          );
          const jobTitle = localized(app.job, "title", locale);
          const companyName = localized(app.job.company, "name", locale);

          // Determine display status label
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
                "flex items-center gap-4 p-4 border-b border-border last:border-b-0 transition-colors",
                expired &&
                  "bg-red-50/50 dark:bg-red-950/20 border-l-2 border-l-red-400 dark:border-l-red-600",
              )}
            >
              {/* Company logo */}
              <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-muted">
                {app.job.company.logo_url ? (
                  <img
                    src={app.job.company.logo_url}
                    alt={companyName}
                    className="h-8 w-8 rounded object-contain"
                  />
                ) : (
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                )}
              </div>

              {/* Job info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/jobs/${app.job.id}`}
                    className="font-medium text-foreground hover:text-primary transition-colors truncate"
                  >
                    {jobTitle}
                  </Link>
                  {expired && (
                    <Badge
                      variant="destructive"
                      className="text-xs"
                    >
                      {t("expired")}
                    </Badge>
                  )}
                  {!expired && (
                    <Badge
                      variant="outline"
                      className="text-xs text-green-700 dark:text-green-400 border-green-300 dark:border-green-700"
                    >
                      {t("jobActive")}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" />
                    {companyName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {t("dateSent")} {formatDate(app.created_at, locale)}
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
                  <span className="text-xs text-muted-foreground">
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
          );
        })}
      </div>
    </div>
  );
}
