import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getJobById } from "@/lib/queries/jobs";
import { getApplicationsByJob } from "@/lib/queries/applications";
import { markApplicationViewedAction } from "@/lib/actions/applications";
import { getTranslations, getLocale } from "next-intl/server";
import { localized } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ApplicationStatusUpdate } from "@/components/dashboard/application-status-update";
import { User, Calendar, ExternalLink } from "lucide-react";
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
  const applications = await getApplicationsByJob(job.id);

  for (const app of applications) {
    if (!app.is_viewed) {
      await markApplicationViewedAction(app.id);
    }
  }

  const title = localized(job, "title", locale);

  if (applications.length === 0) {
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
        <span className="text-[12px] text-muted-foreground/70 tabular-nums">
          {applications.length}
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {applications.map((app, i) => {
          const applicantName =
            localized(app.applicant, "full_name", locale) || "Anonymous";

          return (
            <div
              key={app.id}
              className="rounded-xl border border-border/30 bg-card px-5 py-4 sm:px-6 shadow-sm animate-fade-in"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Applicant info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted/60">
                    {app.applicant.avatar_url ? (
                      <img
                        src={app.applicant.avatar_url}
                        alt={applicantName}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-4 w-4 text-muted-foreground/50" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold tracking-tight text-foreground truncate">
                      {applicantName}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5 text-[12px] text-muted-foreground/70">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 opacity-50" />
                        {formatDate(app.created_at, locale)}
                      </span>
                      {app.applicant.experience_years != null && (
                        <span>{app.applicant.experience_years}y exp</span>
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

                {/* Resume link */}
                <div className="shrink-0">
                  <a
                    href={app.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[12px] text-primary/80 hover:text-primary hover:underline transition-colors duration-200"
                  >
                    Resume <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                {/* Status update */}
                <div className="shrink-0">
                  <ApplicationStatusUpdate
                    applicationId={app.id}
                    currentStatus={app.status}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
