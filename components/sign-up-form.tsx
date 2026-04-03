"use client";

import { cn } from "@/lib/utils";
import { signUpAction } from "@/lib/actions/auth";
import type { ActionResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/brand/logo";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Briefcase, User } from "lucide-react";

const initialState: ActionResult = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useTranslations("auth");

  return (
    <Button type="submit" className="w-full h-11 text-[14px]" disabled={pending}>
      {pending ? "..." : t("signUp")}
    </Button>
  );
}

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [state, formAction] = useFormState(signUpAction, initialState);
  const [selectedRole, setSelectedRole] = useState<"seeker" | "employer">(
    "seeker",
  );
  const t = useTranslations("auth");

  return (
    <div className={cn("flex flex-col", className)} {...props}>
      {/* Mobile logo — hidden on desktop (branding panel handles it) */}
      <div className="flex lg:hidden justify-center mb-10">
        <Logo />
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("signUp")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("signUpDescription")}
        </p>
      </div>

      {/* Form */}
      <form action={formAction} className="flex flex-col gap-5">
        {/* Role selection */}
        <div className="space-y-2.5">
          <Label className="text-[13px]">{t("selectRole")}</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedRole("seeker")}
              className={cn(
                "flex flex-col items-center gap-2.5 rounded-xl border-2 p-4 transition-all duration-200",
                selectedRole === "seeker"
                  ? "border-primary bg-primary/8 shadow-soft"
                  : "border-border hover:border-primary/30 hover:bg-primary/[0.03]",
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                  selectedRole === "seeker" ? "bg-primary/12" : "bg-muted",
                )}
              >
                <User
                  className={cn(
                    "h-5 w-5",
                    selectedRole === "seeker"
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                />
              </div>
              <div className="text-center">
                <span className="text-sm font-medium block">
                  {t("roleSeekerLabel")}
                </span>
                <span className="text-[11px] text-muted-foreground mt-0.5 block">
                  {t("roleSeekerDescription")}
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole("employer")}
              className={cn(
                "flex flex-col items-center gap-2.5 rounded-xl border-2 p-4 transition-all duration-200",
                selectedRole === "employer"
                  ? "border-primary bg-primary/8 shadow-soft"
                  : "border-border hover:border-primary/30 hover:bg-primary/[0.03]",
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                  selectedRole === "employer" ? "bg-primary/12" : "bg-muted",
                )}
              >
                <Briefcase
                  className={cn(
                    "h-5 w-5",
                    selectedRole === "employer"
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                />
              </div>
              <div className="text-center">
                <span className="text-sm font-medium block">
                  {t("roleEmployerLabel")}
                </span>
                <span className="text-[11px] text-muted-foreground mt-0.5 block">
                  {t("roleEmployerDescription")}
                </span>
              </div>
            </button>
          </div>
          <input type="hidden" name="role" value={selectedRole} />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[13px]">
            {t("email")}
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            required
            className="h-11 bg-card"
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-[13px]">
            {t("password")}
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            className="h-11 bg-card"
          />
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-[13px]">
            {t("confirmPassword")}
          </Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            className="h-11 bg-card"
          />
        </div>

        {/* Error */}
        {state.error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
            {state.error}
          </div>
        )}

        {/* Submit */}
        <SubmitButton />
      </form>

      {/* Login link */}
      <p className="mt-8 text-center text-sm text-muted-foreground">
        {t("hasAccount")}{" "}
        <Link
          href="/auth/login"
          className="font-medium text-primary hover:text-primary/80 transition-colors"
        >
          {t("login")}
        </Link>
      </p>
    </div>
  );
}
