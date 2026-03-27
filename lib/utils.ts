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
  const kaField = `${field}_ka` as keyof T;
  const enField = field as keyof T;

  if (locale === "ka") {
    return (obj[kaField] as string) || (obj[enField] as string) || "";
  }
  return (obj[enField] as string) || (obj[kaField] as string) || "";
}
