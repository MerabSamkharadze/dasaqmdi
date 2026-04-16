"use client";

import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { LogOut, User, Settings, ChevronUp } from "lucide-react";
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

      {/* User menu */}
      <div className="border-t border-border/30 p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200 hover:bg-accent group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/60 overflow-hidden">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt=""
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-3.5 w-3.5 text-muted-foreground/50" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-foreground truncate leading-tight">
                  {fullName ?? t("profile")}
                </p>
                <RoleLabel role={role} />
              </div>
              <ChevronUp className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" sideOffset={8} className="w-[calc(14rem-24px)]">
            {role === "seeker" && (
              <>
                <DropdownMenuItem asChild className="gap-2 text-[13px] cursor-pointer">
                  <Link href="/profile">
                    <Settings className="h-4 w-4 opacity-60" />
                    {t("profile")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem
              className="gap-2 text-[13px] cursor-pointer text-destructive/80 focus:text-destructive focus:bg-destructive/8"
              onSelect={() => {
                document.getElementById("sidebar-logout-btn")?.click();
              }}
            >
              <LogOut className="h-4 w-4" />
              {t("logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <form action={logoutAction} className="hidden">
          <button type="submit" id="sidebar-logout-btn" />
        </form>
      </div>
    </aside>
  );
}
