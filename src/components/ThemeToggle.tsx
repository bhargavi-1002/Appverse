import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import type { ThemePreference } from '@/lib/storage';
import { cn } from '@/lib/utils';

const options: Array<{ value: ThemePreference; label: string; Icon: typeof Sun }> = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
];

export function ThemeToggle({ className }: { className?: string }) {
  const { preference, setPreference } = useTheme();

  return (
    <div
      className={cn(
        // `max-sm:hidden` rather than `hidden`: a base `hidden` utility would
        // be overridden by the base `inline-flex` below, because Tailwind
        // emits display utilities in a fixed order. A max-width media query
        // always wins over a base rule.
        'inline-flex items-center gap-0.5 rounded-pill border border-line bg-surface p-0.5',
        className,
      )}
      role="radiogroup"
      aria-label="Colour theme"
    >
      {options.map(({ value, label, Icon }) => {
        const active = preference === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setPreference(value)}
            title={`${label} theme`}
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-pill transition-colors',
              active
                ? 'bg-accent text-white shadow-sm'
                : 'text-muted hover:bg-surface-strong hover:text-ink',
            )}
          >
            <Icon size={15} aria-hidden="true" />
            <span className="av-sr-only">{label} theme</span>
          </button>
        );
      })}
    </div>
  );
}
