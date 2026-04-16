import { ThemeSwitcher } from "@/components/theme-switcher";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { DashboardMobileNav } from "./dashboard-mobile-nav";
import type { UserRole } from "@/lib/types/enums";

type DashboardHeaderProps = {
  fullName: string | null;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
};

export function DashboardHeader({ fullName, email, role, avatarUrl }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/30 bg-background/80 backdrop-blur-xl px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <DashboardMobileNav role={role} fullName={fullName} avatarUrl={avatarUrl} />
        <div className="hidden sm:block">
          <p className="text-[13px] font-medium text-foreground truncate max-w-[200px] leading-tight">
            {fullName ?? email.split("@")[0]}
          </p>
          <p className="text-[11px] text-muted-foreground/50 leading-tight">
            {email}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-0.5">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>
    </header>
  );
}
