const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dasaqmdi.com";

export const siteConfig = {
  url: rawSiteUrl,
  domain: new URL(rawSiteUrl).hostname.replace(/^www\./, ""),
  brand: {
    name: "დასაქმდი",
    nameEn: "Dasaqmdi",
    display: "dasaqmdi.com",
  },
  social: {
    telegramBot: process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || "https://t.me/dasaqmdi_bot",
    telegramBotHandle: "@dasaqmdi_bot",
  },
  email: {
    from: process.env.RESEND_FROM_ADDRESS || "dasaqmdi.com <digest@dasaqmdi.com>",
    noreply: process.env.RESEND_NOREPLY_ADDRESS || "dasaqmdi.com <noreply@dasaqmdi.com>",
  },
  og: {
    accentColor: "#C7AE6A",
    bgColor: "#160905",
    textColor: "#fbf7e1",
    mutedColor: "#8a827b",
    cardBg: "#362828",
  },
} as const;

export type SiteConfig = typeof siteConfig;
