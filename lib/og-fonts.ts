/**
 * Load fonts for next/og ImageResponse (edge runtime).
 * Cached aggressively — social crawlers hit these routes unpredictably,
 * so we want to avoid Google Fonts latency on cold requests.
 */

// Satori supports TTF/OTF/WOFF (NOT WOFF2). jsDelivr serves the fontsource
// package directly — more reliable than Google Fonts CDN for edge fetches.
const NOTO_GEORGIAN_URL =
  "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-georgian@5.0.11/files/noto-sans-georgian-georgian-500-normal.woff";

export async function loadNotoGeorgian(): Promise<ArrayBuffer> {
  const res = await fetch(NOTO_GEORGIAN_URL, {
    cache: "force-cache",
    next: { revalidate: 60 * 60 * 24 * 30 }, // 30 days
  });
  if (!res.ok) {
    throw new Error(`Failed to load Noto Sans Georgian: ${res.status}`);
  }
  const buffer = await res.arrayBuffer();
  // Sanity check — Satori will reject HTML error pages with a cryptic
  // "Unsupported OpenType signature <!DO" message, so surface it clearly.
  const header = new Uint8Array(buffer.slice(0, 4));
  if (header[0] === 0x3c) {
    throw new Error("Font CDN returned HTML instead of binary font file");
  }
  return buffer;
}

export function georgianFontConfig(data: ArrayBuffer) {
  return {
    fonts: [
      {
        name: "Noto Sans Georgian",
        data,
        style: "normal" as const,
        weight: 500 as const,
      },
    ],
  };
}
