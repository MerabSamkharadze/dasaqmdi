import { Sparkles } from "lucide-react";
import type { ResolvedCategory } from "@/lib/queries/jobs";

type Props = {
  originalTerm: string;
  resolvedCategories: ResolvedCategory[];
  locale: string;
  // ICU-pre-substituted template with `{term}` and `{categories}` placeholders
  // still in place — we swap in plain text on the server/client depending on
  // locale. Keeps the translation format simple and avoids next-intl client
  // hydration for just two strings.
  template: string;
};

export function SearchFallbackBanner({ originalTerm, resolvedCategories, locale, template }: Props) {
  if (resolvedCategories.length === 0) return null;

  const names = resolvedCategories
    .map((c) => (locale === "ka" ? c.name_ka : c.name_en))
    .join(", ");

  const message = template
    .replace("{term}", () => originalTerm)
    .replace("{categories}", () => names);

  return (
    <div className="flex items-start gap-2 rounded-lg border border-primary/15 bg-primary/5 px-3 py-2 text-[12px] text-primary">
      <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
