import { AuthButton } from "@/components/auth-button";
import { Logo } from "@/components/brand/logo";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Suspense } from "react";

export async function Header() {
  const t = await getTranslations("nav");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="transition-opacity duration-200 hover:opacity-80"
          >
            <Logo />
          </Link>
          <nav className="hidden sm:flex items-center gap-6">
            <Link
              href="/jobs"
              className="text-[13px] font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              {t("jobs")}
            </Link>
            <Link
              href="/companies"
              className="text-[13px] font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              {t("companies")}
            </Link>
          </nav>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5">
          <LanguageSwitcher />
          <ThemeSwitcher />
          <Suspense>
            <AuthButton />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
