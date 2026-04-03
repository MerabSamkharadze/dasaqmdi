import { getPublicProfile } from "@/lib/queries/profile";
import { getTranslations, getLocale } from "next-intl/server";
import { localized } from "@/lib/utils";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { User, MapPin, Calendar, Briefcase } from "lucide-react";
import Image from "next/image";
import type { Metadata } from "next";

type PageProps = {
  params: { id: string; locale: string };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const profile = await getPublicProfile(params.id);
  if (!profile) return { title: "Profile Not Found" };

  const name = profile.full_name || profile.full_name_ka || "User";
  return {
    title: `${name} — dasakmdi.com`,
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const profile = await getPublicProfile(params.id);
  if (!profile) notFound();

  const locale = await getLocale();
  const t = await getTranslations("profile");

  const fullName = localized(profile, "full_name", locale) || t("anonymous");
  const bio = localized(profile, "bio", locale);

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-muted/60">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={fullName}
              width={64}
              height={64}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <User className="h-7 w-7 text-muted-foreground/40" />
          )}
        </div>

        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {fullName}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-1 text-[13px] text-muted-foreground/70">
            {profile.city && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 opacity-50" />
                {profile.city}
              </span>
            )}
            {profile.experience_years != null && (
              <span className="flex items-center gap-1">
                <Briefcase className="h-3 w-3 opacity-50" />
                {t("experienceYears")}: {profile.experience_years}
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
        </div>
      </div>

      {/* Bio */}
      {bio && (
        <div className="rounded-xl border border-border/60 bg-card p-5 sm:p-8 shadow-soft">
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
        <div className="rounded-xl border border-border/60 bg-card p-5 sm:p-8 shadow-soft">
          <h2 className="text-[15px] font-semibold tracking-tight mb-3">
            {t("skills")}
          </h2>
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
    </div>
  );
}
