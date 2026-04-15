import { getAllCompaniesAdmin } from "@/lib/queries/admin";
import { getTranslations, getLocale } from "next-intl/server";
import { localized } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CountBadge } from "@/components/shared/count-badge";
import { AdminVerifyButton } from "@/components/dashboard/admin-verify-button";
import { Building2, CheckCircle } from "lucide-react";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Manage Companies" };

export default async function AdminCompaniesPage() {
  const t = await getTranslations("admin");
  const locale = await getLocale();
  const companies = await getAllCompaniesAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-lg font-semibold tracking-tight">
          {t("manageCompanies")}
        </h1>
        <CountBadge>{companies.length}</CountBadge>
      </div>

      <div className="flex flex-col gap-2">
        {companies.map((company, i) => (
          <div
            key={company.id}
            className="flex items-center gap-4 rounded-xl border border-border/60 bg-card px-5 py-3.5 shadow-soft animate-fade-in"
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/8">
              {company.logo_url ? (
                <Image
                  src={company.logo_url}
                  alt=""
                  width={24}
                  height={24}
                  className="h-6 w-6 rounded-md object-contain"
                />
              ) : (
                <Building2 className="h-3.5 w-3.5 text-muted-foreground/50" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium truncate">{localized(company, "name", locale)}</p>
              {company.city && (
                <p className="text-[11px] text-muted-foreground/60">{company.city}</p>
              )}
            </div>

            {company.is_verified ? (
              <Badge variant="secondary" className="gap-1 text-[11px] bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                <CheckCircle className="h-3 w-3" />
                Verified
              </Badge>
            ) : (
              <AdminVerifyButton companyId={company.id} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
