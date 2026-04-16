export const revalidate = 3600; // O4: Revalidate every hour

import { getCompanyBySlug } from "@/lib/queries/companies";
import { getTranslations, getLocale } from "next-intl/server";
import { localized } from "@/lib/utils";
import { buildAlternates } from "@/lib/seo";
import { siteConfig } from "@/lib/config";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  MapPin,
  Globe,
  Users,
  ExternalLink,
  Code2,
  Heart,
  Sparkles,
} from "lucide-react";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import Image from "next/image";
import type { Metadata } from "next";

type PageProps = {
  params: { slug: string; locale: string };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const company = await getCompanyBySlug(params.slug);
  if (!company) return { title: "Company Not Found" };

  const name = localized(company, "name", params.locale);
  const rawDescription = localized(company, "description", params.locale) ?? "";
  const description =
    rawDescription.replace(/\s+/g, " ").trim().slice(0, 160) || undefined;
  const alternates = buildAlternates(`/companies/${params.slug}`, params.locale);
  const isKa = params.locale === "ka";

  return {
    title: name,
    description,
    alternates,
    openGraph: {
      title: name,
      description,
      type: "profile",
      url: alternates.canonical as string,
      siteName: siteConfig.domain,
      locale: isKa ? "ka_GE" : "en_US",
      ...(company.logo_url && { images: [company.logo_url] }),
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description,
    },
  };
}

export default async function CompanyProfilePage({ params }: PageProps) {
  const company = await getCompanyBySlug(params.slug);
  if (!company) notFound();

  const locale = await getLocale();
  const t = await getTranslations("company");

  const name = localized(company, "name", locale);
  const description = localized(company, "description", locale);
  const address = localized(company, "address", locale);
  const whyWorkHere = localized(company, "why_work_here", locale);
  const benefits = locale === "ka"
    ? (company.benefits_ka?.length ? company.benefits_ka : company.benefits)
    : (company.benefits?.length ? company.benefits : company.benefits_ka);
  const hasTechStack = company.tech_stack?.length > 0;
  const hasBenefits = benefits?.length > 0;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/8">
          {company.logo_url ? (
            <Image
              src={company.logo_url}
              alt={name}
              width={40}
              height={40}
                    sizes="40px"
              className="h-10 w-10 rounded-lg object-contain"
            />
          ) : (
            <Building2 className="h-6 w-6 text-muted-foreground/50" />
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">{name}</h1>
            {company.is_verified && (
              <>
                <Badge variant="secondary" className="hidden sm:inline-flex gap-1.5 text-[12px] bg-primary/10 text-primary border-primary/20">
                  <VerifiedBadge />
                  {t("verified")}
                </Badge>
                <span className="sm:hidden">
                  <VerifiedBadge size="md" />
                </span>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-2 text-[13px] text-muted-foreground/70">
            {company.city && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 opacity-50" />
                {company.city}
              </span>
            )}
            {company.employee_count && (
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 opacity-50" />
                {company.employee_count}
              </span>
            )}
            {company.website && (
              <a
                href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary/80 hover:text-primary transition-colors duration-200"
              >
                <Globe className="h-3.5 w-3.5" />
                Website
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {description && (
        <div className="rounded-xl border border-border/60 bg-card p-5 sm:p-8 shadow-soft">
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {description}
          </div>
        </div>
      )}

      {/* Culture section */}
      {(hasTechStack || hasBenefits || whyWorkHere) && (
        <div className="flex flex-col gap-6">
          {/* Tech Stack */}
          {hasTechStack && (
            <div className="rounded-xl border border-border/60 bg-card p-5 sm:p-6 shadow-soft">
              <div className="flex items-center gap-2 mb-3">
                <Code2 className="h-4 w-4 text-primary/60" />
                <h2 className="text-[15px] font-semibold tracking-tight">{t("techStack")}</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {company.tech_stack.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center rounded-lg bg-primary/8 px-2.5 py-1 text-xs font-medium text-primary dark:bg-primary/15"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Benefits */}
          {hasBenefits && (
            <div className="rounded-xl border border-border/60 bg-card p-5 sm:p-6 shadow-soft">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="h-4 w-4 text-primary/60" />
                <h2 className="text-[15px] font-semibold tracking-tight">{t("benefits")}</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {benefits.map((benefit) => (
                  <span
                    key={benefit}
                    className="inline-flex items-center rounded-lg bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Why work here */}
          {whyWorkHere && (
            <div className="rounded-xl border border-border/60 bg-card p-5 sm:p-8 shadow-soft">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-primary/60" />
                <h2 className="text-[15px] font-semibold tracking-tight">{t("whyWorkHere")}</h2>
              </div>
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {whyWorkHere}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Address */}
      {address && (
        <div className="text-[13px] text-muted-foreground/60 flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 opacity-50" />
          {address}
        </div>
      )}
    </div>
  );
}
