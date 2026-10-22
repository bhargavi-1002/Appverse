import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-line px-6 py-14 text-center',
        className,
      )}
    >
      {icon && (
        <span
          className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-line bg-surface text-muted"
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
      <div className="max-w-md space-y-1.5">
        <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
        <p className="text-sm leading-relaxed text-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}
