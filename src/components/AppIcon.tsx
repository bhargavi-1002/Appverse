import { useState } from 'react';
import { cn } from '@/lib/utils';

export interface AppIconProps {
  src: string;
  /** Accessible name of the application. */
  name: string;
  className?: string;
  /** Rendered size in pixels for the square icon box. */
  size?: number;
  accent?: string;
}

/**
 * Renders an application icon with a graceful fallback if the asset is
 * missing, so a broken icon never leaves an empty hole in a card.
 */
export function AppIcon({ src, name, className, size = 56, accent }: AppIconProps) {
  const [failed, setFailed] = useState(false);
  const initial = name.trim().charAt(0).toUpperCase() || 'A';

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[18px] border border-line',
        className,
      )}
      style={{
        width: size,
        height: size,
        background: failed
          ? `linear-gradient(135deg, ${accent ?? '#7c5cff'}33, ${accent ?? '#22d3ee'}22)`
          : 'var(--app-bg-elevated)',
      }}
    >
      {failed ? (
        <span
          className="font-display font-bold text-ink"
          style={{ fontSize: Math.round(size * 0.42) }}
          aria-hidden="true"
        >
          {initial}
        </span>
      ) : (
        <img
          src={src}
          alt={`${name} icon`}
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}
