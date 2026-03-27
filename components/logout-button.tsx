"use client";

import { logoutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";

export function LogoutButton() {
  const t = useTranslations("nav");

  return (
    <form action={logoutAction}>
      <Button type="submit" variant="ghost" size="sm" className="gap-2 text-muted-foreground/70 hover:text-foreground">
        <LogOut className="h-3.5 w-3.5" />
        <span className="hidden sm:inline text-[13px]">{t("logout")}</span>
      </Button>
    </form>
  );
}
