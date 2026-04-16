import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { siteConfig } from "@/lib/config";

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
            <nav aria-label="Footer links" className="flex flex-col gap-2">
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
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                {t("about")}
              </Link>
            </nav>
          </div>

          {/* Column 3: Resources */}
          <div className="space-y-3">
            <h4 className="text-[13px] font-semibold text-foreground">
              {t("footerResources")}
            </h4>
            <nav aria-label="Resources" className="flex flex-col gap-2">
              <a
                href={siteConfig.social.telegramBot}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-lg bg-[#229ED9]/10 px-3 py-2 text-sm font-medium text-[#229ED9] transition-all duration-200 hover:bg-[#229ED9] hover:text-white hover:shadow-md"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
                  <path
                    d="M22.05 1.577c-.393-.016-.784.08-1.117.235-2.093.94-17.648 7.583-19.77 8.5-.39.168-.883.44-.883 1.003 0 .385.22.694.567.867l4.948 1.993 1.79 5.86c.164.48.546.68.96.68.34 0 .625-.14.85-.37l2.56-2.37 4.987 3.74c.38.285.755.43 1.146.43.82 0 1.36-.58 1.5-1.36L23.85 3.147c.2-1.02-.43-1.57-1.3-1.57h-.5zM9.33 13.78l-.81 3.58-1.5-5.31 11.76-7.26L9.33 13.78z"
                    className="fill-[#229ED9] transition-colors duration-200 group-hover:fill-white"
                  />
                </svg>
                {t("telegramSubscribe")}
              </a>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-border/20">
          <p className="text-xs text-muted-foreground/40 tracking-normal">
            &copy; {new Date().getFullYear()} {siteConfig.brand.name} &mdash; {siteConfig.domain}
          </p>
        </div>
      </div>
    </footer>
  );
}
