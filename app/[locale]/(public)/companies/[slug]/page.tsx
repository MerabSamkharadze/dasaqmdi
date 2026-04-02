import { getCompanyBySlug } from "@/lib/queries/companies";
import { getTranslations, getLocale } from "next-intl/server";
import { localized } from "@/lib/utils";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  MapPin,
  Globe,
  Users,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import type { Metadata } from "next";

type PageProps = {
  params: { slug: string; locale: string };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const company = await getCompanyBySlug(params.slug);
  if (!company) return { title: "Company Not Found" };

  return {
    title: `${company.name} — dasakmdi.com`,
    description: company.description?.slice(0, 160),
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

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-muted/60">
          {company.logo_url ? (
            <img
              src={company.logo_url}
              alt={name}
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
              <Badge variant="secondary" className="gap-1 text-[12px] bg-primary/10 text-primary dark:bg-primary/15">
                <CheckCircle className="h-3 w-3" />
                {t("verified")}
              </Badge>
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
                href={company.website}
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
        <div className="rounded-xl border border-border/30 bg-card p-5 sm:p-8 shadow-sm">
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {description}
          </div>
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
