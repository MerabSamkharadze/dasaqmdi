import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/queries/profile";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import type { UserRole } from "@/lib/types/enums";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const profile = await getProfile(user.id);
  const role: UserRole = profile?.role ?? "seeker";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar role={role} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader email={user.email ?? ""} role={role} />

        <main id="main-content" className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
