import { cache } from "react";
import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Server-rendered inline SVG illustration. The underlying SVGs embed their
 * own <style> animation blocks (see /public/illustrations/*.svg), so we must
 * inline them to preserve animation — `next/image` strips <style> content.
 *
 * Previously this was a client component that fetched the SVG in useEffect,
 * which blocked LCP until the secondary network round-trip completed. Now
 * the SVG markup is in the initial HTML response.
 */

const readSvg = cache(async (src: string): Promise<string> => {
  try {
    const publicDir = path.join(process.cwd(), "public");
    // `src` is always of the form "/illustrations/<name>.svg"
    const absolute = path.join(publicDir, src);
    return await readFile(absolute, "utf8");
  } catch {
    return "";
  }
});

export async function HeroIllustration({
  src = "/illustrations/hero.svg",
}: {
  src?: string;
}) {
  const svg = await readSvg(src);

  return (
    <div
      className="w-full aspect-square [&>svg]:w-full [&>svg]:h-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
