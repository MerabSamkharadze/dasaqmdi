"use client";

import { useRef, useState } from "react";
import { useFormState } from "react-dom";
import { useScrollOnSave } from "@/lib/hooks/use-scroll-on-save";
import { useTranslations } from "next-intl";
import { updateProfileAction } from "@/lib/actions/profile";
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
import { Checkbox } from "@/components/ui/checkbox";
import type { Profile } from "@/lib/types";
import type { ActionResult } from "@/lib/types";

const initialState: ActionResult<string> = { error: null };

type CategoryOption = { slug: string; label: string };

export function ProfileForm({ profile, categories = [] }: { profile: Profile; categories?: CategoryOption[] }) {
  const [state, formAction] = useFormState(updateProfileAction, initialState);
  const t = useTranslations("profile");
  const tc = useTranslations("common");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");
  const [resumeUrl, setResumeUrl] = useState(profile.resume_url ?? "");
  const formRef = useRef<HTMLFormElement>(null);
  useScrollOnSave(state, formRef);

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      <input type="hidden" name="avatar_url" value={avatarUrl} />
      <input type="hidden" name="resume_url" value={resumeUrl} />

      {state.error && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {state.data === "success" && !state.error && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary">
          {t("updateSuccess")}
        </div>
      )}

      {/* Avatar Upload */}
      <div className="space-y-2">
        <Label>{t("avatar")}</Label>
        <FileUpload
          bucket="avatars"
          userId={profile.id}
          accept="image/png,image/jpeg,image/webp"
          maxSizeMB={2}
          currentUrl={profile.avatar_url}
          onUploadComplete={setAvatarUrl}
          onRemove={() => setAvatarUrl("")}
          label={t("uploadAvatar")}
          prefix="avatar"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Full Name (EN) */}
        <div className="space-y-2">
          <Label htmlFor="full_name">{t("fullName")}</Label>
          <Input
            id="full_name"
            name="full_name"
            defaultValue={profile.full_name ?? ""}
          />
        </div>

        {/* Full Name (KA) */}
        <div className="space-y-2">
          <Label htmlFor="full_name_ka">{t("fullNameKa")}</Label>
          <Input
            id="full_name_ka"
            name="full_name_ka"
            defaultValue={profile.full_name_ka ?? ""}
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">{t("phone")}</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={profile.phone ?? ""}
          />
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label htmlFor="city">{t("city")}</Label>
          <Input
            id="city"
            name="city"
            defaultValue={profile.city ?? ""}
          />
        </div>

        {/* Experience Years */}
        <div className="space-y-2">
          <Label htmlFor="experience_years">{t("experienceYears")}</Label>
          <Input
            id="experience_years"
            name="experience_years"
            type="number"
            min={0}
            max={50}
            defaultValue={profile.experience_years ?? ""}
          />
        </div>

        {/* Preferred Language */}
        <div className="space-y-2">
          <Label htmlFor="preferred_language">{t("language")}</Label>
          <Select
            name="preferred_language"
            defaultValue={profile.preferred_language}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ka">ქართული</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Skills */}
      <div className="space-y-2">
        <Label htmlFor="skills">{t("skills")}</Label>
        <Input
          id="skills"
          name="skills"
          defaultValue={profile.skills?.join(", ") ?? ""}
          placeholder={t("skillsPlaceholder")}
        />
      </div>

      {/* Bio (EN) */}
      <div className="space-y-2">
        <Label htmlFor="bio">{t("bio")}</Label>
        <Textarea
          id="bio"
          name="bio"
          rows={4}
          defaultValue={profile.bio ?? ""}
        />
      </div>

      {/* Bio (KA) */}
      <div className="space-y-2">
        <Label htmlFor="bio_ka">{t("bioKa")}</Label>
        <Textarea
          id="bio_ka"
          name="bio_ka"
          rows={4}
          defaultValue={profile.bio_ka ?? ""}
        />
      </div>

      {/* Resume Upload */}
      <div className="space-y-2">
        <Label>{t("resume")}</Label>
        <FileUpload
          bucket="resumes"
          userId={profile.id}
          accept=".pdf,.doc,.docx"
          maxSizeMB={10}
          currentUrl={profile.resume_url}
          onUploadComplete={setResumeUrl}
          onRemove={() => setResumeUrl("")}
          label={t("uploadResume")}
          prefix="resume"
        />
      </div>

      {/* Preferred Categories */}
      {categories.length > 0 && (
        <PreferredCategoriesSection
          categories={categories}
          initialSelected={profile.preferred_categories ?? []}
          title={t("preferredCategories")}
          hint={t("preferredCategoriesHint")}
        />
      )}

      {/* Privacy & Notifications */}
      <div className="pt-4 border-t border-border/60 space-y-4">
        <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
          {t("settingsTitle")}
        </h3>

        <div className="flex items-center gap-2">
          <Checkbox
            id="is_public"
            name="is_public"
            defaultChecked={profile.is_public ?? true}
          />
          <Label htmlFor="is_public" className="font-normal text-sm">
            {t("publicProfile")}
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="email_digest"
            name="email_digest"
            defaultChecked={profile.email_digest ?? true}
          />
          <Label htmlFor="email_digest" className="font-normal text-sm">
            {t("emailDigest")}
          </Label>
        </div>
      </div>

      <div className="flex justify-end">
        <SubmitButton pendingText="...">{tc("save")}</SubmitButton>
      </div>
    </form>
  );
}

function PreferredCategoriesSection({
  categories,
  initialSelected,
  title,
  hint,
}: {
  categories: CategoryOption[];
  initialSelected: string[];
  title: string;
  hint: string;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSelected));

  function toggle(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  return (
    <div className="pt-4 border-t border-border/60 space-y-3">
      <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="text-[12px] text-muted-foreground/60">{hint}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {categories.map((cat) => {
          const isSelected = selected.has(cat.slug);
          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() => toggle(cat.slug)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-all duration-200 text-[13px] min-w-0 overflow-hidden ${
                isSelected
                  ? "border-primary/40 bg-primary/5 text-primary"
                  : "border-border/60 text-muted-foreground hover:border-border hover:bg-muted/30"
              }`}
            >
              <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"
              }`}>
                {isSelected && <span className="text-[10px]">✓</span>}
              </span>
              <span className="truncate">{cat.label}</span>
            </button>
          );
        })}
      </div>
      {/* Hidden inputs for form submission */}
      {Array.from(selected).map((slug) => (
        <input key={slug} type="hidden" name="preferred_categories" value={slug} />
      ))}
    </div>
  );
}
