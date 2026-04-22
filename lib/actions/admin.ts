"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logAdminAction } from "@/lib/admin-log";
import type { ActionResult } from "@/lib/types";

async function verifyAdmin(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return null;
  return user.id;
}

export async function verifyCompanyAction(companyId: string): Promise<ActionResult> {
  const adminId = await verifyAdmin();
  if (!adminId) return { error: "Unauthorized" };

  const supabase = createClient();

  const { data: company } = await supabase
    .from("companies")
    .select("name, name_ka, slug, owner_id")
    .eq("id", companyId)
    .single();

  const { data: owner } = company?.owner_id
    ? await supabase
        .from("profiles")
        .select("full_name, full_name_ka")
        .eq("id", company.owner_id)
        .single()
    : { data: null };

  const { error } = await supabase
    .from("companies")
    .update({ is_verified: true })
    .eq("id", companyId);

  if (error) return { error: error.message };

  await logAdminAction(supabase, adminId, "verify_company", "company", companyId, {
    company_name: company?.name,
    company_name_ka: company?.name_ka,
    company_slug: company?.slug,
    owner_id: company?.owner_id,
    owner_name: owner?.full_name,
    owner_name_ka: owner?.full_name_ka,
  });

  revalidatePath("/admin/companies");
  return { error: null };
}

export async function updateUserRoleAction(
  userId: string,
  role: "seeker" | "employer" | "admin"
): Promise<ActionResult> {
  const adminId = await verifyAdmin();
  if (!adminId) return { error: "Unauthorized" };

  const supabase = createClient();

  const { data: oldProfile } = await supabase
    .from("profiles")
    .select("role, full_name, full_name_ka")
    .eq("id", userId)
    .single();

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) return { error: error.message };

  await logAdminAction(supabase, adminId, "change_role", "user", userId, {
    old_role: oldProfile?.role,
    new_role: role,
    title: oldProfile?.full_name,
    title_ka: oldProfile?.full_name_ka,
  });

  revalidatePath("/admin/users");
  return { error: null };
}

export async function approveJobAction(jobId: string): Promise<ActionResult> {
  const adminId = await verifyAdmin();
  if (!adminId) return { error: "Unauthorized" };

  const supabase = createClient();

  const { data: job } = await supabase
    .from("jobs")
    .select("id, status, title, title_ka, posted_by, created_at, company_id, company:companies!inner(name, name_ka, slug)")
    .eq("id", jobId)
    .single();

  if (!job) return { error: "Job not found" };
  if (job.status !== "pending") return { error: "Only pending jobs can be approved" };

  const { data: poster } = job.posted_by
    ? await supabase
        .from("profiles")
        .select("full_name, full_name_ka")
        .eq("id", job.posted_by)
        .single()
    : { data: null };

  const { error } = await supabase
    .from("jobs")
    .update({ status: "active" })
    .eq("id", jobId);

  if (error) return { error: error.message };

  const approveCompany = job.company as unknown as { name: string; name_ka: string | null; slug: string };
  await logAdminAction(supabase, adminId, "approve_job", "job", jobId, {
    title: job.title,
    title_ka: job.title_ka,
    company_id: job.company_id,
    company_name: approveCompany?.name,
    company_name_ka: approveCompany?.name_ka,
    company_slug: approveCompany?.slug,
    posted_by: job.posted_by,
    posted_by_name: poster?.full_name,
    posted_by_name_ka: poster?.full_name_ka,
    job_created_at: job.created_at,
  });

  // Telegram notify on approval (fire-and-forget)
  if (process.env.CRON_SECRET) {
    const { siteConfig } = await import("@/lib/config");
    fetch(`${siteConfig.url}/api/telegram/notify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CRON_SECRET}`,
      },
      body: JSON.stringify({ job_id: jobId }),
    }).catch(() => {});
  }

  // SEO: notify search engines about newly approved job
  const { pingNewJob } = await import("@/lib/seo-ping");
  pingNewJob(jobId);

  revalidatePath("/admin/moderation");
  revalidatePath("/admin/jobs");
  revalidatePath("/employer/jobs");
  revalidatePath("/jobs");
  return { error: null };
}

export async function rejectJobAction(jobId: string): Promise<ActionResult> {
  const adminId = await verifyAdmin();
  if (!adminId) return { error: "Unauthorized" };

  const supabase = createClient();

  const { data: job } = await supabase
    .from("jobs")
    .select("id, status, title, title_ka, posted_by, created_at, company_id, company:companies!inner(name, name_ka, slug)")
    .eq("id", jobId)
    .single();

  if (!job) return { error: "Job not found" };
  if (job.status !== "pending") return { error: "Only pending jobs can be rejected" };

  const { data: rPoster } = job.posted_by
    ? await supabase
        .from("profiles")
        .select("full_name, full_name_ka")
        .eq("id", job.posted_by)
        .single()
    : { data: null };

  const { error } = await supabase
    .from("jobs")
    .update({ status: "rejected" })
    .eq("id", jobId);

  if (error) return { error: error.message };

  const rejectCompany = job.company as unknown as { name: string; name_ka: string | null; slug: string };
  await logAdminAction(supabase, adminId, "reject_job", "job", jobId, {
    title: job.title,
    title_ka: job.title_ka,
    company_id: job.company_id,
    company_name: rejectCompany?.name,
    company_name_ka: rejectCompany?.name_ka,
    company_slug: rejectCompany?.slug,
    posted_by: job.posted_by,
    posted_by_name: rPoster?.full_name,
    posted_by_name_ka: rPoster?.full_name_ka,
    job_created_at: job.created_at,
  });

  revalidatePath("/admin/moderation");
  revalidatePath("/admin/jobs");
  revalidatePath("/employer/jobs");
  return { error: null };
}

export async function batchDeleteJobsAction(jobIds: string[]): Promise<ActionResult> {
  if (jobIds.length === 0) return { error: null };
  const adminId = await verifyAdmin();
  if (!adminId) return { error: "Unauthorized" };

  const supabase = createClient();

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, title, title_ka, posted_by, created_at, status, company_id, company:companies!inner(name, name_ka, slug)")
    .in("id", jobIds);

  // Fetch posters in one query for denormalization
  const posterIds = Array.from(new Set((jobs ?? []).map((j) => j.posted_by).filter(Boolean) as string[]));
  const { data: posters } = posterIds.length > 0
    ? await supabase
        .from("profiles")
        .select("id, full_name, full_name_ka")
        .in("id", posterIds)
    : { data: [] };
  const posterById = new Map(
    (posters ?? []).map((p) => [p.id, { full_name: p.full_name, full_name_ka: p.full_name_ka }]),
  );

  const { error } = await supabase
    .from("jobs")
    .delete()
    .in("id", jobIds);

  if (error) return { error: error.message };

  for (const job of jobs ?? []) {
    const company = job.company as unknown as { name: string; name_ka: string | null; slug: string };
    const poster = job.posted_by ? posterById.get(job.posted_by) : null;
    await logAdminAction(supabase, adminId, "delete_job", "job", job.id, {
      bulk: true,
      title: job.title,
      title_ka: job.title_ka,
      company_id: job.company_id,
      company_name: company?.name,
      company_name_ka: company?.name_ka,
      company_slug: company?.slug,
      posted_by: job.posted_by,
      posted_by_name: poster?.full_name ?? null,
      posted_by_name_ka: poster?.full_name_ka ?? null,
      job_created_at: job.created_at,
      status_at_delete: job.status,
    });
  }

  revalidatePath("/admin/jobs");
  revalidatePath("/jobs");
  return { error: null };
}

const SYSTEM_COMPANY_SLUG = "dasaqmdi";

export async function createExternalJobAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const adminId = await verifyAdmin();
  if (!adminId) return { error: "Unauthorized" };

  const { externalJobSchema } = await import("@/lib/validations/external-job");

  const raw = {
    title: formData.get("title") as string,
    title_ka: formData.get("title_ka") as string,
    description: formData.get("description") as string,
    description_ka: formData.get("description_ka") as string,
    requirements: formData.get("requirements") as string,
    requirements_ka: formData.get("requirements_ka") as string,
    category_id: formData.get("category_id") as string,
    job_type: formData.get("job_type") as string,
    city: formData.get("city") as string,
    salary_min: formData.get("salary_min") as string,
    salary_max: formData.get("salary_max") as string,
    salary_currency: formData.get("salary_currency") as string,
    tags: formData.get("tags") as string,
    external_url: formData.get("external_url") as string,
    external_source: formData.get("external_source") as string,
  };

  const parsed = externalJobSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = createClient();

  // Get system company
  const { data: systemCompany } = await supabase
    .from("companies")
    .select("id")
    .eq("slug", SYSTEM_COMPANY_SLUG)
    .single();

  if (!systemCompany) return { error: "System company not found. Run migration 017." };

  const tags = parsed.data.tags
    ? parsed.data.tags.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const { data: newJob, error } = await supabase.from("jobs").insert({
    title: parsed.data.title,
    title_ka: parsed.data.title_ka || null,
    description: parsed.data.description,
    description_ka: parsed.data.description_ka || null,
    requirements: parsed.data.requirements || null,
    requirements_ka: parsed.data.requirements_ka || null,
    category_id: Number(parsed.data.category_id),
    job_type: parsed.data.job_type,
    city: parsed.data.city || null,
    salary_min: parsed.data.salary_min || null,
    salary_max: parsed.data.salary_max || null,
    salary_currency: parsed.data.salary_currency,
    tags,
    external_url: parsed.data.external_url,
    external_source: parsed.data.external_source,
    company_id: systemCompany.id,
    posted_by: adminId,
    status: "active",
  }).select("id").single();

  if (error) return { error: error.message };

  // Fetch category slug for readable audit context
  const { data: category } = await supabase
    .from("categories")
    .select("slug, name_en, name_ka")
    .eq("id", Number(parsed.data.category_id))
    .single();

  await logAdminAction(supabase, adminId, "create_external_job", "job", newJob?.id ?? "new", {
    title: parsed.data.title,
    title_ka: parsed.data.title_ka || null,
    source: parsed.data.external_source,
    url: parsed.data.external_url,
    category_slug: category?.slug,
    category_name: category?.name_en,
    category_name_ka: category?.name_ka,
    city: parsed.data.city || null,
    job_type: parsed.data.job_type,
  });

  // SEO: notify search engines
  if (newJob?.id) {
    const { pingNewJob } = await import("@/lib/seo-ping");
    pingNewJob(newJob.id);
  }

  revalidatePath("/admin/jobs");
  revalidatePath("/jobs");
  return { error: null };
}

export async function upgradeToVipAction(
  jobId: string,
  level: "silver" | "gold",
  days: number = 14,
): Promise<ActionResult> {
  const adminId = await verifyAdmin();
  if (!adminId) return { error: "Unauthorized" };

  const supabase = createClient();

  // Snapshot job state before change (for denormalized log context)
  const { data: jobBefore } = await supabase
    .from("jobs")
    .select("title, title_ka, vip_level, company_id, company:companies!inner(name, name_ka, slug)")
    .eq("id", jobId)
    .single();

  const vipUntil = new Date();
  vipUntil.setDate(vipUntil.getDate() + days);

  const { error } = await supabase
    .from("jobs")
    .update({
      vip_level: level,
      vip_until: vipUntil.toISOString(),
    })
    .eq("id", jobId);

  if (error) return { error: error.message };

  const upgCompany = jobBefore?.company as unknown as { name: string; name_ka: string | null; slug: string } | undefined;
  await logAdminAction(supabase, adminId, "upgrade_vip", "job", jobId, {
    level,
    days,
    previous_level: jobBefore?.vip_level ?? "normal",
    vip_until: vipUntil.toISOString(),
    title: jobBefore?.title,
    title_ka: jobBefore?.title_ka,
    company_id: jobBefore?.company_id,
    company_name: upgCompany?.name,
    company_name_ka: upgCompany?.name_ka,
    company_slug: upgCompany?.slug,
  });

  revalidatePath("/admin/jobs");
  revalidatePath("/jobs");
  return { error: null };
}

export async function removeVipAction(jobId: string): Promise<ActionResult> {
  const adminId = await verifyAdmin();
  if (!adminId) return { error: "Unauthorized" };

  const supabase = createClient();

  // Snapshot full VIP state BEFORE clearing it — audit log must capture what's lost
  const { data: jobBefore } = await supabase
    .from("jobs")
    .select("title, title_ka, vip_level, vip_until, company_id, company:companies!inner(name, name_ka, slug)")
    .eq("id", jobId)
    .single();

  // Look up when this VIP tier became active (most recent upgrade_vip or boost_purchased log for this job)
  const { data: upgradeHistory } = await supabase
    .from("admin_logs")
    .select("created_at, action, metadata")
    .eq("target_type", "job")
    .eq("target_id", jobId)
    .in("action", ["upgrade_vip", "boost_purchased"])
    .order("created_at", { ascending: false })
    .limit(1);
  const lastUpgrade = upgradeHistory?.[0] ?? null;

  const { error } = await supabase
    .from("jobs")
    .update({ vip_level: "normal", vip_until: null })
    .eq("id", jobId);

  if (error) return { error: error.message };

  const rmCompany = jobBefore?.company as unknown as { name: string; name_ka: string | null; slug: string } | undefined;
  await logAdminAction(supabase, adminId, "remove_vip", "job", jobId, {
    previous_level: jobBefore?.vip_level,
    vip_until_at_removal: jobBefore?.vip_until,
    vip_became_active_at: lastUpgrade?.created_at ?? null,
    vip_source: lastUpgrade?.action ?? null,
    title: jobBefore?.title,
    title_ka: jobBefore?.title_ka,
    company_id: jobBefore?.company_id,
    company_name: rmCompany?.name,
    company_name_ka: rmCompany?.name_ka,
    company_slug: rmCompany?.slug,
  });

  revalidatePath("/admin/jobs");
  revalidatePath("/jobs");
  return { error: null };
}

export async function deleteJobAdminAction(jobId: string): Promise<ActionResult> {
  const adminId = await verifyAdmin();
  if (!adminId) return { error: "Unauthorized" };

  const supabase = createClient();

  const { data: job } = await supabase
    .from("jobs")
    .select("title, title_ka, posted_by, created_at, status, company_id, company:companies!inner(name, name_ka, slug)")
    .eq("id", jobId)
    .single();

  const { data: poster } = job?.posted_by
    ? await supabase
        .from("profiles")
        .select("full_name, full_name_ka")
        .eq("id", job.posted_by)
        .single()
    : { data: null };

  const { error } = await supabase
    .from("jobs")
    .delete()
    .eq("id", jobId);

  if (error) return { error: error.message };

  const company = job?.company as unknown as { name: string; name_ka: string | null; slug: string } | null;
  await logAdminAction(supabase, adminId, "delete_job", "job", jobId, {
    title: job?.title,
    title_ka: job?.title_ka,
    company_id: job?.company_id,
    company_name: company?.name,
    company_name_ka: company?.name_ka,
    company_slug: company?.slug,
    posted_by: job?.posted_by,
    posted_by_name: poster?.full_name,
    posted_by_name_ka: poster?.full_name_ka,
    job_created_at: job?.created_at,
    status_at_delete: job?.status,
  });

  revalidatePath("/admin/jobs");
  return { error: null };
}
