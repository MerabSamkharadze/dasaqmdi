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
      className="group flex items-center gap-4 p-4 border-b border-border hover:bg-accent/50 transition-colors"
    >
      {/* Company Logo */}
      <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border bg-muted">
        {job.company.logo_url ? (
          <img
            src={job.company.logo_url}
            alt={companyName}
            className="h-10 w-10 rounded object-contain"
          />
        ) : (
          <Building2 className="h-5 w-5 text-muted-foreground" />
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
            {title}
          </h3>
          <Badge variant="secondary" className="text-xs shrink-0">
            {translations.types[job.job_type] ?? job.job_type}
          </Badge>
          {job.is_remote && (
            <Badge variant="outline" className="text-xs shrink-0">
              {translations.remote}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1 truncate">
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            {companyName}
          </span>
          {job.city && (
            <span className="hidden sm:flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {job.city}
            </span>
          )}
        </div>
      </div>

      {/* Salary + dates (right side) */}
      <div className="hidden md:flex flex-col items-end gap-1 shrink-0 text-sm">
        {salary && (
          <span className="font-semibold text-foreground">{salary}</span>
        )}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
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

      {/* Mobile salary + date */}
      <div className="flex md:hidden flex-col items-end gap-1 shrink-0 text-sm">
        {salary && (
          <span className="font-semibold text-foreground text-xs">{salary}</span>
        )}
        <span className="text-xs text-muted-foreground">
          {formatDate(job.created_at, locale)}
        </span>
      </div>
    </Link>
  );
}
