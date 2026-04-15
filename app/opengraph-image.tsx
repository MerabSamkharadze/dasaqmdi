import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/config";
import { loadNotoGeorgian } from "@/lib/og-fonts";

export const runtime = "edge";
export const alt = `${siteConfig.domain} — ვაკანსიები საქართველოში`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  const notoGeorgian = await loadNotoGeorgian();

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(145deg, #1a1614 0%, #252220 50%, #1a1614 100%)",
          fontFamily: "Noto Sans Georgian, sans-serif",
          position: "relative",
        }}
      >
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -60, right: -60, width: 300, height: 300, borderRadius: "50%", background: "rgba(199,174,106,0.03)" }} />
        <div style={{ position: "absolute", bottom: -80, left: -80, width: 400, height: 400, borderRadius: "50%", background: "rgba(199,174,106,0.02)" }} />

        {/* Logo SVG inline */}
        <div style={{ display: "flex", marginBottom: "24px" }}>
          <svg
            width="80"
            height="80"
            viewBox="0 0 120 120"
            fill="none"
          >
            <path
              d="M60 6C30 4 8 26 6 56c-2 32 22 54 52 58 32 4 56-18 58-48C118 34 94 8 60 6Z"
              fill="#362828"
            />
            <path
              d="M60 24 L84 42 L78 80 L42 80 L36 48 Z"
              fill="none"
              stroke="#fbf7e1"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path d="M60 24 L60 54" stroke="#fbf7e1" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M36 48 L84 42" stroke="#fbf7e1" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M60 54 L42 80" stroke="#fbf7e1" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M60 54 L78 80" stroke="#fbf7e1" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M53 48 L53 66 L67 57 Z" fill="#C7AE6A" />
          </svg>
        </div>

        {/* Brand name */}
        <div style={{ fontSize: 56, fontWeight: 800, color: "#C7AE6A", letterSpacing: "2px", marginBottom: "16px" }}>
          {siteConfig.domain}
        </div>

        {/* Tagline — Georgian */}
        <div style={{ fontSize: 26, color: "#e2e0d5", fontWeight: 500, marginBottom: "40px" }}>
          ვაკანსიები საქართველოში
        </div>

        {/* Features */}
        <div style={{ display: "flex", gap: "32px", fontSize: 17, color: "#94a3b8" }}>
          <span>💼 ვაკანსიები</span>
          <span>🏢 კომპანიები</span>
          <span>💰 ხელფასები</span>
          <span>📱 Telegram</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Noto Sans Georgian",
          data: notoGeorgian,
          style: "normal",
          weight: 500,
        },
      ],
    }
  );
}
