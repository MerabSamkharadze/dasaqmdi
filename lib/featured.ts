/**
 * Featured-star helpers.
 *
 * A job is "featured" (⭐) via one of two mechanisms:
 *   1. Subscription slot — is_featured = true, featured_until IS NULL.
 *      Persistent for the life of the subscription. Plan-gated slot count.
 *   2. Paid extra slot — is_featured = true, featured_until > now().
 *      One-time 5₾ purchase for 30 days. Does NOT count against the plan limit.
 *
 * When `featured_until` is set but in the past, the star should not display —
 * the DB row is reconciled lazily (no cron); feed queries and toggle logic
 * treat it as unfeatured.
 */
export type FeaturedJob = {
  is_featured: boolean;
  featured_until: string | null;
};

/** True when the job's featured star is currently active (sub or paid). */
export function isFeaturedActive(job: FeaturedJob): boolean {
  if (!job.is_featured) return false;
  if (job.featured_until === null) return true; // subscription slot
  return new Date(job.featured_until).getTime() > Date.now();
}

/** True when the featured state came from a paid-extra purchase still in window. */
export function isPaidExtraFeatured(job: FeaturedJob): boolean {
  if (!job.is_featured || !job.featured_until) return false;
  return new Date(job.featured_until).getTime() > Date.now();
}
