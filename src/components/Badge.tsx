import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'text-muted border-line bg-surface',
  accent: 'text-accent-text border-accent/35 bg-accent-soft',
  success: 'text-emerald border-emerald/30 bg-emerald/10',
  warning: 'text-amber border-amber/30 bg-amber/10',
  danger: 'text-rose border-rose/30 bg-rose/10',
  info: 'text-cyan border-cyan/30 bg-cyan/10',
};

export interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
  title?: string;
}

export function Badge({ children, tone = 'neutral', className, title }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-0.5 text-xs font-medium leading-5',
        toneClasses[tone],
        className,
      )}
      title={title}
    >
      {children}
    </span>
  );
}
