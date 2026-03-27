"use client";

import { cn } from "@/lib/utils";
import { signUpAction } from "@/lib/actions/auth";
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
import { useState } from "react";

const initialState: ActionResult = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useTranslations("auth");

  return (
    <Button type="submit" className="w-full" disabled={pending}>
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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t("signUp")}</CardTitle>
          <CardDescription>{t("signUpDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction}>
            <div className="flex flex-col gap-6">
              {/* Role selection */}
              <div className="grid gap-2">
                <Label>{t("selectRole")}</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedRole("seeker")}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-lg border p-3 text-sm transition-colors",
                      selectedRole === "seeker"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-accent",
                    )}
                  >
                    <span className="font-medium">
                      {t("roleSeekerLabel")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {t("roleSeekerDescription")}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole("employer")}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-lg border p-3 text-sm transition-colors",
                      selectedRole === "employer"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-accent",
                    )}
                  >
                    <span className="font-medium">
                      {t("roleEmployerLabel")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {t("roleEmployerDescription")}
                    </span>
                  </button>
                </div>
                <input type="hidden" name="role" value={selectedRole} />
              </div>

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
              <div className="grid gap-2">
                <Label htmlFor="password">{t("password")}</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">
                  {t("confirmPassword")}
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
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
