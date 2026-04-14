import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/queries/profile";
import { getCategories } from "@/lib/queries/categories";
import { getTranslations, getLocale } from "next-intl/server";
import { ProfilePageClient } from "@/components/dashboard/profile-page-client";
import { UserX } from "lucide-react";
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
        <UserX className="h-7 w-7 text-muted-foreground/30 mb-3" />
        <p className="text-sm">{t("notFound")}</p>
      </div>
    );
  }

  const [categories, locale] = await Promise.all([getCategories(), getLocale()]);
  const categoryOptions = categories.map((c) => ({
    slug: c.slug,
    label: locale === "ka" ? c.name_ka : c.name_en,
  }));

  return <ProfilePageClient profile={profile} email={user.email ?? ""} categories={categoryOptions} />;
}
