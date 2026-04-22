"use client";

import { useRef, useState } from "react";
import { useFormState } from "react-dom";
import { useScrollOnSave } from "@/lib/hooks/use-scroll-on-save";
import { useTranslations } from "next-intl";
import { createExternalJobAction } from "@/lib/actions/admin";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubmitButton } from "@/components/shared/submit-button";
import { JOB_TYPES, SALARY_CURRENCIES } from "@/lib/types/enums";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";
import type { ActionResult } from "@/lib/types";

type SourceLanguage = "ka" | "en";

const initialState: ActionResult = { error: null };

type ExternalJobFormProps = {
  categories: Category[];
  locale: string;
};

export function ExternalJobForm({ categories, locale }: ExternalJobFormProps) {
  const [state, formAction] = useFormState(createExternalJobAction, initialState);
  const [sourceLang, setSourceLang] = useState<SourceLanguage>("ka");
  const t = useTranslations("admin");
  const tc = useTranslations("common");
  const tt = useTranslations("jobs.types");
  const formRef = useRef<HTMLFormElement>(null);
  useScrollOnSave(state, formRef);

  const langLabel = sourceLang === "ka" ? t("externalLangKa") : t("externalLangEn");

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      <input type="hidden" name="source_language" value={sourceLang} />

      {state.error && (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-[13px] text-destructive/80">
          {state.error}
        </div>
      )}

      {state.error === null && state !== initialState && (
        <div role="status" className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-[13px] text-primary">
          {tc("saved")}
        </div>
      )}

      {/* External source fields */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-4">
        <p className="text-[13px] font-medium text-primary">{t("externalSourceInfo")}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="external_url">{t("externalUrl")}</Label>
            <Input
              id="external_url"
              name="external_url"
              type="url"
              required
              placeholder="https://jobs.ge/..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="external_source">{t("externalSourceName")}</Label>
            <Input
              id="external_source"
              name="external_source"
              required
              placeholder="jobs.ge"
            />
          </div>
        </div>
      </div>

      {/* Source language toggle */}
      <div className="rounded-xl border border-border/60 bg-card p-5 space-y-3">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <Label className="text-[13px] font-semibold">{t("externalSourceLanguage")}</Label>
          <p className="text-[11px] text-muted-foreground/70">{t("externalSourceLanguageHint")}</p>
        </div>
        <div className="inline-flex items-center gap-1 rounded-xl border border-border/60 bg-background p-1">
          <LangButton
            active={sourceLang === "ka"}
            onClick={() => setSourceLang("ka")}
            label={t("externalLangKa")}
          />
          <LangButton
            active={sourceLang === "en"}
            onClick={() => setSourceLang("en")}
            label={t("externalLangEn")}
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="title">
            {t("externalTitle")} <span className="text-muted-foreground/60 font-normal">({langLabel})</span>
          </Label>
          <Input id="title" name="title" required lang={sourceLang} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category_id">{t("externalCategory")}</Label>
          <Select name="category_id">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {locale === "ka" ? cat.name_ka : cat.name_en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="job_type">{t("externalJobType")}</Label>
          <Select name="job_type" defaultValue="full-time">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {JOB_TYPES.map((type) => (
                <SelectItem key={type} value={type}>{tt(type)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">{t("externalCity")}</Label>
          <Input id="city" name="city" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="salary_currency">{t("externalCurrency")}</Label>
          <Select name="salary_currency" defaultValue="GEL">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {SALARY_CURRENCIES.map((cur) => (
                <SelectItem key={cur} value={cur}>{cur}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="salary_min">{t("externalSalaryMin")}</Label>
          <Input id="salary_min" name="salary_min" type="number" min={0} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="salary_max">{t("externalSalaryMax")}</Label>
          <Input id="salary_max" name="salary_max" type="number" min={0} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">
          {t("externalDescription")} <span className="text-muted-foreground/60 font-normal">({langLabel})</span>
        </Label>
        <Textarea id="description" name="description" rows={6} required lang={sourceLang} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="requirements">
          {t("externalRequirements")} <span className="text-muted-foreground/60 font-normal">({langLabel})</span>
        </Label>
        <Textarea id="requirements" name="requirements" rows={4} lang={sourceLang} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tags">{t("externalTags")}</Label>
        <Input id="tags" name="tags" placeholder="React, TypeScript, Node.js" />
      </div>

      <div className="flex justify-end">
        <SubmitButton pendingText="...">{tc("create")}</SubmitButton>
      </div>
    </form>
  );
}

function LangButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-lg px-4 py-1.5 text-[13px] font-medium transition-all duration-200",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
