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
    .select("name, name_ka")
    .eq("id", companyId)
    .single();

  const { error } = await supabase
    .from("companies")
    .update({ is_verified: true })
    .eq("id", companyId);

  if (error) return { error: error.message };

  await logAdminAction(supabase, adminId, "verify_company", "company", companyId, {
    company_name: company?.name,
    company_name_ka: company?.name_ka,
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
    .select("id, status, title, title_ka, company:companies!inner(name, name_ka)")
    .eq("id", jobId)
    .single();

  if (!job) return { error: "Job not found" };
  if (job.status !== "pending") return { error: "Only pending jobs can be approved" };

  const { error } = await supabase
    .from("jobs")
    .update({ status: "active" })
    .eq("id", jobId);

  if (error) return { error: error.message };

  const approveCompany = job.company as unknown as { name: string; name_ka: string | null };
  await logAdminAction(supabase, adminId, "approve_job", "job", jobId, {
    title: job.title,
    title_ka: job.title_ka,
    company_name: approveCompany?.name,
    company_name_ka: approveCompany?.name_ka,
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
    .select("id, status, title, title_ka, company:companies!inner(name, name_ka)")
    .eq("id", jobId)
    .single();

  if (!job) return { error: "Job not found" };
  if (job.status !== "pending") return { error: "Only pending jobs can be rejected" };

  const { error } = await supabase
    .from("jobs")
    .update({ status: "rejected" })
    .eq("id", jobId);

  if (error) return { error: error.message };

  const rejectCompany = job.company as unknown as { name: string; name_ka: string | null };
  await logAdminAction(supabase, adminId, "reject_job", "job", jobId, {
    title: job.title,
    title_ka: job.title_ka,
    company_name: rejectCompany?.name,
    company_name_ka: rejectCompany?.name_ka,
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
    .select("id, title, title_ka, company:companies!inner(name, name_ka)")
    .in("id", jobIds);

  const { error } = await supabase
    .from("jobs")
    .delete()
    .in("id", jobIds);

  if (error) return { error: error.message };

  for (const job of jobs ?? []) {
    const company = job.company as unknown as { name: string; name_ka: string | null };
    await logAdminAction(supabase, adminId, "delete_job", "job", job.id, {
      bulk: true,
      title: job.title,
      title_ka: job.title_ka,
      company_name: company?.name,
      company_name_ka: company?.name_ka,
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

  const { error } = await supabase.from("jobs").insert({
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
  });

  if (error) return { error: error.message };

  await logAdminAction(supabase, adminId, "create_external_job", "job", "new", {
    source: parsed.data.external_source,
    url: parsed.data.external_url,
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
    .select("title, title_ka, company:companies!inner(name, name_ka)")
    .eq("id", jobId)
    .single();

  const { error } = await supabase
    .from("jobs")
    .delete()
    .eq("id", jobId);

  if (error) return { error: error.message };

  const company = job?.company as unknown as { name: string; name_ka: string | null } | null;
  await logAdminAction(supabase, adminId, "delete_job", "job", jobId, {
    title: job?.title,
    title_ka: job?.title_ka,
    company_name: company?.name,
    company_name_ka: company?.name_ka,
  });

  revalidatePath("/admin/jobs");
  return { error: null };
}
