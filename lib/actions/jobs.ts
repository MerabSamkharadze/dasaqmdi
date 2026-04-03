"use server";

import { createClient } from "@/lib/supabase/server";
import { createJobSchema, updateJobSchema } from "@/lib/validations/job";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionResult } from "@/lib/types";

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

  const raw = extractJobFields(formData);

  const parsed = createJobSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase.from("jobs").insert({
    ...parsed.data,
    company_id: companyId,
    posted_by: user.id,
    status: "active",
  });

  if (error) return { error: error.message };

  revalidatePath("/employer/jobs");
  revalidatePath("/jobs");
  redirect("/employer/jobs");
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
  if (job.status === "closed") return { error: "Cannot renew a closed job. Please create a new listing." };
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
