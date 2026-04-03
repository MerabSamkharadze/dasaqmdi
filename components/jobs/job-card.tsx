import { Badge } from "@/components/ui/badge";
import { localized } from "@/lib/utils";
import type { JobWithCompany } from "@/lib/types";
import { Building2, Calendar, Clock, MapPin, Zap } from "lucide-react";
import { BookmarkButton } from "@/components/jobs/bookmark-button";
import Link from "next/link";

type JobCardProps = {
  job: JobWithCompany;
  locale: string;
  matchScore?: number | null;
  isSaved?: boolean;
  isLoggedIn?: boolean;
  translations: {
    remote: string;
    types: Record<string, string>;
    deadline: string;
    match?: string;
  };
};

function formatDate(dateString: string, locale: string): string {
  return new Date(dateString).toLocaleDateString(locale === "ka" ? "ka-GE" : "en-US", {
    day: "numeric",
    month: "short",
  });
}

function formatSalary(
  min: number | null,
  max: number | null,
  currency: string,
): string | null {
  if (!min && !max) return null;
  if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`;
  if (min) return `${min.toLocaleString()}+ ${currency}`;
  return `${max!.toLocaleString()} ${currency}`;
}

export function JobCard({ job, locale, matchScore, isSaved, isLoggedIn, translations }: JobCardProps) {
  const title = localized(job, "title", locale);
  const companyName = localized(job.company, "name", locale);
  const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency);

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group block rounded-xl border border-border/60 bg-card px-5 py-5 sm:px-6 sm:py-5 shadow-soft transition-all duration-200 hover:shadow-soft-md hover:border-border hover:-translate-y-0.5"
    >
      <div className="flex items-start gap-4 sm:gap-5">
        {/* Company Logo */}
        <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/8">
          {job.company.logo_url ? (
            <img
              src={job.company.logo_url}
              alt={companyName}
              className="h-8 w-8 rounded-md object-contain"
            />
          ) : (
            <Building2 className="h-4 w-4 text-primary/60" />
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Title */}
          <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-foreground group-hover:text-primary transition-colors duration-200 truncate">
            {title}
          </h3>

          {/* Company + location */}
          <div className="flex items-center gap-3 text-[13px] text-muted-foreground leading-normal">
            <span className="flex items-center gap-1.5 truncate">
              <Building2 className="h-3 w-3 shrink-0 opacity-50" />
              {companyName}
            </span>
            {job.city && (
              <span className="hidden sm:flex items-center gap-1.5">
                <MapPin className="h-3 w-3 shrink-0 opacity-50" />
                {job.city}
              </span>
            )}
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap pt-0.5">
            <Badge variant="secondary" className="text-[11px] font-normal px-2 py-0.5 bg-primary/10 text-primary dark:bg-primary/15">
              {translations.types[job.job_type] ?? job.job_type}
            </Badge>
            {job.is_remote && (
              <Badge variant="outline" className="text-[11px] font-normal px-2 py-0.5 bg-gold/12 border-gold/25 text-gold-foreground dark:bg-gold/15 dark:text-gold dark:border-gold/30">
                {translations.remote}
              </Badge>
            )}
            {matchScore != null && matchScore > 0 && (
              <Badge
                variant="outline"
                className="text-[11px] font-medium px-2 py-0.5 border-primary/30 bg-primary/12 text-primary dark:border-primary/25 dark:bg-primary/15 dark:text-primary gap-1"
              >
                <Zap className="h-2.5 w-2.5" />
                {translations.match?.replace("{score}", String(matchScore)) ?? `${matchScore}%`}
              </Badge>
            )}
          </div>
        </div>

        {/* Right column: Salary + dates + bookmark */}
        <div className="hidden md:flex flex-col items-end gap-2.5 shrink-0 pt-0.5">
          <div className="flex items-center gap-1.5">
            {salary && (
              <span className="text-[13px] font-semibold text-foreground tabular-nums">{salary}</span>
            )}
            {isLoggedIn && (
              <BookmarkButton jobId={job.id} isSaved={isSaved ?? false} />
            )}
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground/70">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3 opacity-50" />
              {formatDate(job.created_at, locale)}
            </span>
            {job.application_deadline && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3 opacity-60" />
                {formatDate(job.application_deadline, locale)}
              </span>
            )}
          </div>
        </div>

        {/* Mobile: salary + date + bookmark */}
        <div className="flex md:hidden flex-col items-end gap-1.5 shrink-0 pt-0.5">
          <div className="flex items-center gap-1">
            {salary && (
              <span className="text-[11px] font-semibold text-foreground tabular-nums">{salary}</span>
            )}
            {isLoggedIn && (
              <BookmarkButton jobId={job.id} isSaved={isSaved ?? false} />
            )}
          </div>
          <span className="text-[11px] text-muted-foreground/60">
            {formatDate(job.created_at, locale)}
          </span>
        </div>
      </div>
    </Link>
  );
}
