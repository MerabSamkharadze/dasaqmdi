import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getProfile, getCachedUser } from "@/lib/queries/profile";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import type { UserRole } from "@/lib/types/enums";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCachedUser();
  if (!user) redirect("/auth/login");

  const profile = await getProfile(user.id);
  const role: UserRole = profile?.role ?? "seeker";
  const fullName = profile?.full_name || profile?.full_name_ka || null;
  const avatarUrl = profile?.avatar_url ?? null;

  // Employer unread applications — single JOIN query replaces the previous
  // two sequential round-trips (jobIds then count). We select a boolean
  // `applications(id)` subquery which Postgres JOINs efficiently.
  let newApplicationsCount = 0;
  if (role === "employer") {
    const supabase = createClient();
    const { count } = await supabase
      .from("applications")
      .select("id, job:jobs!inner(posted_by)", { count: "exact", head: true })
      .eq("is_viewed", false)
      .eq("job.posted_by", user.id);
    newApplicationsCount = count ?? 0;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar role={role} fullName={fullName} avatarUrl={avatarUrl} badgeCount={newApplicationsCount} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader
          fullName={fullName}
          email={user.email ?? ""}
          role={role}
          avatarUrl={avatarUrl}
          badgeCount={newApplicationsCount}
        />

        <main id="main-content" className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
