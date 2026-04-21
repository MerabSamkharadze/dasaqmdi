import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getCompanyByOwner } from "@/lib/queries/companies";
import { getActivePlan } from "@/lib/queries/subscriptions";
import { getTranslations } from "next-intl/server";
import { EmailTemplateEditor } from "@/components/dashboard/email-template-editor";
import { DEFAULT_TEMPLATES } from "@/lib/email/default-templates";
import { Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
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

  const plan = await getActivePlan(company.id);
  const t = await getTranslations("dashboard");
  const tEmail = await getTranslations("emailTemplates");

  // Plan gate: Pro (verified) only
  if (plan !== "verified") {
    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{t("emailTemplatesTitle")}</h1>
          <p className="text-[13px] text-muted-foreground/70 mt-1">{t("emailTemplatesDescription")}</p>
        </div>

        <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 to-transparent p-8 text-center shadow-soft">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 mb-4">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
            {tEmail("upgradeTitle")}
          </h2>
          <p className="mt-2 text-[13px] text-muted-foreground max-w-md mx-auto">
            {tEmail("upgradeDescription")}
          </p>
          <Link
            href="/pricing"
            className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors duration-200"
          >
            {tEmail("upgradeCta")}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  // Fetch existing custom templates
  const { data: templates } = await supabase
    .from("email_templates")
    .select("*")
    .eq("company_id", company.id);

  const acceptedTemplate = templates?.find((t) => t.type === "accepted");
  const rejectedTemplate = templates?.find((t) => t.type === "rejected");

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
