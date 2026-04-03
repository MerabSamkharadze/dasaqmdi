import { AuthButton } from "@/components/auth-button";
import { Logo } from "@/components/brand/logo";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Suspense } from "react";

export async function Header() {
  const t = await getTranslations("nav");

  const navLinks = [
    { href: "/jobs", label: t("jobs") },
    { href: "/companies", label: t("companies") },
    { href: "/salaries", label: t("salaries") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[hsl(195_70%_65%/0.85)] shadow-[0_1px_3px_rgb(0_0_0/0.08)] dark:bg-background/80 dark:border-b dark:border-border/30 dark:shadow-none backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Logo + Nav */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="transition-opacity duration-200 hover:opacity-80"
          >
            <Logo variant="header" />
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-2.5 py-1.5 text-[13px] text-white/80 hover:text-white dark:text-muted-foreground dark:hover:text-foreground transition-colors duration-200 rounded-lg hover:bg-white/10 dark:hover:bg-muted/50"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5 [&_button]:text-white/70 [&_button]:hover:text-white [&_button]:hover:bg-white/10 dark:[&_button]:text-muted-foreground/70 dark:[&_button]:hover:text-foreground dark:[&_button]:hover:bg-muted/50">
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
