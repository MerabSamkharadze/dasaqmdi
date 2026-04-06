import { getTranslations } from "next-intl/server";
import { Send } from "lucide-react";

export async function Footer() {
  const t = await getTranslations("nav");

  return (
    <footer className="w-full border-t border-border/30 bg-card/30 py-8 mt-auto">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground/50 tracking-normal">
            &copy; {new Date().getFullYear()} დასაქმდი &mdash; dasaqmdi.com
          </p>
          <a
            href="https://t.me/dasaqmdi_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[12px] text-primary/70 hover:text-primary transition-colors duration-200"
          >
            <Send className="h-3.5 w-3.5" />
            {t("telegramSubscribe")}
          </a>
        </div>
      </div>
    </footer>
  );
}
