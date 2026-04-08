import { getTranslations } from "next-intl/server";
import { Send } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export async function Footer() {
  const t = await getTranslations("nav");

  return (
    <footer className="w-full border-t border-border/30 bg-card/30 mt-auto">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {/* Column 1: Brand */}
          <div className="space-y-3">
            <Logo />
            <p className="text-sm text-muted-foreground/60 leading-relaxed max-w-[240px]">
              {t("footerTagline")}
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-[13px] font-semibold text-foreground">
              {t("footerQuickLinks")}
            </h4>
            <nav className="flex flex-col gap-2">
              <Link href="/jobs" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                {t("jobs")}
              </Link>
              <Link href="/companies" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                {t("companies")}
              </Link>
              <Link href="/salaries" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                {t("salaries")}
              </Link>
              <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                {t("pricing")}
              </Link>
            </nav>
          </div>

          {/* Column 3: Resources */}
          <div className="space-y-3">
            <h4 className="text-[13px] font-semibold text-foreground">
              {t("footerResources")}
            </h4>
            <nav className="flex flex-col gap-2">
              <a
                href="https://t.me/dasaqmdi_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                <Send className="h-3.5 w-3.5" />
                {t("telegramSubscribe")}
              </a>
              <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                {t("login")}
              </Link>
              <Link href="/auth/sign-up" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                {t("signUp")}
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-border/20">
          <p className="text-xs text-muted-foreground/40 tracking-normal">
            &copy; {new Date().getFullYear()} დასაქმდი &mdash; dasaqmdi.com
          </p>
        </div>
      </div>
    </footer>
  );
}
