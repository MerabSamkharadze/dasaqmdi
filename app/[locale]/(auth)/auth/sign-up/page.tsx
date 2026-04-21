import { SignUpForm } from "@/components/sign-up-form";
import { redirectIfAuthenticated } from "@/lib/auth-guards";

export default async function SignUpPage() {
  await redirectIfAuthenticated();
  return <SignUpForm />;
}
