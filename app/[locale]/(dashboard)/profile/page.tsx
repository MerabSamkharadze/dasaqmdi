import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/queries/profile";
import { getTranslations } from "next-intl/server";
import { ProfileForm } from "@/components/dashboard/profile-form";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("profile");
  return { title: t("title") };
}

export default async function ProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const profile = await getProfile(user.id);

  // Profile page is only for seekers — employer has company page, admin doesn't need one
  if (profile?.role === "employer" || profile?.role === "admin") {
    redirect("/dashboard");
  }

  const t = await getTranslations("profile");

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/30 py-24 text-muted-foreground/60">
        <p className="text-sm">{t("notFound")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold tracking-tight">{t("title")}</h1>
      <div className="rounded-xl border border-border/30 bg-card p-5 sm:p-8 shadow-sm">
        <ProfileForm profile={profile} />
      </div>
    </div>
  );
}
