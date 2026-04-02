import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns the localized value of a bilingual field.
 * Falls back to the other language if the preferred one is empty.
 */
export function localized<T extends Record<string, unknown>>(
  obj: T,
  field: string,
  locale: string,
): string {
  const kaField = `${field}_ka`;
  const enField = field;

  const kaValue = obj[kaField];
  const enValue = obj[enField];

  // L5 FIX: Runtime type check instead of blind `as string` cast
  const ka = typeof kaValue === "string" ? kaValue : "";
  const en = typeof enValue === "string" ? enValue : "";

  if (locale === "ka") {
    return ka || en;
  }
  return en || ka;
}
