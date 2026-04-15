import { ImageResponse } from "next/og";
import { loadNotoGeorgian, georgianFontConfig } from "@/lib/og-fonts";
import { siteConfig } from "@/lib/config";

export const runtime = "edge";
export const alt = `${siteConfig.domain} — ვაკანსიები საქართველოში`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function HomeOGImage({
  params,
}: {
  params: { locale: string };
}) {
  const notoGeorgian = await loadNotoGeorgian();
  const fontConfig = georgianFontConfig(notoGeorgian);
  const isKa = params.locale === "ka";

  const headline = isKa
    ? "იპოვე შენი შემდეგი სამუშაო"
    : "Find your next job";
  const subheadline = isKa
    ? "ვაკანსიები საქართველოში — ყოველდღე განახლებული"
    : "Jobs in Georgia — updated daily";
  const tagline = isKa
    ? "AI Smart Matching · Telegram შეტყობინებები · უფასო რეგისტრაცია"
    : "AI Smart Matching · Telegram alerts · Free signup";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          width: "100%",
          height: "100%",
          padding: "80px 100px",
          background:
            "linear-gradient(135deg, #160905 0%, #1f120c 50%, #2a1a12 100%)",
          color: "#fbf7e1",
          fontFamily: "Noto Sans Georgian, sans-serif",
          position: "relative",
        }}
      >
        {/* Decorative orbs */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "rgba(199,174,106,0.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: 200,
            width: 280,
            height: 280,
            borderRadius: "50%",
            background: "rgba(199,174,106,0.04)",
          }}
        />

        {/* Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            marginBottom: 48,
          }}
        >
          <svg width="44" height="44" viewBox="0 0 120 120" fill="none">
            <path
              d="M60 6C30 4 8 26 6 56c-2 32 22 54 52 58 32 4 56-18 58-48C118 34 94 8 60 6Z"
              fill="#362828"
            />
            <path
              d="M60 24 L84 42 L78 80 L42 80 L36 48 Z"
              fill="none"
              stroke="#fbf7e1"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <path d="M53 48 L53 66 L67 57 Z" fill="#C7AE6A" />
          </svg>
          <span style={{ fontSize: 30, fontWeight: 700, color: "#C7AE6A" }}>
            {siteConfig.domain}
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 78,
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
            maxWidth: 900,
            marginBottom: 20,
          }}
        >
          {headline}
        </div>

        {/* Subheadline */}
        <div
          style={{
            fontSize: 32,
            fontWeight: 500,
            color: "#cbbfa8",
            marginBottom: 40,
          }}
        >
          {subheadline}
        </div>

        {/* Tagline pill */}
        <div
          style={{
            display: "flex",
            padding: "12px 24px",
            borderRadius: 999,
            background: "rgba(199,174,106,0.12)",
            border: "1px solid rgba(199,174,106,0.25)",
            color: "#C7AE6A",
            fontSize: 20,
            fontWeight: 500,
          }}
        >
          {tagline}
        </div>
      </div>
    ),
    { ...size, ...fontConfig },
  );
}
