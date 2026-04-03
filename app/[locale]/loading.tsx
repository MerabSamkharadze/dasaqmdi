import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header skeleton */}
      <div className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <Skeleton className="h-5 w-24 rounded-lg" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-xl" />
            <Skeleton className="h-8 w-8 rounded-xl" />
            <Skeleton className="h-8 w-16 rounded-xl" />
          </div>
        </div>
      </div>

      <main className="flex-1 w-full">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-12">
          {/* Title skeleton */}
          <div className="flex items-baseline justify-between mb-8">
            <Skeleton className="h-5 w-28 rounded-lg" />
            <Skeleton className="h-3 w-6 rounded-lg" />
          </div>

          {/* Job card skeletons */}
          <div className="flex flex-col gap-2.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-border/60 bg-card px-5 py-5 sm:px-6 shadow-soft"
                style={{ opacity: 1 - i * 0.08 }}
              >
                <div className="flex items-start gap-4 sm:gap-5">
                  <Skeleton className="hidden sm:block h-10 w-10 rounded-lg" />
                  <div className="flex-1 min-w-0 space-y-2.5">
                    <Skeleton className="h-4 w-3/4 max-w-[260px] rounded-lg" />
                    <Skeleton className="h-3 w-32 rounded-lg" />
                    <div className="flex gap-2 pt-0.5">
                      <Skeleton className="h-5 w-16 rounded-lg" />
                      <Skeleton className="h-5 w-14 rounded-lg" />
                    </div>
                  </div>
                  <div className="hidden md:flex flex-col items-end gap-2.5 shrink-0">
                    <Skeleton className="h-3.5 w-24 rounded-lg" />
                    <Skeleton className="h-3 w-14 rounded-lg" />
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
