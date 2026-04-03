import { getAllUsers } from "@/lib/queries/admin";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { AdminRoleSelect } from "@/components/dashboard/admin-role-select";
import { User } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Manage Users" };

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminUsersPage() {
  const t = await getTranslations("admin");
  const users = await getAllUsers();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-lg font-semibold tracking-tight">{t("users")}</h1>
        <span className="text-[12px] text-muted-foreground/70 tabular-nums">{users.length}</span>
      </div>

      <div className="flex flex-col gap-2">
        {users.map((user, i) => (
          <div
            key={user.id}
            className="flex items-center gap-4 rounded-xl border border-border/60 bg-card px-5 py-3.5 shadow-soft animate-fade-in"
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/60">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt=""
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <User className="h-3.5 w-3.5 text-muted-foreground/50" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium truncate">
                {user.full_name || user.id.slice(0, 8)}
              </p>
              <p className="text-[11px] text-muted-foreground/60">
                Joined {formatDate(user.created_at)}
              </p>
            </div>

            <Badge variant="outline" className="text-[11px]">
              {user.role}
            </Badge>

            <AdminRoleSelect userId={user.id} currentRole={user.role} />
          </div>
        ))}
      </div>
    </div>
  );
}
