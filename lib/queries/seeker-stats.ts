import { createClient } from "@/lib/supabase/server";

export type SeekerStats = {
  totalApplications: number;
  viewedCount: number;
  activeJobsCount: number;
  pendingCount: number;
};

export async function getSeekerStats(userId: string): Promise<SeekerStats> {
  const supabase = createClient();

  const { data: applications } = await supabase
    .from("applications")
    .select("id, status, is_viewed, job:jobs!inner(status)")
    .eq("applicant_id", userId);

  if (!applications) {
    return { totalApplications: 0, viewedCount: 0, activeJobsCount: 0, pendingCount: 0 };
  }

  const totalApplications = applications.length;
  const viewedCount = applications.filter((a) => a.is_viewed).length;
  const pendingCount = applications.filter((a) => a.status === "pending").length;
  const activeJobsCount = applications.filter(
    (a) => (a.job as unknown as { status: string }).status === "active"
  ).length;

  return { totalApplications, viewedCount, activeJobsCount, pendingCount };
}
