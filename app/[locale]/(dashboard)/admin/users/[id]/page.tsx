import { getAdminUserDetail } from "@/lib/queries/admin";
import { getTranslations, getLocale } from "next-intl/server";
import { localized } from "@/lib/utils";
import { notFound } from "next/navigation";
import { AdminRoleSelect } from "@/components/dashboard/admin-role-select";
import { Badge } from "@/components/ui/badge";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import {
  User,
  MapPin,
  Calendar,
  Briefcase,
  FileText,
  Building2,
  ArrowLeft,
  Code2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "User Detail" };

function formatDate(d: string, locale: string): string {
  return new Date(d).toLocaleDateString(
    locale === "ka" ? "ka-GE" : "en-US",
    { day: "numeric", month: "long", year: "numeric" },
  );
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const t = await getTranslations("admin");
  const locale = await getLocale();
  const data = await getAdminUserDetail(params.id);

  if (!data) notFound();

  const { profile, applicationsCount, postedJobsCount, company } = data;
  const name = localized(profile, "full_name", locale) || profile.id.slice(0, 8);

  return (
    <div className="flex flex-col gap-6">
      {/* Back link */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t("manageUsers")}
      </Link>

      {/* Profile card */}
      <div className="rounded-xl border border-border/60 bg-card p-6 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-5">
          {/* Avatar */}
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-muted/60">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={name}
                width={64}
                height={64}
                    sizes="64px"
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <User className="h-7 w-7 text-muted-foreground/40" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-semibold tracking-tight">{name}</h1>
              <Badge
                variant="outline"
                className={
                  profile.role === "admin"
                    ? "text-[11px] border-primary/30 text-primary"
                    : profile.role === "employer"
                      ? "text-[11px] border-blue-300/50 text-blue-600 dark:border-blue-500/30 dark:text-blue-400"
                      : "text-[11px]"
                }
              >
                {t(profile.role === "admin" ? "adminRole" : profile.role)}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-2 text-[13px] text-muted-foreground">
              {profile.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 opacity-50" />
                  {profile.city}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 opacity-50" />
                {formatDate(profile.created_at, locale)}
              </span>
              {profile.experience_years != null && profile.experience_years > 0 && (
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3 opacity-50" />
                  {profile.experience_years} {t("yearsExp")}
                </span>
              )}
            </div>

            {/* Bio */}
            {(profile.bio || profile.bio_ka) && (
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {localized(profile, "bio", locale)}
              </p>
            )}
          </div>

          {/* Role change */}
          <div className="shrink-0">
            <p className="text-[11px] text-muted-foreground/60 mb-1.5">
              {t("changeRole")}
            </p>
            <AdminRoleSelect userId={profile.id} currentRole={profile.role} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-soft text-center">
          <FileText className="h-5 w-5 text-primary/50 mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground tabular-nums">
            {applicationsCount}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {t("applicationsTrend")}
          </p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-soft text-center">
          <Briefcase className="h-5 w-5 text-primary/50 mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground tabular-nums">
            {postedJobsCount}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {t("jobPostings")}
          </p>
        </div>
        {company && (
          <div className="rounded-xl border border-border/60 bg-card p-5 shadow-soft text-center">
            <Building2 className="h-5 w-5 text-primary/50 mx-auto mb-2" />
            <Link
              href={`/admin/companies/${company.id}`}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5"
            >
              {company.name}
              {company.is_verified && <VerifiedBadge />}
            </Link>
            <p className="text-[11px] text-muted-foreground mt-1">
              {t("manageCompanies")}
            </p>
          </div>
        )}
      </div>

      {/* Skills */}
      {profile.skills && profile.skills.length > 0 && (
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 mb-3">
            <Code2 className="h-4 w-4 text-primary/60" />
            <h2 className="text-[15px] font-semibold tracking-tight">
              {t("skills")}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs font-normal">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* User ID */}
      <div className="text-[11px] text-muted-foreground/40 px-1">
        ID: {profile.id}
      </div>
    </div>
  );
}
