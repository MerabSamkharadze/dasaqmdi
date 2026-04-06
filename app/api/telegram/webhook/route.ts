import { webhookCallback } from "grammy";
import { getBot, buildCategoryKeyboard, MESSAGES, CATEGORIES } from "@/lib/telegram/bot";
import { createClient } from "@supabase/supabase-js";

// Supabase service client for bot operations (no cookie context)
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function setupBotHandlers() {
  const bot = getBot();

  // /start — welcome + category selection
  bot.command("start", async (ctx) => {
    const supabase = getServiceClient();
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    // Check if already exists
    const { data: existing } = await supabase
      .from("telegram_subscriptions")
      .select("categories, locale")
      .eq("telegram_id", telegramId)
      .single();

    if (existing) {
      // Re-activate if stopped, keep existing categories
      await supabase
        .from("telegram_subscriptions")
        .update({
          is_active: true,
          chat_id: ctx.chat.id,
          username: ctx.from?.username ?? null,
          first_name: ctx.from?.first_name ?? null,
        })
        .eq("telegram_id", telegramId);

      const locale = (existing.locale ?? "ka") as "ka" | "en";
      const msg = MESSAGES[locale];
      await ctx.reply(msg.welcome);
      await ctx.reply(msg.selectCategories, {
        reply_markup: buildCategoryKeyboard(existing.categories ?? [], locale),
      });
    } else {
      // New subscriber
      await supabase.from("telegram_subscriptions").insert({
        telegram_id: telegramId,
        chat_id: ctx.chat.id,
        username: ctx.from?.username ?? null,
        first_name: ctx.from?.first_name ?? null,
        is_active: true,
        categories: [],
        locale: "ka",
      });

      const msg = MESSAGES.ka;
      await ctx.reply(msg.welcome);
      await ctx.reply(msg.selectCategories, {
        reply_markup: buildCategoryKeyboard([], "ka"),
      });
    }
  });

  // Category toggle callback
  bot.on("callback_query:data", async (ctx) => {
    const data = ctx.callbackQuery.data;
    const telegramId = ctx.from?.id;
    if (!telegramId || !data.startsWith("cat:")) return;

    const supabase = getServiceClient();
    const action = data.replace("cat:", "");

    // Fetch current subscription
    const { data: sub } = await supabase
      .from("telegram_subscriptions")
      .select("categories, locale")
      .eq("telegram_id", telegramId)
      .single();

    const currentCategories = sub?.categories ?? [];
    const locale = (sub?.locale ?? "ka") as "ka" | "en";
    const msg = MESSAGES[locale];

    if (action === "done") {
      // Refetch to get latest categories
      const { data: freshSub } = await supabase
        .from("telegram_subscriptions")
        .select("categories")
        .eq("telegram_id", telegramId)
        .single();

      const savedCategories = freshSub?.categories ?? [];

      if (savedCategories.length === 0) {
        await ctx.answerCallbackQuery({ text: msg.noCategories, show_alert: true });
        return;
      }
      await ctx.answerCallbackQuery();
      const selectedNames = savedCategories.map((slug: string) => {
        const cat = CATEGORIES.find((c) => c.slug === slug);
        return cat ? (locale === "ka" ? cat.label_ka : cat.label_en) : slug;
      });
      await ctx.editMessageText(
        `${msg.saved}\n\n📋 ${selectedNames.join(", ")}`
      );
      return;
    }

    // Toggle category
    const updated = currentCategories.includes(action)
      ? currentCategories.filter((c: string) => c !== action)
      : [...currentCategories, action];

    await supabase
      .from("telegram_subscriptions")
      .update({ categories: updated })
      .eq("telegram_id", telegramId);

    await ctx.answerCallbackQuery();
    await ctx.editMessageReplyMarkup({
      reply_markup: buildCategoryKeyboard(updated, locale),
    });
  });

  // /categories — show current subscriptions
  bot.command("categories", async (ctx) => {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    const supabase = getServiceClient();
    const { data: sub } = await supabase
      .from("telegram_subscriptions")
      .select("categories, locale")
      .eq("telegram_id", telegramId)
      .single();

    const locale = (sub?.locale ?? "ka") as "ka" | "en";
    const msg = MESSAGES[locale];
    const categories = sub?.categories ?? [];

    await ctx.reply(msg.currentCategories, {
      reply_markup: buildCategoryKeyboard(categories, locale),
    });
  });

  // /stop — unsubscribe
  bot.command("stop", async (ctx) => {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    const supabase = getServiceClient();
    const { data: sub } = await supabase
      .from("telegram_subscriptions")
      .select("locale")
      .eq("telegram_id", telegramId)
      .single();

    const locale = (sub?.locale ?? "ka") as "ka" | "en";

    await supabase
      .from("telegram_subscriptions")
      .update({ is_active: false })
      .eq("telegram_id", telegramId);

    await ctx.reply(MESSAGES[locale].stopped);
  });

  // /language — toggle ka/en
  bot.command("language", async (ctx) => {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    const supabase = getServiceClient();
    const { data: sub } = await supabase
      .from("telegram_subscriptions")
      .select("locale")
      .eq("telegram_id", telegramId)
      .single();

    const newLocale = sub?.locale === "en" ? "ka" : "en";

    await supabase
      .from("telegram_subscriptions")
      .update({ locale: newLocale })
      .eq("telegram_id", telegramId);

    await ctx.reply(MESSAGES[newLocale].languageChanged);
  });

  return bot;
}

// Initialize handlers once
const bot = setupBotHandlers();

// Grammy webhook handler for Next.js
const handler = webhookCallback(bot, "std/http");

export const POST = handler;
