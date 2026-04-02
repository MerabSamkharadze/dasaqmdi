import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("errors");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center gap-6 max-w-md text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/60">
          <FileQuestion className="h-5 w-5 text-muted-foreground/50" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-base font-semibold tracking-tight text-foreground">
            {t("notFound")}
          </h1>
          <p className="text-[13px] text-muted-foreground/70 leading-relaxed">
            {t("notFoundDescription")}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/">{t("goHome")}</Link>
        </Button>
      </div>
    </div>
  );
}
