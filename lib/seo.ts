import type { Metadata } from "next";

/**
 * Build canonical + hreflang alternates for a bilingual page.
 * `path` is the locale-less path (e.g. "/jobs", "/companies/acme").
 */
export function buildAlternates(
  path: string,
  locale: string,
): NonNullable<Metadata["alternates"]> {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const kaPath = cleanPath === "/" ? "/" : cleanPath;
  const enPath = cleanPath === "/" ? "/en" : `/en${cleanPath}`;
  const canonical = locale === "en" ? enPath : kaPath;

  return {
    canonical,
    languages: {
      ka: kaPath,
      en: enPath,
      "x-default": kaPath,
    },
  };
}
