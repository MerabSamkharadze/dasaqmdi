"use client";

import { useTranslations } from "next-intl";
import type { UserRole } from "@/lib/types/enums";

export function RoleLabel({ role }: { role: UserRole }) {
  const t = useTranslations("dashboard");

  return (
    <p className="text-[11px] text-muted-foreground/60 mt-0.5">
      {t(`roles.${role}`)}
    </p>
  );
}
