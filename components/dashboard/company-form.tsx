"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { useTranslations } from "next-intl";
import { createCompanyAction, updateCompanyAction } from "@/lib/actions/company";
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
import { FileUpload } from "@/components/shared/file-upload";
import { EMPLOYEE_COUNTS } from "@/lib/types/enums";
import type { Company } from "@/lib/types";
import type { ActionResult } from "@/lib/types";

const initialState: ActionResult = { error: null };

type CompanyFormProps = {
  company?: Company;
  mode: "create" | "edit";
  userId: string;
};

export function CompanyForm({ company, mode, userId }: CompanyFormProps) {
  const action = mode === "create" ? createCompanyAction : updateCompanyAction;
  const [state, formAction] = useFormState(action, initialState);
  const t = useTranslations("company");
  const tc = useTranslations("common");
  const [logoUrl, setLogoUrl] = useState(company?.logo_url ?? "");

  return (
    <form action={formAction} className="space-y-6">
      {company && <input type="hidden" name="company_id" value={company.id} />}
      <input type="hidden" name="logo_url" value={logoUrl} />

      {state.error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {mode === "edit" && state.error === null && state !== initialState && (
        <div className="rounded-lg border border-green-500/50 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400">
          {t("editCompany")} ✓
        </div>
      )}

      {/* Logo Upload */}
      <div className="space-y-2">
        <Label>{t("logo")}</Label>
        <FileUpload
          bucket="company-logos"
          userId={userId}
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          maxSizeMB={2}
          currentUrl={company?.logo_url}
          onUploadComplete={setLogoUrl}
          onRemove={() => setLogoUrl("")}
          label={t("logo")}
          prefix="logo"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Company Name (EN) */}
        <div className="space-y-2">
          <Label htmlFor="name">{t("name")}</Label>
          <Input
            id="name"
            name="name"
            required
            defaultValue={company?.name ?? ""}
          />
        </div>

        {/* Company Name (KA) */}
        <div className="space-y-2">
          <Label htmlFor="name_ka">{t("nameKa")}</Label>
          <Input
            id="name_ka"
            name="name_ka"
            defaultValue={company?.name_ka ?? ""}
          />
        </div>

        {/* Website */}
        <div className="space-y-2">
          <Label htmlFor="website">{t("website")}</Label>
          <Input
            id="website"
            name="website"
            type="url"
            placeholder="https://"
            defaultValue={company?.website ?? ""}
          />
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label htmlFor="city">{t("city")}</Label>
          <Input
            id="city"
            name="city"
            defaultValue={company?.city ?? ""}
          />
        </div>

        {/* Address (EN) */}
        <div className="space-y-2">
          <Label htmlFor="address">{t("address")}</Label>
          <Input
            id="address"
            name="address"
            defaultValue={company?.address ?? ""}
          />
        </div>

        {/* Address (KA) */}
        <div className="space-y-2">
          <Label htmlFor="address_ka">{t("addressKa")}</Label>
          <Input
            id="address_ka"
            name="address_ka"
            defaultValue={company?.address_ka ?? ""}
          />
        </div>

        {/* Employee Count */}
        <div className="space-y-2">
          <Label htmlFor="employee_count">{t("employeeCount")}</Label>
          <Select
            name="employee_count"
            defaultValue={company?.employee_count ?? undefined}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EMPLOYEE_COUNTS.map((count) => (
                <SelectItem key={count} value={count}>
                  {count}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Description (EN) */}
      <div className="space-y-2">
        <Label htmlFor="description">{t("description")}</Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={company?.description ?? ""}
        />
      </div>

      {/* Description (KA) */}
      <div className="space-y-2">
        <Label htmlFor="description_ka">{t("descriptionKa")}</Label>
        <Textarea
          id="description_ka"
          name="description_ka"
          rows={4}
          defaultValue={company?.description_ka ?? ""}
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
