import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getSavedJobs } from "@/lib/queries/saved-jobs";
import { getProfile } from "@/lib/queries/profile";
import { calculateMatch } from "@/lib/matching";
import { getTranslations, getLocale } from "next-intl/server";
import { localized } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { BookmarkButton } from "@/components/jobs/bookmark-button";
import { Bookmark, Building2, MapPin, Zap } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard");
  return { title: t("savedJobs") };
}

export default async function SavedJobsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const locale = await getLocale();
  const t = await getTranslations("dashboard");
  const [jobs, profile] = await Promise.all([
    getSavedJobs(user.id),
    getProfile(user.id),
  ]);

  const seekerSkills = profile?.skills ?? [];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold tracking-tight">
        {t("savedJobs")}
      </h1>

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/30 py-24">
          <Bookmark className="h-7 w-7 text-muted-foreground/25 mb-3" />
          <p className="text-[13px] text-muted-foreground/50">
            {t("noSavedJobs")}
          </p>
          <Link
            href="/jobs"
            className="text-[12px] text-primary/70 hover:text-primary mt-1.5 transition-colors duration-200"
          >
            {t("browseJobs")}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {jobs.map((job, i) => {
            const title = localized(job, "title", locale);
            const companyName = localized(job.company, "name", locale);
            const matchResult =
              seekerSkills.length > 0 && job.tags?.length > 0
                ? calculateMatch(seekerSkills, job.tags)
                : null;

            return (
              <div
                key={job.id}
                className="flex items-center gap-4 rounded-xl border border-border/60 bg-card px-5 py-3.5 shadow-soft hover:shadow-soft-md hover:border-border transition-all duration-200 animate-fade-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <Link href={`/jobs/${job.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                    {job.company.logo_url ? (
                      <img
                        src={job.company.logo_url}
                        alt=""
                        className="h-9 w-9 rounded-lg object-cover"
                      />
                    ) : (
                      <Building2 className="h-4 w-4 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-foreground truncate">
                      {title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-muted-foreground/60 truncate">
                        {companyName}
                      </span>
                      {job.city && (
                        <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground/50">
                          <MapPin className="h-2.5 w-2.5" />
                          {job.city}
                        </span>
                      )}
                    </div>
                  </div>
                  {matchResult && matchResult.score > 0 && (
                    <Badge
                      variant="outline"
                      className="shrink-0 text-[10px] font-medium gap-1 border-primary/30 bg-primary/5 text-primary"
                    >
                      <Zap className="h-2.5 w-2.5" />
                      {matchResult.score}%
                    </Badge>
                  )}
                </Link>
                <BookmarkButton jobId={job.id} isSaved={true} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
