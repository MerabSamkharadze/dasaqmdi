"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types";

export async function saveJobAction(jobId: string): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("saved_jobs")
    .insert({ user_id: user.id, job_id: jobId });

  if (error) {
    if (error.code === "23505") return { error: null }; // already saved
    return { error: error.message };
  }

  revalidatePath("/seeker/saved");
  return { error: null };
}

export async function unsaveJobAction(jobId: string): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("saved_jobs")
    .delete()
    .eq("user_id", user.id)
    .eq("job_id", jobId);

  if (error) return { error: error.message };

  revalidatePath("/seeker/saved");
  return { error: null };
}
