import { createClient } from "@/lib/supabase/server";
import type { TrendPoint } from "@/lib/queries/admin";

export type TopJobRow = {
  id: string;
  title: string;
  title_ka: string | null;
  views_count: number;
  applications_count: number;
};

export type EmployerAnalytics = {
  totals: {
    views: number;
    applications: number;
    accepted: number;
    activeJobs: number;
    totalJobs: number;
  };
  jobPostingTrend: TrendPoint[];
  applicationTrend: TrendPoint[];
  topJobs: TopJobRow[];
};

function emptyTrend(days: number): TrendPoint[] {
  const out: TrendPoint[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    out.push({ date: d.toISOString().slice(0, 10), count: 0 });
  }
  return out;
}

function bucketByDay(
  rows: Array<{ created_at: string }>,
  days: number,
): TrendPoint[] {
  const trend = emptyTrend(days);
  const index = new Map<string, number>();
  trend.forEach((p, i) => index.set(p.date, i));

  for (const row of rows) {
    const day = row.created_at.slice(0, 10);
    const idx = index.get(day);
    if (idx !== undefined) trend[idx].count += 1;
  }
  return trend;
}

export async function getEmployerAnalytics(
  userId: string,
  days = 30,
): Promise<EmployerAnalytics> {
  const supabase = createClient();

  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);
  const sinceIso = since.toISOString();

  // Get employer's jobs (all-time + with views_count)
  const { data: allJobs } = await supabase
    .from("jobs")
    .select("id, title, title_ka, views_count, created_at, status, expires_at")
    .eq("posted_by", userId);

  const jobs = allJobs ?? [];
  const jobIds = jobs.map((j) => j.id);
  const now = new Date().toISOString();

  const activeJobs = jobs.filter(
    (j) => j.status === "active" && j.expires_at > now,
  ).length;
  const views = jobs.reduce((s, j) => s + (j.views_count ?? 0), 0);

  if (jobIds.length === 0) {
    return {
      totals: { views: 0, applications: 0, accepted: 0, activeJobs: 0, totalJobs: 0 },
      jobPostingTrend: emptyTrend(days),
      applicationTrend: emptyTrend(days),
      topJobs: [],
    };
  }

  // Applications (all-time + for counters, windowed for trend)
  const [allApps, recentJobs, recentApps, acceptedApps, topAppCounts] = await Promise.all([
    supabase
      .from("applications")
      .select("id", { count: "exact", head: true })
      .in("job_id", jobIds),
    supabase
      .from("jobs")
      .select("created_at")
      .eq("posted_by", userId)
      .gte("created_at", sinceIso),
    supabase
      .from("applications")
      .select("created_at")
      .in("job_id", jobIds)
      .gte("created_at", sinceIso),
    supabase
      .from("applications")
      .select("id", { count: "exact", head: true })
      .in("job_id", jobIds)
      .eq("status", "accepted"),
    supabase
      .from("applications")
      .select("job_id")
      .in("job_id", jobIds),
  ]);

  const totalApps = allApps.count ?? 0;
  const accepted = acceptedApps.count ?? 0;

  // Top jobs — sort by applications first, then views
  const appCountByJob = new Map<string, number>();
  (topAppCounts.data ?? []).forEach((a) => {
    appCountByJob.set(a.job_id, (appCountByJob.get(a.job_id) ?? 0) + 1);
  });

  const topJobs: TopJobRow[] = jobs
    .map((j) => ({
      id: j.id,
      title: j.title,
      title_ka: j.title_ka,
      views_count: j.views_count ?? 0,
      applications_count: appCountByJob.get(j.id) ?? 0,
    }))
    .sort((a, b) => {
      if (b.applications_count !== a.applications_count) {
        return b.applications_count - a.applications_count;
      }
      return b.views_count - a.views_count;
    })
    .slice(0, 5);

  return {
    totals: {
      views,
      applications: totalApps,
      accepted,
      activeJobs,
      totalJobs: jobs.length,
    },
    jobPostingTrend: bucketByDay(recentJobs.data ?? [], days),
    applicationTrend: bucketByDay(recentApps.data ?? [], days),
    topJobs,
  };
}
