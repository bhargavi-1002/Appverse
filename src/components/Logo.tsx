import { cn } from '@/lib/utils';

export interface LogoProps {
  className?: string;
  /** Hide the wordmark and render only the mark. */
  markOnly?: boolean;
  title?: string;
}

/**
 * The AppVerse mark — a gradient chevron "A" inside a rounded tile, with a
 * cyan orbit node. The same geometry is used for the favicon, the PWA icon
 * and the launcher icon, so the identity is identical everywhere.
 */
export function Logo({ className, markOnly = false, title = 'AppVerse' }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className="relative inline-flex shrink-0">
        <svg
          viewBox="0 0 512 512"
          className="h-8 w-8"
          role="img"
          aria-label={`${title} logo`}
          focusable="false"
        >
          <defs>
            <linearGradient id="avLogoTile" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1b1f47" />
              <stop offset="55%" stopColor="#0d1026" />
              <stop offset="100%" stopColor="#070912" />
            </linearGradient>
            <linearGradient id="avLogoMark" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="48%" stopColor="#7c5cff" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
          <rect width="512" height="512" rx="116" fill="url(#avLogoTile)" />
          <rect
            x="1.5"
            y="1.5"
            width="509"
            height="509"
            rx="114.5"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.12"
            strokeWidth="3"
          />
          <path
            d="M132 384 L256 138 L380 384"
            fill="none"
            stroke="url(#avLogoMark)"
            strokeWidth="44"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M196 312 H316"
            fill="none"
            stroke="url(#avLogoMark)"
            strokeWidth="36"
            strokeLinecap="round"
          />
          <circle cx="380" cy="150" r="19" fill="#22d3ee" />
        </svg>
      </span>
      {!markOnly && (
        <span className="font-display text-lg font-bold tracking-tight text-ink">AppVerse</span>
      )}
    </span>
  );
}
