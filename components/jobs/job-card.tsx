"use client";

import { Badge } from "@/components/ui/badge";
import { localized } from "@/lib/utils";
import type { JobWithCompany } from "@/lib/types";
import { BadgeCheck, Building2, Calendar, Clock, MapPin, Star, Zap } from "lucide-react";
import { BookmarkButton } from "@/components/jobs/bookmark-button";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
    featured?: string;
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
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/jobs/${job.id}`)}
      className="group relative block cursor-pointer rounded-xl border border-border/60 bg-card px-5 py-5 sm:px-6 sm:py-5 shadow-soft transition-all duration-200 hover:shadow-soft-md hover:border-border/80 hover:-translate-y-0.5 before:absolute before:left-0 before:top-3 before:bottom-3 before:w-[3px] before:rounded-full before:bg-primary/0 before:transition-all before:duration-200 hover:before:bg-primary/60 before:origin-center before:scale-y-0 hover:before:scale-y-100"
    >
      <div className="flex items-start gap-4 sm:gap-5">
        {/* Company Logo */}
        <Link
          href={`/companies/${job.company.slug}`}
          onClick={(e) => e.stopPropagation()}
          className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/60 hover:bg-muted transition-colors duration-200"
        >
          {job.company.logo_url ? (
            <Image
              src={job.company.logo_url}
              alt={companyName}
              width={32}
              height={32}
              className="h-8 w-8 rounded-md object-contain"
            />
          ) : (
            <Building2 className="h-4 w-4 text-primary/60" />
          )}
        </Link>

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Title */}
          <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-foreground group-hover:text-primary transition-colors duration-200 truncate">
            {title}
          </h3>

          {/* Company + location */}
          <div className="flex items-center gap-3 text-[13px] text-muted-foreground leading-normal">
            <Link
              href={`/companies/${job.company.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 truncate hover:text-primary transition-colors duration-200"
            >
              <Building2 className="h-3 w-3 shrink-0 opacity-50" />
              {companyName}
              {job.company.is_verified && (
                <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
              )}
            </Link>
            {job.city && (
              <span className="hidden sm:flex items-center gap-1.5">
                <MapPin className="h-3 w-3 shrink-0 opacity-50" />
                {job.city}
              </span>
            )}
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap pt-0.5">
            {job.is_featured && (
              <Badge variant="outline" className="text-[11px] font-normal px-2 py-0.5 border-amber-300/60 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400 gap-1">
                <Star className="h-2.5 w-2.5" />
                {translations.featured ?? "Featured"}
              </Badge>
            )}
            <Badge variant="secondary" className="text-[11px] font-normal px-2 py-0.5">
              {translations.types[job.job_type] ?? job.job_type}
            </Badge>
            {job.is_remote && (
              <Badge variant="outline" className="text-[11px] font-normal px-2 py-0.5 border-teal-300/60 bg-teal-50 text-teal-700 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-400">
                {translations.remote}
              </Badge>
            )}
            {matchScore != null && matchScore > 0 && (
              <Badge
                variant="outline"
                className="text-[11px] font-medium px-2 py-0.5 border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-400 gap-1"
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
    </div>
  );
}
