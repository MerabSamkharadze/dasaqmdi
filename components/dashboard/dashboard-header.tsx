import { ThemeSwitcher } from "@/components/theme-switcher";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { LogoutButton } from "@/components/logout-button";
import { DashboardMobileNav } from "./dashboard-mobile-nav";
import type { UserRole } from "@/lib/types/enums";

type DashboardHeaderProps = {
  email: string;
  role: UserRole;
};

export function DashboardHeader({ email, role }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/30 bg-background/80 backdrop-blur-xl px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <DashboardMobileNav role={role} />
        <span className="text-[13px] text-muted-foreground/60 hidden sm:inline truncate max-w-[200px]">
          {email}
        </span>
      </div>

      <div className="flex items-center gap-0.5">
        <LanguageSwitcher />
        <ThemeSwitcher />
        <LogoutButton />
      </div>
    </header>
  );
}
