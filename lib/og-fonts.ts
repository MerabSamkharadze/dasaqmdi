/**
 * Load fonts for next/og ImageResponse (edge runtime).
 * Cached aggressively — social crawlers hit these routes unpredictably,
 * so we want to avoid Google Fonts latency on cold requests.
 */

const NOTO_GEORGIAN_URL =
  "https://fonts.gstatic.com/s/notosansgeorgian/v44/PlIaFke5O6RzLfvNNVSitxkr76PRHBC4Ytyq-Gof7PUs4S7zWn-8YDB09HFNdpvnzFj-f5WK0OQV.woff2";

export async function loadNotoGeorgian(): Promise<ArrayBuffer> {
  const res = await fetch(NOTO_GEORGIAN_URL, {
    cache: "force-cache",
    next: { revalidate: 60 * 60 * 24 * 30 }, // 30 days
  });
  if (!res.ok) {
    throw new Error(`Failed to load Noto Sans Georgian: ${res.status}`);
  }
  return res.arrayBuffer();
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
