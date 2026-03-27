"use server";

import { createClient } from "@/lib/supabase/server";
import { createCompanySchema, updateCompanySchema } from "@/lib/validations/company";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionResult } from "@/lib/types";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function createCompanyAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const raw = {
    name: formData.get("name") as string,
    name_ka: formData.get("name_ka") as string,
    description: formData.get("description") as string,
    description_ka: formData.get("description_ka") as string,
    website: formData.get("website") as string,
    city: formData.get("city") as string,
    address: formData.get("address") as string,
    address_ka: formData.get("address_ka") as string,
    employee_count: formData.get("employee_count") as string || undefined,
  };

  const parsed = createCompanySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const slug = slugify(parsed.data.name) + "-" + Date.now().toString(36);

  const { error } = await supabase.from("companies").insert({
    ...parsed.data,
    owner_id: user.id,
    slug,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/employer/company");
  redirect("/employer/company");
}

export async function updateCompanyAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const companyId = formData.get("company_id") as string;
  if (!companyId) {
    return { error: "Company ID required" };
  }

  const raw = {
    name: formData.get("name") as string,
    name_ka: formData.get("name_ka") as string,
    description: formData.get("description") as string,
    description_ka: formData.get("description_ka") as string,
    website: formData.get("website") as string,
    city: formData.get("city") as string,
    address: formData.get("address") as string,
    address_ka: formData.get("address_ka") as string,
    employee_count: formData.get("employee_count") as string || undefined,
  };

  const parsed = updateCompanySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase
    .from("companies")
    .update(parsed.data)
    .eq("id", companyId)
    .eq("owner_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/employer/company");
  return { error: null };
}
