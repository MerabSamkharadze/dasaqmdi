import { getAllCompanies } from "@/lib/queries/companies";
import { getTranslations, getLocale } from "next-intl/server";
import { localized } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Users, CheckCircle } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Companies — dasakmdi.com",
  description: "Browse companies hiring in Georgia",
};

export default async function CompaniesPage() {
  const locale = await getLocale();
  const t = await getTranslations("nav");
  const companies = await getAllCompanies();

  if (companies.length === 0) {
    return (
      <div>
        <h1 className="text-lg font-semibold tracking-tight mb-8">
          {t("companies")}
        </h1>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 py-20">
          <Building2 className="h-8 w-8 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">No companies yet</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-8">
        <h1 className="text-lg font-semibold tracking-tight">
          {t("companies")}
        </h1>
        <span className="text-xs text-muted-foreground/60 tabular-nums">
          {companies.length}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map((company, i) => {
          const name = localized(company, "name", locale);
          const desc = localized(company, "description", locale);

          return (
            <Link
              key={company.id}
              href={`/companies/${company.slug}`}
              className="group rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-border"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-muted">
                  {company.logo_url ? (
                    <img
                      src={company.logo_url}
                      alt={name}
                      className="h-8 w-8 rounded object-contain"
                    />
                  ) : (
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[15px] font-semibold leading-snug truncate group-hover:text-primary transition-colors">
                      {name}
                    </h2>
                    {company.is_verified && (
                      <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                    )}
                  </div>

                  {desc && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {desc}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    {company.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 opacity-60" />
                        {company.city}
                      </span>
                    )}
                    {company.employee_count && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3 opacity-60" />
                        {company.employee_count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
