import { Badge } from "@/components/ui/badge";
import { localized } from "@/lib/utils";
import type { JobWithCompany } from "@/lib/types";
import { Building2, Calendar, Clock, MapPin } from "lucide-react";
import Link from "next/link";

type JobCardProps = {
  job: JobWithCompany;
  locale: string;
  translations: {
    remote: string;
    types: Record<string, string>;
    deadline: string;
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

export function JobCard({ job, locale, translations }: JobCardProps) {
  const title = localized(job, "title", locale);
  const companyName = localized(job.company, "name", locale);
  const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency);

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group block rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-border"
    >
      <div className="flex items-start gap-4">
        {/* Company Logo */}
        <div className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/50">
          {job.company.logo_url ? (
            <img
              src={job.company.logo_url}
              alt={companyName}
              className="h-9 w-9 rounded-md object-contain"
            />
          ) : (
            <Building2 className="h-4.5 w-4.5 text-muted-foreground/70" />
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Title row */}
          <h3 className="text-[15px] font-semibold leading-snug text-foreground group-hover:text-primary transition-colors duration-200 truncate">
            {title}
          </h3>

          {/* Company + location */}
          <div className="mt-1.5 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5 truncate">
              <Building2 className="h-3.5 w-3.5 shrink-0 opacity-60" />
              {companyName}
            </span>
            {job.city && (
              <span className="hidden sm:flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0 opacity-60" />
                {job.city}
              </span>
            )}
          </div>

          {/* Badges */}
          <div className="mt-2.5 flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="rounded-md text-xs font-normal px-2.5 py-0.5">
              {translations.types[job.job_type] ?? job.job_type}
            </Badge>
            {job.is_remote && (
              <Badge variant="outline" className="rounded-md text-xs font-normal px-2.5 py-0.5 border-primary/30 text-primary">
                {translations.remote}
              </Badge>
            )}
          </div>
        </div>

        {/* Right column: Salary + dates */}
        <div className="hidden md:flex flex-col items-end gap-2 shrink-0">
          {salary && (
            <span className="text-sm font-semibold text-foreground">{salary}</span>
          )}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3 opacity-60" />
              {formatDate(job.created_at, locale)}
            </span>
            {job.application_deadline && (
              <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                <Clock className="h-3 w-3" />
                {formatDate(job.application_deadline, locale)}
              </span>
            )}
          </div>
        </div>

        {/* Mobile: salary + date */}
        <div className="flex md:hidden flex-col items-end gap-1.5 shrink-0">
          {salary && (
            <span className="text-xs font-semibold text-foreground">{salary}</span>
          )}
          <span className="text-xs text-muted-foreground">
            {formatDate(job.created_at, locale)}
          </span>
        </div>
      </div>
    </Link>
  );
}
