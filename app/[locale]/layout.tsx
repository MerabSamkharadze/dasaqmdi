import { Inter, Noto_Sans_Georgian } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import NextTopLoader from "nextjs-toploader";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/lib/types/enums";

const inter = Inter({
  variable: "--font-inter",
  display: "swap",
  subsets: ["latin", "latin-ext"],
});

const notoGeorgian = Noto_Sans_Georgian({
  variable: "--font-noto-georgian",
  display: "swap",
  subsets: ["georgian"],
  weight: ["300", "400", "500", "600", "700"],
});

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${inter.variable} ${notoGeorgian.variable} font-sans antialiased`}
      >
        {/* L4 FIX: Skip to content link for keyboard/screen-reader users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg"
        >
          {locale === "ka" ? "კონტენტზე გადასვლა" : "Skip to content"}
        </a>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            enableColorScheme
          >
            <NextTopLoader
              color="hsl(239 84% 67%)"
              height={2}
              showSpinner={false}
              shadow="0 0 10px hsl(239 84% 67% / 0.3), 0 0 5px hsl(239 84% 67% / 0.2)"
            />
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}