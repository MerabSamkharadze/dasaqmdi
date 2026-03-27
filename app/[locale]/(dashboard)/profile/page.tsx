import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/queries/profile";
import { getTranslations } from "next-intl/server";
import { ProfileForm } from "@/components/dashboard/profile-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const profile = await getProfile(user.id);
  const t = await getTranslations("profile");

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p>Profile not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight">{t("title")}</h1>

      <div className="rounded-xl border border-border/60 bg-card p-5 sm:p-8 shadow-sm">
        <ProfileForm profile={profile} />
      </div>
    </div>
  );
}
