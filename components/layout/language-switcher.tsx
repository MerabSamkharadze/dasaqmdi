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

    const pathWithoutLocale = pathname.replace(/^\/(ka|en)/, "") || "/";
    const newPath =
      nextLocale === "ka" ? pathWithoutLocale : `/en${pathWithoutLocale}`;

    router.push(newPath);
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 rounded-xl text-xs font-medium text-muted-foreground/70"
      onClick={switchLocale}
    >
      {locale === "ka" ? "EN" : "ქარ"}
    </Button>
  );
}
