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
export const CATEGORIES = [
  { slug: "it-software", label_en: "IT & Software", label_ka: "IT და პროგრამირება" },
  { slug: "sales-marketing", label_en: "Sales & Marketing", label_ka: "გაყიდვები და მარკეტინგი" },
  { slug: "administration", label_en: "Administration", label_ka: "ადმინისტრაცია" },
  { slug: "finance", label_en: "Finance", label_ka: "ფინანსები" },
  { slug: "hospitality", label_en: "Hospitality", label_ka: "ჰოსპიტალობა" },
  { slug: "construction", label_en: "Construction", label_ka: "მშენებლობა" },
  { slug: "food-service", label_en: "Food & Service", label_ka: "კვება და სერვისი" },
  { slug: "retail", label_en: "Retail & Sales", label_ka: "ვაჭრობა" },
  { slug: "beauty-wellness", label_en: "Beauty & Wellness", label_ka: "სილამაზე და ჯანმრთელობა" },
  { slug: "logistics", label_en: "Logistics & Transport", label_ka: "ლოჯისტიკა და ტრანსპორტი" },
  { slug: "healthcare", label_en: "Healthcare", label_ka: "ჯანდაცვა" },
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

export function buildCompanyKeyboard(
  companies: Array<{ id: string; name: string }>,
  selectedIds: string[],
  page: number,
  totalPages: number,
  locale: string
): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  for (const company of companies) {
    const isSelected = selectedIds.includes(company.id);
    const text = isSelected ? `✅ ${company.name}` : company.name;
    keyboard.text(text, `comp:${company.id}`).row();
  }

  // Pagination
  const navRow: Array<{ text: string; data: string }> = [];
  if (page > 0) navRow.push({ text: "⬅️", data: `comp_page:${page - 1}` });
  if (page < totalPages - 1) navRow.push({ text: "➡️", data: `comp_page:${page + 1}` });
  if (navRow.length > 0) {
    for (const btn of navRow) keyboard.text(btn.text, btn.data);
    keyboard.row();
  }

  keyboard.text(locale === "ka" ? "✅ შენახვა" : "✅ Save", "comp:done").row();
  return keyboard;
}

export const MESSAGES = {
  ka: {
    welcome: "👋 გამარჯობა! მე ვარ dasaqmdi.com-ის ბოტი.\n\nაირჩიე კატეგორიები და მიიღე ახალი ვაკანსიები რეალურ დროში.\n\n/categories — კატეგორიების არჩევა\n/companies — კომპანიების გამოწერა",
    selectCategories: "📋 აირჩიე კატეგორიები:",
    selectCompanies: "🏢 აირჩიე კომპანიები:",
    saved: "✅ გამოწერა შენახულია!",
    savedCategories: "✅ კატეგორიები შენახულია!",
    savedCompanies: "✅ კომპანიები შენახულია!",
    noCategories: "⚠️ აირჩიე მინიმუმ 1 კატეგორია.",
    noCompanies: "🏢 კომპანიები ჯერ არ არის დარეგისტრირებული.",
    stopped: "🔕 გამოწერა გაუქმებულია.\n\n/start — ხელახალი გამოწერა",
    currentCategories: "📋 შენი კატეგორიები:",
    currentCompanies: "🏢 შენი კომპანიები:",
    languageChanged: "🌐 ენა შეცვლილია: ქართული",
    newJob: "📢 ახალი ვაკანსია",
  },
  en: {
    welcome: "👋 Hello! I'm the dasaqmdi.com bot.\n\nChoose categories and get new job postings in real time.\n\n/categories — select categories\n/companies — follow companies",
    selectCategories: "📋 Select categories:",
    selectCompanies: "🏢 Select companies to follow:",
    saved: "✅ Subscription saved!",
    savedCategories: "✅ Categories saved!",
    savedCompanies: "✅ Companies saved!",
    noCategories: "⚠️ Select at least 1 category.",
    noCompanies: "🏢 No companies registered yet.",
    stopped: "🔕 Subscription cancelled.\n\n/start — re-subscribe",
    currentCategories: "📋 Your categories:",
    currentCompanies: "🏢 Your followed companies:",
    languageChanged: "🌐 Language changed: English",
    newJob: "📢 New job posting",
  },
} as const;

export type Locale = "ka" | "en";
