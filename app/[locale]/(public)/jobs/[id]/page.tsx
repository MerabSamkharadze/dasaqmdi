export const revalidate = 60; // ISR: revalidate every 60 seconds

import { getJobById } from "@/lib/queries/jobs";
import { getProfile } from "@/lib/queries/profile";
import { createClient } from "@/lib/supabase/server";
import { calculateMatch } from "@/lib/matching";
import { getTranslations, getLocale } from "next-intl/server";
import { localized } from "@/lib/utils";
import { buildAlternates } from "@/lib/seo";
import { siteConfig } from "@/lib/config";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Globe,
  Clock,
  Tag,
  Zap,
  CheckCircle,
  Send,
  ExternalLink,
} from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import Image from "next/image";
import Link from "next/link";
import { ViewTracker } from "@/components/jobs/view-tracker";
import { BookmarkButton } from "@/components/jobs/bookmark-button";
import { ShareJobButton } from "@/components/jobs/share-job-button";
import { ApplyButton } from "@/components/jobs/apply-button";
import { getSavedJobIds } from "@/lib/queries/saved-jobs";
import type { Metadata } from "next";

type PageProps = {
  params: { id: string; locale: string };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const job = await getJobById(params.id);
  if (!job) return { title: "Job Not Found" };

  const title = localized(job, "title", params.locale);
  const companyName = localized(job.company, "name", params.locale);
  const rawDescription = localized(job, "description", params.locale) ?? "";
  const description =
    rawDescription.replace(/\s+/g, " ").trim().slice(0, 160) || undefined;

  const path = `/jobs/${params.id}`;
  const alternates = buildAlternates(path, params.locale);
  const fullTitle = `${title} — ${companyName}`;
  const ogImageUrl = `${siteConfig.url}/api/og/job/${params.id}?locale=${params.locale}`;

  return {
    title: fullTitle,
    description,
    alternates,
    openGraph: {
      title: fullTitle,
      description,
      type: "article",
      url: alternates.canonical as string,
      siteName: siteConfig.domain,
      locale: params.locale === "ka" ? "ka_GE" : "en_US",
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: fullTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImageUrl],
    },
  };
}

function formatDate(dateString: string, locale: string): string {
  return new Date(dateString).toLocaleDateString(
    locale === "ka" ? "ka-GE" : "en-US",
    { day: "numeric", month: "long", year: "numeric" }
  );
}

function formatSalary(min: number | null, max: number | null, currency: string): string | null {
  if (!min && !max) return null;
  if (min && max) return `${min.toLocaleString()} – ${max.toLocaleString()} ${currency}`;
  if (min) return `${min.toLocaleString()}+ ${currency}`;
  return `${max!.toLocaleString()} ${currency}`;
}

function DetailCell({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${highlight ? "bg-primary/12" : "bg-muted/50"}`}>
        <Icon className={`h-4 w-4 ${highlight ? "text-primary/70" : "text-muted-foreground/50"}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground/50 leading-normal">{label}</p>
        <p className={`text-sm font-medium leading-snug truncate ${highlight ? "text-primary" : "text-foreground"}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

export default async function JobDetailPage({ params }: PageProps) {
  const job = await getJobById(params.id);
  if (!job) notFound();

  const locale = await getLocale();
  const t = await getTranslations("jobs");

  const title = localized(job, "title", locale);
  const description = localized(job, "description", locale);
  const requirements = localized(job, "requirements", locale);
  const companyName = localized(job.company, "name", locale);
  const categoryName = locale === "ka" ? job.category.name_ka : job.category.name_en;
  const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency);

  const isExpired =
    job.status !== "active" ||
    (job.application_deadline && new Date(job.application_deadline) < new Date()) ||
    new Date(job.expires_at) < new Date();

  // Smart Matching for logged-in seekers
  let matchResult: { score: number; matchedSkills: string[] } | null = null;
  let hasApplied = false;
  let isSeeker = false;
  let isLoggedIn = false;
  let isJobSaved = false;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    isLoggedIn = true;
    const profile = await getProfile(user.id);
    isSeeker = profile?.role === "seeker";

    if (isSeeker) {
      // Check if already applied + saved status
      const [existing, savedIds] = await Promise.all([
        supabase
          .from("applications")
          .select("id")
          .eq("job_id", job.id)
          .eq("applicant_id", user.id)
          .single(),
        getSavedJobIds(user.id),
      ]);

      hasApplied = !!existing.data;
      isJobSaved = savedIds.has(job.id);

      // Smart matching
      if (job.tags?.length > 0 && profile?.skills?.length) {
        const result = calculateMatch(profile.skills, job.tags);
        if (result.score > 0) {
          matchResult = result;
        }
      }
    }
  }

  // O7: JSON-LD structured data for Google Jobs
  const jobTypeMap: Record<string, string> = {
    "full-time": "FULL_TIME",
    "part-time": "PART_TIME",
    contract: "CONTRACTOR",
    internship: "INTERN",
    remote: "FULL_TIME",
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title,
    description,
    datePosted: job.created_at,
    validThrough: job.application_deadline ?? job.expires_at,
    employmentType: jobTypeMap[job.job_type] ?? "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: companyName,
      ...(job.company.logo_url && { logo: job.company.logo_url }),
    },
    jobLocation: job.is_remote
      ? { "@type": "Place", address: { "@type": "PostalAddress", addressCountry: "GE" } }
      : job.city
        ? { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: job.city, addressCountry: "GE" } }
        : undefined,
    jobLocationType: job.is_remote ? "TELECOMMUTE" : undefined,
    ...(job.salary_min && {
      baseSalary: {
        "@type": "MonetaryAmount",
        currency: job.salary_currency,
        value: {
          "@type": "QuantitativeValue",
          minValue: job.salary_min,
          ...(job.salary_max && { maxValue: job.salary_max }),
          unitText: "MONTH",
        },
      },
    }),
  };

  return (
    <div className="flex flex-col gap-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ViewTracker jobId={job.id} jobTitle={title} category={categoryName} />

      {/* ── Hero Card: Logo + Title + Actions ── */}
      <div className="rounded-xl border border-border/60 bg-card p-5 sm:p-8 shadow-soft">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/8">
              {job.external_url ? (
                <LogoMark size={48} />
              ) : job.company.logo_url ? (
                <Image
                  src={job.company.logo_url}
                  alt={companyName}
                  width={40}
                  height={40}
                  sizes="40px"
                  className="h-10 w-10 rounded-lg object-contain"
                />
              ) : (
                <Building2 className="h-6 w-6 text-primary/50" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground leading-snug">
                {title}
              </h1>
              <Link
                href={`/companies/${job.company.slug}`}
                className="text-sm text-muted-foreground/70 hover:text-primary transition-colors duration-200 mt-0.5 inline-block"
              >
                {companyName}
              </Link>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            {matchResult && (
              <Badge
                variant="outline"
                className="text-sm font-medium gap-1.5 border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-400 px-3 py-1"
              >
                <Zap className="h-3.5 w-3.5" />
                {t("match", { score: matchResult.score })}
              </Badge>
            )}
            <ShareJobButton
              jobUrl={`${locale === "en" ? "/en" : ""}/jobs/${job.id}`}
              jobTitle={title}
              variant="button"
            />
            <BookmarkButton jobId={job.id} isSaved={isJobSaved} isLoggedIn={isLoggedIn} />
            {isExpired ? (
              <Badge variant="destructive" className="text-sm px-3 py-1">{t("jobClosed")}</Badge>
            ) : hasApplied ? (
              <Badge
                variant="outline"
                className="text-sm font-medium gap-1.5 border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400 px-3 py-1"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                {t("alreadyApplied")}
              </Badge>
            ) : !hasApplied ? (
              <ApplyButton jobId={job.id} label={t("applyNow")} isLoggedIn={isLoggedIn} externalUrl={job.external_url} externalLabel={job.external_source ? `${t("viewOriginal")} → ${job.external_source}` : undefined} />
            ) : null}
          </div>
        </div>

        {/* Mobile: Apply + actions row */}
        <div className="flex sm:hidden items-center gap-2 mt-4">
          {isExpired ? (
            <Badge variant="destructive" className="text-[12px] px-2.5 py-1">{t("jobClosed")}</Badge>
          ) : hasApplied ? (
            <Badge
              variant="outline"
              className="text-[12px] font-medium gap-1 border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400 px-2.5 py-1"
            >
              <CheckCircle className="h-3 w-3" />
              {t("alreadyApplied")}
            </Badge>
          ) : !hasApplied ? (
            <ApplyButton jobId={job.id} label={t("applyNow")} isLoggedIn={isLoggedIn} />
          ) : null}
          <ShareJobButton
            jobUrl={`${locale === "en" ? "/en" : ""}/jobs/${job.id}`}
            jobTitle={title}
          />
          <BookmarkButton jobId={job.id} isSaved={isJobSaved} isLoggedIn={isLoggedIn} />
          {matchResult && (
            <Badge variant="outline" className="text-[11px] font-medium gap-1 border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-400 px-2 py-0.5">
              <Zap className="h-3 w-3" />
              {matchResult.score}%
            </Badge>
          )}
        </div>

        {/* Key details grid inside hero */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-6 pt-6 border-t border-border/40">
          <DetailCell
            icon={Clock}
            label={t("filters.type")}
            value={t(`types.${job.job_type}`)}
          />
          {job.city && (
            <DetailCell icon={MapPin} label={t("filters.location")} value={job.city} />
          )}
          {job.is_remote && (
            <DetailCell icon={Globe} label={t("remote")} value={t("remote")} highlight />
          )}
          <DetailCell icon={Tag} label={t("filters.category")} value={categoryName} />
          {salary && (
            <DetailCell icon={DollarSign} label={t("salary")} value={salary} />
          )}
          {job.application_deadline && (
            <DetailCell
              icon={Calendar}
              label={t("deadline", { date: "" }).replace(": ", "")}
              value={formatDate(job.application_deadline, locale)}
            />
          )}
        </div>
      </div>

      {/* ── Match Highlights ── */}
      {matchResult && matchResult.matchedSkills.length > 0 && (
        <div className="rounded-xl border border-violet-200 dark:border-violet-500/20 bg-violet-50/50 dark:bg-violet-500/5 p-5">
          <p className="text-sm font-medium text-violet-700 dark:text-violet-400 mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            {t("matchingSkills")}
          </p>
          <div className="flex flex-wrap gap-2">
            {matchResult.matchedSkills.map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className="text-xs font-normal border-violet-300 text-violet-700 bg-violet-100/50 dark:border-violet-500/30 dark:text-violet-400 dark:bg-violet-500/10 px-2.5 py-0.5"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* ── Description ── */}
      <div className="rounded-xl border border-border/60 bg-card p-5 sm:p-8 shadow-soft">
        <h2 className="text-base font-semibold tracking-tight mb-5">
          {t("descriptionLabel")}
        </h2>
        <div className="whitespace-pre-wrap text-[15px] leading-7 text-foreground/90">
          {description}
        </div>
      </div>

      {/* ── Requirements ── */}
      {requirements && (
        <div className="rounded-xl border border-border/60 bg-card p-5 sm:p-8 shadow-soft">
          <h2 className="text-base font-semibold tracking-tight mb-5">
            {t("requirements")}
          </h2>
          <div className="whitespace-pre-wrap text-[15px] leading-7 text-foreground/90">
            {requirements}
          </div>
        </div>
      )}

      {/* ── Tags ── */}
      {job.tags && job.tags.length > 0 && (
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-soft">
          <h2 className="text-sm font-semibold tracking-tight mb-3">
            Tags
          </h2>
          <div className="flex flex-wrap gap-2">
            {job.tags.map((tag) => {
              const isMatched = matchResult?.matchedSkills.some(
                (s) => s.toLowerCase() === tag.toLowerCase()
              );
              return (
                <Badge
                  key={tag}
                  variant="secondary"
                  className={`font-normal text-xs px-2.5 py-0.5 ${
                    isMatched
                      ? "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400"
                      : ""
                  }`}
                >
                  {tag}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* ── External source notice ── */}
      {job.external_url && job.external_source && (
        <div className="rounded-xl border border-orange-200/60 dark:border-orange-500/20 bg-orange-50/30 dark:bg-orange-950/10 p-5 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{t("externalSource")}: </span>
            {job.external_source}
          </div>
          <a
            href={job.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1.5"
          >
            {t("viewOriginal")}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}

      {/* ── Telegram CTA ── */}
      <a
        href={siteConfig.social.telegramBot}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-card py-4 text-[13px] text-muted-foreground hover:text-primary hover:border-primary/30 transition-all duration-200"
      >
        <Send className="h-4 w-4" />
        {t("subscribeTelegram")}
      </a>

      {/* ── Footer meta ── */}
      <div className="flex items-center justify-between text-xs text-muted-foreground/50 px-1">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 opacity-50" />
          {formatDate(job.created_at, locale)}
        </span>
        <span>{t("views", { count: job.views_count })}</span>
      </div>
    </div>
  );
}
