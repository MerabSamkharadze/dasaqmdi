import { webhookCallback } from "grammy";
import { getBot, buildCategoryKeyboard, buildCompanyKeyboard, MESSAGES, CATEGORIES } from "@/lib/telegram/bot";
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

  // Callback query handler — categories + companies
  bot.on("callback_query:data", async (ctx) => {
    const data = ctx.callbackQuery.data;
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    const supabase = getServiceClient();

    // --- Category callbacks ---
    if (data.startsWith("cat:")) {
      const action = data.replace("cat:", "");

      const { data: sub } = await supabase
        .from("telegram_subscriptions")
        .select("categories, locale")
        .eq("telegram_id", telegramId)
        .single();

      const currentCategories = sub?.categories ?? [];
      const locale = (sub?.locale ?? "ka") as "ka" | "en";
      const msg = MESSAGES[locale];

      if (action === "done") {
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
        await ctx.editMessageText(`${msg.savedCategories}\n\n📋 ${selectedNames.join(", ")}`);
        return;
      }

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
      return;
    }

    // --- Company callbacks ---
    if (data.startsWith("comp:") || data.startsWith("comp_page:")) {
      const { data: sub } = await supabase
        .from("telegram_subscriptions")
        .select("company_ids, locale")
        .eq("telegram_id", telegramId)
        .single();

      const currentCompanyIds = sub?.company_ids ?? [];
      const locale = (sub?.locale ?? "ka") as "ka" | "en";
      const msg = MESSAGES[locale];

      // Fetch all companies for keyboard
      const { data: allCompanies } = await supabase
        .from("companies")
        .select("id, name, name_ka")
        .order("name");

      const companyList = (allCompanies ?? []).map((c) => ({
        id: c.id,
        name: locale === "ka" && c.name_ka ? c.name_ka : c.name,
      }));
      const totalPages = Math.ceil(companyList.length / COMPANIES_PER_PAGE);

      // Pagination
      if (data.startsWith("comp_page:")) {
        const page = parseInt(data.replace("comp_page:", ""), 10);
        const pageCompanies = companyList.slice(page * COMPANIES_PER_PAGE, (page + 1) * COMPANIES_PER_PAGE);
        await ctx.answerCallbackQuery();
        await ctx.editMessageReplyMarkup({
          reply_markup: buildCompanyKeyboard(pageCompanies, currentCompanyIds, page, totalPages, locale),
        });
        return;
      }

      const companyId = data.replace("comp:", "");

      if (companyId === "done") {
        const { data: freshSub } = await supabase
          .from("telegram_subscriptions")
          .select("company_ids")
          .eq("telegram_id", telegramId)
          .single();

        const savedIds = freshSub?.company_ids ?? [];
        await ctx.answerCallbackQuery();

        if (savedIds.length === 0) {
          await ctx.editMessageText(msg.savedCompanies);
        } else {
          const savedNames = savedIds.map((id: string) => {
            const c = companyList.find((co) => co.id === id);
            return c?.name ?? id;
          });
          await ctx.editMessageText(`${msg.savedCompanies}\n\n🏢 ${savedNames.join(", ")}`);
        }
        return;
      }

      // Toggle company
      const updated = currentCompanyIds.includes(companyId)
        ? currentCompanyIds.filter((id: string) => id !== companyId)
        : [...currentCompanyIds, companyId];

      await supabase
        .from("telegram_subscriptions")
        .update({ company_ids: updated })
        .eq("telegram_id", telegramId);

      // Find current page from companyId position
      const companyIndex = companyList.findIndex((c) => c.id === companyId);
      const currentPage = Math.floor(companyIndex / COMPANIES_PER_PAGE);
      const pageCompanies = companyList.slice(currentPage * COMPANIES_PER_PAGE, (currentPage + 1) * COMPANIES_PER_PAGE);

      await ctx.answerCallbackQuery();
      await ctx.editMessageReplyMarkup({
        reply_markup: buildCompanyKeyboard(pageCompanies, updated, currentPage, totalPages, locale),
      });
      return;
    }
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

    if (!sub) {
      await ctx.reply("ჯერ /start ბრძანება გამოიყენე გამოწერისთვის.");
      return;
    }

    const locale = (sub.locale ?? "ka") as "ka" | "en";
    const msg = MESSAGES[locale];

    await ctx.reply(msg.currentCategories, {
      reply_markup: buildCategoryKeyboard(sub.categories ?? [], locale),
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

    if (!sub) {
      await ctx.reply("გამოწერა არ მოიძებნა.");
      return;
    }

    const locale = (sub.locale ?? "ka") as "ka" | "en";

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

    if (!sub) {
      await ctx.reply("ჯერ /start ბრძანება გამოიყენე.");
      return;
    }

    const newLocale = sub.locale === "en" ? "ka" : "en";

    await supabase
      .from("telegram_subscriptions")
      .update({ locale: newLocale })
      .eq("telegram_id", telegramId);

    await ctx.reply(MESSAGES[newLocale].languageChanged);
  });

  // /companies — follow companies
  const COMPANIES_PER_PAGE = 6;

  bot.command("companies", async (ctx) => {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    const supabase = getServiceClient();
    const { data: sub } = await supabase
      .from("telegram_subscriptions")
      .select("company_ids, locale")
      .eq("telegram_id", telegramId)
      .single();

    if (!sub) {
      await ctx.reply("ჯერ /start ბრძანება გამოიყენე.");
      return;
    }

    const locale = (sub.locale ?? "ka") as "ka" | "en";
    const msg = MESSAGES[locale];

    const { data: companies } = await supabase
      .from("companies")
      .select("id, name, name_ka")
      .eq("is_verified", true)
      .order("name");

    if (!companies || companies.length === 0) {
      await ctx.reply(msg.noCompanies);
      return;
    }

    const companyList = companies.map((c) => ({
      id: c.id,
      name: locale === "ka" && c.name_ka ? c.name_ka : c.name,
    }));

    const totalPages = Math.ceil(companyList.length / COMPANIES_PER_PAGE);
    const pageCompanies = companyList.slice(0, COMPANIES_PER_PAGE);

    await ctx.reply(msg.selectCompanies, {
      reply_markup: buildCompanyKeyboard(pageCompanies, sub.company_ids ?? [], 0, totalPages, locale),
    });
  });

  // Company callbacks: comp:{id}, comp:done, comp_page:{page}
  // (handled in the existing callback_query handler — extend it)

  // Set localized command menus
  bot.api.setMyCommands([
    { command: "start", description: "გამოწერის დაწყება" },
    { command: "categories", description: "კატეგორიების არჩევა" },
    { command: "companies", description: "კომპანიების გამოწერა" },
    { command: "language", description: "ენის შეცვლა (KA/EN)" },
    { command: "stop", description: "გამოწერის გაუქმება" },
  ], { language_code: "ka" }).catch(() => {});

  bot.api.setMyCommands([
    { command: "start", description: "Start subscription" },
    { command: "categories", description: "Select categories" },
    { command: "companies", description: "Follow companies" },
    { command: "language", description: "Change language (KA/EN)" },
    { command: "stop", description: "Unsubscribe" },
  ], { language_code: "en" }).catch(() => {});

  // Default (fallback for other languages)
  bot.api.setMyCommands([
    { command: "start", description: "გამოწერის დაწყება / Start" },
    { command: "categories", description: "კატეგორიები / Categories" },
    { command: "companies", description: "კომპანიები / Companies" },
    { command: "language", description: "ენა / Language" },
    { command: "stop", description: "გაუქმება / Unsubscribe" },
  ]).catch(() => {});

  // Global error handler — prevents Telegram retries on crash
  bot.catch((err) => {
    console.error("Telegram bot error:", err);
  });

  return bot;
}

// Initialize handlers once
const bot = setupBotHandlers();

// Grammy webhook handler for Next.js
const handler = webhookCallback(bot, "std/http");

export const POST = handler;
