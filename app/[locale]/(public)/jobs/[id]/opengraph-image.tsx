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
  const locale = params.locale ?? "ka";
  const supabase = createClient();
  const { data: job } = await supabase
    .from("jobs")
    .select("title, title_ka, city, job_type, salary_min, salary_max, salary_currency, company:companies!inner(name, name_ka)")
    .eq("id", params.id)
    .single();

  if (!job) {
    return new ImageResponse(
      (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", background: "#362828", color: "#fbf7e1", fontSize: 48 }}>
          dasaqmdi.com
        </div>
      ),
      size
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
          background: "linear-gradient(135deg, #160905 0%, #362828 100%)",
          color: "#fbf7e1",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ fontSize: 22, color: "#C7AE6A", fontWeight: 600 }}>
            {companyName}
          </div>
          <div style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.2, maxWidth: "900px" }}>
            {jobTitle}
          </div>
          <div style={{ display: "flex", gap: "24px", fontSize: 22, color: "#725252", marginTop: "8px" }}>
            {job.city && <span>{job.city}</span>}
            <span>{job.job_type}</span>
            {salary && <span>{salary}</span>}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ fontSize: 28, fontWeight: 600, color: "#C7AE6A" }}>
            dasaqmdi.com
          </div>
          <div style={{ fontSize: 18, color: "#725252" }}>
            დასაქმდი — ვაკანსიები საქართველოში
          </div>
        </div>
      </div>
    ),
    size
  );
}
