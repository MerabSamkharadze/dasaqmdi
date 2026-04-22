import {
  LayoutDashboard,
  User,
  FileText,
  Building2,
  Briefcase,
  PlusCircle,
  Users,
  Bookmark,
  Search,
  CreditCard,
  Mail,
  BarChart3,
  ScrollText,
  ExternalLink,
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
  { href: "/jobs", labelKey: "jobs", icon: Search, exact: true },
  { href: "/seeker/applications", labelKey: "myApplications", icon: FileText },
  { href: "/seeker/saved", labelKey: "savedJobs", icon: Bookmark },
  { href: "/profile", labelKey: "profile", icon: User },
];

const employerNav: NavItem[] = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/employer/company", labelKey: "myCompany", icon: Building2 },
  { href: "/employer/jobs", labelKey: "myJobs", icon: Briefcase, exact: true },
  { href: "/employer/applications", labelKey: "applicants", icon: FileText },
  { href: "/employer/analytics", labelKey: "analytics", icon: BarChart3 },
  { href: "/employer/jobs/new", labelKey: "postJob", icon: PlusCircle, exact: true },
  { href: "/employer/email-templates", labelKey: "emailTemplates", icon: Mail },
  { href: "/employer/billing", labelKey: "billing", icon: CreditCard },
];

const adminNav: NavItem[] = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/admin/users", labelKey: "manageUsers", icon: Users },
  { href: "/admin/jobs", labelKey: "manageJobs", icon: Briefcase },
  { href: "/admin/companies", labelKey: "manageCompanies", icon: Building2 },
  { href: "/admin/analytics", labelKey: "analytics", icon: BarChart3 },
  { href: "/admin/subscriptions", labelKey: "subscriptions", icon: CreditCard },
  { href: "/admin/jobs/external/new", labelKey: "addExternalJob", icon: ExternalLink, exact: true },
  // Moderation route exists but hidden from nav until MODERATION_ENABLED is used.
  // Re-add with `icon: ShieldCheck` from lucide-react when restoring.
  { href: "/admin/logs", labelKey: "logs", icon: ScrollText },
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
