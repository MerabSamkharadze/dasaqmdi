# Lemon Squeezy — Test Mode → Live Mode გადასვლის გეგმა

**სტატუსი (2026-04-24):** Test store production-ზე მუშაობს, end-to-end checkout გამართულია. ეს დოკუმენტი — live mode-ზე გადასვლის runbook.

**მთავარი პრინციპი:** Lemon Squeezy-ში Test mode და Live mode ცალ-ცალკე გარემოებაა. Live store ცალკე API key-ს, ცალკე webhook secret-ს, ცალკე product ID-ებს გენერირებს. კოდი არაფერი იცვლება — მხოლოდ Vercel env vars.

---

## 0. წინაპირობები (ერთჯერადი, LS-ის მხარეს)

Lemon Squeezy Dashboard → Store settings-ში დასრულებული უნდა იყოს:

- [ ] **KYC / Business verification** — Lemon Squeezy MoR მოდელი, უყიდობა შენი სახელით ვერ გააქტიურდება სანამ ეს არ დასრულდება
- [ ] **Tax information** — Georgia-სთვის tax profile setup
- [ ] **Payout method** — საბანკო ანგარიში ან PayPal (ფული რომ ჩამოვიდეს)
- [ ] **Store currency** — GEL (ან USD თუ ასე გადაწყვიტე; checkout page-ზე გავლენა აქვს)
- [ ] **Store მისამართი** — legal business address

⚠️ ამ 4 ნაბიჯის გარეშე Live mode არ ჩაირთვება, თუნდაც ტექნიკურად ყველაფერი გამართული იყოს.

---

## 1. Live Store-ში პროდუქტების ხელახალი შექმნა

Live mode-ში **ყველა variant ID ცალკე შეიქმნება** — Test-ის ID-ები არ გადადის. იხილე მიმდინარე კონფიგურაცია: `lib/lemonsqueezy.ts:13–97`.

### Subscription plans (2 product, 2-2 variant თითოში)

| პროდუქტი | Variant | ფასი | Env var |
|---|---|---|---|
| **Business** | Monthly | 79 ₾ | `LEMONSQUEEZY_PRO_VARIANT_ID` |
| **Business** | Yearly | 790 ₾ | `LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID` |
| **Pro** | Monthly | 199 ₾ | `LEMONSQUEEZY_VERIFIED_VARIANT_ID` |
| **Pro** | Yearly | 1990 ₾ | `LEMONSQUEEZY_VERIFIED_ANNUAL_VARIANT_ID` |

> DB enum-ის სახელები (`pro` / `verified`) UI label-ს ({`Business` / `Pro`}) არ ემთხვევა — ნუ გადაარქმევ, code-ში მოლოდინი ამ მაპინგზე დგას.

### One-time products (Boost + Featured extra)

| პროდუქტი | ფასი | დღე | Env var |
|---|---|---|---|
| **VIP Silver Boost** | 30 ₾ | 7 | `LEMONSQUEEZY_VIP_SILVER_VARIANT_ID` |
| **VIP Gold Boost** | 80 ₾ | 14 | `LEMONSQUEEZY_VIP_GOLD_VARIANT_ID` |
| **Featured Extra Slot** | 5 ₾ | 30 | `LEMONSQUEEZY_FEATURED_EXTRA_VARIANT_ID` |

Boost webhook ლოგიკა variant-ს level-ს უდარებს (`variantToVipLevel()` `lib/lemonsqueezy.ts:80–84`). თუ variant ID ცდომილი იქნება env-ში → `order_created` webhook 400-ით დაბრუნდება და ფული გადავა, მაგრამ `vip_level` არ დააფიქსირდება. **ყოველი ID ზუსტად გადაიტანე.**

---

## 2. Vercel Environment Variables-ის Swap

**Production** scope-ში ცვლადები (Preview/Development-ს ხელი არ ახლო — Test store-ზე დარჩეს local dev-ისთვის).

```
LEMONSQUEEZY_API_KEY=<live-api-key>
LEMONSQUEEZY_STORE_ID=<live-store-id>
LEMONSQUEEZY_WEBHOOK_SECRET=<live-webhook-secret>
LEMONSQUEEZY_PRO_VARIANT_ID=<live-business-monthly>
LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID=<live-business-yearly>
LEMONSQUEEZY_VERIFIED_VARIANT_ID=<live-pro-monthly>
LEMONSQUEEZY_VERIFIED_ANNUAL_VARIANT_ID=<live-pro-yearly>
LEMONSQUEEZY_VIP_SILVER_VARIANT_ID=<live-silver>
LEMONSQUEEZY_VIP_GOLD_VARIANT_ID=<live-gold>
LEMONSQUEEZY_FEATURED_EXTRA_VARIANT_ID=<live-featured-extra>
```

⚠️ Test values-ები **შეინახე სადმე** (1Password / local note) — rollback-ისთვის დაგჭირდება.

Annual variant-ები არასავალდებულოა: თუ env var ცარიელია, `hasAnnualVariants()` false-ს აბრუნებს და Pricing page-ს yearly toggle ავტომატურად ქრება (`lib/lemonsqueezy.ts:25–28`). იგივე Featured Extra-ზე — ცარიელია → star upsell dialog იმალება.

---

## 3. Live Webhook-ის რეგისტრაცია

Live store → Dashboard → Webhooks → **Create webhook**:

- **URL:** `https://www.dasaqmdi.com/api/webhooks/lemonsqueezy`
- **Signing secret:** ახალი სიმბოლოების სტრიქონი (ჩაწერე `LEMONSQUEEZY_WEBHOOK_SECRET`-ში)
- **Events** (5, ყველა აუცილებელია — იხილე `app/api/webhooks/lemonsqueezy/route.ts:47`):
  - [ ] `order_created` — boost + featured extra one-time purchases
  - [ ] `subscription_created` — ახალი subscription + auto-feature welcome
  - [ ] `subscription_updated` — plan change + over-limit feature reconciliation
  - [ ] `subscription_payment_failed` — UI state `past_due`
  - [ ] `subscription_expired` — downgrade to `free` + clear subscription-slot features

⚠️ webhook signature HMAC-ით verify-დება (`crypto.timingSafeEqual`). თუ secret-ი არ ემთხვევა → ყველა event 401/403-ით ბრუნდება, DB მდგომარეობა არ განახლდება, მომხმარებელი გადაიხდის და პაკეტი არ ჩაირთვება.

---

## 4. Deployment თანმიმდევრობა

1. Vercel-ზე env vars დაამატე/შეცვალე (**არ deploy-ავ jer**)
2. Lemon Squeezy live webhook შექმენი (Step 3)
3. Vercel-ში manual **Redeploy** Production-ის ბოლო commit-ისთვის — რომ env vars-მა in-memory cache-ში ჩაიტვირთოს
4. Redeploy-ის შემდეგ შეამოწმე logs: `/api/webhooks/lemonsqueezy` hit-ზე 200 OK

ეს თანმიმდევრობა ვერ ცვლის — თუ ჯერ Redeploy გააკეთო და მერე webhook, მომხმარებელი შუალედში მოხვდება "live checkout, არ-რეგისტრირებული webhook" მდგომარეობაში.

---

## 5. Post-deploy ვერიფიკაცია

Live mode-ში რეალური ბარათით ტესტი **შენი ბარათით** გააკეთე 4 flow-ზე, ყველაზე იაფი ვარიანტი → refund ხელით LS dashboard-იდან:

- [ ] **Subscription flow** — ერთი ვაკანსია Starter account-ით, upgrade → Business monthly (79 ₾). შემოწმება: `subscriptions` table row + `is_featured=true` newest job-ზე (welcome feature, `route.ts:202–280`) + UI badge
- [ ] **Boost flow** — არსებული job-ზე Silver Boost (30 ₾). შემოწმება: `jobs.vip_level='silver'`, `jobs.vip_until = now + 7d`, `admin_logs` row `boost_purchased`, VipSpotlight carousel (Gold-ისთვის)
- [ ] **Featured extra flow** — Starter account-ით ⭐ დააჭირე → dialog → 5 ₾ → შემოწმება: `jobs.is_featured=true`, `jobs.featured_until = now + 30d`, `admin_logs` row `featured_extra_purchased`
- [ ] **Subscription cancel / expire** — LS dashboard-იდან subscription cancel → გადაამოწმე `subscription_expired` webhook-ი DB-ში plan `free`-ზე დაბრუნდა

ყოველი ტესტის შემდეგ → LS dashboard → Orders → **Refund**. Refund-ი webhook-ს არ აქცევს რამეში — DB state-ი ხელით უნდა გაასუფთაო (`UPDATE jobs SET vip_level='normal', vip_until=null WHERE id=...`).

---

## 6. Rollback Plan

თუ რამე წავიდა ცუდად **პირველი 24 საათი**:

1. Vercel env vars → Test-ის ძველი values დააბრუნე
2. Live webhook Lemon Squeezy-ში **disable** (არ წაშალო — orders history შეინახება)
3. Redeploy
4. Production-ზე ხელახლა Test mode — მომხმარებელი ვერ გადაიხდის (Test bank card უცხოა რეალური users-ისთვის), მაგრამ DB-ს არ დააზიანებს

**24 საათზე ძველი live orders-ის refund** — LS dashboard → Orders → ხელით. DB cleanup-ი SQL-ით:

```sql
-- Revert unintended boosts
UPDATE jobs SET vip_level='normal', vip_until=null WHERE vip_until > '<cutoff-date>';
-- Revert paid-extra features
UPDATE jobs SET is_featured=false, featured_until=null WHERE featured_until > '<cutoff-date>';
-- Cancel subscription rows (require manual LS subscription cancellation FIRST)
UPDATE subscriptions SET status='cancelled' WHERE created_at > '<cutoff-date>';
```

---

## 7. ყურადღების წერტილები

- **Legacy pricing badge** — თუ Test mode-ში გქონდა subscribers ძველ variant-ებზე და Live mode-ში ახალ ID-ებით სწავლობ, LS grandfathering ავტომატურად არ მუშაობს store-ებს შორის. Test subscribers Live-ში არ გადმოდის — ნულიდან დაიწყებ.
- **Webhook reconciliation bugs** — `subscription_updated` over-limit downgrade logic (`route.ts:202–280`) — პრო → ბიზნეს downgrade-ზე 3→1 slot, ყველაზე ახალი job-ები რჩება featured, ძველები იხსნება. ეს paid-extras-ს **არ** ეხება (მათ `featured_until IS NOT NULL` აქვთ). დარწმუნდი, რომ ეს ქცევა ახლაც სწორია live reconciliation-ის დროს.
- **Currency mismatch** — თუ Live store USD-ში გამართე და Test GEL-ში იყო, Pricing page label-ები (`79₾`, `199₾`) hard-coded ტექსტია `messages/*.json`-ში. Live checkout მომხმარებელს USD ფასს გამოუჩენს → label-თან disconnect. გადაწყვიტე **წინასწარ** რომელი currency.
- **Test mode transactions ნახვადი** — LS dashboard-ზე "Test mode" toggle-ს აქვს; Test orders Live dashboard-ში არ ჩანს. Support-ის pingistvis დაიმახსოვრე რომელ mode-ში დებაგ.

---

## 8. Checklist — Go-live დღეს

- [ ] Store KYC/tax/payout — complete
- [ ] Live-ში 2 subscription პროდუქტი × 2 variant შექმნილი + ID-ები ჩაწერილი
- [ ] Live-ში 3 one-time პროდუქტი შექმნილი + ID-ები ჩაწერილი
- [ ] Vercel Production env vars swapped (10 ცვლადი)
- [ ] Test env values-ები backup-ში შენახული
- [ ] Live webhook რეგისტრირებული 5 event-ით
- [ ] Webhook secret Vercel-ში შეესაბამება LS-ში ჩაწერილს
- [ ] Vercel Redeploy Production
- [ ] Vercel logs — webhook 200 OK
- [ ] 4 post-deploy flow-ს ცოცხალი ბარათით გამოცდა + refund
- [ ] Facebook Pixel / analytics checkout events რეალურ მოცულობაში აისახება
