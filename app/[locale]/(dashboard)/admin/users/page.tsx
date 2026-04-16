import { getAllUsers } from "@/lib/queries/admin";
import { getTranslations, getLocale } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { CountBadge } from "@/components/shared/count-badge";
import { AdminRoleSelect } from "@/components/dashboard/admin-role-select";
import { AdminUserFilters } from "@/components/dashboard/admin-user-filters";
import { User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Manage Users" };

function formatDate(d: string, locale: string): string {
  return new Date(d).toLocaleDateString(
    locale === "ka" ? "ka-GE" : "en-US",
    { day: "numeric", month: "short", year: "numeric" },
  );
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string; role?: string };
}) {
  const t = await getTranslations("admin");
  const locale = await getLocale();
  const users = await getAllUsers({
    q: searchParams.q,
    role: searchParams.role,
  });

  const filterTranslations = {
    searchPlaceholder: t("searchUsers"),
    allRoles: t("allRoles"),
    seeker: t("seeker"),
    employer: t("employer"),
    admin: t("adminRole"),
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-lg font-semibold tracking-tight">{t("manageUsers")}</h1>
        <CountBadge>{users.length}</CountBadge>
      </div>

      <Suspense fallback={<div className="h-10 animate-pulse rounded-lg bg-muted/50" />}>
        <AdminUserFilters translations={filterTranslations} />
      </Suspense>

      {users.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/30 py-16">
          <p className="text-sm text-muted-foreground/60">{t("noResults")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {users.map((user, i) => (
            <div
              key={user.id}
              className="flex items-center gap-4 rounded-xl border border-border/60 bg-card px-5 py-3.5 shadow-soft animate-fade-in"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/60">
                {user.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt=""
                    width={32}
                    height={32}
                    sizes="32px"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-3.5 w-3.5 text-muted-foreground/50" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <Link
                  href={`/admin/users/${user.id}`}
                  className="text-[13px] font-medium truncate hover:text-primary transition-colors"
                >
                  {user.full_name || user.full_name_ka || user.id.slice(0, 8)}
                </Link>
                <p className="text-[11px] text-muted-foreground/60">
                  {formatDate(user.created_at, locale)}
                </p>
              </div>

              <Badge
                variant="outline"
                className={
                  user.role === "admin"
                    ? "text-[11px] border-primary/30 text-primary"
                    : user.role === "employer"
                      ? "text-[11px] border-blue-300/50 text-blue-600 dark:border-blue-500/30 dark:text-blue-400"
                      : "text-[11px]"
                }
              >
                {t(user.role === "admin" ? "adminRole" : user.role)}
              </Badge>

              <AdminRoleSelect userId={user.id} currentRole={user.role} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
