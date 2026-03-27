"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type AuthActionResult = {
  error: string | null;
};

export async function loginAction(formData: FormData): Promise<AuthActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/protected");
}

export async function signUpAction(formData: FormData): Promise<AuthActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const supabase = createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL ? "" : "http://localhost:3000"}/auth/confirm`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/auth/sign-up-success");
}

export async function logoutAction(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}

export async function forgotPasswordAction(formData: FormData): Promise<AuthActionResult> {
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Email is required." };
  }

  const supabase = createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL ? "" : "http://localhost:3000"}/auth/update-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

export async function updatePasswordAction(formData: FormData): Promise<AuthActionResult> {
  const password = formData.get("password") as string;

  if (!password) {
    return { error: "Password is required." };
  }

  const supabase = createClient();

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  redirect("/protected");
}