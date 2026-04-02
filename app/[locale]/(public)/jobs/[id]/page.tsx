import { getJobById } from "@/lib/queries/jobs";
import { getProfile } from "@/lib/queries/profile";
import { createClient } from "@/lib/supabase/server";
import { calculateMatch } from "@/lib/matching";
import { getTranslations, getLocale } from "next-intl/server";
import { localized } from "@/lib/utils";
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
} from "lucide-react";
import Link from "next/link";
import { ViewTracker } from "@/components/jobs/view-tracker";
import type { Metadata } from "next";

type PageProps = {
  params: { id: string; locale: string };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const job = await getJobById(params.id);
  if (!job) return { title: "Job Not Found" };

  return {
    title: `${job.title} — ${job.company.name} | dasakmdi.com`,
    description: job.description?.slice(0, 160),
    openGraph: {
      title: job.title,
      description: job.description?.slice(0, 160),
      type: "article",
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

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const profile = await getProfile(user.id);
    isSeeker = profile?.role === "seeker";

    if (isSeeker) {
      // Check if already applied
      const { data: existing } = await supabase
        .from("applications")
        .select("id")
        .eq("job_id", job.id)
        .eq("applicant_id", user.id)
        .single();

      hasApplied = !!existing;

      // Smart matching
      if (job.tags?.length > 0 && profile?.skills?.length) {
        const result = calculateMatch(profile.skills, job.tags);
        if (result.score > 0) {
          matchResult = result;
        }
      }
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <ViewTracker jobId={job.id} />
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-muted/60">
            {job.company.logo_url ? (
              <img
                src={job.company.logo_url}
                alt={companyName}
                className="h-10 w-10 rounded-lg object-contain"
              />
            ) : (
              <Building2 className="h-6 w-6 text-muted-foreground/50" />
            )}
          </div>

          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground leading-snug">
              {title}
            </h1>
            <Link
              href={`/companies/${job.company.slug}`}
              className="text-[13px] text-muted-foreground/70 hover:text-primary transition-colors duration-200"
            >
              {companyName}
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {matchResult && (
            <Badge
              variant="outline"
              className="text-[12px] font-medium gap-1.5 border-primary/30 bg-primary/5 text-primary dark:border-primary/25 dark:bg-primary/10 dark:text-primary"
            >
              <Zap className="h-3 w-3" />
              {t("match", { score: matchResult.score })}
            </Badge>
          )}
          {isExpired ? (
            <Badge variant="destructive" className="text-[12px]">{t("jobClosed")}</Badge>
          ) : hasApplied ? (
            <Badge
              variant="outline"
              className="text-[12px] font-medium gap-1.5 border-primary/30 bg-primary/5 text-primary dark:border-primary/25 dark:bg-primary/10 dark:text-primary"
            >
              <CheckCircle className="h-3 w-3" />
              {t("alreadyApplied")}
            </Badge>
          ) : isSeeker ? (
            <Button asChild size="lg" className="rounded-xl">
              <Link href={`/jobs/${job.id}/apply`}>{t("applyNow")}</Link>
            </Button>
          ) : null}
        </div>
      </div>

      {/* Match highlights */}
      {matchResult && matchResult.matchedSkills.length > 0 && (
        <div className="rounded-xl border border-primary/20 dark:border-primary/15 bg-primary/[0.03] dark:bg-primary/[0.06] p-4 sm:p-5">
          <p className="text-[13px] font-medium text-primary dark:text-primary mb-2.5 flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5" />
            {t("matchingSkills")}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {matchResult.matchedSkills.map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className="text-[11px] font-normal border-primary/30 text-primary dark:border-primary/25 dark:text-primary bg-primary/5 dark:bg-primary/10"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Meta row */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" className="gap-1.5 text-[12px] font-normal">
          <Clock className="h-3 w-3 opacity-60" />
          {t(`types.${job.job_type}`)}
        </Badge>

        {job.city && (
          <Badge variant="outline" className="gap-1.5 text-[12px] font-normal">
            <MapPin className="h-3 w-3 opacity-60" />
            {job.city}
          </Badge>
        )}

        {job.is_remote && (
          <Badge variant="outline" className="gap-1.5 text-[12px] font-normal border-primary/20 text-primary/80">
            <Globe className="h-3 w-3" />
            {t("remote")}
          </Badge>
        )}

        <Badge variant="outline" className="gap-1.5 text-[12px] font-normal">
          <Tag className="h-3 w-3 opacity-60" />
          {categoryName}
        </Badge>

        {salary && (
          <Badge variant="outline" className="gap-1.5 text-[12px] font-normal">
            <DollarSign className="h-3 w-3 opacity-60" />
            {salary}
          </Badge>
        )}

        {job.application_deadline && (
          <Badge variant="outline" className="gap-1.5 text-[12px] font-normal">
            <Calendar className="h-3 w-3 opacity-60" />
            {t("deadline", { date: formatDate(job.application_deadline, locale) })}
          </Badge>
        )}
      </div>

      {/* Description */}
      <div className="rounded-xl border border-border/30 bg-card p-5 sm:p-8 shadow-sm">
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {description}
        </div>
      </div>

      {/* Requirements */}
      {requirements && (
        <div className="rounded-xl border border-border/30 bg-card p-5 sm:p-8 shadow-sm">
          <h2 className="text-sm font-semibold tracking-tight mb-4">{t("requirements")}</h2>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {requirements}
          </div>
        </div>
      )}

      {/* Tags */}
      {job.tags && job.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {job.tags.map((tag) => {
            const isMatched = matchResult?.matchedSkills.some(
              (s) => s.toLowerCase() === tag.toLowerCase()
            );
            return (
              <Badge
                key={tag}
                variant="secondary"
                className={`font-normal text-[11px] ${
                  isMatched
                    ? "bg-primary/10 text-primary dark:bg-primary/15"
                    : ""
                }`}
              >
                {tag}
              </Badge>
            );
          })}
        </div>
      )}

      {/* Footer meta */}
      <div className="text-[12px] text-muted-foreground/60 flex items-center gap-4">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3 opacity-50" />
          {formatDate(job.created_at, locale)}
        </span>
        <span>{t("views", { count: job.views_count })}</span>
      </div>
    </div>
  );
}
