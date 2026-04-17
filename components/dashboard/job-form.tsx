"use client";

import { useRef, useState, useCallback } from "react";
import { useFormState } from "react-dom";
import { useScrollOnSave } from "@/lib/hooks/use-scroll-on-save";
import { useTranslations } from "next-intl";
import { createJobAction, updateJobAction } from "@/lib/actions/jobs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AIDraftButton } from "@/components/dashboard/ai-draft-button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubmitButton } from "@/components/shared/submit-button";
import { JOB_TYPES, SALARY_CURRENCIES } from "@/lib/types/enums";
import type { Job, Category } from "@/lib/types";
import type { ActionResult } from "@/lib/types";

const initialState: ActionResult = { error: null };

function defaultDeadline(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 16);
}

type JobFormProps = {
  job?: Job;
  companyId: string;
  categories: Category[];
  locale: string;
  mode: "create" | "edit";
  canUseAI?: boolean;
};

export function JobForm({ job, companyId, categories, locale, mode, canUseAI = false }: JobFormProps) {
  const action = mode === "create" ? createJobAction : updateJobAction;
  const [state, formAction] = useFormState(action, initialState);
  const t = useTranslations("jobs");
  const tc = useTranslations("common");
  const tt = useTranslations("jobs.types");
  const [categoryId, setCategoryId] = useState<string | undefined>(
    job?.category_id?.toString(),
  );
  const titleRef = useRef<HTMLInputElement>(null);
  const tagsRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const descKaRef = useRef<HTMLTextAreaElement>(null);
  const reqRef = useRef<HTMLTextAreaElement>(null);
  const reqKaRef = useRef<HTMLTextAreaElement>(null);

  const handleAIDraft = useCallback((data: {
    title: string;
    tags: string;
    description: string;
    description_ka: string;
    requirements: string;
    requirements_ka: string;
    suggested_category?: string;
  }) => {
    // Fill title and tags from AI input fields
    if (titleRef.current && data.title) {
      titleRef.current.value = data.title;
      titleRef.current.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (tagsRef.current && data.tags) {
      tagsRef.current.value = data.tags;
      tagsRef.current.dispatchEvent(new Event("input", { bubbles: true }));
    }

    // Fill description and requirements (both languages)
    const textFields = [
      { ref: descRef, value: data.description },
      { ref: descKaRef, value: data.description_ka },
      { ref: reqRef, value: data.requirements },
      { ref: reqKaRef, value: data.requirements_ka },
    ];
    for (const { ref, value } of textFields) {
      if (ref.current && value) {
        ref.current.value = value;
        ref.current.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }

    // Auto-select category by slug
    if (data.suggested_category) {
      const match = categories.find((c) => c.slug === data.suggested_category);
      if (match) {
        setCategoryId(match.id.toString());
      }
    }
  }, [categories]);

  const formRef = useRef<HTMLFormElement>(null);
  useScrollOnSave(state, formRef);

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      <input type="hidden" name="company_id" value={companyId} />
      {job && <input type="hidden" name="job_id" value={job.id} />}

      {state.error && (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-[13px] text-destructive/80">
          {state.error}
        </div>
      )}

      {mode === "edit" && state.error === null && state !== initialState && (
        <div role="status" aria-live="polite" className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-[13px] text-primary">
          {tc("saved")}
        </div>
      )}

      {/* AI Draft — only for Pro/Verified plans */}
      {mode === "create" && canUseAI && (
        <AIDraftButton onDraftComplete={handleAIDraft} />
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Title (EN) */}
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            ref={titleRef}
            id="title"
            name="title"
            required
            defaultValue={job?.title ?? ""}
          />
        </div>

        {/* Title (KA) */}
        <div className="space-y-2">
          <Label htmlFor="title_ka">Title (Georgian)</Label>
          <Input
            id="title_ka"
            name="title_ka"
            defaultValue={job?.title_ka ?? ""}
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category_id">Category</Label>
          <Select
            name="category_id"
            value={categoryId}
            onValueChange={setCategoryId}
          >
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

        {/* Job Type */}
        <div className="space-y-2">
          <Label htmlFor="job_type">{t("filters.type")}</Label>
          <Select name="job_type" defaultValue={job?.job_type ?? "full-time"}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {JOB_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {tt(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label htmlFor="city">{t("filters.location")}</Label>
          <Input
            id="city"
            name="city"
            defaultValue={job?.city ?? ""}
          />
        </div>

        {/* Salary Currency */}
        <div className="space-y-2">
          <Label htmlFor="salary_currency">{t("salary")}</Label>
          <Select
            name="salary_currency"
            defaultValue={job?.salary_currency ?? "GEL"}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SALARY_CURRENCIES.map((cur) => (
                <SelectItem key={cur} value={cur}>
                  {cur}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Salary Min */}
        <div className="space-y-2">
          <Label htmlFor="salary_min">Min Salary</Label>
          <Input
            id="salary_min"
            name="salary_min"
            type="number"
            min={0}
            defaultValue={job?.salary_min ?? ""}
          />
        </div>

        {/* Salary Max */}
        <div className="space-y-2">
          <Label htmlFor="salary_max">Max Salary</Label>
          <Input
            id="salary_max"
            name="salary_max"
            type="number"
            min={0}
            defaultValue={job?.salary_max ?? ""}
          />
        </div>

        {/* Application Deadline */}
        <div className="space-y-2">
          <Label htmlFor="application_deadline">Application Deadline</Label>
          <Input
            id="application_deadline"
            name="application_deadline"
            type="datetime-local"
            defaultValue={
              job?.application_deadline
                ? job.application_deadline.slice(0, 16)
                : defaultDeadline()
            }
          />
        </div>

        {/* Remote */}
        <div className="flex items-center gap-2 pt-7">
          <Checkbox
            id="is_remote"
            name="is_remote"
            defaultChecked={job?.is_remote ?? false}
          />
          <Label htmlFor="is_remote" className="font-normal">
            {t("remote")}
          </Label>
        </div>
      </div>

      {/* Description (EN) */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          ref={descRef}
          id="description"
          name="description"
          rows={6}
          required
          defaultValue={job?.description ?? ""}
        />
      </div>

      {/* Description (KA) */}
      <div className="space-y-2">
        <Label htmlFor="description_ka">Description (Georgian)</Label>
        <Textarea
          ref={descKaRef}
          id="description_ka"
          name="description_ka"
          rows={6}
          defaultValue={job?.description_ka ?? ""}
        />
      </div>

      {/* Requirements (EN) */}
      <div className="space-y-2">
        <Label htmlFor="requirements">Requirements</Label>
        <Textarea
          ref={reqRef}
          id="requirements"
          name="requirements"
          rows={4}
          defaultValue={job?.requirements ?? ""}
        />
      </div>

      {/* Requirements (KA) */}
      <div className="space-y-2">
        <Label htmlFor="requirements_ka">Requirements (Georgian)</Label>
        <Textarea
          ref={reqKaRef}
          id="requirements_ka"
          name="requirements_ka"
          rows={4}
          defaultValue={job?.requirements_ka ?? ""}
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label htmlFor="tags">Tags / Skills</Label>
        <Input
          ref={tagsRef}
          id="tags"
          name="tags"
          defaultValue={job?.tags?.join(", ") ?? ""}
          placeholder="React, TypeScript, Node.js"
        />
      </div>

      <div className="flex justify-end">
        <SubmitButton pendingText="...">
          {mode === "create" ? tc("create") : tc("save")}
        </SubmitButton>
      </div>
    </form>
  );
}
