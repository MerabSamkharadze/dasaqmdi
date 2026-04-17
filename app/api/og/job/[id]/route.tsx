import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";
import { localized } from "@/lib/utils";
import { siteConfig } from "@/lib/config";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const size = { width: 1200, height: 630 };

function publicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

function fallbackImage() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", background: "#160905", color: "#C7AE6A", fontSize: 48, fontWeight: 700 }}>
        {siteConfig.domain}
      </div>
    ),
    { ...size },
  );
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const url = new URL(request.url);
  const locale = url.searchParams.get("locale") === "en" ? "en" : "ka";

  type JobRow = {
    title: string;
    title_ka: string | null;
    city: string | null;
    job_type: string;
    salary_min: number | null;
    salary_max: number | null;
    salary_currency: string;
    company: { name: string; name_ka: string | null };
  };

  let job: JobRow | null = null;
  try {
    const supabase = publicClient();
    const { data } = await supabase
      .from("jobs")
      .select(
        "title, title_ka, city, job_type, salary_min, salary_max, salary_currency, company:companies!inner(name, name_ka)",
      )
      .eq("id", params.id)
      .single();
    job = data as unknown as JobRow;
  } catch {
    return fallbackImage();
  }

  if (!job) return fallbackImage();

  const companyName = localized(job.company, "name", locale);
  const jobTitle = localized(job, "title", locale);
  const salary =
    job.salary_min && job.salary_max
      ? `${job.salary_min.toLocaleString()} – ${job.salary_max.toLocaleString()} ${job.salary_currency}`
      : job.salary_min
        ? `${job.salary_min.toLocaleString()}+ ${job.salary_currency}`
        : null;

  const typeLabels: Record<string, string> = {
    "full-time": locale === "ka" ? "სრული განაკვეთი" : "Full-time",
    "part-time": locale === "ka" ? "ნახევარი განაკვეთი" : "Part-time",
    contract: locale === "ka" ? "კონტრაქტი" : "Contract",
    internship: locale === "ka" ? "სტაჟირება" : "Internship",
    remote: locale === "ka" ? "დისტანციური" : "Remote",
  };

  try {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "64px 80px",
            background: "linear-gradient(135deg, #160905 0%, #1f120b 55%, #281b12 100%)",
            color: "#fbf7e1",
          }}
        >
          {/* Company */}
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 64,
                height: 64,
                borderRadius: 16,
                background: "rgba(199,174,106,0.15)",
                border: "1px solid rgba(199,174,106,0.3)",
                fontSize: 28,
                color: "#C7AE6A",
                fontWeight: 700,
              }}
            >
              {companyName.charAt(0).toUpperCase()}
            </div>
            <div style={{ fontSize: 24, color: "#C7AE6A", fontWeight: 600 }}>
              {companyName}
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              lineHeight: 1.15,
              maxWidth: 950,
              letterSpacing: "-0.02em",
            }}
          >
            {jobTitle}
          </div>

          {/* Tags + Footer */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div style={{ display: "flex", gap: "12px", fontSize: 20, color: "#cbbfa8" }}>
              <span
                style={{
                  padding: "8px 18px",
                  borderRadius: 999,
                  background: "rgba(199,174,106,0.12)",
                  border: "1px solid rgba(199,174,106,0.25)",
                }}
              >
                {typeLabels[job.job_type] ?? job.job_type}
              </span>
              {job.city && (
                <span
                  style={{
                    padding: "8px 18px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {job.city}
                </span>
              )}
              {salary && (
                <span
                  style={{
                    padding: "8px 18px",
                    borderRadius: 999,
                    background: "rgba(199,174,106,0.15)",
                    border: "1px solid rgba(199,174,106,0.3)",
                    color: "#C7AE6A",
                    fontWeight: 600,
                  }}
                >
                  {salary}
                </span>
              )}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#C7AE6A" }}>
              {siteConfig.domain}
            </div>
          </div>
        </div>
      ),
      { ...size },
    );
  } catch {
    return fallbackImage();
  }
}
