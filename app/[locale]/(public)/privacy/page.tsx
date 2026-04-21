import { getTranslations, getLocale } from "next-intl/server";
import { buildAlternates } from "@/lib/seo";
import { siteConfig } from "@/lib/config";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isKa = params.locale === "ka";
  const title = isKa ? "კონფიდენციალურობის პოლიტიკა" : "Privacy Policy";
  const alternates = buildAlternates("/privacy", params.locale);

  return {
    title,
    alternates,
    openGraph: {
      title,
      type: "website",
      url: alternates.canonical as string,
      siteName: siteConfig.domain,
    },
  };
}

export default async function PrivacyPage() {
  const locale = await getLocale();
  const isKa = locale === "ka";

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight">
        {isKa ? "კონფიდენციალურობის პოლიტიკა" : "Privacy Policy"}
      </h1>

      <p className="text-sm text-muted-foreground">
        {isKa ? "ბოლო განახლება: 2025 წელი" : "Last updated: 2025"}
      </p>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-[15px] leading-7 text-foreground/90">
        <section>
          <h2 className="text-lg font-semibold tracking-tight">
            {isKa ? "1. ზოგადი ინფორმაცია" : "1. General Information"}
          </h2>
          <p>
            {isKa
              ? `dasaqmdi.com  არის დასაქმების ვებ-საიტი, რომელიც აკავშირებს სამუშაოს მაძიებლებს დამსაქმებლებთან საქართველოში. ჩვენ ვიცავთ თქვენი პერსონალური მონაცემების კონფიდენციალურობას.`
              : `dasaqmdi.com  is a job board website connecting job seekers with employers in Georgia. We are committed to protecting your personal data privacy.`}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">
            {isKa ? "2. რა მონაცემებს ვაგროვებთ" : "2. Data We Collect"}
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              {isKa
                ? "ელფოსტის მისამართი — ავტორიზაციისა და შეტყობინებებისთვის"
                : "Email address — for authentication and notifications"}
            </li>
            <li>
              {isKa
                ? "პროფილის ინფორმაცია (სახელი, ქალაქი, უნარები) — რომელსაც თქვენ თვითონ შეავსებთ"
                : "Profile information (name, city, skills) — which you voluntarily provide"}
            </li>
            <li>
              {isKa
                ? "რეზიუმე — მხოლოდ თუ თქვენ ატვირთავთ განაცხადის გაგზავნისას"
                : "Resume — only if you upload it when applying to a job"}
            </li>
            <li>
              {isKa
                ? "Google/Facebook ანგარიშის ძირითადი ინფორმაცია — თუ სოციალური ავტორიზაციით შეხვალთ"
                : "Google/Facebook basic account info — if you sign in with social login"}
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">
            {isKa ? "3. როგორ ვიყენებთ მონაცემებს" : "3. How We Use Data"}
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              {isKa
                ? "ავტორიზაცია და ანგარიშის მართვა"
                : "Authentication and account management"}
            </li>
            <li>
              {isKa
                ? "ვაკანსიების შეთავაზება თქვენი პროფილის მიხედვით (Smart Matching)"
                : "Job recommendations based on your profile (Smart Matching)"}
            </li>
            <li>
              {isKa
                ? "ელფოსტით შეტყობინებები განაცხადის სტატუსის ცვლილებაზე"
                : "Email notifications about application status changes"}
            </li>
            <li>
              {isKa
                ? "საიტის ანალიტიკა და გაუმჯობესება"
                : "Site analytics and improvement"}
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">
            {isKa ? "4. სოციალური ავტორიზაცია" : "4. Social Login"}
          </h2>
          <p>
            {isKa
              ? "Google-ით ან Facebook-ით ავტორიზაციისას ჩვენ ვიღებთ მხოლოდ თქვენს ელფოსტას და სახელს. ჩვენ არ ვიღებთ წვდომას თქვენს კონტაქტებზე, ფოტოებზე ან სხვა პერსონალურ მონაცემებზე. ელფოსტა გამოიყენება მხოლოდ ავტორიზაციისთვის."
              : "When signing in with Google or Facebook, we only receive your email and name. We do not access your contacts, photos, or other personal data. Your email is used solely for authentication."}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">
            {isKa ? "5. Cookies" : "5. Cookies"}
          </h2>
          <p>
            {isKa
              ? "ჩვენ ვიყენებთ cookies-ს ავტორიზაციისთვის, ანალიტიკისთვის (Facebook Pixel) და საიტის ფუნქციონალისთვის (თემის არჩევანი). თქვენ შეგიძლიათ უარი თქვათ არასავალდებულო cookies-ზე."
              : "We use cookies for authentication, analytics (Facebook Pixel), and site functionality (theme preference). You can decline non-essential cookies."}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">
            {isKa ? "6. მონაცემთა უსაფრთხოება" : "6. Data Security"}
          </h2>
          <p>
            {isKa
              ? "თქვენი მონაცემები ინახება Supabase-ის დაცულ სერვერებზე. პაროლები დაჰეშილია და არასოდეს ინახება ღია ტექსტით. ფაილები (რეზიუმეები, ფოტოები) ინახება დაცულ cloud storage-ში."
              : "Your data is stored on Supabase secure servers. Passwords are hashed and never stored in plain text. Files (resumes, photos) are stored in secure cloud storage."}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">
            {isKa ? "7. თქვენი უფლებები" : "7. Your Rights"}
          </h2>
          <p>
            {isKa
              ? "თქვენ შეგიძლიათ ნებისმიერ დროს: წაშალოთ თქვენი ანგარიში, განაახლოთ პერსონალური ინფორმაცია, მოითხოვოთ თქვენი მონაცემების ასლი."
              : "You can at any time: delete your account, update your personal information, request a copy of your data."}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">
            {isKa ? "8. კონტაქტი" : "8. Contact"}
          </h2>
          <p>
            {isKa
              ? "კონფიდენციალურობასთან დაკავშირებული კითხვებისთვის მოგვწერეთ: samkharadzemerab@gmail.com"
              : "For privacy-related questions, contact us at: samkharadzemerab@gmail.com"}
          </p>
        </section>
      </div>
    </div>
  );
}
