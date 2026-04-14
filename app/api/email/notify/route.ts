import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { DEFAULT_TEMPLATES, renderTemplate } from "@/lib/email/default-templates";
import { buildStatusEmailHtml } from "@/lib/email/application-status-template";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: Request) {
  // Verify secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { application_id, status } = await req.json();

  // Only send for accepted/rejected
  if (!application_id || !["accepted", "rejected"].includes(status)) {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }

  const supabase = getServiceClient();

  // Fetch application + applicant + job + company
  const { data: application } = await supabase
    .from("applications")
    .select("id, job_id, applicant_id")
    .eq("id", application_id)
    .single();

  if (!application) {
    return Response.json({ error: "Application not found" }, { status: 404 });
  }

  // Fetch applicant profile + auth email
  const [{ data: profile }, { data: job }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, full_name_ka, preferred_language")
      .eq("id", application.applicant_id)
      .single(),
    supabase
      .from("jobs")
      .select("id, title, title_ka, company_id, company:companies!inner(name, name_ka)")
      .eq("id", application.job_id)
      .single(),
  ]);

  if (!profile || !job) {
    return Response.json({ error: "Data not found" }, { status: 404 });
  }

  // Get applicant's email from auth
  const { data: authUser } = await supabase.auth.admin.getUserById(application.applicant_id);
  const email = authUser?.user?.email;
  if (!email) {
    return Response.json({ error: "No email" }, { status: 404 });
  }

  const company = job.company as unknown as { name: string; name_ka: string | null };
  const locale = profile.preferred_language ?? "ka";
  const applicantName = locale === "ka"
    ? (profile.full_name_ka || profile.full_name || email.split("@")[0])
    : (profile.full_name || profile.full_name_ka || email.split("@")[0]);
  const jobTitle = locale === "ka" && job.title_ka ? job.title_ka : job.title;
  const companyName = locale === "ka" && company.name_ka ? company.name_ka : company.name;

  const variables = {
    applicant_name: applicantName,
    job_title: jobTitle,
    company_name: companyName,
  };

  // Check for custom template
  const { data: customTemplate } = await supabase
    .from("email_templates")
    .select("subject, subject_ka, body, body_ka")
    .eq("company_id", job.company_id)
    .eq("type", status)
    .eq("is_active", true)
    .single();

  const defaults = DEFAULT_TEMPLATES[status as "accepted" | "rejected"];
  const rawSubject = customTemplate
    ? (locale === "ka" ? customTemplate.subject_ka || customTemplate.subject : customTemplate.subject)
    : (locale === "ka" ? defaults.subject_ka : defaults.subject);
  const rawBody = customTemplate
    ? (locale === "ka" ? customTemplate.body_ka || customTemplate.body : customTemplate.body)
    : (locale === "ka" ? defaults.body_ka : defaults.body);

  const subject = renderTemplate(rawSubject, variables);
  const body = renderTemplate(rawBody, variables);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.dasaqmdi.com";
  const jobUrl = locale === "ka" ? `${baseUrl}/jobs/${job.id}` : `${baseUrl}/en/jobs/${job.id}`;

  const html = buildStatusEmailHtml({
    subject,
    body,
    jobTitle,
    jobUrl,
    companyName,
    locale,
  });

  // Send via Resend
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    await resend.emails.send({
      from: "dasaqmdi.com <noreply@dasaqmdi.com>",
      to: email,
      subject,
      html,
    });
    return Response.json({ sent: true });
  } catch (err) {
    console.error("Failed to send email:", err);
    return Response.json({ error: "Failed to send" }, { status: 500 });
  }
}
