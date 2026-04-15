import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";
import { localized } from "@/lib/utils";
import { loadNotoGeorgian, georgianFontConfig } from "@/lib/og-fonts";
import { siteConfig } from "@/lib/config";

export const runtime = "edge";
export const alt = `Job posting on ${siteConfig.domain}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Cookie-less public client — safe for edge crawlers (FB/LinkedIn bots have no session)
function publicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export default async function OGImage({
  params,
}: {
  params: { id: string; locale: string };
}) {
  const notoGeorgian = await loadNotoGeorgian();
  const fontConfig = georgianFontConfig(notoGeorgian);

  const locale = params.locale ?? "ka";
  const supabase = publicClient();
  const { data: job } = await supabase
    .from("jobs")
    .select(
      "title, title_ka, city, job_type, salary_min, salary_max, salary_currency, company:companies!inner(name, name_ka, logo_url)",
    )
    .eq("id", params.id)
    .single();

  if (!job) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            background: "#1a1614",
            fontFamily: "Noto Sans Georgian, sans-serif",
          }}
        >
          <span style={{ fontSize: 48, color: "#C7AE6A", fontWeight: 700 }}>
            {siteConfig.domain}
          </span>
        </div>
      ),
      { ...size, ...fontConfig },
    );
  }

  const companyObj = job.company as unknown as {
    name: string;
    name_ka: string | null;
    logo_url: string | null;
  };
  const companyName = localized(companyObj, "name", locale);
  const jobTitle = localized(job, "title", locale);
  const salary =
    job.salary_min && job.salary_max
      ? `${job.salary_min.toLocaleString()} – ${job.salary_max.toLocaleString()} ${job.salary_currency}`
      : job.salary_min
        ? `${job.salary_min.toLocaleString()}+ ${job.salary_currency}`
        : null;

  const jobTypeLabels: Record<string, { en: string; ka: string }> = {
    "full-time": { en: "Full-time", ka: "სრული განაკვეთი" },
    "part-time": { en: "Part-time", ka: "ნახევარი განაკვეთი" },
    contract: { en: "Contract", ka: "კონტრაქტი" },
    internship: { en: "Internship", ka: "სტაჟირება" },
    remote: { en: "Remote", ka: "დისტანციური" },
  };
  const jobTypeText =
    jobTypeLabels[job.job_type]?.[locale === "ka" ? "ka" : "en"] ?? job.job_type;

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
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 260,
            height: 260,
            borderRadius: "50%",
            background: "rgba(199,174,106,0.05)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(199,174,106,0.03)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          {companyObj.logo_url ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 64,
                height: 64,
                borderRadius: 14,
                background: "rgba(199,174,106,0.08)",
                border: "1px solid rgba(199,174,106,0.2)",
                overflow: "hidden",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={companyObj.logo_url}
                alt=""
                width={52}
                height={52}
                style={{ objectFit: "contain", borderRadius: 8 }}
              />
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 64,
                height: 64,
                borderRadius: 14,
                background: "rgba(199,174,106,0.1)",
                border: "1px solid rgba(199,174,106,0.2)",
                fontSize: 28,
                color: "#C7AE6A",
                fontWeight: 700,
              }}
            >
              {companyName.charAt(0).toUpperCase()}
            </div>
          )}
          <div style={{ fontSize: 24, color: "#C7AE6A", fontWeight: 600 }}>
            {companyName}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              lineHeight: 1.15,
              maxWidth: "950px",
              letterSpacing: "-0.02em",
            }}
          >
            {jobTitle}
          </div>
          <div
            style={{
              display: "flex",
              gap: "14px",
              fontSize: 20,
              color: "#cbbfa8",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                padding: "8px 16px",
                borderRadius: 999,
                background: "rgba(199,174,106,0.1)",
                border: "1px solid rgba(199,174,106,0.2)",
              }}
            >
              {jobTypeText}
            </span>
            {job.city && (
              <span
                style={{
                  padding: "8px 16px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {job.city}
              </span>
            )}
            {salary && (
              <span
                style={{
                  padding: "8px 16px",
                  borderRadius: 999,
                  background: "rgba(199,174,106,0.12)",
                  border: "1px solid rgba(199,174,106,0.25)",
                  color: "#C7AE6A",
                  fontWeight: 600,
                }}
              >
                {salary}
              </span>
            )}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            borderTop: "1px solid rgba(199,174,106,0.15)",
            paddingTop: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <svg width="32" height="32" viewBox="0 0 120 120" fill="none">
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
              <path d="M53 48 L53 66 L67 57 Z" fill="#C7AE6A" />
            </svg>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#C7AE6A" }}>
              {siteConfig.domain}
            </span>
          </div>
          <div style={{ fontSize: 16, color: "#8a827b" }}>
            {locale === "ka"
              ? "ვაკანსიები საქართველოში"
              : "Jobs in Georgia"}
          </div>
        </div>
      </div>
    ),
    { ...size, ...fontConfig },
  );
}
