import { AuthButton } from "@/components/auth-button";
import { Logo } from "@/components/brand/logo";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Suspense } from "react";
import { Briefcase, Building2, BarChart3 } from "lucide-react";

const NAV_ICONS: Record<string, React.ElementType> = {
  "/jobs": Briefcase,
  "/companies": Building2,
  "/salaries": BarChart3,
};

export async function Header() {
  const t = await getTranslations("nav");

  const navLinks = [
    { href: "/jobs", label: t("jobs") },
    { href: "/companies", label: t("companies") },
    { href: "/salaries", label: t("salaries") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl transition-[background-color,border-color] duration-300">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="transition-opacity duration-200 hover:opacity-80"
          >
            <Logo />
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = NAV_ICONS[link.href];
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground"
                >
                  {Icon && (
                    <Icon className="h-3.5 w-3.5 opacity-50 transition-opacity duration-200 group-hover:opacity-80" />
                  )}
                  {link.label}
                </Link>
              );
            })}
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
