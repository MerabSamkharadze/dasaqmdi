import { getJobById } from "@/lib/queries/jobs";
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
} from "lucide-react";
import Link from "next/link";
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

  return (
    <div className="flex flex-col gap-8">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          {/* Company logo */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted">
            {job.company.logo_url ? (
              <img
                src={job.company.logo_url}
                alt={companyName}
                className="h-10 w-10 rounded-lg object-contain"
              />
            ) : (
              <Building2 className="h-6 w-6 text-muted-foreground" />
            )}
          </div>

          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            <Link
              href={`/companies/${job.company.slug}`}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {companyName}
            </Link>
          </div>
        </div>

        <div className="flex gap-2">
          {isExpired ? (
            <Badge variant="destructive">{t("jobClosed")}</Badge>
          ) : (
            <Button asChild size="lg" className="rounded-lg">
              <Link href={`/jobs/${job.id}/apply`}>{t("applyNow")}</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap gap-3">
        <Badge variant="secondary" className="gap-1.5 font-normal">
          <Clock className="h-3 w-3" />
          {t(`types.${job.job_type}`)}
        </Badge>

        {job.city && (
          <Badge variant="outline" className="gap-1.5 font-normal">
            <MapPin className="h-3 w-3" />
            {job.city}
          </Badge>
        )}

        {job.is_remote && (
          <Badge variant="outline" className="gap-1.5 font-normal">
            <Globe className="h-3 w-3" />
            {t("remote")}
          </Badge>
        )}

        <Badge variant="outline" className="gap-1.5 font-normal">
          <Tag className="h-3 w-3" />
          {categoryName}
        </Badge>

        {salary && (
          <Badge variant="outline" className="gap-1.5 font-normal">
            <DollarSign className="h-3 w-3" />
            {salary}
          </Badge>
        )}

        {job.application_deadline && (
          <Badge variant="outline" className="gap-1.5 font-normal">
            <Calendar className="h-3 w-3" />
            {t("deadline", { date: formatDate(job.application_deadline, locale) })}
          </Badge>
        )}
      </div>

      {/* Description */}
      <div className="rounded-xl border border-border/60 bg-card p-5 sm:p-8 shadow-sm">
        <div className="prose prose-sm prose-slate dark:prose-invert max-w-none">
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {description}
          </div>
        </div>
      </div>

      {/* Requirements */}
      {requirements && (
        <div className="rounded-xl border border-border/60 bg-card p-5 sm:p-8 shadow-sm">
          <h2 className="text-base font-semibold mb-4">Requirements</h2>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {requirements}
          </div>
        </div>
      )}

      {/* Tags */}
      {job.tags && job.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {job.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="font-normal text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Footer meta */}
      <div className="text-xs text-muted-foreground flex items-center gap-4">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatDate(job.created_at, locale)}
        </span>
        <span>{t("views", { count: job.views_count })}</span>
      </div>
    </div>
  );
}
