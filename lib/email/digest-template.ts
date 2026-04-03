import type { DigestEntry } from "@/lib/queries/digest";
import { localized } from "@/lib/utils";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dasakmdi.com";

type TemplateStrings = {
  subject: string;
  greeting: string;
  intro: string;
  matchLabel: string;
  viewJob: string;
  viewAll: string;
  unsubscribe: string;
  footer: string;
};

const STRINGS: Record<"ka" | "en", TemplateStrings> = {
  ka: {
    subject: "შენთვის შერჩეული ვაკანსიები — dasakmdi.com",
    greeting: "გამარჯობა",
    intro: "ბოლო 24 საათში გამოქვეყნდა ვაკანსიები, რომლებიც შენს უნარებს ემთხვევა:",
    matchLabel: "თავსებადობა",
    viewJob: "ნახვა",
    viewAll: "ყველა ვაკანსიის ნახვა",
    unsubscribe: "გამოწერის გაუქმება",
    footer: "ეს შეტყობინება ავტომატურად გაიგზავნა dasakmdi.com-დან",
  },
  en: {
    subject: "Jobs picked for you — dasakmdi.com",
    greeting: "Hi",
    intro: "New jobs matching your skills were posted in the last 24 hours:",
    matchLabel: "Match",
    viewJob: "View",
    viewAll: "View all jobs",
    unsubscribe: "Unsubscribe",
    footer: "This email was sent automatically from dasakmdi.com",
  },
};

function formatSalary(min: number | null, max: number | null, currency: string): string {
  if (!min && !max) return "";
  if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`;
  if (min) return `${min.toLocaleString()}+ ${currency}`;
  return `${max!.toLocaleString()} ${currency}`;
}

export function buildDigestEmail(entry: DigestEntry): { subject: string; html: string } {
  const lang = entry.seeker.preferred_language;
  const s = STRINGS[lang];
  const name = (lang === "ka" ? entry.seeker.full_name_ka : entry.seeker.full_name)
    || entry.seeker.full_name
    || entry.seeker.full_name_ka
    || "";

  const unsubscribeUrl = `${SITE_URL}/api/digest/unsubscribe?id=${entry.seeker.id}`;

  const jobRows = entry.topJobs
    .map(({ job, score, matchedSkills }) => {
      const title = localized(job, "title", lang);
      const company = localized(job.company, "name", lang);
      const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency);
      const jobUrl = `${SITE_URL}/jobs/${job.id}`;

      return `
        <tr>
          <td style="padding: 16px 0; border-bottom: 1px solid #e2e8f0;">
            <a href="${jobUrl}" style="text-decoration: none; color: inherit;">
              <div style="font-size: 15px; font-weight: 600; color: #1e293b; margin-bottom: 4px;">${title}</div>
              <div style="font-size: 13px; color: #64748b; margin-bottom: 6px;">${company}${job.city ? ` · ${job.city}` : ""}${salary ? ` · ${salary}` : ""}</div>
              <div style="display: inline-flex; gap: 6px; flex-wrap: wrap;">
                <span style="display: inline-block; background: #eef2ff; color: #6366f1; font-size: 11px; font-weight: 500; padding: 2px 8px; border-radius: 6px;">${s.matchLabel}: ${score}%</span>
                ${matchedSkills.slice(0, 3).map((sk) => `<span style="display: inline-block; background: #f1f5f9; color: #475569; font-size: 11px; padding: 2px 8px; border-radius: 6px;">${sk}</span>`).join("")}
              </div>
            </a>
          </td>
        </tr>`;
    })
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 560px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="font-size: 18px; font-weight: 700; color: #1e293b; letter-spacing: -0.3px;">დასაქმდი</div>
    </div>

    <!-- Card -->
    <div style="background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 24px 24px 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.04);">
      <div style="font-size: 15px; color: #1e293b; margin-bottom: 4px;">
        ${s.greeting}${name ? `, ${name}` : ""}!
      </div>
      <div style="font-size: 13px; color: #64748b; margin-bottom: 20px;">
        ${s.intro}
      </div>

      <table style="width: 100%; border-collapse: collapse;">
        ${jobRows}
      </table>

      <div style="text-align: center; padding: 24px 0 16px;">
        <a href="${SITE_URL}/jobs" style="display: inline-block; background: #6366f1; color: #ffffff; font-size: 13px; font-weight: 500; padding: 10px 24px; border-radius: 8px; text-decoration: none;">
          ${s.viewAll}
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 24px 0; font-size: 11px; color: #94a3b8;">
      <div>${s.footer}</div>
      <a href="${unsubscribeUrl}" style="color: #94a3b8; text-decoration: underline; margin-top: 4px; display: inline-block;">
        ${s.unsubscribe}
      </a>
    </div>
  </div>
</body>
</html>`;

  return { subject: s.subject, html };
}
