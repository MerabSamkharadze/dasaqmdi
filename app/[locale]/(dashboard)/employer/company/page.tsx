import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getCompanyByOwner } from "@/lib/queries/companies";
import { getTranslations } from "next-intl/server";
import { CompanyForm } from "@/components/dashboard/company-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Company",
};

export default async function EmployerCompanyPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const company = await getCompanyByOwner(user.id);
  const t = await getTranslations("company");

  if (!company) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-xl font-semibold tracking-tight">{t("title")}</h1>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 py-20 gap-4">
          <p className="text-sm text-muted-foreground">{t("createCompany")}</p>
          <Button asChild>
            <Link href="/employer/company/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              {t("createCompany")}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight">{t("editCompany")}</h1>
      <div className="rounded-xl border border-border/60 bg-card p-5 sm:p-8 shadow-sm">
        <CompanyForm company={company} mode="edit" userId={user.id} />
      </div>
    </div>
  );
}
