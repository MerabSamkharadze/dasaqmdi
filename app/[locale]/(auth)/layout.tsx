import { getTranslations } from "next-intl/server";
import { AuthSearchBar } from "@/components/auth/auth-search-bar";
import { Logo } from "@/components/brand/logo";
import { LottieAnimation } from "@/components/shared/lottie-animation";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("home");
  const tJobs = await getTranslations("jobs");

  return (
    <div className="flex min-h-svh w-full">
      {/* ── Left branding panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col items-center justify-center bg-secondary relative overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-16 -left-20 h-72 w-72 rounded-full bg-white/[0.03]" />
        <div className="absolute bottom-24 -right-24 h-96 w-96 rounded-full bg-white/[0.03]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-white/[0.015]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-8 text-center px-12 max-w-md">
          <Logo variant="icon" className="[&_svg]:w-16 [&_svg]:h-16" />

          <div>
            <h1 className="text-3xl font-bold text-secondary-foreground tracking-tight leading-[1.15]">
              {t("title")}{" "}
              <span className="text-[#f5ebb4]">{t("titleAccent")}</span>
            </h1>
            <p className="mt-4 text-sm text-secondary-foreground/50 leading-relaxed">
              {t("subtitle")}
            </p>
          </div>

          {/* Chatbot animation */}
          <LottieAnimation
            src="/animations/Live chatbot.json"
            className="w-48 h-48 -mb-4"
          />

          {/* Quick job search */}
          <AuthSearchBar
            placeholder={t("searchPlaceholder")}
            buttonLabel={t("heroSearch")}
            locationPlaceholder={tJobs("filters.location")}
          />
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex w-full lg:w-[55%] flex-col items-center justify-center px-6 py-12 sm:px-12 lg:px-20">
        <div className="w-full max-w-[440px]">{children}</div>
      </div>
    </div>
  );
}
