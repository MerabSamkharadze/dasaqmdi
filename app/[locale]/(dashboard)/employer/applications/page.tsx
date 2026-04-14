import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getAllEmployerApplications } from "@/lib/queries/employer-applications";
import { getSignedResumeUrl } from "@/lib/queries/applications";
import { markApplicationsBatchViewedAction } from "@/lib/actions/applications";
import { getTranslations, getLocale } from "next-intl/server";
import { localized } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ApplicationStatusUpdate } from "@/components/dashboard/application-status-update";
import { ApplicationDetails } from "@/components/dashboard/application-details";
import { ApplicationFilters } from "@/components/dashboard/application-filters";
import { MarkViewedOnLoad } from "@/components/dashboard/mark-viewed-on-load";
import { ResumeLink } from "@/components/dashboard/resume-link";
import { User, Calendar, Briefcase, Circle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("applications");
  return { title: t("title") };
}

function formatDate(dateString: string, locale: string): string {
  return new Date(dateString).toLocaleDateString(
    locale === "ka" ? "ka-GE" : "en-US",
    { day: "numeric", month: "short" }
  );
}

export default async function EmployerAllApplicationsPage({
  searchParams,
}: {
  searchParams: { job?: string; status?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const locale = await getLocale();
  const t = await getTranslations("applications");
  const allApplications = await getAllEmployerApplications(user.id);

  // Collect unviewed IDs — mark after render (client-side)
  const unviewedIds = allApplications.filter((a) => !a.is_viewed).map((a) => a.id);

  // Generate signed URLs for resumes
  const resumeUrls = new Map<string, string | null>();
  await Promise.all(
    allApplications.map(async (app) => {
      const signedUrl = await getSignedResumeUrl(app.resume_url);
      resumeUrls.set(app.id, signedUrl);
    })
  );

  // Extract unique jobs for filter dropdown
  const jobMap = new Map<string, string>();
  for (const app of allApplications) {
    if (!jobMap.has(app.job.id)) {
      jobMap.set(app.job.id, localized(app.job, "title", locale));
    }
  }
  const jobOptions = [...jobMap.entries()].map(([id, title]) => ({ id, title }));

  // Apply filters
  let filtered = allApplications;
  if (searchParams.job) {
    filtered = filtered.filter((a) => a.job.id === searchParams.job);
  }
  if (searchParams.status) {
    filtered = filtered.filter((a) => a.status === searchParams.status);
  }

  const filterTranslations = {
    allJobs: t("allJobs"),
    allStatuses: t("allStatuses"),
    filterByJob: t("filterByJob"),
    filterByStatus: t("filterByStatus"),
    statuses: {
      pending: t("status.pending"),
      reviewed: t("status.reviewed"),
      shortlisted: t("status.shortlisted"),
      rejected: t("status.rejected"),
      accepted: t("status.accepted"),
    },
  };

  if (allApplications.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-lg font-semibold tracking-tight">{t("title")}</h1>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/30 py-24">
          <User className="h-7 w-7 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground/60">{t("noApplications")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-lg font-semibold tracking-tight">{t("title")}</h1>
        <span className="text-[12px] text-muted-foreground/70 tabular-nums">
          {filtered.length}{filtered.length !== allApplications.length ? ` / ${allApplications.length}` : ""}
        </span>
      </div>

      {/* Filters */}
      <Suspense>
        <ApplicationFilters
          jobs={jobOptions}
          translations={filterTranslations}
        />
      </Suspense>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/30 py-16">
          <p className="text-sm text-muted-foreground/60">{t("noResults")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((app, i) => {
            const applicantName =
              localized(app.applicant, "full_name", locale) || "Anonymous";
            const jobTitle = localized(app.job, "title", locale);

            return (
              <div
                key={app.id}
                className={`rounded-xl border bg-card px-5 py-4 sm:px-6 shadow-sm animate-fade-in ${
                  !app.is_viewed
                    ? "border-primary/40 bg-primary/[0.03]"
                    : "border-border/60"
                }`}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Applicant */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted/60">
                      {app.applicant.avatar_url ? (
                        <Image
                          src={app.applicant.avatar_url}
                          alt={applicantName}
                          width={36}
                          height={36}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-4 w-4 text-muted-foreground/50" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold tracking-tight text-foreground truncate flex items-center gap-1.5">
                        {!app.is_viewed && (
                          <Circle className="h-2 w-2 fill-primary text-primary shrink-0" />
                        )}
                        {applicantName}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground/60">
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3 opacity-50" />
                          <Link
                            href={`/employer/jobs/${app.job.id}/applications`}
                            className="hover:text-primary transition-colors duration-200"
                          >
                            {jobTitle}
                          </Link>
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 opacity-50" />
                          {formatDate(app.created_at, locale)}
                        </span>
                        {app.applicant.experience_years != null && (
                          <span>{app.applicant.experience_years}y exp</span>
                        )}
                      </div>
                      {app.applicant.skills && app.applicant.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {app.applicant.skills.slice(0, 4).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-[10px] font-normal px-1.5 py-0">
                              {skill}
                            </Badge>
                          ))}
                          {app.applicant.skills.length > 4 && (
                            <span className="text-[10px] text-muted-foreground/50">
                              +{app.applicant.skills.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Resume link */}
                  {resumeUrls.get(app.id) && (
                    <div className="shrink-0">
                      <ResumeLink
                        href={resumeUrls.get(app.id)!}
                        label={t("resume")}
                        applicationId={app.id}
                        isViewed={app.is_viewed}
                      />
                    </div>
                  )}

                  {/* Status update */}
                  <div className="shrink-0">
                    <ApplicationStatusUpdate
                      applicationId={app.id}
                      currentStatus={app.status}
                    />
                  </div>
                </div>

                {/* Collapsible cover letter */}
                <ApplicationDetails
                  coverLetter={app.cover_letter}
                  label={t("viewDetails")}
                  applicationId={app.id}
                  isViewed={app.is_viewed}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Mark unviewed as viewed after page renders */}
      {unviewedIds.length > 0 && <MarkViewedOnLoad ids={unviewedIds} />}
    </div>
  );
}
