/**
 * SEO Landing page definitions.
 * Maps clean URL slugs to job query filters + localized metadata.
 */

export type LandingConfig = {
  filter: {
    category?: string;
    city?: string;
    type?: string;
    isRemote?: boolean;
  };
  title: { ka: string; en: string };
  description: { ka: string; en: string };
  h1: { ka: string; en: string };
};

// City landings
const CITIES: Record<string, LandingConfig> = {
  tbilisi: {
    filter: { city: "თბილისი" },
    title: {
      ka: "ვაკანსიები თბილისში",
      en: "Jobs in Tbilisi",
    },
    description: {
      ka: "იპოვე სამუშაო თბილისში. უახლესი ვაკანსიები IT, მარკეტინგი, ფინანსები და სხვა სფეროებში.",
      en: "Find jobs in Tbilisi. Latest openings in IT, marketing, finance and more.",
    },
    h1: { ka: "ვაკანსიები თბილისში", en: "Jobs in Tbilisi" },
  },
  batumi: {
    filter: { city: "ბათუმი" },
    title: { ka: "ვაკანსიები ბათუმში", en: "Jobs in Batumi" },
    description: {
      ka: "იპოვე სამუშაო ბათუმში. ტურიზმი, სტუმართმოყვარეობა, IT და სხვა ვაკანსიები.",
      en: "Find jobs in Batumi. Tourism, hospitality, IT and more.",
    },
    h1: { ka: "ვაკანსიები ბათუმში", en: "Jobs in Batumi" },
  },
  kutaisi: {
    filter: { city: "ქუთაისი" },
    title: { ka: "ვაკანსიები ქუთაისში", en: "Jobs in Kutaisi" },
    description: {
      ka: "იპოვე სამუშაო ქუთაისში. უახლესი ვაკანსიები სხვადასხვა სფეროში.",
      en: "Find jobs in Kutaisi. Latest openings across industries.",
    },
    h1: { ka: "ვაკანსიები ქუთაისში", en: "Jobs in Kutaisi" },
  },
  rustavi: {
    filter: { city: "რუსთავი" },
    title: { ka: "ვაკანსიები რუსთავში", en: "Jobs in Rustavi" },
    description: {
      ka: "იპოვე სამუშაო რუსთავში.",
      en: "Find jobs in Rustavi.",
    },
    h1: { ka: "ვაკანსიები რუსთავში", en: "Jobs in Rustavi" },
  },
};

// Type landings
const TYPES: Record<string, LandingConfig> = {
  remote: {
    filter: { isRemote: true },
    title: {
      ka: "დისტანციური სამუშაო საქართველოში",
      en: "Remote Jobs in Georgia",
    },
    description: {
      ka: "იპოვე დისტანციური სამუშაო. მუშაობა სახლიდან — IT, მარკეტინგი, დიზაინი და სხვა.",
      en: "Find remote jobs in Georgia. Work from home — IT, marketing, design and more.",
    },
    h1: { ka: "დისტანციური ვაკანსიები", en: "Remote Jobs" },
  },
  internship: {
    filter: { type: "internship" },
    title: {
      ka: "სტაჟირება და სტუდენტური ვაკანსიები",
      en: "Internships & Student Jobs in Georgia",
    },
    description: {
      ka: "სტაჟირების პროგრამები და სტუდენტური ვაკანსიები საქართველოში. დაიწყე კარიერა დღეს.",
      en: "Internship programs and student jobs in Georgia. Start your career today.",
    },
    h1: { ka: "სტაჟირება", en: "Internships" },
  },
  "part-time": {
    filter: { type: "part-time" },
    title: {
      ka: "ნახევარ განაკვეთზე სამუშაო",
      en: "Part-time Jobs in Georgia",
    },
    description: {
      ka: "ნახევარ განაკვეთზე ვაკანსიები საქართველოში. მოქნილი გრაფიკი.",
      en: "Part-time job opportunities in Georgia. Flexible schedule.",
    },
    h1: { ka: "ნახევარი განაკვეთი", en: "Part-time Jobs" },
  },
};

// Category landings — generated from slugs
const CATEGORIES: Record<string, LandingConfig> = {
  "it-software": {
    filter: { category: "it-software" },
    title: { ka: "IT ვაკანსიები საქართველოში", en: "IT & Software Jobs in Georgia" },
    description: {
      ka: "IT და პროგრამირების ვაკანსიები. Frontend, Backend, DevOps, QA და სხვა.",
      en: "IT and software development jobs. Frontend, Backend, DevOps, QA and more.",
    },
    h1: { ka: "IT ვაკანსიები", en: "IT & Software Jobs" },
  },
  "sales-marketing": {
    filter: { category: "sales-marketing" },
    title: { ka: "გაყიდვების და მარკეტინგის ვაკანსიები", en: "Sales & Marketing Jobs" },
    description: {
      ka: "გაყიდვების, მარკეტინგის, PR და რეკლამის ვაკანსიები საქართველოში.",
      en: "Sales, marketing, PR and advertising jobs in Georgia.",
    },
    h1: { ka: "გაყიდვები და მარკეტინგი", en: "Sales & Marketing" },
  },
  administration: {
    filter: { category: "administration" },
    title: { ka: "ადმინისტრაციული ვაკანსიები", en: "Administration Jobs" },
    description: {
      ka: "ადმინისტრაციული და ოფისის ვაკანსიები საქართველოში.",
      en: "Administrative and office jobs in Georgia.",
    },
    h1: { ka: "ადმინისტრაცია", en: "Administration" },
  },
  finance: {
    filter: { category: "finance" },
    title: { ka: "ფინანსური ვაკანსიები", en: "Finance Jobs" },
    description: {
      ka: "ბუღალტერიის, ფინანსების და ბანკინგის ვაკანსიები საქართველოში.",
      en: "Accounting, finance and banking jobs in Georgia.",
    },
    h1: { ka: "ფინანსები", en: "Finance Jobs" },
  },
  hospitality: {
    filter: { category: "hospitality" },
    title: { ka: "სტუმართმოყვარეობის ვაკანსიები", en: "Hospitality Jobs" },
    description: {
      ka: "სასტუმროების, რესტორნების და ტურიზმის ვაკანსიები.",
      en: "Hotel, restaurant and tourism jobs in Georgia.",
    },
    h1: { ka: "სტუმართმოყვარეობა", en: "Hospitality" },
  },
  construction: {
    filter: { category: "construction" },
    title: { ka: "მშენებლობის ვაკანსიები", en: "Construction Jobs" },
    description: {
      ka: "მშენებლობის, არქიტექტურის და ინჟინერიის ვაკანსიები.",
      en: "Construction, architecture and engineering jobs.",
    },
    h1: { ka: "მშენებლობა", en: "Construction" },
  },
  "food-service": {
    filter: { category: "food-service" },
    title: { ka: "კვების სფეროს ვაკანსიები", en: "Food & Service Jobs" },
    description: {
      ka: "მზარეულის, ბარმენის, ოფიციანტის და კვების სფეროს ვაკანსიები.",
      en: "Chef, bartender, waiter and food service jobs.",
    },
    h1: { ka: "კვება და სერვისი", en: "Food & Service" },
  },
  retail: {
    filter: { category: "retail" },
    title: { ka: "ვაჭრობის ვაკანსიები", en: "Retail Jobs" },
    description: {
      ka: "გაყიდვების, მაღაზიის და ვაჭრობის ვაკანსიები.",
      en: "Sales, store and retail jobs.",
    },
    h1: { ka: "ვაჭრობა", en: "Retail" },
  },
  "beauty-wellness": {
    filter: { category: "beauty-wellness" },
    title: { ka: "სილამაზის სფეროს ვაკანსიები", en: "Beauty & Wellness Jobs" },
    description: {
      ka: "სტილისტის, კოსმეტოლოგის, მასაჟისტის ვაკანსიები.",
      en: "Stylist, cosmetologist, massage therapist jobs.",
    },
    h1: { ka: "სილამაზე და ჯანმრთელობა", en: "Beauty & Wellness" },
  },
  logistics: {
    filter: { category: "logistics" },
    title: { ka: "ლოჯისტიკის ვაკანსიები", en: "Logistics & Transport Jobs" },
    description: {
      ka: "ლოჯისტიკის, ტრანსპორტის და მიწოდების ვაკანსიები.",
      en: "Logistics, transport and delivery jobs.",
    },
    h1: { ka: "ლოჯისტიკა", en: "Logistics & Transport" },
  },
  healthcare: {
    filter: { category: "healthcare" },
    title: { ka: "ჯანდაცვის ვაკანსიები", en: "Healthcare Jobs" },
    description: {
      ka: "ექიმის, ექთნის, ფარმაცევტის და ჯანდაცვის ვაკანსიები.",
      en: "Doctor, nurse, pharmacist and healthcare jobs.",
    },
    h1: { ka: "ჯანდაცვა", en: "Healthcare" },
  },
};

// Merge all landings
export const ALL_LANDINGS: Record<string, LandingConfig> = {
  ...CITIES,
  ...TYPES,
  ...CATEGORIES,
};

/** Get all landing slugs for sitemap */
export function getAllLandingSlugs(): string[] {
  return Object.keys(ALL_LANDINGS);
}

/** Resolve a slug to its landing config */
export function getLandingConfig(slug: string): LandingConfig | null {
  return ALL_LANDINGS[slug] ?? null;
}
