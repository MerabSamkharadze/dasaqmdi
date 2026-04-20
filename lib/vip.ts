import type { VipLevel } from "@/lib/types/enums";

/** Check if a job's VIP status is currently active */
export function isVipActive(job: { vip_level: string; vip_until: string | null }): boolean {
  if (job.vip_level === "normal" || !job.vip_until) return false;
  return new Date(job.vip_until) > new Date();
}

/** Get display label for VIP level */
export function getVipLabel(level: VipLevel | string, locale: string): string | null {
  if (level === "normal") return null;
  if (level === "gold") return locale === "ka" ? "PREMIUM" : "PREMIUM";
  if (level === "silver") return "VIP";
  return null;
}

/** VIP priority for sorting (higher = first) */
export function getVipPriority(level: string): number {
  if (level === "gold") return 2;
  if (level === "silver") return 1;
  return 0;
}

/** Default VIP duration in days */
export const VIP_DURATION_DAYS = 14;
