import type { Metadata } from "next";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "დასაქმდი — სამუშაოს ძიება საქართველოში",
    template: "%s | დასაქმდი",
  },
  description:
    "იპოვე შენი საოცნებო სამუშაო საქართველოში. ათასობით ვაკანსია საუკეთესო დამსაქმებლებისგან.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
