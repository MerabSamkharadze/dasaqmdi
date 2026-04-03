import { Skeleton } from "@/components/ui/skeleton";

export default function SeekerProfileLoading() {
  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto">
      <div className="rounded-xl border border-border/60 bg-card p-6 sm:p-8 shadow-soft">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-40 rounded-lg" />
            <div className="flex gap-3">
              <Skeleton className="h-3 w-20 rounded-lg" />
              <Skeleton className="h-3 w-28 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
      <Skeleton className="h-28 w-full rounded-xl" />
      <Skeleton className="h-20 w-full rounded-xl" />
    </div>
  );
}
