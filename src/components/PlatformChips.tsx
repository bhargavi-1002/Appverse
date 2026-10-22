import {
  Globe,
  Monitor,
  Smartphone,
  Apple,
  Terminal,
  Package,
  Github,
} from 'lucide-react';
import type { Platform } from '@/data/types';
import { platformLabels } from '@/data/types';
import { cn } from '@/lib/utils';

const platformIcons: Record<Platform, typeof Globe> = {
  web: Globe,
  android: Smartphone,
  ios: Apple,
  windows: Monitor,
  macos: Monitor,
  linux: Terminal,
};

export interface PlatformChipsProps {
  platforms: Platform[];
  /** Maximum number of chips to show before collapsing into a "+n" chip. */
  max?: number;
  className?: string;
}

export function PlatformChips({ platforms, max = 4, className }: PlatformChipsProps) {
  const shown = platforms.slice(0, max);
  const overflow = platforms.length - shown.length;

  return (
    <ul className={cn('flex flex-wrap items-center gap-1.5', className)} aria-label="Supported platforms">
      {shown.map((platform) => {
        const Icon = platformIcons[platform];
        return (
          <li
            key={platform}
            className="inline-flex items-center gap-1 rounded-pill border border-line bg-surface px-2 py-0.5 text-[11px] font-medium text-muted"
            title={`Works on ${platformLabels[platform]}`}
          >
            <Icon size={12} aria-hidden="true" />
            {platformLabels[platform]}
          </li>
        );
      })}
      {overflow > 0 && (
        <li className="rounded-pill border border-line bg-surface px-2 py-0.5 text-[11px] font-medium text-subtle">
          +{overflow}
        </li>
      )}
    </ul>
  );
}

const installIcons = {
  pwa: Package,
  web: Globe,
  apk: Package,
  desktop: Monitor,
  github: Github,
} as const;

const installTones = {
  pwa: 'text-emerald border-emerald/30 bg-emerald/10',
  web: 'text-cyan border-cyan/30 bg-cyan/10',
  apk: 'text-amber border-amber/30 bg-amber/10',
  desktop: 'text-indigo border-indigo/30 bg-indigo/10',
  github: 'text-muted border-line bg-surface',
} as const;

export interface InstallStatusBadgeProps {
  installationType: keyof typeof installIcons;
  className?: string;
}

/**
 * Small badge describing how an app is delivered. The wording is deliberately
 * factual — "Web app" is never dressed up as an install.
 */
export function InstallStatusBadge({ installationType, className }: InstallStatusBadgeProps) {
  const Icon = installIcons[installationType];
  const labels = {
    pwa: 'Installable PWA',
    web: 'Open in browser',
    apk: 'Android APK',
    desktop: 'Desktop installer',
    github: 'Source on GitHub',
  } as const;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-0.5 text-xs font-medium',
        installTones[installationType],
        className,
      )}
    >
      <Icon size={12} aria-hidden="true" />
      {labels[installationType]}
    </span>
  );
}
