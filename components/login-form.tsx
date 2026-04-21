"use client";

import { cn } from "@/lib/utils";
import { loginAction } from "@/lib/actions/auth";
import type { ActionResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HeroIllustration } from "@/components/shared/hero-illustration";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { FacebookAuthButton } from "@/components/auth/facebook-auth-button";
import { LinkedInAuthButton } from "@/components/auth/linkedin-auth-button";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

const initialState: ActionResult = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useTranslations("auth");

  return (
    <Button type="submit" className="w-full h-11 text-[14px]" disabled={pending}>
      {pending ? "..." : t("login")}
    </Button>
  );
}

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [state, formAction] = useFormState(loginAction, initialState);
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") ?? "";

  return (
    <div className={cn("flex flex-col", className)} {...props}>
      {/* Illustration */}
      <div className="flex justify-center mb-6">
        <div className="w-36">
          <HeroIllustration src="/illustrations/laptop.svg" />
        </div>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">{t("login")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("loginDescription")}
        </p>
      </div>

      {/* Form */}
      <form action={formAction} className="flex flex-col gap-5">
        {returnUrl && <input type="hidden" name="returnUrl" value={returnUrl} />}
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
            aria-describedby={state.error ? "login-error" : undefined}
            className="h-11 bg-card"
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="password" className="text-[13px]">
              {t("password")}
            </Label>
            <Link
              href="/auth/forgot-password"
              className="ml-auto text-[12px] text-muted-foreground hover:text-primary transition-colors"
            >
              {t("forgotPassword")}
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            required
            aria-invalid={!!state.error}
            aria-describedby={state.error ? "login-error" : undefined}
            className="h-11 bg-card"
          />
        </div>

        {/* Error */}
        {state.error && (
          <div id="login-error" role="alert" className="rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
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

      {/* OAuth buttons */}
      <div className="flex flex-col gap-2.5">
        <GoogleAuthButton />
        <FacebookAuthButton />
        <LinkedInAuthButton />
      </div>

      {/* Sign up link */}
      <p className="mt-8 text-center text-sm text-muted-foreground">
        {t("noAccount")}{" "}
        <Link
          href="/auth/sign-up"
          className="font-medium text-primary hover:text-primary/80 transition-colors"
        >
          {t("signUp")}
        </Link>
      </p>
    </div>
  );
}
