import { JobCard } from "@/components/jobs/job-card";
import type { JobWithCompany } from "@/lib/types";

type JobListProps = {
  jobs: JobWithCompany[];
  locale: string;
  translations: {
    remote: string;
    types: Record<string, string>;
    deadline: string;
    noJobs: string;
  };
};

export function JobList({ jobs, locale, translations }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-lg">{translations.noJobs}</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden divide-y divide-border">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          locale={locale}
          translations={translations}
        />
      ))}
    </div>
  );
}
