import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getJobById } from "@/lib/queries/jobs";
import { getProfile } from "@/lib/queries/profile";
import { getTranslations, getLocale } from "next-intl/server";
import { localized } from "@/lib/utils";
import { ApplyForm } from "@/components/applications/apply-form";
import { Building2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apply",
};

export default async function ApplyPage({
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
  if (!job) notFound();

  const locale = await getLocale();
  const t = await getTranslations("applications");
  const profile = await getProfile(user.id);

  const isExpired =
    job.status !== "active" ||
    (job.application_deadline && new Date(job.application_deadline) < new Date()) ||
    new Date(job.expires_at) < new Date();

  if (isExpired) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/30 py-24">
        <p className="text-sm text-muted-foreground/60">
          This job is no longer accepting applications
        </p>
      </div>
    );
  }

  const { data: existing } = await supabase
    .from("applications")
    .select("id")
    .eq("job_id", job.id)
    .eq("applicant_id", user.id)
    .single();

  if (existing) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/30 py-24">
        <p className="text-sm text-muted-foreground/60">
          You have already applied to this job
        </p>
      </div>
    );
  }

  const title = localized(job, "title", locale);
  const companyName = localized(job.company, "name", locale);

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Job summary */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/60">
          {job.company.logo_url ? (
            <img
              src={job.company.logo_url}
              alt={companyName}
              className="h-8 w-8 rounded-md object-contain"
            />
          ) : (
            <Building2 className="h-4 w-4 text-muted-foreground/50" />
          )}
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
          <p className="text-[13px] text-muted-foreground/70">{companyName}</p>
        </div>
      </div>

      {/* Apply form */}
      <div className="rounded-xl border border-border/30 bg-card p-5 sm:p-8 shadow-sm">
        <h2 className="text-sm font-semibold tracking-tight mb-6">{t("submitApplication")}</h2>
        <ApplyForm
          jobId={job.id}
          userId={user.id}
          existingResumeUrl={profile?.resume_url}
        />
      </div>
    </div>
  );
}
