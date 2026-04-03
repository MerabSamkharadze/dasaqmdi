import { createClient } from "@supabase/supabase-js";
import { getBot, MESSAGES } from "@/lib/telegram/bot";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: Request) {
  // Verify secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { job_id } = await req.json();
  if (!job_id) {
    return new Response("Missing job_id", { status: 400 });
  }

  const supabase = getServiceClient();

  // Fetch job with company and category
  const { data: job } = await supabase
    .from("jobs")
    .select("id, title, title_ka, city, salary_min, salary_max, salary_currency, job_type, category:categories!inner(slug, name_en, name_ka), company:companies!inner(name, name_ka)")
    .eq("id", job_id)
    .single();

  if (!job) {
    return Response.json({ error: "Job not found" }, { status: 404 });
  }

  const categorySlug = (job.category as unknown as { slug: string }).slug;
  const companyName = (job.company as unknown as { name: string; name_ka: string | null });
  const categoryName = (job.category as unknown as { name_en: string; name_ka: string });

  // Find active subscribers for this category
  const { data: subscribers } = await supabase
    .from("telegram_subscriptions")
    .select("chat_id, locale")
    .eq("is_active", true)
    .contains("categories", [categorySlug]);

  if (!subscribers || subscribers.length === 0) {
    return Response.json({ sent: 0 });
  }

  const bot = getBot();
  const baseUrl = "https://dasakmdi.com";
  let sentCount = 0;

  // Format salary
  function formatSalary(min: number | null, max: number | null, currency: string): string | null {
    if (!min && !max) return null;
    if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`;
    if (min) return `${min.toLocaleString()}+ ${currency}`;
    return `${max!.toLocaleString()} ${currency}`;
  }

  const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency);

  // Send to each subscriber (with rate limiting: 30/sec)
  for (let i = 0; i < subscribers.length; i++) {
    const sub = subscribers[i];
    const locale = (sub.locale ?? "ka") as "ka" | "en";
    const msg = MESSAGES[locale];

    const title = locale === "ka" && job.title_ka ? job.title_ka : job.title;
    const company = locale === "ka" && companyName.name_ka ? companyName.name_ka : companyName.name;
    const category = locale === "ka" ? categoryName.name_ka : categoryName.name_en;
    const jobUrl = locale === "ka" ? `${baseUrl}/jobs/${job.id}` : `${baseUrl}/en/jobs/${job.id}`;

    let text = `${msg.newJob}\n\n`;
    text += `💼 *${title}*\n`;
    text += `🏢 ${company}\n`;
    text += `📂 ${category}\n`;
    if (job.city) text += `📍 ${job.city}\n`;
    if (salary) text += `💰 ${salary}\n`;
    text += `\n🔗 [${locale === "ka" ? "ნახე ვაკანსია" : "View job"}](${jobUrl})`;

    try {
      await bot.api.sendMessage(sub.chat_id, text, { parse_mode: "Markdown" });
      sentCount++;
    } catch (err) {
      console.error(`Failed to send to chat ${sub.chat_id}:`, err);
      // If blocked by user, deactivate subscription
      if (err instanceof Error && err.message.includes("blocked")) {
        await supabase
          .from("telegram_subscriptions")
          .update({ is_active: false })
          .eq("chat_id", sub.chat_id);
      }
    }

    // Rate limit: 30 messages per second
    if ((i + 1) % 25 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return Response.json({ sent: sentCount, total: subscribers.length });
}
