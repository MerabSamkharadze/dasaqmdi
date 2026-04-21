import { LoginForm } from "@/components/login-form";
import { redirectIfAuthenticated } from "@/lib/auth-guards";

export default async function LoginPage() {
  await redirectIfAuthenticated();
  return <LoginForm />;
}
