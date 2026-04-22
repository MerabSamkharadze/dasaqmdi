import { redirect } from "next/navigation";
import { getProfile, getCachedUser } from "@/lib/queries/profile";
import { getSeekerDashboardData, getEmployerDashboardData } from "@/lib/queries/dashboard";
import { getAdminStats } from "@/lib/queries/admin";
import { getTranslations, getLocale } from "next-intl/server";
import { localized } from "@/lib/utils";
import { SeekerDashboard } from "@/components/dashboard/seeker-dashboard";
import { EmployerDashboard } from "@/components/dashboard/employer-dashboard";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import type { UserRole } from "@/lib/types/enums";

export default async function DashboardPage() {
  const user = await getCachedUser();
  if (!user) redirect("/auth/login");

  const locale = await getLocale();
  const profile = await getProfile(user.id);
  const t = await getTranslations("dashboard");
  const role: UserRole = profile?.role ?? "seeker";

  const displayName = profile
    ? localized(profile, "full_name", locale) || user.email?.split("@")[0]
    : user.email?.split("@")[0];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">
          {t("welcome", { name: displayName ?? "" })}
        </h1>
        <p className="text-[13px] text-muted-foreground/70 mt-1">
          {t("overview")}
        </p>
      </div>

      <RoleDashboard role={role} userId={user.id} locale={locale} />
    </div>
  );
}

async function RoleDashboard({
  role,
  userId,
  locale,
}: {
  role: UserRole;
  userId: string;
  locale: string;
}) {
  switch (role) {
    case "employer": {
      const [data, t] = await Promise.all([
        getEmployerDashboardData(userId),
        getTranslations("dashboard"),
      ]);
      return <EmployerDashboard data={data} locale={locale} t={t} />;
    }
    case "admin": {
      const [data, t] = await Promise.all([
        getAdminStats(),
        getTranslations("admin"),
      ]);
      return <AdminDashboard data={data} t={t} />;
    }
    default: {
      const [data, t] = await Promise.all([
        getSeekerDashboardData(userId),
        getTranslations("dashboard"),
      ]);
      return <SeekerDashboard data={data} locale={locale} t={t} />;
    }
  }
}
