import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `დასაქმდი — ვაკანსიები და სამუშაოს ძიება საქართველოში | ${siteConfig.domain}`,
    template: "%s | დასაქმდი — ვაკანსიები საქართველოში",
  },
  description:
    "იპოვე სამუშაო საქართველოში. უახლესი ვაკანსიები IT, მარკეტინგი, ფინანსები, კვება, ლოჯისტიკა და სხვა სფეროებში. AI-ით ვაკანსიების შექმნა, Smart Matching და Telegram შეტყობინებები.",
  openGraph: {
    siteName: siteConfig.domain,
    locale: "ka_GE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Structured data: Organization + WebSite with SearchAction
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "დასაქმდი",
  alternateName: "dasaqmdi",
  url: siteConfig.url,
  logo: `${siteConfig.url}/logo.svg`,
  description: "იპოვე სამუშაო საქართველოში. დასაქმების პლატფორმა — ვაკანსიები, AI Smart Matching, Telegram შეტყობინებები.",
  sameAs: [
    siteConfig.social.telegramBot,
    `https://www.facebook.com/profile.php?id=61577498aborti`,
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: ["Georgian", "English"],
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "dasaqmdi.com",
  url: siteConfig.url,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteConfig.url}/jobs?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
  inLanguage: ["ka", "en"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      {children}
    </>
  );
}
