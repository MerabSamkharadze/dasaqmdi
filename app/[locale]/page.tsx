import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function HomePage() {
  const t = await getTranslations();

  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col items-center">
        <Header />

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

        <Footer />
      </div>
    </main>
  );
}
