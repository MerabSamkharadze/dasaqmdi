"use server";

import { createClient } from "@/lib/supabase/server";
import {
  applyToJobSchema,
  updateApplicationStatusSchema,
} from "@/lib/validations/application";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionResult } from "@/lib/types";

// Typed shape for application ownership check (join: applications → jobs)
type ApplicationWithJobOwner = {
  id: string;
  job: { posted_by: string };
};

async function verifyApplicationOwnership(
  supabase: ReturnType<typeof createClient>,
  applicationId: string,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("applications")
    .select("id, job:jobs!inner(posted_by)")
    .eq("id", applicationId)
    .single();

  if (!data) return false;

  // Supabase returns single-relation joins as objects
  const app = data as unknown as ApplicationWithJobOwner;
  return app.job.posted_by === userId;
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
    employer_notes: formData.get("employer_notes") as string,
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

  revalidatePath("/employer/jobs");
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

  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("id", applicationId)
    .eq("applicant_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/seeker/applications");
  return { error: null };
}
