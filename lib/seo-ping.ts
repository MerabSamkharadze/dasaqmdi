import { siteConfig } from "@/lib/config";

/**
 * Notify search engines about new/updated URLs.
 * Fire-and-forget — never blocks the calling action.
 */
export function pingIndexNow(urls: string[]) {
  if (!process.env.CRON_SECRET || !process.env.INDEXNOW_KEY) return;

  fetch(`${siteConfig.url}/api/indexnow`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.CRON_SECRET}`,
    },
    body: JSON.stringify({ urls }),
  }).catch(() => {});
}

/**
 * Ping for a new job — notifies both ka and en URLs + sitemap.
 */
export function pingNewJob(jobId: string) {
  pingIndexNow([
    `/jobs/${jobId}`,
    `/en/jobs/${jobId}`,
    `/sitemap.xml`,
  ]);
}
