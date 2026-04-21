import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getCompanyByOwner } from "@/lib/queries/companies";
import { getCategories } from "@/lib/queries/categories";
import { getActivePlan } from "@/lib/queries/subscriptions";
import { canUseAIDraft, STARTER_JOB_LIMIT } from "@/lib/subscription-helpers";
import { getTranslations, getLocale } from "next-intl/server";
import { JobForm } from "@/components/dashboard/job-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Lock, ArrowRight, Sparkles, CreditCard } from "lucide-react";
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
  const td = await getTranslations("dashboard");

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

  const [categories, plan] = await Promise.all([
    getCategories(),
    getActivePlan(company.id),
  ]);

  // Starter plan limit check — show upsell instead of form
  if (plan === "free") {
    const now = new Date().toISOString();
    const { count: activeJobs } = await supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("company_id", company.id)
      .eq("status", "active")
      .gte("expires_at", now);

    if ((activeJobs ?? 0) >= STARTER_JOB_LIMIT) {
      return (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto">
          <h1 className="text-lg font-semibold tracking-tight">{t("create")}</h1>

          <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 to-transparent p-8 shadow-soft">
            <div className="flex items-start gap-4">
              <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15">
                <Lock className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
                  {td("starterLimitTitle", { limit: STARTER_JOB_LIMIT })}
                </h2>
                <p className="mt-1.5 text-[13px] text-muted-foreground">
                  {td("starterLimitDescription")}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link
                href="/pricing"
                className="group flex items-start gap-3 rounded-xl border border-primary/40 bg-primary/5 p-4 hover:bg-primary/10 transition-colors duration-200"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                  <CreditCard className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground">
                    {td("upgradeToBusiness")}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                    {td("upgradeToBusinessDesc")}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-primary/50 group-hover:text-primary transition-colors" />
              </Link>

              <Link
                href="/employer/jobs"
                className="group flex items-start gap-3 rounded-xl border border-amber-300/50 bg-amber-50/30 dark:bg-amber-500/5 dark:border-amber-500/30 p-4 hover:bg-amber-50/50 dark:hover:bg-amber-500/10 transition-colors duration-200"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15">
                  <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground">
                    {td("boostExistingJob")}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                    {td("boostExistingJobDesc")}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-amber-500/50 group-hover:text-amber-600 transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold tracking-tight">{t("create")}</h1>
      <div className="rounded-xl border border-border/60 bg-card p-5 sm:p-8 shadow-soft">
        <JobForm
          companyId={company.id}
          categories={categories}
          locale={locale}
          mode="create"
          canUseAI={canUseAIDraft(plan)}
        />
      </div>
    </div>
  );
}
