import type { Metadata } from "next";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.dasaqmdi.com"),
  title: {
    default: "დასაქმდი — სამუშაოს ძიება საქართველოში",
    template: "%s | დასაქმდი",
  },
  description:
    "იპოვე შენი საოცნებო სამუშაო საქართველოში. ათასობით ვაკანსია საუკეთესო დამსაქმებლებისგან.",
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
