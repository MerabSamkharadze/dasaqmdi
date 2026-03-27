import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getJobById } from "@/lib/queries/jobs";
import { getCategories } from "@/lib/queries/categories";
import { getTranslations, getLocale } from "next-intl/server";
import { JobForm } from "@/components/dashboard/job-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Job",
};

export default async function EditJobPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const job = await getJobById(params.id);
  if (!job || job.posted_by !== user.id) notFound();

  const locale = await getLocale();
  const t = await getTranslations("jobs");
  const categories = await getCategories();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold tracking-tight">{t("editJob")}</h1>
      <div className="rounded-xl border border-border/30 bg-card p-5 sm:p-8 shadow-sm">
        <JobForm
          job={job}
          companyId={job.company_id}
          categories={categories}
          locale={locale}
          mode="edit"
        />
      </div>
    </div>
  );
}
