import { JobCard } from "@/components/jobs/job-card";
import { Zap, UserCog } from "lucide-react";
import type { JobWithCompany } from "@/lib/types";
import Link from "next/link";

type TopMatchesProps = {
  jobs: JobWithCompany[];
  matchScores: Map<string, number>;
  savedJobIds: Set<string> | null;
  locale: string;
  translations: {
    title: string;
    noSkills: string;
    noSkillsCta: string;
    remote: string;
    types: Record<string, string>;
    deadline: string;
    match?: string;
  };
};

export function TopMatches({
  jobs,
  matchScores,
  savedJobIds,
  locale,
  translations,
}: TopMatchesProps) {
  // Get top 5 jobs sorted by match score
  const topJobs = jobs
    .filter((j) => (matchScores.get(j.id) ?? 0) > 0)
    .sort((a, b) => (matchScores.get(b.id) ?? 0) - (matchScores.get(a.id) ?? 0))
    .slice(0, 5);

  if (topJobs.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-primary" />
        <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
          {translations.title}
        </h2>
      </div>

      <div className="flex flex-col gap-2.5">
        {topJobs.map((job, i) => (
          <div
            key={job.id}
            className="animate-fade-in"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <JobCard
              job={job}
              locale={locale}
              matchScore={matchScores.get(job.id)}
              isSaved={savedJobIds?.has(job.id)}
              isLoggedIn
              translations={translations}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export function TopMatchesEmpty({
  title,
  noSkills,
  noSkillsCta,
}: {
  title: string;
  noSkills: string;
  noSkillsCta: string;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-primary" />
        <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
          {title}
        </h2>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 py-10 text-center">
        <UserCog className="h-6 w-6 text-muted-foreground/40 mb-2" />
        <p className="text-sm text-muted-foreground">{noSkills}</p>
        <Link
          href="/profile"
          className="mt-2 text-xs text-primary hover:text-primary/80 transition-colors"
        >
          {noSkillsCta} &rarr;
        </Link>
      </div>
    </section>
  );
}
