"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { useTranslations } from "next-intl";
import { applyToJobAction } from "@/lib/actions/applications";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/shared/submit-button";
import { FileUpload } from "@/components/shared/file-upload";
import { trackLead } from "@/lib/tracking/pixel-events";
import type { ActionResult } from "@/lib/types";

const initialState: ActionResult = { error: null };

type ApplyFormProps = {
  jobId: string;
  jobTitle?: string;
  category?: string;
  userId: string;
  existingResumeUrl?: string | null;
};

export function ApplyForm({ jobId, jobTitle, category, userId, existingResumeUrl }: ApplyFormProps) {
  const [state, formAction] = useFormState(applyToJobAction, initialState);
  const t = useTranslations("applications");
  const [resumeUrl, setResumeUrl] = useState(existingResumeUrl ?? "");

  return (
    <form
      action={formAction}
      onSubmit={() => trackLead({ jobId, jobTitle: jobTitle ?? "", category })}
      className="space-y-6"
    >
      <input type="hidden" name="job_id" value={jobId} />
      <input type="hidden" name="resume_url" value={resumeUrl} />

      {state.error && (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-[13px] text-destructive/80">
          {state.error}
        </div>
      )}

      {/* Resume Upload */}
      <div className="space-y-2">
        <Label className="text-[13px]">{t("resume")}</Label>
        <FileUpload
          bucket="resumes"
          userId={userId}
          accept=".pdf,.doc,.docx"
          maxSizeMB={10}
          currentUrl={existingResumeUrl}
          onUploadComplete={setResumeUrl}
          onRemove={() => setResumeUrl("")}
          label={t("resume")}
          prefix="application"
        />
        {!resumeUrl && (
          <p id="resume-hint" className="text-[11px] text-destructive/60">
            {t("resumeRequired")}
          </p>
        )}
      </div>

      {/* Cover Letter */}
      <div className="space-y-2">
        <Label htmlFor="cover_letter" className="text-[13px]">{t("coverLetter")}</Label>
        <Textarea
          id="cover_letter"
          name="cover_letter"
          rows={6}
          placeholder={t("coverLetterPlaceholder")}
        />
      </div>

      <div className="flex justify-end">
        <SubmitButton
          pendingText="..."
          disabled={!resumeUrl}
          aria-describedby={!resumeUrl ? "resume-hint" : undefined}
        >
          {t("submitApplication")}
        </SubmitButton>
      </div>
    </form>
  );
}
