import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header skeleton */}
      <div className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <Skeleton className="h-6 w-24" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        </div>
      </div>

      <main className="flex-1 w-full">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-12">
          {/* Title skeleton */}
          <div className="flex items-baseline justify-between mb-8">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-8" />
          </div>

          {/* Job card skeletons */}
          <div className="flex flex-col gap-2.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-border/40 bg-card px-5 py-5 sm:px-6 shadow-sm"
              >
                <div className="flex items-start gap-4 sm:gap-5">
                  {/* Logo skeleton */}
                  <Skeleton className="hidden sm:block h-10 w-10 rounded-lg" />

                  {/* Content skeleton */}
                  <div className="flex-1 min-w-0 space-y-2.5">
                    <Skeleton className="h-[18px] w-3/4 max-w-[280px]" />
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-3.5 w-28" />
                      <Skeleton className="h-3.5 w-20 hidden sm:block" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-14 rounded-full" />
                    </div>
                  </div>

                  {/* Right column skeleton */}
                  <div className="hidden md:flex flex-col items-end gap-2.5 shrink-0">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
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
