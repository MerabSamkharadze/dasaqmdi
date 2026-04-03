import { Bot, InlineKeyboard } from "grammy";

// Singleton bot instance
let bot: Bot | null = null;

export function getBot(): Bot {
  if (!bot) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set");
    bot = new Bot(token);
  }
  return bot;
}

// Category slugs matching our DB categories table
const CATEGORIES = [
  { slug: "it-software", label_en: "IT & Software", label_ka: "IT და პროგრამირება" },
  { slug: "sales-marketing", label_en: "Sales & Marketing", label_ka: "გაყიდვები და მარკეტინგი" },
  { slug: "administration", label_en: "Administration", label_ka: "ადმინისტრაცია" },
  { slug: "finance", label_en: "Finance", label_ka: "ფინანსები" },
  { slug: "hospitality", label_en: "Hospitality", label_ka: "ჰოსპიტალობა" },
  { slug: "construction", label_en: "Construction", label_ka: "მშენებლობა" },
] as const;

export function buildCategoryKeyboard(
  selectedCategories: string[],
  locale: string
): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  for (const cat of CATEGORIES) {
    const isSelected = selectedCategories.includes(cat.slug);
    const label = locale === "ka" ? cat.label_ka : cat.label_en;
    const text = isSelected ? `✅ ${label}` : label;
    keyboard.text(text, `cat:${cat.slug}`).row();
  }

  keyboard.text(locale === "ka" ? "✅ შენახვა" : "✅ Save", "cat:done").row();
  return keyboard;
}

export const MESSAGES = {
  ka: {
    welcome: "👋 გამარჯობა! მე ვარ dasakmdi.com-ის ბოტი.\n\nაირჩიე კატეგორიები და მიიღე ახალი ვაკანსიები რეალურ დროში.",
    selectCategories: "📋 აირჩიე კატეგორიები:",
    saved: "✅ გამოწერა შენახულია! მიიღებ შეტყობინებებს არჩეულ კატეგორიებში.",
    noCategories: "⚠️ აირჩიე მინიმუმ 1 კატეგორია.",
    stopped: "🔕 გამოწერა გაუქმებულია. /start ხელახალი გამოწერისთვის.",
    currentCategories: "📋 შენი გამოწერები:",
    languageChanged: "🌐 ენა შეცვლილია: ქართული",
    newJob: "📢 ახალი ვაკანსია",
  },
  en: {
    welcome: "👋 Hello! I'm the dasakmdi.com bot.\n\nChoose categories and get new job postings in real time.",
    selectCategories: "📋 Select categories:",
    saved: "✅ Subscription saved! You'll receive notifications for selected categories.",
    noCategories: "⚠️ Select at least 1 category.",
    stopped: "🔕 Subscription cancelled. /start to re-subscribe.",
    currentCategories: "📋 Your subscriptions:",
    languageChanged: "🌐 Language changed: English",
    newJob: "📢 New job posting",
  },
} as const;

export type Locale = "ka" | "en";
