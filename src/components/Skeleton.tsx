import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('av-shimmer rounded-md', className)} aria-hidden="true" />;
}

export function AppCardSkeleton() {
  return (
    <div className="av-card" aria-hidden="true">
      <div className="flex items-start gap-3">
        <Skeleton className="h-14 w-14 rounded-[18px]" />
        <div className="flex-1 space-y-2 pt-1">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-6 w-20 rounded-pill" />
        <Skeleton className="h-6 w-24 rounded-pill" />
      </div>
    </div>
  );
}
