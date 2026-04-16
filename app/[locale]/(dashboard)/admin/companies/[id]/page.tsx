import { getAdminCompanyDetail } from "@/lib/queries/admin";
import { getTranslations, getLocale } from "next-intl/server";
import { localized } from "@/lib/utils";
import { notFound } from "next/navigation";
import { AdminVerifyButton } from "@/components/dashboard/admin-verify-button";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  MapPin,
  Globe,
  Users,
  Briefcase,
  FileText,
  CreditCard,
  ArrowLeft,
  User,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Company Detail" };

function formatDate(d: string | null, locale: string): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(
    locale === "ka" ? "ka-GE" : "en-US",
    { day: "numeric", month: "short", year: "numeric" },
  );
}

export default async function AdminCompanyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const t = await getTranslations("admin");
  const locale = await getLocale();
  const data = await getAdminCompanyDetail(params.id);

  if (!data) notFound();

  const { company, owner, activeJobsCount, totalJobsCount, totalApplicationsCount, subscription } = data;
  const name = localized(company, "name", locale);
  const description = localized(company, "description", locale);

  const planColors: Record<string, string> = {
    free: "text-[11px]",
    pro: "text-[11px] border-primary/30 text-primary",
    verified: "text-[11px] border-emerald-300/50 text-emerald-600 dark:border-emerald-500/30 dark:text-emerald-400",
  };

  const statusColors: Record<string, string> = {
    active: "text-[11px] bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
    cancelled: "text-[11px] bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
    past_due: "text-[11px] bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    expired: "text-[11px] bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Back link */}
      <Link
        href="/admin/companies"
        className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t("manageCompanies")}
      </Link>

      {/* Company card */}
      <div className="rounded-xl border border-border/60 bg-card p-6 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-5">
          {/* Logo */}
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary/8">
            {company.logo_url ? (
              <Image
                src={company.logo_url}
                alt={name}
                width={48}
                height={48}
                    sizes="48px"
                className="h-12 w-12 rounded-lg object-contain"
              />
            ) : (
              <Building2 className="h-7 w-7 text-muted-foreground/40" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-semibold tracking-tight">{name}</h1>
              {company.is_verified && <VerifiedBadge size="md" />}
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-2 text-[13px] text-muted-foreground">
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
              {company.website && (
                <a
                  href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary/80 hover:text-primary transition-colors"
                >
                  <Globe className="h-3 w-3" />
                  Website
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}
            </div>

            {description && (
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {description}
              </p>
            )}
          </div>

          {/* Verify */}
          <div className="shrink-0">
            {!company.is_verified && (
              <AdminVerifyButton companyId={company.id} />
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-soft text-center">
          <Briefcase className="h-5 w-5 text-emerald-500/60 mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground tabular-nums">{activeJobsCount}</p>
          <p className="text-[11px] text-muted-foreground mt-1">{t("active")}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-soft text-center">
          <Briefcase className="h-5 w-5 text-primary/50 mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground tabular-nums">{totalJobsCount}</p>
          <p className="text-[11px] text-muted-foreground mt-1">{t("totalJobs")}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-soft text-center">
          <FileText className="h-5 w-5 text-blue-500/50 mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground tabular-nums">{totalApplicationsCount}</p>
          <p className="text-[11px] text-muted-foreground mt-1">{t("applicationsTrend")}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-soft text-center">
          <CreditCard className="h-5 w-5 text-primary/50 mx-auto mb-2" />
          {subscription ? (
            <>
              <Badge variant="outline" className={planColors[subscription.plan] ?? "text-[11px]"}>
                {subscription.plan.toUpperCase()}
              </Badge>
              <Badge className={`mt-1 ${statusColors[subscription.status] ?? "text-[11px]"}`}>
                {subscription.status}
              </Badge>
              <p className="text-[10px] text-muted-foreground/50 mt-1">
                {formatDate(subscription.current_period_end, locale)}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Free</p>
          )}
        </div>
      </div>

      {/* Owner */}
      {owner && (
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-soft">
          <h2 className="text-[15px] font-semibold tracking-tight mb-3">
            {t("owner")}
          </h2>
          <Link
            href={`/admin/users/${owner.id}`}
            className="inline-flex items-center gap-3 hover:text-primary transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/60">
              <User className="h-3.5 w-3.5 text-muted-foreground/50" />
            </div>
            <div>
              <p className="text-[13px] font-medium">
                {localized(owner, "full_name", locale) || owner.id.slice(0, 8)}
              </p>
              <p className="text-[11px] text-muted-foreground/60">{owner.role}</p>
            </div>
          </Link>
        </div>
      )}

      {/* Company ID + slug */}
      <div className="text-[11px] text-muted-foreground/40 px-1">
        ID: {company.id} · slug: {company.slug}
      </div>
    </div>
  );
}
