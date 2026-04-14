"use server";

import { createClient } from "@/lib/supabase/server";
import {
  applyToJobSchema,
  updateApplicationStatusSchema,
} from "@/lib/validations/application";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionResult } from "@/lib/types";

async function verifyApplicationOwnership(
  supabase: ReturnType<typeof createClient>,
  applicationId: string,
  userId: string
): Promise<boolean> {
  // Fetch the application's job to check posted_by
  const { data: application } = await supabase
    .from("applications")
    .select("id, job_id")
    .eq("id", applicationId)
    .single();

  if (!application) return false;

  // Direct job lookup — avoids fragile join typing
  const { data: job } = await supabase
    .from("jobs")
    .select("posted_by")
    .eq("id", application.job_id)
    .single();

  if (!job) return false;
  return job.posted_by === userId;
}

export async function applyToJobAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Role check: only seekers can apply
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "seeker") {
    return { error: "Only job seekers can apply to jobs" };
  }

  const raw = {
    job_id: formData.get("job_id") as string,
    cover_letter: formData.get("cover_letter") as string,
    resume_url: formData.get("resume_url") as string,
  };

  const parsed = applyToJobSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Check if already applied
  const { data: existing } = await supabase
    .from("applications")
    .select("id")
    .eq("job_id", parsed.data.job_id)
    .eq("applicant_id", user.id)
    .single();

  if (existing) {
    return { error: "You have already applied to this job" };
  }

  const { error } = await supabase.from("applications").insert({
    job_id: parsed.data.job_id,
    applicant_id: user.id,
    cover_letter: parsed.data.cover_letter || null,
    resume_url: parsed.data.resume_url,
  });

  if (error) return { error: error.message };

  revalidatePath("/seeker/applications");
  redirect(`/jobs/${parsed.data.job_id}`);
}

export async function updateApplicationStatusAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const raw = {
    application_id: formData.get("application_id") as string,
    status: formData.get("status") as string,
    employer_notes: (formData.get("employer_notes") as string) ?? "",
  };

  const parsed = updateApplicationStatusSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // C1 FIX: Verify that the user owns the job this application belongs to
  const isOwner = await verifyApplicationOwnership(supabase, parsed.data.application_id, user.id);
  if (!isOwner) {
    return { error: "Unauthorized: you do not own this job" };
  }

  const { error } = await supabase
    .from("applications")
    .update({
      status: parsed.data.status,
      employer_notes: parsed.data.employer_notes || null,
    })
    .eq("id", parsed.data.application_id);

  if (error) return { error: error.message };

  // N4.2: Send email notification for accepted/rejected (fire-and-forget)
  if (["accepted", "rejected"].includes(parsed.data.status) && process.env.CRON_SECRET) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.dasaqmdi.com";
    fetch(`${baseUrl}/api/email/notify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CRON_SECRET}`,
      },
      body: JSON.stringify({
        application_id: parsed.data.application_id,
        status: parsed.data.status,
      }),
    }).catch(() => {});
  }

  revalidatePath("/employer/jobs");
  return { error: null };
}

// O9: Batch mark multiple applications as viewed in one query
export async function markApplicationsBatchViewedAction(
  applicationIds: string[],
): Promise<ActionResult> {
  if (applicationIds.length === 0) return { error: null };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Ownership check: only mark applications for jobs this user owns
  const { data: userJobs } = await supabase
    .from("jobs")
    .select("id")
    .eq("posted_by", user.id);

  const userJobIds = new Set((userJobs ?? []).map((j) => j.id));

  // Filter to only applications belonging to user's jobs
  const { data: validApps } = await supabase
    .from("applications")
    .select("id, job_id")
    .in("id", applicationIds)
    .eq("is_viewed", false);

  const ownedIds = (validApps ?? [])
    .filter((a) => userJobIds.has(a.job_id))
    .map((a) => a.id);

  if (ownedIds.length === 0) return { error: null };

  const { error } = await supabase
    .from("applications")
    .update({
      is_viewed: true,
      viewed_at: new Date().toISOString(),
    })
    .in("id", ownedIds);

  if (error) return { error: error.message };

  revalidatePath("/seeker/applications");
  return { error: null };
}

export async function markApplicationViewedAction(
  applicationId: string,
): Promise<ActionResult> {
  const supabase = createClient();

  // C2 FIX: Verify authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // C2 FIX: Verify the user owns the job this application belongs to
  const isOwner = await verifyApplicationOwnership(supabase, applicationId, user.id);
  if (!isOwner) {
    return { error: "Unauthorized: you do not own this job" };
  }

  const { error } = await supabase
    .from("applications")
    .update({
      is_viewed: true,
      viewed_at: new Date().toISOString(),
    })
    .eq("id", applicationId)
    .eq("is_viewed", false);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/seeker/applications");
  return { error: null };
}

export async function deleteApplicationAction(
  applicationId: string,
): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Fetch resume_url before deleting so we can clean up storage
  const { data: application } = await supabase
    .from("applications")
    .select("resume_url")
    .eq("id", applicationId)
    .eq("applicant_id", user.id)
    .single();

  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("id", applicationId)
    .eq("applicant_id", user.id);

  // Clean up resume file from storage (best-effort, don't block on failure)
  if (!error && application?.resume_url) {
    await supabase.storage
      .from("resumes")
      .remove([application.resume_url]);
  }

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/seeker/applications");
  return { error: null };
}
