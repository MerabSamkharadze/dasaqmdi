"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { UserRole } from "@/lib/types/enums";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut, Menu } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import { getNavItems, isNavActive } from "./nav-items";
import { RoleLabel } from "./role-label";

type DashboardMobileNavProps = {
  role: UserRole;
  fullName: string | null;
};

export function DashboardMobileNav({ role, fullName }: DashboardMobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("nav");
  const navItems = getNavItems(role);
  const normalizedPath = pathname.replace(/^\/(ka|en)/, "") || "/";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8 rounded-xl">
          <Menu className="h-4 w-4" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 flex flex-col">
        <SheetTitle className="flex h-14 items-center border-b border-border/30 px-5">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="text-base font-semibold tracking-tight text-foreground"
          >
            დასაქმდი
          </Link>
        </SheetTitle>

        <nav className="flex-1 space-y-0.5 p-3">
          {navItems.map((item) => {
            const isActive = isNavActive(item, normalizedPath);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm relative before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[3px] before:rounded-full before:bg-primary"
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
            onClick={() => setOpen(false)}
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
      </SheetContent>
    </Sheet>
  );
}
