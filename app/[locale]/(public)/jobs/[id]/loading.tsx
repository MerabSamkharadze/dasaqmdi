import { Skeleton } from "@/components/ui/skeleton";

export default function JobDetailLoading() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <Skeleton className="h-14 w-14 rounded-xl" />
          <div className="space-y-2.5">
            <Skeleton className="h-5 w-56 rounded-lg" />
            <Skeleton className="h-3.5 w-28 rounded-lg" />
          </div>
        </div>
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>

      {/* Meta badges */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-20 rounded-lg" />
        ))}
      </div>

      {/* Description card */}
      <div className="rounded-xl border border-border/30 bg-card p-5 sm:p-8 shadow-sm space-y-3">
        <Skeleton className="h-3.5 w-full rounded-lg" />
        <Skeleton className="h-3.5 w-full rounded-lg" />
        <Skeleton className="h-3.5 w-5/6 rounded-lg" />
        <Skeleton className="h-3.5 w-full rounded-lg" />
        <Skeleton className="h-3.5 w-3/4 rounded-lg" />
        <Skeleton className="h-3.5 w-full rounded-lg" />
        <Skeleton className="h-3.5 w-2/3 rounded-lg" />
      </div>

      {/* Requirements card */}
      <div className="rounded-xl border border-border/30 bg-card p-5 sm:p-8 shadow-sm space-y-3">
        <Skeleton className="h-4 w-24 rounded-lg mb-1" />
        <Skeleton className="h-3.5 w-full rounded-lg" />
        <Skeleton className="h-3.5 w-4/5 rounded-lg" />
        <Skeleton className="h-3.5 w-full rounded-lg" />
        <Skeleton className="h-3.5 w-3/5 rounded-lg" />
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-16 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
