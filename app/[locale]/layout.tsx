import { Inter, Noto_Sans_Georgian, Playfair_Display } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import NextTopLoader from "nextjs-toploader";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { AuthModalProvider } from "@/lib/hooks/use-auth-modal";
import { AuthModal } from "@/components/shared/auth-modal";
import { FacebookPixel } from "@/components/tracking/facebook-pixel";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Locale } from "@/lib/types/enums";
import { siteConfig } from "@/lib/config";
import { organizationJsonLd, websiteJsonLd } from "@/lib/structured-data";

const inter = Inter({
  variable: "--font-inter",
  display: "swap",
  subsets: ["latin", "latin-ext"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  display: "swap",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
        className={`${inter.variable} ${notoGeorgian.variable} ${playfair.variable} font-sans antialiased`}
      >
        {/* L4 FIX: Skip to content link for keyboard/screen-reader users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg"
        >
          {locale === "ka" ? "კონტენტზე გადასვლა" : "Skip to content"}
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <FacebookPixel />
        <SpeedInsights debug={false} />
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NextTopLoader
              color={siteConfig.og.accentColor}
              height={2}
              showSpinner={false}
              shadow={`0 0 10px ${siteConfig.og.accentColor}4D, 0 0 5px ${siteConfig.og.accentColor}33`}
            />
            <AuthModalProvider>
              {children}
              <AuthModal />
            </AuthModalProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}