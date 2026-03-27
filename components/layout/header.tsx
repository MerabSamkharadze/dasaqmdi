import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Suspense } from "react";

export async function Header() {
  const t = await getTranslations("nav");

  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
      <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
        <div className="flex gap-5 items-center font-semibold">
          <Link href="/" className="text-lg">
            დასაქმდი
          </Link>
          <Link
            href="/jobs"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("jobs")}
          </Link>
          <Link
            href="/companies"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("companies")}
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeSwitcher />
          <Suspense>
            <AuthButton />
          </Suspense>
        </div>
      </div>
    </nav>
  );
}
