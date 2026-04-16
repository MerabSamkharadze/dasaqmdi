import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
  User,
  MapPin,
  Phone,
  Briefcase,
  Globe,
  FileText,
  Mail,
} from "lucide-react";
import type { Profile } from "@/lib/types";

type ProfileViewProps = {
  profile: Profile;
  email: string;
  t: (key: string) => string;
};

export function ProfileView({ profile, email, t }: ProfileViewProps) {
  const displayName =
    profile.full_name || profile.full_name_ka || email.split("@")[0];

  return (
    <div className="flex flex-col gap-6">
      {/* Header: Avatar + Name */}
      <div className="flex items-center gap-5">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-muted/60">
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
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {displayName}
          </h2>
          {profile.full_name && profile.full_name_ka && (
            <p className="text-[13px] text-muted-foreground/60 mt-0.5">
              {profile.full_name_ka}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3 mt-2 text-[13px] text-muted-foreground/70">
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 opacity-50" />
              {email}
            </span>
            {profile.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 opacity-50" />
                {profile.phone}
              </span>
            )}
            {profile.city && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 opacity-50" />
                {profile.city}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {profile.experience_years != null && (
          <InfoItem
            icon={Briefcase}
            label={t("experienceYears")}
            value={`${profile.experience_years} ${profile.experience_years === 1 ? "year" : "years"}`}
          />
        )}
        <InfoItem
          icon={Globe}
          label={t("language")}
          value={profile.preferred_language === "ka" ? "ქართული" : "English"}
        />
        {profile.resume_url && (
          <InfoItem
            icon={FileText}
            label={t("resume")}
            value={
              <a
                href={profile.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary/80 hover:text-primary hover:underline transition-colors duration-200"
              >
                {t("viewResume")}
              </a>
            }
          />
        )}
      </div>

      {/* Skills */}
      {profile.skills && profile.skills.length > 0 && (
        <Section title={t("skills")}>
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
        </Section>
      )}

      {/* Bio */}
      {(profile.bio || profile.bio_ka) && (
        <Section title={t("bio")}>
          {profile.bio && (
            <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
              {profile.bio}
            </p>
          )}
          {profile.bio_ka && profile.bio && (
            <div className="border-t border-border/30 my-3" />
          )}
          {profile.bio_ka && (
            <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
              {profile.bio_ka}
            </p>
          )}
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-soft">
      <h3 className="text-[13px] font-semibold tracking-tight text-foreground mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3.5 shadow-soft">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/12">
        <Icon className="h-3.5 w-3.5 text-primary/70" />
      </div>
      <div>
        <p className="text-[11px] text-muted-foreground/60">{label}</p>
        <p className="text-[13px] font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
