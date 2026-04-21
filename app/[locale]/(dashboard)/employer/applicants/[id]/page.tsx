import { createClient } from "@/lib/supabase/server";
import { getApplicantProfileForEmployer } from "@/lib/queries/employer-applications";
import { getTranslations, getLocale } from "next-intl/server";
import { localized } from "@/lib/utils";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  User,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  Code2,
  Calendar,
  FileText,
} from "lucide-react";
import type { Metadata } from "next";

type PageProps = {
  params: { id: string };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { title: "Applicant" };

  const data = await getApplicantProfileForEmployer(params.id, user.id);
  const t = await getTranslations("applications");
  if (!data) return { title: t("applicantProfile") };

  const name = data.profile.full_name || data.profile.full_name_ka || t("applicantProfile");
  return { title: name, robots: { index: false, follow: false } };
}

export default async function EmployerApplicantProfilePage({ params }: PageProps) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const data = await getApplicantProfileForEmployer(params.id, user.id);
  if (!data) notFound();

  const locale = await getLocale();
  const t = await getTranslations("applications");
  const tProfile = await getTranslations("profile");

  const { profile, email, applications } = data;
  const displayName =
    localized(profile, "full_name", locale) || tProfile("anonymous");
  const bio = localized(profile, "bio", locale);

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <Link
        href="/employer/applications"
        className="inline-flex items-center gap-1.5 self-start text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t("backToApplications")}
      </Link>

      {/* Hero */}
      <div className="rounded-xl border border-border/60 bg-card p-6 sm:p-8 shadow-soft">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-muted/60 ring-2 ring-primary/15 overflow-hidden">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={displayName}
                width={80}
                height={80}
                sizes="80px"
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <User className="h-8 w-8 text-muted-foreground/40" />
            )}
          </div>
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              {displayName}
            </h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 mt-2 text-[13px] text-muted-foreground">
              {profile.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 opacity-50" />
                  {profile.city}
                </span>
              )}
              {profile.experience_years != null && profile.experience_years > 0 && (
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5 opacity-50" />
                  {profile.experience_years} {tProfile("experienceYears").toLowerCase()}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 opacity-50" />
                {tProfile("memberSince", {
                  date: new Date(profile.created_at).toLocaleDateString(
                    locale === "ka" ? "ka-GE" : "en-US",
                    { month: "long", year: "numeric" }
                  ),
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact */}
      {(email || profile.phone) && (
        <div className="rounded-xl border border-border/60 bg-card p-5 sm:p-6 shadow-soft">
          <h2 className="text-[13px] font-semibold tracking-tight mb-3">
            {t("contactInfo")}
          </h2>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-[13px]">
            {email && (
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-2 text-foreground hover:text-primary transition-colors duration-200"
              >
                <Mail className="h-3.5 w-3.5 opacity-50" />
                {email}
              </a>
            )}
            {profile.phone && (
              <a
                href={`tel:${profile.phone}`}
                className="flex items-center gap-2 text-foreground hover:text-primary transition-colors duration-200"
              >
                <Phone className="h-3.5 w-3.5 opacity-50" />
                {profile.phone}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Applications to this employer */}
      <div className="rounded-xl border border-border/60 bg-card p-5 sm:p-6 shadow-soft">
        <h2 className="text-[13px] font-semibold tracking-tight mb-3">
          {t("appliedFor")}
        </h2>
        <div className="flex flex-col gap-2">
          {applications.map((app) => (
            <Link
              key={app.id}
              href={`/employer/jobs/${app.job.id}/applications`}
              className="flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-background/60 px-3.5 py-2.5 hover:border-border hover:bg-background transition-all duration-200"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Briefcase className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                <span className="text-[13px] font-medium text-foreground truncate">
                  {localized(app.job, "title", locale)}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-muted-foreground/60 tabular-nums">
                  {new Date(app.created_at).toLocaleDateString(
                    locale === "ka" ? "ka-GE" : "en-US",
                    { day: "numeric", month: "short" }
                  )}
                </span>
                <Badge variant="outline" className="text-[10px] font-normal">
                  {t(`status.${app.status}`)}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bio */}
      {bio && (
        <div className="rounded-xl border border-border/60 bg-card p-5 sm:p-6 shadow-soft">
          <h2 className="text-[13px] font-semibold tracking-tight mb-3">
            {tProfile("bio")}
          </h2>
          <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
            {bio}
          </p>
        </div>
      )}

      {/* Skills */}
      {profile.skills && profile.skills.length > 0 && (
        <div className="rounded-xl border border-border/60 bg-card p-5 sm:p-6 shadow-soft">
          <div className="flex items-center gap-2 mb-3">
            <Code2 className="h-3.5 w-3.5 text-primary/60" />
            <h2 className="text-[13px] font-semibold tracking-tight">
              {tProfile("skills")}
            </h2>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="text-[12px] font-normal"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Resume hint — full resume access is via per-application signed URL */}
      {profile.resume_url && (
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground/70">
          <FileText className="h-3.5 w-3.5 opacity-50" />
          {tProfile("resume")}: {t("resume")}
        </div>
      )}
    </div>
  );
}
