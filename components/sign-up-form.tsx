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
import { GoogleAuthButton } from "@/components/auth/google-auth-button";

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
        <Logo className="[&_svg]:w-14 [&_svg]:h-14" />
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
          <div role="radiogroup" aria-label={t("selectRole")} className="grid grid-cols-2 gap-2">
            <button
              type="button"
              role="radio"
              aria-checked={selectedRole === "seeker"}
              onClick={() => setSelectedRole("seeker")}
              className={cn(
                "flex items-center gap-2.5 rounded-xl border-2 px-3 py-2.5 transition-all duration-200",
                selectedRole === "seeker"
                  ? "border-primary bg-primary/8"
                  : "border-border hover:border-primary/30",
              )}
            >
              <User
                className={cn(
                  "h-4 w-4 shrink-0",
                  selectedRole === "seeker" ? "text-primary" : "text-muted-foreground",
                )}
              />
              <span className="text-[13px] font-medium">
                {t("roleSeekerLabel")}
              </span>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={selectedRole === "employer"}
              onClick={() => setSelectedRole("employer")}
              className={cn(
                "flex items-center gap-2.5 rounded-xl border-2 px-3 py-2.5 transition-all duration-200",
                selectedRole === "employer"
                  ? "border-primary bg-primary/8"
                  : "border-border hover:border-primary/30",
              )}
            >
              <Briefcase
                className={cn(
                  "h-4 w-4 shrink-0",
                  selectedRole === "employer" ? "text-primary" : "text-muted-foreground",
                )}
              />
              <span className="text-[13px] font-medium">
                {t("roleEmployerLabel")}
              </span>
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
            aria-invalid={!!state.error}
            aria-describedby={state.error ? "signup-error" : undefined}
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
            aria-invalid={!!state.error}
            aria-describedby={state.error ? "signup-error" : undefined}
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
            aria-invalid={!!state.error}
            aria-describedby={state.error ? "signup-error" : undefined}
            className="h-11 bg-card"
          />
        </div>

        {/* Error */}
        {state.error && (
          <div id="signup-error" role="alert" className="rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
            {state.error}
          </div>
        )}

        {/* Submit */}
        <SubmitButton />
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/40" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-3 text-[12px] text-muted-foreground/60">
            {t("orContinueWith")}
          </span>
        </div>
      </div>

      {/* Google OAuth */}
      <GoogleAuthButton />

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
