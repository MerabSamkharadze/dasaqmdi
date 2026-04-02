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
};

const seekerNav: NavItem[] = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/profile", labelKey: "profile", icon: User },
  { href: "/seeker/applications", labelKey: "myApplications", icon: FileText },
];

const employerNav: NavItem[] = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/employer/company", labelKey: "myCompany", icon: Building2 },
  { href: "/employer/jobs", labelKey: "myJobs", icon: Briefcase },
  { href: "/employer/jobs/new", labelKey: "postJob", icon: PlusCircle },
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
