import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-8">
      {/* Title */}
      <div>
        <Skeleton className="h-6 w-48 rounded-lg" />
        <Skeleton className="h-4 w-24 rounded-lg mt-2" />
      </div>

      {/* Stats grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border/40 bg-card p-5 shadow-soft"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div>
                <Skeleton className="h-7 w-12 rounded-lg" />
                <Skeleton className="h-3 w-20 rounded-lg mt-1.5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content list */}
      <div>
        <Skeleton className="h-5 w-36 rounded-lg mb-4" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-xl border border-border/40 bg-card px-5 py-3.5 shadow-soft"
              style={{ opacity: 1 - i * 0.15 }}
            >
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-4 w-40 rounded-lg" />
                <Skeleton className="h-3 w-24 rounded-lg mt-1.5" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
