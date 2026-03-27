import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/queries/profile";
import { getTranslations } from "next-intl/server";
import { localized } from "@/lib/utils";
import { getLocale } from "next-intl/server";
import { Briefcase, FileText, Building2, Users } from "lucide-react";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const locale = await getLocale();
  const profile = await getProfile(user.id);
  const t = await getTranslations("dashboard");

  const displayName = profile
    ? localized(profile, "full_name", locale) || user.email?.split("@")[0]
    : user.email?.split("@")[0];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          {t("welcome", { name: displayName ?? "" })}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t("overview")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Briefcase}
          label={t("activeJobs")}
          value="—"
        />
        <StatCard
          icon={FileText}
          label={t("totalApplications")}
          value="—"
        />
        <StatCard
          icon={Building2}
          label={t("totalJobs")}
          value="—"
        />
        <StatCard
          icon={Users}
          label={t("recentApplications")}
          value="—"
        />
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-semibold text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}
