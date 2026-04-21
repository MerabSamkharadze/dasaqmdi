import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { redirectIfAuthenticated } from "@/lib/auth-guards";

export default async function ForgotPasswordPage() {
  await redirectIfAuthenticated();
  return <ForgotPasswordForm />;
}
