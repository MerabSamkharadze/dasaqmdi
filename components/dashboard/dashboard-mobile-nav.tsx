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
import {
  LayoutDashboard,
  User,
  FileText,
  Building2,
  Briefcase,
  PlusCircle,
  Users,
  ArrowLeft,
  Menu,
} from "lucide-react";

type NavItem = {
  href: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
};

const seekerNav: NavItem[] = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/profile", labelKey: "profile", icon: User },
  { href: "/seeker/applications", labelKey: "myApplications", icon: FileText },
];

const employerNav: NavItem[] = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/profile", labelKey: "profile", icon: User },
  { href: "/employer/company", labelKey: "myCompany", icon: Building2 },
  { href: "/employer/jobs", labelKey: "myJobs", icon: Briefcase },
  { href: "/employer/jobs/new", labelKey: "postJob", icon: PlusCircle },
];

const adminNav: NavItem[] = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/profile", labelKey: "profile", icon: User },
  { href: "/admin/users", labelKey: "manageUsers", icon: Users },
  { href: "/admin/jobs", labelKey: "manageJobs", icon: Briefcase },
  { href: "/admin/companies", labelKey: "manageCompanies", icon: Building2 },
];

function getNavItems(role: UserRole): NavItem[] {
  switch (role) {
    case "employer":
      return employerNav;
    case "admin":
      return adminNav;
    default:
      return seekerNav;
  }
}

export function DashboardMobileNav({ role }: { role: UserRole }) {
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
      <SheetContent side="left" className="w-64 p-0">
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
            const isActive =
              normalizedPath === item.href ||
              (item.href !== "/dashboard" && normalizedPath.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
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

        <div className="border-t border-border/30 p-3">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium text-muted-foreground/60 transition-all duration-200 hover:bg-accent hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 shrink-0 opacity-60" />
            {t("backToSite")}
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
