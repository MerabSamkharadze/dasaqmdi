"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types";

export async function markApplicationViewedAction(
  applicationId: string,
): Promise<ActionResult> {
  const supabase = createClient();

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
