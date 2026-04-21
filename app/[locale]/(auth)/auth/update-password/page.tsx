import { UpdatePasswordForm } from "@/components/update-password-form";
import { requireAuthenticated } from "@/lib/auth-guards";

export default async function UpdatePasswordPage() {
  // Recovery link establishes a session via /auth/confirm.
  // Without a session, the reset link is invalid or expired.
  await requireAuthenticated("/auth/forgot-password");
  return <UpdatePasswordForm />;
}
