import { NextResponse } from "next/server";
import { Resend } from "resend";
import { buildDigestData } from "@/lib/queries/digest";
import { buildDigestEmail } from "@/lib/email/digest-template";
import { siteConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 503 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const entries = await buildDigestData();

    if (entries.length === 0) {
      return NextResponse.json({ message: "No digests to send", sent: 0 });
    }

    let sent = 0;
    let failed = 0;

    for (const entry of entries) {
      const { subject, html } = buildDigestEmail(entry);

      const { error } = await resend.emails.send({
        from: siteConfig.email.from,
        to: entry.seeker.email,
        subject,
        html,
      });

      if (error) {
        console.error(`Digest email failed for ${entry.seeker.id}:`, error.message);
        failed++;
      } else {
        sent++;
      }
    }

    return NextResponse.json({
      message: `Digest complete: ${sent} sent, ${failed} failed`,
      sent,
      failed,
      total: entries.length,
    });
  } catch (error) {
    console.error("Digest error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
