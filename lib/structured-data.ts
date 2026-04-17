import { siteConfig } from "@/lib/config";

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.brand.name,
  alternateName: siteConfig.brand.nameEn,
  url: siteConfig.url,
  logo: `${siteConfig.url}/logo.svg`,
  description:
    "იპოვე სამუშაო საქართველოში. დასაქმების პლატფორმა — ვაკანსიები, AI Smart Matching, Telegram შეტყობინებები.",
  sameAs: [siteConfig.social.telegramBot],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: ["Georgian", "English"],
  },
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.domain,
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
