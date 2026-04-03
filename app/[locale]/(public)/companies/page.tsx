import { getAllCompanies } from "@/lib/queries/companies";
import { getTranslations, getLocale } from "next-intl/server";
import { localized } from "@/lib/utils";
import { Building2, MapPin, Users, CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 3600; // O4: Revalidate every hour

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
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/30 py-24">
          <Building2 className="h-7 w-7 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground/60">No companies yet</p>
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
        <span className="text-[12px] text-muted-foreground/70 tabular-nums">
          {companies.length}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map((company, i) => {
          const name = localized(company, "name", locale);
          const desc = localized(company, "description", locale);

          return (
            <Link
              key={company.id}
              href={`/companies/${company.slug}`}
              className="group rounded-xl border border-border/60 bg-card p-5 shadow-soft transition-all duration-200 hover:shadow-soft-md hover:border-border hover:-translate-y-0.5 animate-fade-in"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/8">
                  {company.logo_url ? (
                    <Image
                      src={company.logo_url}
                      alt={name}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-md object-contain"
                    />
                  ) : (
                    <Building2 className="h-4 w-4 text-muted-foreground/50" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[15px] font-semibold leading-snug tracking-tight truncate group-hover:text-primary transition-colors duration-200">
                      {name}
                    </h2>
                    {company.is_verified && (
                      <CheckCircle className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                    )}
                  </div>

                  {desc && (
                    <p className="text-[13px] text-muted-foreground/70 line-clamp-2 mt-1 leading-relaxed">
                      {desc}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-2.5 text-[12px] text-muted-foreground/60">
                    {company.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 opacity-50" />
                        {company.city}
                      </span>
                    )}
                    {company.employee_count && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3 opacity-50" />
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
