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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Skeleton className="h-9 flex-1 rounded-lg" />
        <Skeleton className="h-9 w-full sm:w-[160px] rounded-lg" />
        <Skeleton className="h-9 w-full sm:w-[140px] rounded-lg" />
        <Skeleton className="h-9 w-full sm:w-[130px] rounded-lg" />
      </div>

      {/* Job cards */}
      <div className="flex flex-col gap-2.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border/30 bg-card px-5 py-5 shadow-sm"
            style={{ opacity: 1 - i * 0.08 }}
          >
            <div className="flex items-start gap-5">
              <Skeleton className="hidden sm:block h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-2.5">
                <Skeleton className="h-4 w-2/3 rounded-lg" />
                <div className="flex gap-3">
                  <Skeleton className="h-3 w-24 rounded-lg" />
                  <Skeleton className="h-3 w-16 rounded-lg" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16 rounded-lg" />
                  <Skeleton className="h-5 w-14 rounded-lg" />
                </div>
              </div>
              <div className="hidden md:flex flex-col items-end gap-2">
                <Skeleton className="h-4 w-24 rounded-lg" />
                <Skeleton className="h-3 w-16 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
