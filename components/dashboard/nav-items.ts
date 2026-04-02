import {
  LayoutDashboard,
  User,
  FileText,
  Building2,
  Briefcase,
  PlusCircle,
  Users,
} from "lucide-react";
import type { UserRole } from "@/lib/types/enums";

export type NavItem = {
  href: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
};

/**
 * Check if a nav item is active for the given path.
 * Items with `exact: true` only match their exact href.
 * Dashboard always uses exact match.
 * Other items match if the path starts with the href.
 */
export function isNavActive(item: NavItem, currentPath: string): boolean {
  if (item.exact || item.href === "/dashboard") {
    return currentPath === item.href;
  }
  return currentPath === item.href || currentPath.startsWith(`${item.href}/`);
}

const seekerNav: NavItem[] = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/profile", labelKey: "profile", icon: User },
  { href: "/seeker/applications", labelKey: "myApplications", icon: FileText },
];

const employerNav: NavItem[] = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/employer/company", labelKey: "myCompany", icon: Building2 },
  { href: "/employer/jobs", labelKey: "myJobs", icon: Briefcase, exact: true },
  { href: "/employer/jobs/new", labelKey: "postJob", icon: PlusCircle, exact: true },
];

const adminNav: NavItem[] = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/admin/users", labelKey: "manageUsers", icon: Users },
  { href: "/admin/jobs", labelKey: "manageJobs", icon: Briefcase },
  { href: "/admin/companies", labelKey: "manageCompanies", icon: Building2 },
];

export function getNavItems(role: UserRole): NavItem[] {
  switch (role) {
    case "employer":
      return employerNav;
    case "admin":
      return adminNav;
    default:
      return seekerNav;
  }
}
