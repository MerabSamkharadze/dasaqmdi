import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header skeleton */}
      <div className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Skeleton className="h-5 w-24 rounded-lg" />
            <div className="hidden sm:flex items-center gap-1">
              <Skeleton className="h-7 w-20 rounded-lg" />
              <Skeleton className="h-7 w-20 rounded-lg" />
              <Skeleton className="h-7 w-20 rounded-lg" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-xl" />
            <Skeleton className="h-8 w-8 rounded-xl" />
            <Skeleton className="h-8 w-16 rounded-xl" />
          </div>
        </div>
      </div>

      <main className="flex-1 w-full">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-10">
          {/* Filter bar skeleton */}
          <div className="mb-8 rounded-xl border border-border/40 bg-card/50 p-3 sm:p-4 shadow-soft">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Skeleton className="h-9 flex-1 rounded-xl" />
              <Skeleton className="h-9 w-full sm:w-[172px] rounded-xl" />
              <Skeleton className="h-9 w-full sm:w-[140px] rounded-xl" />
              <Skeleton className="h-9 w-full sm:w-[130px] rounded-xl" />
            </div>
          </div>

          {/* Job card skeletons */}
          <div className="flex flex-col gap-2.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-border/40 bg-card p-4 sm:p-5 shadow-soft"
                style={{ opacity: 1 - i * 0.08 }}
              >
                <div className="flex items-start gap-4">
                  <Skeleton className="hidden sm:block h-11 w-11 rounded-xl" />
                  <div className="flex-1 min-w-0 space-y-2.5">
                    <Skeleton className="h-4 w-3/4 max-w-[280px] rounded-lg" />
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-3 w-28 rounded-lg" />
                      <Skeleton className="h-3 w-20 rounded-lg" />
                      <Skeleton className="h-3 w-16 rounded-lg" />
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
      </main>
    </div>
  );
}
