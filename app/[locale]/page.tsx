import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Suspense } from "react";

export default function HomePage() {
  const t = useTranslations();

  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href="/">დასაქმდი</Link>
              <Link
                href="/jobs"
                className="text-muted-foreground hover:text-foreground"
              >
                {t("nav.jobs")}
              </Link>
              <Link
                href="/companies"
                className="text-muted-foreground hover:text-foreground"
              >
                {t("nav.companies")}
              </Link>
            </div>
            <Suspense>
              <AuthButton />
            </Suspense>
          </div>
        </nav>

        <div className="flex-1 flex flex-col gap-16 max-w-5xl p-5 w-full">
          <section className="flex flex-col items-center gap-6 text-center py-16">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              {t("home.title")}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              {t("home.subtitle")}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-6">
              {t("home.browseByCategory")}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                "it-software",
                "sales-marketing",
                "administration",
                "finance",
                "hospitality",
                "construction",
              ].map((slug) => (
                <Link
                  key={slug}
                  href={`/jobs?category=${slug}`}
                  className="p-4 rounded-lg border hover:bg-accent transition-colors text-center"
                >
                  {t(`categories.${slug}`)}
                </Link>
              ))}
            </div>
          </section>
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>
            &copy; {new Date().getFullYear()} დასაქმდი — dasakmdi.com
          </p>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}
