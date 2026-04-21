"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTransition } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GlobeIcon } from "@/components/brand/nav-icons";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  function switchLocale(value: string) {
    if (value === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: value });
      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center h-8 gap-1.5 rounded-xl px-2 text-xs font-medium text-muted-foreground/70 hover:bg-accent hover:text-accent-foreground transition-all duration-200"
        >
          <GlobeIcon className="h-4 w-4" />
          {locale === "ka" ? "ქარ" : "EN"}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-content" align="start">
        <DropdownMenuRadioGroup value={locale} onValueChange={switchLocale}>
          <DropdownMenuRadioItem className="flex gap-2 text-[13px]" value="ka">
            <span>ქართული</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem className="flex gap-2 text-[13px]" value="en">
            <span>English</span>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
