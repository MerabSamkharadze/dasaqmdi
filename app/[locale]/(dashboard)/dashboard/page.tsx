import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const t = await getTranslations("dashboard");

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <h1 className="text-3xl font-bold">
        {t("welcome", { name: user.email?.split("@")[0] ?? "" })}
      </h1>
      <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground">
        <pre className="text-xs font-mono overflow-auto max-h-48">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
    </div>
  );
}
