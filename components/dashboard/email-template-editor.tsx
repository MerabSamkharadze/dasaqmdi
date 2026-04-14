"use client";

import { useState, useRef } from "react";
import { useFormState } from "react-dom";
import { useTranslations } from "next-intl";
import { upsertEmailTemplateAction, deleteEmailTemplateAction } from "@/lib/actions/email-templates";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/shared/submit-button";
import { Check, RotateCcw } from "lucide-react";
import type { ActionResult } from "@/lib/types";

type TemplateData = {
  subject: string;
  subject_ka: string | null;
  body: string;
  body_ka: string | null;
} | null;

type Props = {
  companyId: string;
  templates: {
    accepted: TemplateData;
    rejected: TemplateData;
  };
  defaults: {
    accepted: { subject: string; subject_ka: string; body: string; body_ka: string };
    rejected: { subject: string; subject_ka: string; body: string; body_ka: string };
  };
};

const initialState: ActionResult<string> = { error: null };

export function EmailTemplateEditor({ companyId, templates, defaults }: Props) {
  const [activeTab, setActiveTab] = useState<"accepted" | "rejected">("accepted");
  const t = useTranslations("dashboard");

  const tabs = [
    { key: "accepted" as const, label: t("templateAccepted") },
    { key: "rejected" as const, label: t("templateRejected") },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted/50 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
              activeTab === tab.key
                ? "bg-card shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Editor */}
      <TemplateForm
        key={activeTab}
        companyId={companyId}
        type={activeTab}
        current={templates[activeTab]}
        defaults={defaults[activeTab]}
      />
    </div>
  );
}

function TemplateForm({
  companyId,
  type,
  current,
  defaults,
}: {
  companyId: string;
  type: "accepted" | "rejected";
  current: TemplateData;
  defaults: { subject: string; subject_ka: string; body: string; body_ka: string };
}) {
  const [state, formAction] = useFormState(upsertEmailTemplateAction, initialState);
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
  const formRef = useRef<HTMLFormElement>(null);

  // Live preview state
  const [subject, setSubject] = useState(current?.subject ?? defaults.subject);
  const [body, setBody] = useState(current?.body ?? defaults.body);
  const [subjectKa, setSubjectKa] = useState(current?.subject_ka ?? defaults.subject_ka);
  const [bodyKa, setBodyKa] = useState(current?.body_ka ?? defaults.body_ka);

  const [previewLocale, setPreviewLocale] = useState<"en" | "ka">("en");
  const [showPreview, setShowPreview] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetting, setResetting] = useState(false);

  const sampleData = {
    en: { name: "John Doe", job: "Frontend Developer", company: "TechCorp" },
    ka: { name: "გიორგი კახიძე", job: "ფრონტენდ დეველოპერი", company: "თექკორპი" },
  };
  const sample = sampleData[previewLocale];
  const previewSrc = previewLocale === "ka"
    ? { subject: subjectKa || subject, body: bodyKa || body }
    : { subject, body };

  const previewSubject = previewSrc.subject
    .replace(/\{applicant_name\}/g, sample.name)
    .replace(/\{job_title\}/g, sample.job)
    .replace(/\{company_name\}/g, sample.company);

  const previewBody = previewSrc.body
    .replace(/\{applicant_name\}/g, sample.name)
    .replace(/\{job_title\}/g, sample.job)
    .replace(/\{company_name\}/g, sample.company);

  async function handleResetConfirm() {
    setResetting(true);
    await deleteEmailTemplateAction(companyId, type);
    setSubject(defaults.subject);
    setSubjectKa(defaults.subject_ka);
    setBody(defaults.body);
    setBodyKa(defaults.body_ka);
    setResetting(false);
    setShowResetDialog(false);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Form — full width, hidden when preview is active */}
      <form ref={formRef} action={formAction} className={`rounded-xl border border-border/60 bg-card p-5 sm:p-6 shadow-sm space-y-5 ${showPreview ? "hidden" : ""}`}>
        <input type="hidden" name="company_id" value={companyId} />
        <input type="hidden" name="type" value={type} />

        {state.data === "success" && (
          <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 px-3 py-2 text-[13px] text-primary">
            <Check className="h-3.5 w-3.5" />
            {t("templateSaved")}
          </div>
        )}

        {state.error && (
          <div className="rounded-lg bg-destructive/5 border border-destructive/20 px-3 py-2 text-[13px] text-destructive">
            {state.error}
          </div>
        )}

        {/* Subject EN */}
        <div className="space-y-2">
          <Label className="text-[13px]">{t("templateSubject")} (EN)</Label>
          <Input
            name="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="text-[13px]"
          />
        </div>

        {/* Subject KA */}
        <div className="space-y-2">
          <Label className="text-[13px]">{t("templateSubject")} (KA)</Label>
          <Input
            name="subject_ka"
            value={subjectKa}
            onChange={(e) => setSubjectKa(e.target.value)}
            className="text-[13px]"
          />
        </div>

        {/* Body EN */}
        <div className="space-y-2">
          <Label className="text-[13px]">{t("templateBody")} (EN)</Label>
          <Textarea
            name="body"
            rows={8}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="text-[13px] font-mono"
          />
        </div>

        {/* Body KA */}
        <div className="space-y-2">
          <Label className="text-[13px]">{t("templateBody")} (KA)</Label>
          <Textarea
            name="body_ka"
            rows={8}
            value={bodyKa}
            onChange={(e) => setBodyKa(e.target.value)}
            className="text-[13px] font-mono"
          />
        </div>

        {/* Variables — click to copy */}
        <div className="space-y-1.5">
          <p className="text-[11px] text-muted-foreground/50">{t("templateVariables")}</p>
          <div className="flex flex-wrap gap-1.5">
            {["{applicant_name}", "{job_title}", "{company_name}"].map((v) => (
              <VariableChip key={v} value={v} />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowResetDialog(true)}
              className="gap-1.5 text-[12px] text-muted-foreground"
            >
              <RotateCcw className="h-3 w-3" />
              {t("templateReset")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(true)}
              className="gap-1.5 text-[12px]"
            >
              {t("templatePreview")}
            </Button>
          </div>
          <SubmitButton size="sm" pendingText="...">
            {tc("save")}
          </SubmitButton>
        </div>
      </form>

      {/* Reset confirmation dialog */}
      {showResetDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowResetDialog(false)} aria-hidden="true" />
          <div className="relative w-full max-w-sm rounded-2xl border border-border/60 bg-card p-6 shadow-xl animate-fade-in">
            <div className="flex justify-center mb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10">
                <RotateCcw className="h-5 w-5 text-destructive" />
              </div>
            </div>
            <div className="text-center mb-6">
              <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
                {t("templateReset")}
              </h3>
              <p className="mt-2 text-[13px] text-muted-foreground leading-relaxed">
                {t("templateResetConfirm")}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-xl border-border bg-card text-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setShowResetDialog(false)}
                disabled={resetting}
              >
                {tc("cancel")}
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="flex-1 rounded-xl"
                onClick={handleResetConfirm}
                disabled={resetting}
              >
                {resetting ? (
                  <span className="flex items-center gap-1.5">
                    <RotateCcw className="h-3.5 w-3.5 animate-spin" />
                    ...
                  </span>
                ) : t("templateReset")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Preview — full width, realistic email render */}
      {showPreview && (
      <div className="rounded-xl border border-border/60 bg-card p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[13px] font-semibold tracking-tight text-muted-foreground">
            {t("templatePreview")}
          </h3>
          <div className="flex gap-1 p-0.5 rounded-lg bg-muted/50">
            <button
              type="button"
              onClick={() => setPreviewLocale("en")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                previewLocale === "en" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setPreviewLocale("ka")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                previewLocale === "ka" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
              }`}
            >
              KA
            </button>
          </div>
        </div>

        {/* Realistic email preview */}
        <div className="max-w-xl mx-auto rounded-2xl overflow-hidden border border-[rgba(199,174,106,0.15)]" style={{ background: "#252220" }}>
          {/* Email header */}
          <div className="px-8 py-6 text-center border-b border-[rgba(199,174,106,0.1)]">
            <span className="text-lg font-bold tracking-wide" style={{ color: "#C7AE6A" }}>dasaqmdi.com</span>
          </div>

          {/* Email body */}
          <div className="px-8 py-8">
            {/* Subject line */}
            <div className="mb-6 pb-4 border-b border-[rgba(199,174,106,0.1)]">
              <p className="text-[11px] mb-1" style={{ color: "#6b6560" }}>Subject:</p>
              <p className="text-[15px] font-semibold" style={{ color: "#e2e0d5" }}>{previewSubject}</p>
            </div>

            {/* Body text */}
            <div className="text-[14px] whitespace-pre-wrap leading-7" style={{ color: "#e2e0d5" }}>
              {previewBody}
            </div>

            {/* Job link button */}
            <div className="mt-8 text-center">
              <span
                className="inline-block px-7 py-3 rounded-xl text-[14px] font-semibold"
                style={{ background: "linear-gradient(135deg, #C7AE6A, #b89d5a)", color: "#1a1614" }}
              >
                {previewLocale === "ka" ? "ვაკანსიის ნახვა" : "View Job"}: {sample.job}
              </span>
            </div>
          </div>

          {/* Email footer */}
          <div className="px-8 py-4 text-center border-t border-[rgba(199,174,106,0.1)]">
            <p className="text-[11px]" style={{ color: "#6b6560" }}>
              {previewLocale === "ka" ? "ეს წერილი გამოგზავნილია dasaqmdi.com-იდან" : "This email was sent from dasaqmdi.com"}
            </p>
          </div>
        </div>

        {/* Back to editor */}
        <div className="flex justify-center mt-6">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(false)}
            className="gap-1.5 text-[12px]"
          >
            ← {tc("edit")}
          </Button>
        </div>
      </div>
      )}
    </div>
  );
}

function VariableChip({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(value).catch(() => {
      const input = document.createElement("input");
      input.value = value;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-mono transition-all duration-200 ${
        copied
          ? "bg-primary/10 text-primary border border-primary/30"
          : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/30"
      }`}
    >
      {copied ? "✓ copied" : value}
    </button>
  );
}
