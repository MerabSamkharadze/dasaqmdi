import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslations } from "next-intl";

export default function SignUpSuccessPage() {
  const t = useTranslations("auth");

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t("signUpSuccess")}</CardTitle>
          <CardDescription>{t("signUpSuccessDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t("signUpSuccessDescription")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
