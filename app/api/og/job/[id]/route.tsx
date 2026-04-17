import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";
import { localized } from "@/lib/utils";
import { loadNotoGeorgian, georgianFontConfig } from "@/lib/og-fonts";
import { siteConfig } from "@/lib/config";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const size = { width: 1200, height: 630 };

// Centralized OG colors from config
const C = siteConfig.og;

function publicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const url = new URL(request.url);
  const locale = url.searchParams.get("locale") === "en" ? "en" : "ka";

  const notoGeorgian = await loadNotoGeorgian();
  const fontConfig = georgianFontConfig(notoGeorgian);

  type JobRow = {
    title: string;
    title_ka: string | null;
    city: string | null;
    job_type: string;
    salary_min: number | null;
    salary_max: number | null;
    salary_currency: string;
    company: { name: string; name_ka: string | null; logo_url: string | null };
  };

  let job: JobRow | null = null;
  try {
    const supabase = publicClient();
    const { data } = await supabase
      .from("jobs")
      .select(
        "title, title_ka, city, job_type, salary_min, salary_max, salary_currency, company:companies!inner(name, name_ka, logo_url)",
      )
      .eq("id", params.id)
      .single();
    job = data as unknown as JobRow;
  } catch {
    job = null;
  }

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
            background: C.bgColor,
            fontFamily: "Noto Sans Georgian, sans-serif",
          }}
        >
          <span style={{ fontSize: 48, color: C.accentColor, fontWeight: 700 }}>
            {siteConfig.domain}
          </span>
        </div>
      ),
      { ...size, ...fontConfig },
    );
  }

  const companyName = localized(job.company, "name", locale);
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

  const hiringLabel = locale === "ka" ? "იღებს" : "Hiring";

  // Accent color with alpha variations — must use rgba() for Satori compatibility
  const accentAlpha = (a: number) => `rgba(199,174,106,${a})`;

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
          background: C.bgColor,
          backgroundImage:
            `radial-gradient(at 15% 20%, ${accentAlpha(0.18)} 0, transparent 45%), radial-gradient(at 85% 85%, ${accentAlpha(0.10)} 0, transparent 50%), linear-gradient(135deg, ${C.bgColor} 0%, #1f120b 55%, #281b12 100%)`,
          color: C.textColor,
          fontFamily: "Noto Sans Georgian, sans-serif",
          position: "relative",
        }}
      >
        {/* Subtle vignette frame */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 0,
            boxShadow: "inset 0 0 200px rgba(0,0,0,0.35)",
            pointerEvents: "none",
          }}
        />

        {/* Hiring badge */}
        <div
          style={{
            position: "absolute",
            top: 40,
            right: 40,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 18px",
            borderRadius: 999,
            background: accentAlpha(0.15),
            border: `1px solid ${accentAlpha(0.35)}`,
            color: C.accentColor,
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          <div
            style={{
              display: "flex",
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: C.accentColor,
              boxShadow: `0 0 12px ${accentAlpha(0.9)}`,
            }}
          />
          {hiringLabel}
        </div>

        {/* Company row */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 72,
              height: 72,
              borderRadius: 18,
              background:
                `linear-gradient(135deg, ${accentAlpha(0.25)} 0%, ${accentAlpha(0.05)} 100%)`,
              border: `1px solid ${accentAlpha(0.35)}`,
              fontSize: 32,
              color: C.accentColor,
              fontWeight: 700,
              boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            }}
          >
            {companyName.charAt(0).toUpperCase()}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div
              style={{
                fontSize: 14,
                color: C.mutedColor,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontWeight: 500,
              }}
            >
              {locale === "ka" ? "კომპანია" : "Company"}
            </div>
            <div
              style={{ fontSize: 26, color: C.textColor, fontWeight: 600 }}
            >
              {companyName}
            </div>
          </div>
        </div>

        {/* Title block with accent bar */}
        <div style={{ display: "flex", gap: "28px" }}>
          <div
            style={{
              display: "flex",
              width: 5,
              minHeight: 140,
              borderRadius: 3,
              background:
                `linear-gradient(180deg, ${C.accentColor} 0%, ${accentAlpha(0)} 100%)`,
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "22px",
              flex: 1,
            }}
          >
            <div
              style={{
                fontSize: 60,
                fontWeight: 700,
                lineHeight: 1.1,
                maxWidth: "920px",
                letterSpacing: "-0.025em",
                color: C.textColor,
              }}
            >
              {jobTitle}
            </div>
            <div
              style={{
                display: "flex",
                gap: "12px",
                fontSize: 20,
                color: "#cbbfa8",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 18px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                {jobTypeText}
              </span>
              {job.city && (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 18px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {job.city}
                </span>
              )}
              {salary && (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 18px",
                    borderRadius: 999,
                    background:
                      `linear-gradient(135deg, ${accentAlpha(0.2)} 0%, ${accentAlpha(0.08)} 100%)`,
                    border: `1px solid ${accentAlpha(0.4)}`,
                    color: C.accentColor,
                    fontWeight: 600,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="2" x2="12" y2="22" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                  {salary}
                </span>
              )}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            borderTop: `1px solid ${accentAlpha(0.15)}`,
            paddingTop: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <svg width="32" height="32" viewBox="0 0 120 120" fill="none">
              <path
                d="M60 6C30 4 8 26 6 56c-2 32 22 54 52 58 32 4 56-18 58-48C118 34 94 8 60 6Z"
                fill={C.cardBg}
              />
              <path
                d="M60 24 L84 42 L78 80 L42 80 L36 48 Z"
                fill="none"
                stroke={C.textColor}
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path d="M53 48 L53 66 L67 57 Z" fill={C.accentColor} />
            </svg>
            <span style={{ fontSize: 22, fontWeight: 700, color: C.accentColor }}>
              {siteConfig.domain}
            </span>
          </div>
          <div style={{ fontSize: 16, color: C.mutedColor }}>
            {locale === "ka" ? "ვაკანსიები საქართველოში" : "Jobs in Georgia"}
          </div>
        </div>
      </div>
    ),
    { ...size, ...fontConfig },
  );
}
