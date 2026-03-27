"use client";

import { cn } from "@/lib/utils";
import { forgotPasswordAction } from "@/lib/actions/auth";
import type { ActionResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";

const initialState: ActionResult = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useTranslations("auth");

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "..." : t("resetPassword")}
    </Button>
  );
}

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [state, formAction] = useFormState(forgotPasswordAction, initialState);
  const t = useTranslations("auth");

  // If error is null and form was submitted, show success
  const isSuccess = state.error === null && state !== initialState;

  if (isSuccess) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t("resetPassword")}</CardTitle>
            <CardDescription>{t("resetSent")}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t("resetPassword")}</CardTitle>
          <CardDescription>{t("resetPasswordDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              {state.error && (
                <p className="text-sm text-red-500">{state.error}</p>
              )}
              <SubmitButton />
            </div>
            <div className="mt-4 text-center text-sm">
              {t("hasAccount")}{" "}
              <Link
                href="/auth/login"
                className="underline underline-offset-4"
              >
                {t("login")}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
