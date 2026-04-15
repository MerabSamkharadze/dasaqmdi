import { getPublicProfile } from "@/lib/queries/profile";
import { getTranslations, getLocale } from "next-intl/server";
import { localized } from "@/lib/utils";
import { notFound } from "next/navigation";
import { ShareButton } from "@/components/shared/share-button";
import { User, MapPin, Calendar, Briefcase, Code2 } from "lucide-react";
import Image from "next/image";
import type { Metadata } from "next";
import { buildAlternates } from "@/lib/seo";
import { siteConfig } from "@/lib/config";

type PageProps = {
  params: { id: string; locale: string };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const profile = await getPublicProfile(params.id);
  if (!profile) return { title: "Profile Not Found" };

  const name = profile.full_name || profile.full_name_ka || "User";
  const skills = profile.skills?.slice(0, 5).join(", ") ?? "";
  const description = skills ? `${name} — ${skills}` : `${name} on ${siteConfig.domain}`;
  const alternates = buildAlternates(`/seekers/${params.id}`, params.locale);
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
      ...(profile.avatar_url && { images: [profile.avatar_url] }),
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description,
    },
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const profile = await getPublicProfile(params.id);
  if (!profile || profile.role !== "seeker") notFound();

  const locale = await getLocale();
  const t = await getTranslations("profile");

  const fullName = localized(profile, "full_name", locale) || t("anonymous");
  const bio = localized(profile, "bio", locale);

  const profileUrl = `${siteConfig.url}/seekers/${params.id}`;

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto">
      {/* Hero card */}
      <div className="rounded-xl border border-border/60 bg-card p-6 sm:p-8 shadow-soft">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar */}
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 via-violet-500/10 to-emerald-500/10 ring-2 ring-primary/20 dark:ring-primary/30">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={fullName}
                width={80}
                height={80}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <User className="h-8 w-8 text-primary/40" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              {fullName}
            </h1>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2 text-[13px] text-muted-foreground">
              {profile.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 opacity-50" />
                  {profile.city}
                </span>
              )}
              {profile.experience_years != null && profile.experience_years > 0 && (
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3 opacity-50" />
                  {profile.experience_years} {t("experienceYears").toLowerCase()}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 opacity-50" />
                {t("memberSince", {
                  date: new Date(profile.created_at).toLocaleDateString(
                    locale === "ka" ? "ka-GE" : "en-US",
                    { month: "long", year: "numeric" }
                  ),
                })}
              </span>
            </div>

            {/* Share */}
            <div className="mt-4">
              <ShareButton
                url={profileUrl}
                label={t("shareProfile")}
                copiedLabel={t("linkCopied")}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      {bio && (
        <div className="rounded-xl border border-border/60 bg-card p-5 sm:p-8 shadow-soft animate-fade-in" style={{ animationDelay: "50ms" }}>
          <h2 className="text-[15px] font-semibold tracking-tight mb-3">
            {t("bio")}
          </h2>
          <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
            {bio}
          </p>
        </div>
      )}

      {/* Skills */}
      {profile.skills && profile.skills.length > 0 && (
        <div className="rounded-xl border border-border/60 bg-card p-5 sm:p-8 shadow-soft animate-fade-in" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center gap-2 mb-4">
            <Code2 className="h-4 w-4 text-primary/60" />
            <h2 className="text-[15px] font-semibold tracking-tight">
              {t("skills")}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill, i) => (
              <span
                key={skill}
                className="inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium bg-primary/8 text-primary dark:bg-primary/15 animate-fade-in"
                style={{ animationDelay: `${150 + i * 30}ms` }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Empty state for sparse profiles */}
      {!bio && (!profile.skills || profile.skills.length === 0) && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 py-16 text-center animate-fade-in">
          <User className="h-8 w-8 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground/60">{t("sparseProfile")}</p>
        </div>
      )}
    </div>
  );
}
