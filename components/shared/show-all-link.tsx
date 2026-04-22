"use client";

import { useRouter } from "nextjs-toploader/app";
import { useTransition } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { ChocoDrink } from "@/components/shared/loaders/choco-drink";

type ShowAllLinkProps = {
  href?: string;
};

export function ShowAllLink({ href = "/?all=1" }: ShowAllLinkProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("home");

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    startTransition(() => {
      router.push(href);
    });
  }

  return (
    <>
      <a
        href={href}
        onClick={handleClick}
        className="text-[11px] text-primary/60 hover:text-primary transition-colors"
      >
        {t("showAll")}
      </a>

      {isPending && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <ChocoDrink />
        </div>,
        document.body
      )}
    </>
  );
}
