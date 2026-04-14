import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "dasaqmdi.com — ვაკანსიები საქართველოში";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
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
          fontFamily: "sans-serif",
        }}
      >
        {/* Logo text */}
        <div style={{ fontSize: 64, fontWeight: 800, color: "#C7AE6A", letterSpacing: "2px", marginBottom: "20px" }}>
          dasaqmdi.com
        </div>

        {/* Tagline */}
        <div style={{ fontSize: 28, color: "#e2e0d5", fontWeight: 500, marginBottom: "40px" }}>
          ვაკანსიები საქართველოში
        </div>

        {/* Features row */}
        <div style={{ display: "flex", gap: "40px", fontSize: 18, color: "#94a3b8" }}>
          <span>💼 ვაკანსიები</span>
          <span>🏢 კომპანიები</span>
          <span>💰 ხელფასები</span>
          <span>🤖 AI Draft</span>
        </div>
      </div>
    ),
    size
  );
}
