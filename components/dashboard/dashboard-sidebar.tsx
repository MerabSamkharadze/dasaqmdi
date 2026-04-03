"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { LogOut, User } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import { getNavItems, isNavActive } from "./nav-items";
import { RoleLabel } from "./role-label";
import type { UserRole } from "@/lib/types/enums";

type DashboardSidebarProps = {
  role: UserRole;
  fullName: string | null;
  avatarUrl: string | null;
  badgeCount?: number;
};

export function DashboardSidebar({ role, fullName, avatarUrl, badgeCount = 0 }: DashboardSidebarProps) {
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
          const isActive = isNavActive(item, normalizedPath);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/12 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-70" />
              <span className="flex-1">{t(item.labelKey)}</span>
              {item.labelKey === "applicants" && badgeCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground tabular-nums">
                  {badgeCount > 99 ? "99+" : badgeCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User identity + logout */}
      <div className="border-t border-border/30 px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted/60 overflow-hidden">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <User className="h-4 w-4 text-muted-foreground/50" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-foreground truncate leading-tight">
              {fullName ?? t("profile")}
            </p>
            <RoleLabel role={role} />
          </div>
        </div>
        <form action={logoutAction} className="mt-2.5 ml-12">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-destructive/70 transition-all duration-200 hover:bg-destructive/8 hover:text-destructive"
          >
            <LogOut className="h-3.5 w-3.5" />
            {t("logout")}
          </button>
        </form>
      </div>
    </aside>
  );
}
