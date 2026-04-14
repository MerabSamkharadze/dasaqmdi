import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";
import { localized } from "@/lib/utils";

export const runtime = "edge";
export const alt = "Job posting on dasaqmdi.com";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: { id: string; locale: string };
}) {
  // Load Georgian font
  const notoGeorgian = await fetch(
    new URL("https://fonts.gstatic.com/s/notosansgeorgian/v44/PlIaFke5O6RzLfvNNVSitxkr76PRHBC4Ytyq-Gof7PUs4S7zWn-8YDB09HFNdpvnzFj-f5WK0OQV.woff2")
  ).then((res) => res.arrayBuffer());

  const locale = params.locale ?? "ka";
  const supabase = createClient();
  const { data: job } = await supabase
    .from("jobs")
    .select("title, title_ka, city, job_type, salary_min, salary_max, salary_currency, company:companies!inner(name, name_ka)")
    .eq("id", params.id)
    .single();

  const fontConfig = {
    fonts: [
      {
        name: "Noto Sans Georgian",
        data: notoGeorgian,
        style: "normal" as const,
        weight: 500 as const,
      },
    ],
  };

  if (!job) {
    return new ImageResponse(
      (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", background: "#1a1614", fontFamily: "Noto Sans Georgian, sans-serif" }}>
          <span style={{ fontSize: 48, color: "#C7AE6A", fontWeight: 700 }}>dasaqmdi.com</span>
        </div>
      ),
      { ...size, ...fontConfig }
    );
  }

  const companyObj = job.company as unknown as { name: string; name_ka: string | null };
  const companyName = localized(companyObj, "name", locale);
  const jobTitle = localized(job, "title", locale);
  const salary =
    job.salary_min && job.salary_max
      ? `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} ${job.salary_currency}`
      : job.salary_min
        ? `${job.salary_min.toLocaleString()}+ ${job.salary_currency}`
        : null;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "60px 80px",
          background: "linear-gradient(135deg, #1a1614 0%, #252220 100%)",
          color: "#fbf7e1",
          fontFamily: "Noto Sans Georgian, sans-serif",
          position: "relative",
        }}
      >
        {/* Decorative */}
        <div style={{ position: "absolute", top: -40, right: -40, width: 250, height: 250, borderRadius: "50%", background: "rgba(199,174,106,0.04)" }} />

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ fontSize: 22, color: "#C7AE6A", fontWeight: 600 }}>
            {companyName}
          </div>
          <div style={{ fontSize: 46, fontWeight: 700, lineHeight: 1.2, maxWidth: "900px" }}>
            {jobTitle}
          </div>
          <div style={{ display: "flex", gap: "24px", fontSize: 20, color: "#94a3b8", marginTop: "8px" }}>
            {job.city && <span>📍 {job.city}</span>}
            <span>💼 {job.job_type}</span>
            {salary && <span>💰 {salary}</span>}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <svg width="36" height="36" viewBox="0 0 120 120" fill="none">
              <path d="M60 6C30 4 8 26 6 56c-2 32 22 54 52 58 32 4 56-18 58-48C118 34 94 8 60 6Z" fill="#362828" />
              <path d="M60 24 L84 42 L78 80 L42 80 L36 48 Z" fill="none" stroke="#fbf7e1" strokeWidth="2.5" strokeLinejoin="round" />
              <path d="M53 48 L53 66 L67 57 Z" fill="#C7AE6A" />
            </svg>
            <span style={{ fontSize: 24, fontWeight: 700, color: "#C7AE6A" }}>dasaqmdi.com</span>
          </div>
          <div style={{ fontSize: 16, color: "#6b6560" }}>
            ვაკანსიები საქართველოში
          </div>
        </div>
      </div>
    ),
    { ...size, ...fontConfig }
  );
}
