import { siteConfig } from "@/lib/config";
import { escapeHtml } from "@/lib/email/escape";

export function buildStatusEmailHtml({
  subject,
  body,
  jobTitle,
  jobUrl,
  companyName,
  locale,
}: {
  subject: string;
  body: string;
  jobTitle: string;
  jobUrl: string;
  companyName: string;
  locale: string;
}): string {
  const viewJobLabel = locale === "ka" ? "ვაკანსიის ნახვა" : "View Job";
  const footerText = locale === "ka"
    ? `ეს წერილი გამოგზავნილია ${siteConfig.domain}-იდან`
    : `This email was sent from ${siteConfig.domain}`;

  const bodyHtml = body
    .split("\n\n")
    .map((p) => `<p style="margin:0 0 16px;line-height:1.6;color:#e2e0d5;">${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("");

  const safeSubject = escapeHtml(subject);
  const safeJobTitle = escapeHtml(jobTitle);
  const safeJobUrl = encodeURI(jobUrl);

  return `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${safeSubject}</title>
</head>
<body style="margin:0;padding:0;background:#1a1614;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1614;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#252220;border-radius:16px;overflow:hidden;border:1px solid rgba(199,174,106,0.15);">

          <!-- Header -->
          <tr>
            <td style="padding:28px 32px 20px;text-align:center;border-bottom:1px solid rgba(199,174,106,0.1);">
              <p style="margin:0;font-size:18px;font-weight:700;color:#C7AE6A;letter-spacing:0.5px;">
                ${siteConfig.domain}
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${bodyHtml}

              <!-- Job link button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                <tr>
                  <td align="center">
                    <a href="${safeJobUrl}" style="display:inline-block;background:linear-gradient(135deg,#C7AE6A,#b89d5a);color:#1a1614;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:14px;font-weight:600;">
                      ${viewJobLabel}: ${safeJobTitle}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid rgba(199,174,106,0.1);text-align:center;">
              <p style="margin:0;font-size:12px;color:#6b6560;">
                ${footerText}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
