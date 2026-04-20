import { localized } from "@/lib/utils";
import { VipBadge } from "@/components/shared/vip-badge";
import { VipCarousel } from "@/components/jobs/vip-carousel";
import { LogoMark } from "@/components/brand/logo";
import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { JobWithCompany } from "@/lib/types";

type VipSpotlightProps = {
  jobs: JobWithCompany[];
  locale: string;
  title: string;
};

function formatSalary(min: number | null, max: number | null, currency: string): string | null {
  if (!min && !max) return null;
  if (min && max) return `${min.toLocaleString()} – ${max.toLocaleString()} ${currency}`;
  if (min) return `${min.toLocaleString()}+ ${currency}`;
  return `${max!.toLocaleString()} ${currency}`;
}

export function VipSpotlight({ jobs, locale, title }: VipSpotlightProps) {
  if (jobs.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="text-[15px] font-semibold tracking-tight mb-4 flex items-center gap-2">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
          <path
            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
            fill="#C7AE6A"
            stroke="#a08940"
            strokeWidth="1"
          />
        </svg>
        {title}
      </h2>
      <VipCarousel>
        {jobs.map((job, i) => {
          const jobTitle = localized(job, "title", locale);
          const companyName = localized(job.company, "name", locale);
          const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency);
          const isExternal = !!job.external_url;
          const vipLevel = (job.vip_level ?? "silver") as "silver" | "gold";

          return (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="flex-shrink-0 w-[280px] sm:w-[320px] rounded-xl border border-amber-300/50 bg-gradient-to-br from-amber-50/50 to-card p-4 shadow-soft hover:shadow-[0_4px_20px_rgba(199,174,106,0.2)] transition-all duration-200 hover:-translate-y-0.5 animate-fade-in dark:from-amber-500/5 dark:to-card dark:border-amber-500/20"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/8 ring-1 ring-amber-200/50 dark:ring-amber-500/20">
                  {isExternal ? (
                    <LogoMark size={28} />
                  ) : job.company.logo_url ? (
                    <Image
                      src={job.company.logo_url}
                      alt={companyName}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-md object-contain"
                    />
                  ) : (
                    <LogoMark size={24} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold truncate text-foreground">
                    {jobTitle}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {companyName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <VipBadge level={vipLevel} />
                {job.city && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/60">
                    <MapPin className="h-3 w-3" />
                    {job.city}
                  </span>
                )}
                {salary && (
                  <span className="text-[11px] font-medium text-primary">
                    {salary}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </VipCarousel>
    </section>
  );
}
