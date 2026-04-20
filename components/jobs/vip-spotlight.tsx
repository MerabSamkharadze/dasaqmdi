import { localized } from "@/lib/utils";
import { VipCarousel } from "@/components/jobs/vip-carousel";
import { VipCard } from "@/components/jobs/vip-card";
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
        {jobs.map((job, i) => (
          <VipCard
            key={job.id}
            jobId={job.id}
            jobTitle={localized(job, "title", locale)}
            companyName={localized(job.company, "name", locale)}
            companyLogoUrl={job.company.logo_url}
            isExternal={!!job.external_url}
            vipLevel={(job.vip_level ?? "silver") as "silver" | "gold"}
            city={job.city}
            salary={formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
            index={i}
          />
        ))}
      </VipCarousel>
    </section>
  );
}
