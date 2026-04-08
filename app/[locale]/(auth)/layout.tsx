import { getTranslations } from "next-intl/server";
import { AuthSearchBar } from "@/components/auth/auth-search-bar";

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
      <div className="hidden lg:flex lg:w-[45%] flex-col items-center justify-center bg-primary relative overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-16 -left-20 h-72 w-72 rounded-full bg-white/[0.04]" />
        <div className="absolute bottom-24 -right-24 h-96 w-96 rounded-full bg-white/[0.04]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-white/[0.02]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-8 text-center px-12 max-w-md">
          <svg
            width="56"
            height="56"
            viewBox="0 0 28 28"
            fill="none"
            aria-hidden="true"
          >
            <rect
              x="3" y="9" width="22" height="15" rx="3.5"
              stroke="white" strokeWidth="1.5" strokeOpacity="0.85"
            />
            <path
              d="M10 9V7a4 4 0 0 1 8 0v2"
              stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.85"
            />
            <path
              d="M9.5 17l3 3 6.5-7"
              stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>

          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight leading-[1.15]">
              {t("title")}{" "}
              <span className="text-white/80">{t("titleAccent")}</span>
            </h1>
            <p className="mt-4 text-sm text-white/50 leading-relaxed">
              {t("subtitle")}
            </p>
          </div>

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
