import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const runtime = "edge";
export const alt = "Job posting on dasakmdi.com";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: job } = await supabase
    .from("jobs")
    .select("title, city, job_type, salary_min, salary_max, salary_currency, company:companies!inner(name)")
    .eq("id", params.id)
    .single();

  if (!job) {
    return new ImageResponse(
      (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", background: "#0f172a", color: "#f8fafc", fontSize: 48 }}>
          dasakmdi.com
        </div>
      ),
      size
    );
  }

  const companyName = (job.company as unknown as { name: string }).name;
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
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#f8fafc",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ fontSize: 22, color: "#818cf8", fontWeight: 600 }}>
            {companyName}
          </div>
          <div style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.2, maxWidth: "900px" }}>
            {job.title}
          </div>
          <div style={{ display: "flex", gap: "24px", fontSize: 22, color: "#94a3b8", marginTop: "8px" }}>
            {job.city && <span>{job.city}</span>}
            <span>{job.job_type}</span>
            {salary && <span>{salary}</span>}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ fontSize: 28, fontWeight: 600, color: "#818cf8" }}>
            dasakmdi.com
          </div>
          <div style={{ fontSize: 18, color: "#64748b" }}>
            დასაქმდი — ვაკანსიები საქართველოში
          </div>
        </div>
      </div>
    ),
    size
  );
}
