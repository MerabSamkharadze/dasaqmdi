import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getCompanyByOwner } from "@/lib/queries/companies";
import { getTranslations } from "next-intl/server";
import { EmailTemplateEditor } from "@/components/dashboard/email-template-editor";
import { DEFAULT_TEMPLATES } from "@/lib/email/default-templates";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard");
  return { title: t("emailTemplatesTitle") };
}

export default async function EmailTemplatesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const company = await getCompanyByOwner(user.id);
  if (!company) redirect("/employer/company/new");

  // Fetch existing custom templates
  const { data: templates } = await supabase
    .from("email_templates")
    .select("*")
    .eq("company_id", company.id);

  const acceptedTemplate = templates?.find((t) => t.type === "accepted");
  const rejectedTemplate = templates?.find((t) => t.type === "rejected");

  const t = await getTranslations("dashboard");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">{t("emailTemplatesTitle")}</h1>
        <p className="text-[13px] text-muted-foreground/70 mt-1">{t("emailTemplatesDescription")}</p>
      </div>

      <EmailTemplateEditor
        companyId={company.id}
        templates={{
          accepted: acceptedTemplate ?? null,
          rejected: rejectedTemplate ?? null,
        }}
        defaults={DEFAULT_TEMPLATES}
      />
    </div>
  );
}
