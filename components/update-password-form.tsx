"use client";

import { cn } from "@/lib/utils";
import { updatePasswordAction } from "@/lib/actions/auth";
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
import { useFormState, useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";

const initialState: ActionResult = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useTranslations("common");

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "..." : t("save")}
    </Button>
  );
}

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [state, formAction] = useFormState(updatePasswordAction, initialState);
  const t = useTranslations("auth");

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t("updatePassword")}</CardTitle>
          <CardDescription>{t("updatePasswordDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password">{t("newPassword")}</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                />
              </div>
              {state.error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  <p>{state.error}</p>
                  {(state.error.includes("expired") || state.error.includes("Invalid")) && (
                    <a href="/auth/forgot-password" className="underline mt-1 inline-block text-destructive/80 hover:text-destructive">
                      {t("requestNewLink")}
                    </a>
                  )}
                </div>
              )}
              <SubmitButton />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
