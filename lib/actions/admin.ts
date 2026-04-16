"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
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
  const { error } = await supabase
    .from("companies")
    .update({ is_verified: true })
    .eq("id", companyId);

  if (error) return { error: error.message };

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
  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  return { error: null };
}

export async function approveJobAction(jobId: string): Promise<ActionResult> {
  const adminId = await verifyAdmin();
  if (!adminId) return { error: "Unauthorized" };

  const supabase = createClient();

  // Only pending jobs can be approved
  const { data: job } = await supabase
    .from("jobs")
    .select("id, status")
    .eq("id", jobId)
    .single();

  if (!job) return { error: "Job not found" };
  if (job.status !== "pending") return { error: "Only pending jobs can be approved" };

  const { error } = await supabase
    .from("jobs")
    .update({ status: "active" })
    .eq("id", jobId);

  if (error) return { error: error.message };

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
    .select("id, status")
    .eq("id", jobId)
    .single();

  if (!job) return { error: "Job not found" };
  if (job.status !== "pending") return { error: "Only pending jobs can be rejected" };

  const { error } = await supabase
    .from("jobs")
    .update({ status: "rejected" })
    .eq("id", jobId);

  if (error) return { error: error.message };

  revalidatePath("/admin/moderation");
  revalidatePath("/admin/jobs");
  revalidatePath("/employer/jobs");
  return { error: null };
}

export async function deleteJobAdminAction(jobId: string): Promise<ActionResult> {
  const adminId = await verifyAdmin();
  if (!adminId) return { error: "Unauthorized" };

  const supabase = createClient();
  const { error } = await supabase
    .from("jobs")
    .delete()
    .eq("id", jobId);

  if (error) return { error: error.message };

  revalidatePath("/admin/jobs");
  return { error: null };
}
