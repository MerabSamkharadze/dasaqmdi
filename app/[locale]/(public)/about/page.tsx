import { getTranslations, getLocale } from "next-intl/server";
import { buildAlternates } from "@/lib/seo";
import { siteConfig } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";
import { HeroIllustration } from "@/components/shared/hero-illustration";
import {
  Sparkles,
  Zap,
  Shield,
  Globe,
  Send,
  Users,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations("about");
  const isKa = params.locale === "ka";
  const alternates = buildAlternates("/about", params.locale);

  return {
    title: t("title"),
    description: t("subtitle"),
    alternates,
    openGraph: {
      title: t("title"),
      description: t("subtitle"),
      type: "website",
      url: alternates.canonical as string,
      siteName: siteConfig.domain,
      locale: isKa ? "ka_GE" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("subtitle"),
    },
  };
}

const FEATURES = [
  { icon: Sparkles, key: "aiMatching" },
  { icon: Zap, key: "smartAlerts" },
  { icon: Shield, key: "verified" },
  { icon: Globe, key: "bilingual" },
  { icon: Send, key: "telegram" },
  { icon: Users, key: "freeForSeekers" },
] as const;

export default async function AboutPage() {
  const t = await getTranslations("about");
  const locale = await getLocale();

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  return (
    <div className="flex flex-col gap-12">
      {/* Hero */}
      <section className="flex flex-col-reverse md:flex-row items-center gap-8 md:gap-14">
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-[1.15]">
            {t("heroTitle")}{" "}
            <span className="text-gradient">{t("heroAccent")}</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg mx-auto md:mx-0">
            {t("subtitle")}
          </p>
          <div className="flex flex-wrap gap-3 mt-6 justify-center md:justify-start">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200"
            >
              {t("browseJobs")}
            </Link>
            {!isLoggedIn && (
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted/50 transition-all duration-200"
              >
                {t("createAccount")}
              </Link>
            )}
          </div>
        </div>
        <div className="w-full max-w-[300px] sm:max-w-[360px] md:max-w-[420px] shrink-0 rounded-2xl overflow-hidden">
          <HeroIllustration src="/illustrations/promo.svg" />
        </div>
      </section>

      {/* Features grid */}
      <section>
        <h2 className="text-xl font-semibold tracking-tight text-center mb-8">
          {t("whyUs")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, key }, i) => (
            <div
              key={key}
              className="rounded-xl border border-border/60 bg-card p-5 shadow-soft animate-fade-in hover:shadow-gold-glow transition-all duration-200"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-3">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-[15px] font-semibold tracking-tight mb-1.5">
                {t(`features.${key}.title`)}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(`features.${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="rounded-xl border border-primary/20 bg-primary/5 p-8 sm:p-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {(["jobs", "companies", "categories", "languages"] as const).map(
            (key) => (
              <div key={key}>
                <p className="text-2xl sm:text-3xl font-bold text-primary">
                  {t(`stats.${key}.value`)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t(`stats.${key}.label`)}
                </p>
              </div>
            ),
          )}
        </div>
      </section>

      {/* For employers / seekers */}
      <section className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-soft">
          <h3 className="text-base font-semibold tracking-tight mb-3">
            {t("forSeekers.title")}
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[1, 2, 3, 4].map((n) => (
              <li key={n} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                {t(`forSeekers.point${n}`)}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-soft">
          <h3 className="text-base font-semibold tracking-tight mb-3">
            {t("forEmployers.title")}
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[1, 2, 3, 4].map((n) => (
              <li key={n} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                {t(`forEmployers.point${n}`)}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Telegram CTA */}
      <a
        href={siteConfig.social.telegramBot}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-card py-5 text-sm text-muted-foreground hover:text-primary hover:border-primary/30 transition-all duration-200"
      >
        <Send className="h-4 w-4" />
        {t("telegramCta")}
      </a>
    </div>
  );
}
