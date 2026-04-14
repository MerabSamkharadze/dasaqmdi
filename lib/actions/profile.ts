"use server";

import { createClient } from "@/lib/supabase/server";
import { updateProfileSchema } from "@/lib/validations/profile";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types";

export async function updateProfileAction(
  _prevState: ActionResult<string>,
  formData: FormData
): Promise<ActionResult<string>> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const raw = {
    full_name: formData.get("full_name") as string,
    full_name_ka: formData.get("full_name_ka") as string,
    phone: formData.get("phone") as string,
    city: formData.get("city") as string,
    bio: formData.get("bio") as string,
    bio_ka: formData.get("bio_ka") as string,
    skills: (formData.get("skills") as string)
      ?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) ?? [],
    experience_years: formData.get("experience_years") as string,
    preferred_language: formData.get("preferred_language") as string,
    avatar_url: formData.get("avatar_url") as string,
    resume_url: formData.get("resume_url") as string,
    preferred_categories: formData.getAll("preferred_categories").map(String).filter(Boolean),
    is_public: formData.get("is_public") === "on",
    email_digest: formData.get("email_digest") === "on",
  };

  const parsed = updateProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase
    .from("profiles")
    .update(parsed.data)
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/profile");
  return { error: null, data: "success" };
}
