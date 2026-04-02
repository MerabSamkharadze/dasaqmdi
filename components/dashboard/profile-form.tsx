"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
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
import type { Profile } from "@/lib/types";
import type { ActionResult } from "@/lib/types";

const initialState: ActionResult<string> = { error: null };

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction] = useFormState(updateProfileAction, initialState);
  const t = useTranslations("profile");
  const tc = useTranslations("common");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");
  const [resumeUrl, setResumeUrl] = useState(profile.resume_url ?? "");

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="avatar_url" value={avatarUrl} />
      <input type="hidden" name="resume_url" value={resumeUrl} />

      {state.error && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {state.data === "success" && !state.error && (
        <div className="rounded-xl border border-green-500/50 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400">
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

      <div className="flex justify-end">
        <SubmitButton pendingText="...">{tc("save")}</SubmitButton>
      </div>
    </form>
  );
}
