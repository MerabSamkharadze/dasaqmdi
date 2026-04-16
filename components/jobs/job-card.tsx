"use client";

import { localized } from "@/lib/utils";
import type { JobWithCompany } from "@/lib/types";
import { Building2, Calendar, Clock, MapPin, Star, Zap, Wifi } from "lucide-react";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { BookmarkButton } from "@/components/jobs/bookmark-button";
import { ShareJobButton } from "@/components/jobs/share-job-button";
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

const MONTHS_KA = ["იან", "თებ", "მარ", "აპრ", "მაი", "ივნ", "ივლ", "აგვ", "სექ", "ოქტ", "ნოე", "დეკ"];
const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDate(dateString: string, locale: string): string {
  const d = new Date(dateString);
  const months = locale === "ka" ? MONTHS_KA : MONTHS_EN;
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

function fmtNum(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

function formatSalary(
  min: number | null,
  max: number | null,
  currency: string,
): string | null {
  if (!min && !max) return null;
  if (min && max) return `${fmtNum(min)} – ${fmtNum(max)} ${currency}`;
  if (min) return `${fmtNum(min)}+ ${currency}`;
  return `${fmtNum(max!)} ${currency}`;
}

/* Pastel badge palette — each type gets a distinct soft color */
const TYPE_COLORS: Record<string, string> = {
  "full-time":  "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  "part-time":  "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  contract:     "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
  internship:   "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  remote:       "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400",
};

export function JobCard({ job, locale, matchScore, isSaved, isLoggedIn, translations }: JobCardProps) {
  const title = localized(job, "title", locale);
  const companyName = localized(job.company, "name", locale);
  const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency);
  const router = useRouter();

  const typeColor = TYPE_COLORS[job.job_type] ?? "bg-secondary text-secondary-foreground";

  return (
    <div
      onClick={() => router.push(`/jobs/${job.id}`)}
      className="group relative block cursor-pointer rounded-xl border border-muted-foreground/10 bg-card p-4 sm:p-5 shadow-soft transition-all duration-200 hover:shadow-gold-glow hover:border-primary/20 hover:-translate-y-1"
    >
      <div className="flex items-start gap-4">
        {/* Company Logo */}
        <Link
          href={`/companies/${job.company.slug}`}
          onClick={(e) => e.stopPropagation()}
          className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted/50 ring-1 ring-border/30 hover:bg-muted transition-colors duration-150"
        >
          {job.company.logo_url ? (
            <Image
              src={job.company.logo_url}
              alt={companyName}
              width={36}
              height={36}
              sizes="36px"
              className="h-9 w-9 rounded-lg object-contain"
            />
          ) : (
            <Building2 className="h-5 w-5 text-muted-foreground/40" />
          )}
        </Link>

        {/* Middle: Title + Meta + Badges */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Title row */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-1">
              {title}
            </h3>

            {/* Desktop bookmark */}
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
            <div className="hidden md:flex items-center shrink-0 -mt-0.5 -mr-1" onClick={(e) => e.stopPropagation()}>
              <ShareJobButton
                jobUrl={`${locale === "en" ? "/en" : ""}/jobs/${job.id}`}
                jobTitle={title}
              />
              <BookmarkButton jobId={job.id} isSaved={isSaved ?? false} isLoggedIn={isLoggedIn} />
            </div>
          </div>

          {/* Company + Location + Date meta row */}
          <div className="flex items-center gap-x-3 gap-y-1 flex-wrap text-[13px] text-muted-foreground">
            <Link
              href={`/companies/${job.company.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 truncate hover:text-primary transition-colors duration-150"
            >
              {companyName}
              {job.company.is_verified && <VerifiedBadge />}
            </Link>
            {job.city && (
              <span className="inline-flex items-center gap-1 text-muted-foreground/60">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                {job.city}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-muted-foreground/50">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
              {formatDate(job.created_at, locale)}
            </span>
            {job.application_deadline && (
              <span className="hidden sm:inline-flex items-center gap-1 text-muted-foreground/50">
                <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                {formatDate(job.application_deadline, locale)}
              </span>
            )}
          </div>

          {/* Badges + Salary row */}
          <div className="flex items-center justify-between gap-3 pt-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              {job.is_featured && (
                <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                  <Star className="h-3 w-3" />
                  {translations.featured ?? "Featured"}
                </span>
              )}
              <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${typeColor}`}>
                {translations.types[job.job_type] ?? job.job_type}
              </span>
              {job.is_remote && (
                <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400">
                  <Wifi className="h-3 w-3" />
                  {translations.remote}
                </span>
              )}
              {matchScore != null && matchScore > 0 && (
                <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400">
                  <Zap className="h-3 w-3" />
                  {translations.match?.replace("{score}", String(matchScore)) ?? `${matchScore}%`}
                </span>
              )}
            </div>

            {/* Salary — desktop */}
            {salary && (
              <span className="hidden sm:block text-[13px] font-semibold text-success tabular-nums whitespace-nowrap">
                {salary}
              </span>
            )}
          </div>

          {/* Mobile bottom row: salary + share + bookmark */}
          <div className="flex sm:hidden items-center justify-between pt-1" onClick={(e) => e.stopPropagation()}>
            {salary ? (
              <span className="text-[12px] font-semibold text-success tabular-nums">
                {salary}
              </span>
            ) : (
              <span />
            )}
            <div className="flex items-center">
              <ShareJobButton
                jobUrl={`${locale === "en" ? "/en" : ""}/jobs/${job.id}`}
                jobTitle={title}
              />
              <BookmarkButton jobId={job.id} isSaved={isSaved ?? false} isLoggedIn={isLoggedIn} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
