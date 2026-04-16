"use client";

import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { LogOut, User, Settings } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import { getNavItems, isNavActive } from "./nav-items";
import { RoleLabel } from "./role-label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const tDash = useTranslations("dashboard");
  const navItems = getNavItems(role);

  const normalizedPath = pathname.replace(/^\/(ka|en)/, "") || "/";

  return (
    <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-border/30 bg-card/60 backdrop-blur-sm">
      <div className="flex h-14 items-center border-b border-border/30 px-4">
        <Link href="/" className="transition-opacity duration-200 hover:opacity-80">
          <Logo />
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
                "flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-200 relative",
                isActive
                  ? "bg-primary/10 text-primary shadow-sm before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[3px] before:rounded-full before:bg-primary"
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

      {/* User avatar + dropdown */}
      <div className="border-t border-border/30 px-4 py-3.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted/60 overflow-hidden ring-2 ring-transparent hover:ring-primary/30 transition-all duration-200 focus-visible:outline-none focus-visible:ring-primary/40"
            >
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt=""
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <User className="h-4 w-4 text-muted-foreground/50" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-52 mb-1">
            {/* User info */}
            <div className="px-3 py-2.5">
              <p className="text-[13px] font-medium text-foreground truncate">
                {fullName ?? t("profile")}
              </p>
              <RoleLabel role={role} />
            </div>
            <DropdownMenuSeparator />

            {/* Profile link (seeker only) */}
            {role === "seeker" && (
              <DropdownMenuItem asChild className="gap-2 text-[13px] cursor-pointer">
                <Link href="/profile">
                  <Settings className="h-4 w-4 opacity-60" />
                  {t("profile")}
                </Link>
              </DropdownMenuItem>
            )}

            {/* Logout */}
            <DropdownMenuItem
              className="gap-2 text-[13px] cursor-pointer text-destructive/80 focus:text-destructive focus:bg-destructive/8"
              onSelect={(e) => {
                e.preventDefault();
                const form = document.createElement("form");
                form.method = "POST";
                form.action = "/api/auth/logout";
                document.body.appendChild(form);
                // Use server action via hidden form
                const btn = document.getElementById("sidebar-logout-btn") as HTMLButtonElement;
                btn?.click();
              }}
            >
              <LogOut className="h-4 w-4" />
              {t("logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Hidden logout form for server action */}
        <form action={logoutAction} className="hidden">
          <button type="submit" id="sidebar-logout-btn" />
        </form>
      </div>
    </aside>
  );
}
