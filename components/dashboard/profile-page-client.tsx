"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ProfileView } from "./profile-view";
import { ProfileForm } from "./profile-form";
import { Button } from "@/components/ui/button";
import { Pencil, ArrowLeft } from "lucide-react";
import type { Profile } from "@/lib/types";

type CategoryOption = { slug: string; label: string };

type ProfilePageClientProps = {
  profile: Profile;
  email: string;
  categories: CategoryOption[];
};

export function ProfilePageClient({ profile, email, categories }: ProfilePageClientProps) {
  const [editing, setEditing] = useState(false);
  const t = useTranslations("profile");
  const tc = useTranslations("common");

  if (editing) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight">{t("editProfile")}</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditing(false)}
            className="gap-1.5 text-muted-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {tc("cancel")}
          </Button>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-5 sm:p-8 shadow-soft">
          <ProfileForm profile={profile} categories={categories} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">{t("title")}</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditing(true)}
          className="gap-1.5 rounded-xl"
        >
          <Pencil className="h-3.5 w-3.5" />
          {tc("edit")}
        </Button>
      </div>
      <ProfileView profile={profile} email={email} t={t} />
    </div>
  );
}
