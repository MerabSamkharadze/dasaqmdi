import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  verification: {
    google: "zwPV8PnoBhuJvXbbZPjEPmRp1aUkuzfz4rUsE7WJOkk",
  },
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
