import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getCompanyByOwner } from "@/lib/queries/companies";
import { getTranslations } from "next-intl/server";
import { CompanyForm } from "@/components/dashboard/company-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Company",
};

export default async function CreateCompanyPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const existing = await getCompanyByOwner(user.id);
  if (existing) {
    redirect("/employer/company");
  }

  const t = await getTranslations("company");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold tracking-tight">{t("createCompany")}</h1>
      <div className="rounded-xl border border-border/30 bg-card p-5 sm:p-8 shadow-sm">
        <CompanyForm mode="create" userId={user.id} />
      </div>
    </div>
  );
}
