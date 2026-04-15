import type { Metadata } from "next";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.dasaqmdi.com"),
  title: {
    default: "დასაქმდი — ვაკანსიები და სამუშაოს ძიება საქართველოში | dasaqmdi.com",
    template: "%s | დასაქმდი — ვაკანსიები საქართველოში",
  },
  description:
    "იპოვე სამუშაო საქართველოში. უახლესი ვაკანსიები IT, მარკეტინგი, ფინანსები, კვება, ლოჯისტიკა და სხვა სფეროებში. AI-ით ვაკანსიების შექმნა, Smart Matching და Telegram შეტყობინებები.",
  openGraph: {
    siteName: "dasaqmdi.com",
    locale: "ka_GE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
