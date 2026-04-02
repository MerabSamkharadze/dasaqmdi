"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { ArrowLeft, LogOut } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import { getNavItems } from "./nav-items";
import { RoleLabel } from "./role-label";
import type { UserRole } from "@/lib/types/enums";

type DashboardSidebarProps = {
  role: UserRole;
  fullName: string | null;
};

export function DashboardSidebar({ role, fullName }: DashboardSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const navItems = getNavItems(role);

  const normalizedPath = pathname.replace(/^\/(ka|en)/, "") || "/";

  return (
    <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-border/30 bg-card/40">
      <div className="flex h-14 items-center border-b border-border/30 px-5">
        <Link
          href="/"
          className="text-base font-semibold tracking-tight text-foreground transition-colors duration-200 hover:text-primary"
        >
          დასაქმდი
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 p-3">
        {navItems.map((item) => {
          const isActive =
            normalizedPath === item.href ||
            (item.href !== "/dashboard" && normalizedPath.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/8 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-70" />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/30 p-3 space-y-0.5">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium text-muted-foreground/60 transition-all duration-200 hover:bg-accent hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 shrink-0 opacity-60" />
          {t("backToSite")}
        </Link>

        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium text-muted-foreground/60 transition-all duration-200 hover:bg-accent hover:text-foreground"
          >
            <LogOut className="h-4 w-4 shrink-0 opacity-60" />
            {t("logout")}
          </button>
        </form>
      </div>

      {/* User identity */}
      <div className="border-t border-border/30 px-5 py-3.5">
        <p className="text-[13px] font-medium text-foreground truncate">
          {fullName ?? t("profile")}
        </p>
        <RoleLabel role={role} />
      </div>
    </aside>
  );
}
