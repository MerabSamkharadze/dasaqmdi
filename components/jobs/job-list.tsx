import { JobCard } from "@/components/jobs/job-card";
import type { JobWithCompany } from "@/lib/types";

type JobListProps = {
  jobs: JobWithCompany[];
  locale: string;
  matchScores?: Map<string, number> | null;
  savedJobIds?: Set<string> | null;
  isLoggedIn?: boolean;
  translations: {
    remote: string;
    types: Record<string, string>;
    deadline: string;
    noJobs: string;
    match?: string;
  };
};

export function JobList({ jobs, locale, matchScores, savedJobIds, isLoggedIn, translations }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/40 py-24 text-muted-foreground/60">
        <p className="text-sm">{translations.noJobs}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {jobs.map((job, i) => (
        <div
          key={job.id}
          className="animate-fade-in"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <JobCard
            job={job}
            locale={locale}
            matchScore={matchScores?.get(job.id) ?? null}
            isSaved={savedJobIds?.has(job.id) ?? false}
            isLoggedIn={isLoggedIn}
            translations={translations}
          />
        </div>
      ))}
    </div>
  );
}
