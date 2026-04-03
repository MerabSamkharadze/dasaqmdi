import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getCompanyByOwner } from "@/lib/queries/companies";
import { getCategories } from "@/lib/queries/categories";
import { getTranslations, getLocale } from "next-intl/server";
import { JobForm } from "@/components/dashboard/job-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Post a Job",
};

export default async function CreateJobPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const company = await getCompanyByOwner(user.id);
  const locale = await getLocale();
  const t = await getTranslations("jobs");

  if (!company) {
    const tc = await getTranslations("company");
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/30 py-24 gap-4">
        <p className="text-sm text-muted-foreground/60">
          {tc("createFirst")}
        </p>
        <Button asChild>
          <Link href="/employer/company/new">{tc("createCompany")}</Link>
        </Button>
      </div>
    );
  }

  const categories = await getCategories();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold tracking-tight">{t("create")}</h1>
      <div className="rounded-xl border border-border/60 bg-card p-5 sm:p-8 shadow-soft">
        <JobForm
          companyId={company.id}
          categories={categories}
          locale={locale}
          mode="create"
        />
      </div>
    </div>
  );
}
