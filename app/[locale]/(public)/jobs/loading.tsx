import { Skeleton } from "@/components/ui/skeleton";

export default function JobsLoading() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-baseline justify-between">
        <Skeleton className="h-5 w-28 rounded-lg" />
        <Skeleton className="h-3 w-8 rounded-lg" />
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-border/40 bg-card/50 p-3 sm:p-4 shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Skeleton className="h-9 flex-1 rounded-xl" />
          <Skeleton className="h-9 w-full sm:w-[172px] rounded-xl" />
          <Skeleton className="h-9 w-full sm:w-[140px] rounded-xl" />
          <Skeleton className="h-9 w-full sm:w-[130px] rounded-xl" />
        </div>
      </div>

      {/* Job cards */}
      <div className="flex flex-col gap-2.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border/40 bg-card p-4 sm:p-5"
            style={{ opacity: 1 - i * 0.08 }}
          >
            <div className="flex items-start gap-4">
              <Skeleton className="hidden sm:block h-11 w-11 rounded-xl" />
              <div className="flex-1 min-w-0 space-y-2.5">
                <Skeleton className="h-4 w-2/3 max-w-[260px] rounded-lg" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-3 w-24 rounded-lg" />
                  <Skeleton className="h-3 w-16 rounded-lg" />
                  <Skeleton className="h-3 w-14 rounded-lg" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <Skeleton className="h-5 w-16 rounded-md" />
                    <Skeleton className="h-5 w-14 rounded-md" />
                  </div>
                  <Skeleton className="hidden sm:block h-3.5 w-24 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
