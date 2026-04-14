"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types";

export async function upsertEmailTemplateAction(
  _prevState: ActionResult<string>,
  formData: FormData
): Promise<ActionResult<string>> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const companyId = formData.get("company_id") as string;
  const type = formData.get("type") as string;
  const subject = formData.get("subject") as string;
  const subject_ka = formData.get("subject_ka") as string;
  const body = formData.get("body") as string;
  const body_ka = formData.get("body_ka") as string;

  if (!companyId || !type || !subject || !body) {
    return { error: "Missing required fields" };
  }

  if (!["accepted", "rejected"].includes(type)) {
    return { error: "Invalid template type" };
  }

  // Verify ownership
  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("id", companyId)
    .eq("owner_id", user.id)
    .single();

  if (!company) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("email_templates")
    .upsert(
      {
        company_id: companyId,
        type,
        subject,
        subject_ka: subject_ka || null,
        body,
        body_ka: body_ka || null,
        is_active: true,
      },
      { onConflict: "company_id,type" }
    );

  if (error) return { error: error.message };

  revalidatePath("/employer/email-templates");
  return { error: null, data: "success" };
}

export async function deleteEmailTemplateAction(
  companyId: string,
  type: string
): Promise<ActionResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Verify ownership
  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("id", companyId)
    .eq("owner_id", user.id)
    .single();

  if (!company) return { error: "Unauthorized" };

  await supabase
    .from("email_templates")
    .delete()
    .eq("company_id", companyId)
    .eq("type", type);

  revalidatePath("/employer/email-templates");
  return { error: null };
}
