import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getJobById } from "@/lib/queries/jobs";
import { getApplicationsByJob, getSignedResumeUrl } from "@/lib/queries/applications";
import { markApplicationsBatchViewedAction } from "@/lib/actions/applications";
import { calculateMatch } from "@/lib/matching";
import { getTranslations, getLocale } from "next-intl/server";
import { localized } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CountBadge } from "@/components/shared/count-badge";
import { ApplicationStatusUpdate } from "@/components/dashboard/application-status-update";
import { ApplicationDetails } from "@/components/dashboard/application-details";
import { User, Calendar, ExternalLink, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Applicants",
};

function formatDate(dateString: string, locale: string): string {
  return new Date(dateString).toLocaleDateString(
    locale === "ka" ? "ka-GE" : "en-US",
    { day: "numeric", month: "short", year: "numeric" }
  );
}

export default async function JobApplicationsPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const job = await getJobById(params.id);
  if (!job || job.posted_by !== user.id) notFound();

  const locale = await getLocale();
  const t = await getTranslations("applications");
  const applications = await getApplicationsByJob(job.id, user.id);

  // O9: Batch mark all unviewed as viewed in one query
  const unviewedIds = applications.filter((a) => !a.is_viewed).map((a) => a.id);
  if (unviewedIds.length > 0) {
    await markApplicationsBatchViewedAction(unviewedIds);
  }

  // Generate signed URLs for resumes (private bucket)
  const resumeUrls = new Map<string, string | null>();
  await Promise.all(
    applications.map(async (app) => {
      const signedUrl = await getSignedResumeUrl(app.resume_url);
      resumeUrls.set(app.id, signedUrl);
    })
  );

  // T2: Calculate match scores and sort by best match
  const matchScores = new Map<string, number>();
  if (job.tags && job.tags.length > 0) {
    for (const app of applications) {
      if (app.applicant.skills && app.applicant.skills.length > 0) {
        const result = calculateMatch(app.applicant.skills, job.tags);
        if (result.score > 0) {
          matchScores.set(app.id, result.score);
        }
      }
    }
  }

  // Sort: highest match first, then by date
  const sortedApplications = [...applications].sort((a, b) => {
    const scoreA = matchScores.get(a.id) ?? 0;
    const scoreB = matchScores.get(b.id) ?? 0;
    if (scoreA !== scoreB) return scoreB - scoreA;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const title = localized(job, "title", locale);

  if (sortedApplications.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-lg font-semibold tracking-tight">
          {t("applicants")} — {title}
        </h1>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/30 py-24">
          <User className="h-7 w-7 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground/60">No applicants yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-lg font-semibold tracking-tight">
          {t("applicants")} — {title}
        </h1>
        <CountBadge>{applications.length}</CountBadge>
      </div>

      <div className="flex flex-col gap-2.5">
        {sortedApplications.map((app, i) => {
          const applicantName =
            localized(app.applicant, "full_name", locale) || "Anonymous";
          const matchScore = matchScores.get(app.id);

          return (
            <div
              key={app.id}
              className="rounded-xl border border-border/60 bg-card px-5 py-4 sm:px-6 shadow-soft animate-fade-in"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Applicant info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted/60">
                    {app.applicant.avatar_url ? (
                      <Image
                        src={app.applicant.avatar_url}
                        alt={applicantName}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-4 w-4 text-muted-foreground/50" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/seekers/${app.applicant.id}`}
                      className="text-[15px] font-semibold tracking-tight text-foreground truncate hover:text-primary transition-colors duration-200 block"
                    >
                      {applicantName}
                    </Link>
                    <div className="flex items-center gap-3 mt-0.5 text-[12px] text-muted-foreground/70">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 opacity-50" />
                        {formatDate(app.created_at, locale)}
                      </span>
                      {app.applicant.experience_years != null && (
                        <span>{app.applicant.experience_years}y exp</span>
                      )}
                      {matchScore != null && (
                        <span className="inline-flex items-center gap-0.5 text-violet-600 dark:text-violet-400 font-medium">
                          <Zap className="h-2.5 w-2.5" />
                          {matchScore}%
                        </span>
                      )}
                    </div>
                    {app.applicant.skills && app.applicant.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {app.applicant.skills.slice(0, 5).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-[10px] font-normal px-1.5 py-0">
                            {skill}
                          </Badge>
                        ))}
                        {app.applicant.skills.length > 5 && (
                          <span className="text-[10px] text-muted-foreground/50">
                            +{app.applicant.skills.length - 5}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Resume link — always visible */}
                {resumeUrls.get(app.id) && (
                  <div className="shrink-0">
                    <a
                      href={resumeUrls.get(app.id)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[12px] text-primary/80 hover:text-primary hover:underline transition-colors duration-200"
                    >
                      {t("resume")} <ExternalLink className="h-3 w-3" />
                    </a>
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
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
