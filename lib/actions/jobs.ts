"use server";

import { createClient } from "@/lib/supabase/server";
import { createJobSchema, updateJobSchema } from "@/lib/validations/job";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getActivePlan } from "@/lib/queries/subscriptions";
import {
  canPostJob,
  getFeaturedSlotLimit,
  STARTER_JOB_LIMIT,
} from "@/lib/subscription-helpers";
import type { ActionResult } from "@/lib/types";
import { siteConfig } from "@/lib/config";

function extractJobFields(formData: FormData) {
  return {
    title: formData.get("title") as string,
    title_ka: formData.get("title_ka") as string,
    description: formData.get("description") as string,
    description_ka: formData.get("description_ka") as string,
    requirements: formData.get("requirements") as string,
    requirements_ka: formData.get("requirements_ka") as string,
    category_id: formData.get("category_id") as string,
    job_type: formData.get("job_type") as string,
    city: formData.get("city") as string,
    is_remote: formData.get("is_remote") === "on",
    salary_min: formData.get("salary_min") as string,
    salary_max: formData.get("salary_max") as string,
    salary_currency: formData.get("salary_currency") as string,
    application_deadline: formData.get("application_deadline") as string,
    tags: (formData.get("tags") as string)
      ?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) ?? [],
  };
}

export async function createJobAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const companyId = formData.get("company_id") as string;
  if (!companyId) return { error: "Company required" };

  // Check plan-based job limit
  const plan = await getActivePlan(companyId);
  if (plan === "free") {
    const { count } = await supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("company_id", companyId)
      .eq("status", "active")
      .gte("expires_at", new Date().toISOString());

    if (!canPostJob(plan, count ?? 0)) {
      return {
        error: `Starter plan is limited to ${STARTER_JOB_LIMIT} active jobs. Upgrade to Business for unlimited.`,
      };
    }
  }

  const raw = extractJobFields(formData);

  const parsed = createJobSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const moderationEnabled = process.env.MODERATION_ENABLED === "true";
  const initialStatus = moderationEnabled ? "pending" : "active";

  const { data: newJob, error } = await supabase.from("jobs").insert({
    ...parsed.data,
    company_id: companyId,
    posted_by: user.id,
    status: initialStatus,
  }).select("id").single();

  if (error) return { error: error.message };

  // TB3.3: Notify Telegram subscribers (non-blocking) — only when auto-approved
  if (!moderationEnabled && newJob?.id && process.env.CRON_SECRET) {
    const baseUrl = siteConfig.url;
    fetch(`${baseUrl}/api/telegram/notify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CRON_SECRET}`,
      },
      body: JSON.stringify({ job_id: newJob.id }),
    }).catch(() => {}); // Fire-and-forget, don't block job creation
  }

  // SEO: notify search engines about new job
  if (!moderationEnabled && newJob?.id) {
    const { pingNewJob } = await import("@/lib/seo-ping");
    pingNewJob(newJob.id);
  }

  revalidatePath("/employer/jobs");
  revalidatePath("/jobs");
  redirect("/employer/jobs?created=1");
}

export async function updateJobAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const jobId = formData.get("job_id") as string;
  if (!jobId) return { error: "Job ID required" };

  const raw = extractJobFields(formData);

  const parsed = updateJobSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase
    .from("jobs")
    .update(parsed.data)
    .eq("id", jobId)
    .eq("posted_by", user.id);

  if (error) return { error: error.message };

  revalidatePath("/employer/jobs");
  revalidatePath("/jobs");
  return { error: null };
}

export async function closeJobAction(jobId: string): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("jobs")
    .update({ status: "closed" })
    .eq("id", jobId)
    .eq("posted_by", user.id);

  if (error) return { error: error.message };

  revalidatePath("/employer/jobs");
  revalidatePath("/jobs");
  return { error: null };
}

export async function incrementJobViewAction(jobId: string): Promise<void> {
  const supabase = createClient();

  await supabase.rpc("increment_job_views", { job_id_input: jobId });
}

/**
 * Toggle a job's featured state. Plan-gated:
 *   - Starter: cannot feature anything (can still buy extra slots)
 *   - Business: up to 1 featured active job via subscription
 *   - Pro: up to 3 featured active jobs via subscription
 *
 * Paid-extra slots (featured_until set) are independent:
 *   - Not counted against plan limit
 *   - Cannot be toggled off before expiry (user paid for the window)
 *   - Cleared automatically when featured_until is reached (lazy, on read)
 */
export async function toggleJobFeaturedAction(jobId: string): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data: job } = await supabase
    .from("jobs")
    .select("id, posted_by, company_id, is_featured, status, featured_until")
    .eq("id", jobId)
    .single();

  if (!job) return { error: "Job not found" };
  if (job.posted_by !== user.id) return { error: "Not authorized for this job" };

  if (job.is_featured) {
    // Paid-extra still active → refuse to toggle off.
    if (job.featured_until && new Date(job.featured_until).getTime() > Date.now()) {
      return {
        error: "Featured-extra is active on this job; it will expire automatically.",
      };
    }
    // Subscription slot OR expired paid-extra — clearing featured_until too so
    // any stale paid-extra timestamp doesn't stick around.
    const { error } = await supabase
      .from("jobs")
      .update({ is_featured: false, featured_until: null })
      .eq("id", jobId);
    if (error) return { error: error.message };
    revalidatePath("/employer/jobs");
    revalidatePath("/jobs");
    return { error: null };
  }

  // Featuring — check plan limit (subscription slots only)
  const plan = await getActivePlan(job.company_id);
  const limit = getFeaturedSlotLimit(plan);
  if (limit === 0) {
    return { error: "Featured jobs are a Business plan feature. Upgrade or buy an extra slot." };
  }

  const { count: currentCount } = await supabase
    .from("jobs")
    .select("id", { count: "exact", head: true })
    .eq("company_id", job.company_id)
    .eq("status", "active")
    .eq("is_featured", true)
    .is("featured_until", null);

  if ((currentCount ?? 0) >= limit) {
    return {
      error: `Featured slot limit reached (${limit}). Unfeature another job or buy an extra slot.`,
    };
  }

  const { error } = await supabase
    .from("jobs")
    .update({ is_featured: true, featured_until: null })
    .eq("id", jobId);

  if (error) return { error: error.message };

  revalidatePath("/employer/jobs");
  revalidatePath("/jobs");
  return { error: null };
}

export async function renewJobAction(jobId: string): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // M5 FIX: Verify job exists, belongs to user, and is not permanently closed
  const { data: job } = await supabase
    .from("jobs")
    .select("id, status")
    .eq("id", jobId)
    .eq("posted_by", user.id)
    .single();

  if (!job) return { error: "Job not found" };
  if (job.status === "archived") return { error: "Cannot renew an archived job." };

  const newExpiresAt = new Date();
  newExpiresAt.setDate(newExpiresAt.getDate() + 30);

  const { error } = await supabase
    .from("jobs")
    .update({
      expires_at: newExpiresAt.toISOString(),
      status: "active",
    })
    .eq("id", jobId)
    .eq("posted_by", user.id);

  if (error) return { error: error.message };

  revalidatePath("/employer/jobs");
  revalidatePath("/jobs");
  return { error: null };
}
