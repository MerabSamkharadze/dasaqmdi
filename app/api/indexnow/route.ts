import { siteConfig } from "@/lib/config";

const INDEXNOW_KEY = process.env.INDEXNOW_KEY;

export async function POST(req: Request) {
  // Verify internal call
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!INDEXNOW_KEY) {
    return Response.json({ error: "INDEXNOW_KEY not configured" }, { status: 500 });
  }

  let urls: string[];
  try {
    const body = await req.json();
    urls = Array.isArray(body.urls) ? body.urls : [body.url];
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (urls.length === 0) {
    return Response.json({ error: "No URLs" }, { status: 400 });
  }

  // Ping Bing IndexNow
  try {
    await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host: new URL(siteConfig.url).hostname,
        key: INDEXNOW_KEY,
        keyLocation: `${siteConfig.url}/${INDEXNOW_KEY}.txt`,
        urlList: urls.map((u) => (u.startsWith("http") ? u : `${siteConfig.url}${u}`)),
      }),
    });
  } catch {
    // Non-blocking — don't fail if IndexNow is down
  }

  return Response.json({ submitted: urls.length });
}
