import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { LayoutDashboard } from "lucide-react";

export async function AuthButton() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const t = await getTranslations("nav");

  return user ? (
    <Button asChild size="sm" variant="ghost" className="gap-1.5 pl-2">
      <Link href="/dashboard">
        <LayoutDashboard className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{t("dashboard")}</span>
      </Link>
    </Button>
  ) : (
    <div className="flex gap-1.5 pl-1.5">
      <Button asChild size="sm" variant="ghost">
        <Link href="/auth/login">{t("login")}</Link>
      </Button>
      <Button asChild size="sm" variant="default">
        <Link href="/auth/sign-up">{t("signUp")}</Link>
      </Button>
    </div>
  );
}
