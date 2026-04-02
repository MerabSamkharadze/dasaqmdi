export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-8 animate-pulse">
      {/* Title skeleton */}
      <div>
        <div className="h-6 w-48 rounded-lg bg-muted/50" />
        <div className="h-4 w-24 rounded-lg bg-muted/30 mt-2" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border/30 bg-card p-5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-muted/40" />
              <div>
                <div className="h-7 w-12 rounded-lg bg-muted/40" />
                <div className="h-3 w-20 rounded-lg bg-muted/30 mt-1.5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div>
        <div className="h-5 w-36 rounded-lg bg-muted/40 mb-4" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-xl border border-border/30 bg-card px-5 py-3.5 shadow-sm"
            >
              <div className="h-9 w-9 rounded-lg bg-muted/40" />
              <div className="flex-1">
                <div className="h-4 w-40 rounded-lg bg-muted/40" />
                <div className="h-3 w-24 rounded-lg bg-muted/30 mt-1.5" />
              </div>
              <div className="h-5 w-16 rounded-full bg-muted/30" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
