import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { HeaderClient } from "@/components/layout/header-client";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

export async function Header() {
  const t = await getTranslations("nav");

  const navLinks = [
    { href: "/jobs", label: t("jobs") },
    { href: "/companies", label: t("companies") },
    { href: "/salaries", label: t("salaries") },
  ];

  return (
    <HeaderClient navLinks={navLinks}>
      <LanguageSwitcher />
      <ThemeSwitcher />
      <div className="ml-1.5 pl-1.5 border-l border-border/40">
        <Suspense>
          <AuthButton />
        </Suspense>
      </div>
    </HeaderClient>
  );
}
