import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const t = await getTranslations("errors");

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t("authError")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {searchParams?.error ?? t("generic")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
