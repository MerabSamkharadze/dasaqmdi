"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale() {
    const nextLocale = locale === "ka" ? "en" : "ka";

    // Strip current locale prefix and prepend new one
    const pathWithoutLocale = pathname.replace(/^\/(ka|en)/, "") || "/";
    const newPath =
      nextLocale === "ka" ? pathWithoutLocale : `/en${pathWithoutLocale}`;

    router.push(newPath);
  }

  return (
    <Button variant="ghost" size="sm" onClick={switchLocale}>
      {locale === "ka" ? "EN" : "ქარ"}
    </Button>
  );
}
