import { getAdminStats } from "@/lib/queries/admin";
import { getTranslations } from "next-intl/server";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboardPage() {
  const t = await getTranslations("admin");
  const stats = await getAdminStats();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold tracking-tight">{t("title")}</h1>
      <AdminDashboard data={stats} t={t} />
    </div>
  );
}
