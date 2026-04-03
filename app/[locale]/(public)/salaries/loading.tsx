import { Skeleton } from "@/components/ui/skeleton";

export default function SalariesLoading() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-6 w-48 rounded-lg" />
        <Skeleton className="h-4 w-72 rounded-lg" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-9 w-full sm:w-[160px] rounded-lg" />
        <Skeleton className="h-9 w-full sm:w-[160px] rounded-lg" />
        <Skeleton className="h-9 w-full sm:w-[140px] rounded-lg" />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border/60 bg-card p-5 shadow-soft"
          >
            <Skeleton className="h-3 w-24 rounded-lg mb-3" />
            <Skeleton className="h-6 w-32 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Category sections */}
      {Array.from({ length: 3 }).map((_, ci) => (
        <div key={ci} className="flex flex-col gap-3" style={{ opacity: 1 - ci * 0.15 }}>
          <Skeleton className="h-4 w-36 rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-border/60 bg-card p-5 shadow-soft"
              >
                <div className="flex justify-between mb-3">
                  <Skeleton className="h-3 w-16 rounded-lg" />
                  <Skeleton className="h-4 w-8 rounded-lg" />
                </div>
                <Skeleton className="h-5 w-40 rounded-lg mb-2" />
                <Skeleton className="h-3 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
