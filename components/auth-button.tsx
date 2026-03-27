import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? (
    <div className="flex items-center gap-3 pl-2">
      <span className="hidden sm:inline text-[13px] text-muted-foreground truncate max-w-[160px]">
        {user.email}
      </span>
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-1.5 pl-1.5">
      <Button asChild size="sm" variant="ghost">
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant="default">
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
