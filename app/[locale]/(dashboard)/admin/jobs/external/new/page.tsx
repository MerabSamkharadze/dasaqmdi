import { getCategories } from "@/lib/queries/categories";
import { getTranslations, getLocale } from "next-intl/server";
import { ExternalJobForm } from "@/components/dashboard/external-job-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Add External Job" };

export default async function AdminExternalJobPage() {
  const t = await getTranslations("admin");
  const locale = await getLocale();
  const categories = await getCategories();

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/jobs"
        className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t("manageJobs")}
      </Link>

      <h1 className="text-lg font-semibold tracking-tight">{t("addExternalJob")}</h1>

      <ExternalJobForm categories={categories} locale={locale} />
    </div>
  );
}
