import { Link } from 'react-router-dom';
import { ArrowUpRight, Heart, Eye, AlertTriangle } from 'lucide-react';
import type { AppEntry } from '@/data/schema';
import { resolvePrimaryAction } from '@/lib/appActions';
import { AppIcon } from './AppIcon';
import { InstallStatusBadge, PlatformChips } from './PlatformChips';
import { cn } from '@/lib/utils';

export interface AppCardProps {
  app: AppEntry;
  /** Compact single-line layout used by the "recently added" rail. */
  layout?: 'grid' | 'list' | 'rail';
  isFavorite?: boolean;
  onToggleFavorite?: (slug: string) => void;
  className?: string;
}

export function AppCard({
  app,
  layout = 'grid',
  isFavorite = false,
  onToggleFavorite,
  className,
}: AppCardProps) {
  const action = resolvePrimaryAction(app);
  const ActionIcon = action.icon;
  const isPlaceholder = app.deploymentStatus === 'placeholder';

  const favouriteButton = onToggleFavorite && (
    <button
      type="button"
      onClick={() => onToggleFavorite(app.slug)}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? `Remove ${app.name} from favourites` : `Add ${app.name} to favourites`}
      title={isFavorite ? 'Remove from favourites' : 'Add to favourites'}
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-sm border transition-colors',
        isFavorite
          ? 'border-rose/40 bg-rose/10 text-rose'
          : 'border-line bg-surface text-muted hover:border-line-strong hover:text-ink',
      )}
    >
      <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} aria-hidden="true" />
    </button>
  );

  if (layout === 'rail') {
    return (
      <Link
        to={`/apps/${app.slug}`}
        className={cn(
          'group flex w-56 shrink-0 items-center gap-3 rounded-md border border-line bg-surface p-3 transition-all hover:-translate-y-0.5 hover:border-line-strong hover:bg-surface-strong',
          className,
        )}
      >
        <AppIcon src={app.icon} name={app.name} size={40} accent={app.accent} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-ink">{app.name}</span>
          <span className="block truncate text-xs text-subtle">{app.category}</span>
        </span>
        <ArrowUpRight
          size={15}
          className="shrink-0 text-subtle transition-colors group-hover:text-accent-text"
          aria-hidden="true"
        />
      </Link>
    );
  }

  if (layout === 'list') {
    return (
      <article
        className={cn(
          'group flex items-start gap-4 rounded-lg border border-line bg-surface p-4 transition-all hover:border-line-strong hover:bg-surface-strong',
          className,
        )}
      >
        <Link to={`/apps/${app.slug}`} className="shrink-0" tabIndex={-1} aria-hidden="true">
          <AppIcon src={app.icon} name={app.name} size={52} accent={app.accent} />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="font-display text-base font-semibold text-ink">
              <Link
                to={`/apps/${app.slug}`}
                className="rounded-sm outline-offset-4 hover:text-accent-text focus-visible:underline"
              >
                {app.name}
              </Link>
            </h3>
            <span className="text-xs text-subtle">{app.category}</span>
            {isPlaceholder && (
              <span className="inline-flex items-center gap-1 rounded-pill border border-amber/30 bg-amber/10 px-2 py-0.5 text-[11px] font-medium text-amber">
                <AlertTriangle size={11} aria-hidden="true" />
                Placeholder build
              </span>
            )}
          </div>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">{app.shortDescription}</p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <InstallStatusBadge installationType={app.installationType} />
            <PlatformChips platforms={app.supportedPlatforms} max={3} />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {favouriteButton}
          {action.kind === 'open' ? (
            <Link to={action.to} className="av-btn av-btn-primary !min-h-10 !px-3.5 !text-sm">
              <ActionIcon size={15} aria-hidden="true" />
              Open
            </Link>
          ) : action.kind === 'source' ? (
            <a
              href={action.href}
              target="_blank"
              rel="noopener noreferrer"
              className="av-btn av-btn-secondary !min-h-10 !px-3.5 !text-sm"
            >
              <ActionIcon size={15} aria-hidden="true" />
              Source
            </a>
          ) : (
            <Link to={action.to} className="av-btn av-btn-secondary !min-h-10 !px-3.5 !text-sm">
              <ActionIcon size={15} aria-hidden="true" />
              Details
            </Link>
          )}
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        'av-card group',
        'hover:!border-line-strong',
        className,
      )}
      style={{ ['--app-card-glow' as string]: `${app.accent ?? '#7c5cff'}22` }}
    >
      <div className="flex items-start gap-3">
        <Link to={`/apps/${app.slug}`} tabIndex={-1} aria-hidden="true" className="shrink-0">
          <AppIcon src={app.icon} name={app.name} size={52} accent={app.accent} />
        </Link>

        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-[15px] font-semibold leading-tight text-ink">
            <Link
              to={`/apps/${app.slug}`}
              className="rounded-sm outline-offset-4 hover:text-accent-text focus-visible:underline"
            >
              {app.name}
            </Link>
          </h3>
          <p className="mt-0.5 text-xs text-subtle">{app.category}</p>
        </div>

        {favouriteButton && (
          <div className="-mr-1 -mt-1 shrink-0 [&>button]:h-8 [&>button]:w-8 [&>button]:border-0 [&>button]:bg-transparent">
            {favouriteButton}
          </div>
        )}
      </div>

      <p className="line-clamp-3 text-sm leading-relaxed text-muted">{app.shortDescription}</p>

      {isPlaceholder && (
        <p className="flex items-start gap-2 rounded-sm border border-amber/25 bg-amber/8 px-2.5 py-2 text-xs leading-relaxed text-amber">
          <AlertTriangle size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
          The public build is still a starter template. The full source is in the repository.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <InstallStatusBadge installationType={app.installationType} />
      </div>

      <PlatformChips platforms={app.supportedPlatforms} max={4} className="mt-auto" />

      <div className="flex items-center gap-2 pt-1">
        {action.kind === 'open' ? (
          <Link to={action.to} className="av-btn av-btn-primary flex-1 !text-sm">
            <ActionIcon size={15} aria-hidden="true" />
            {action.label}
          </Link>
        ) : action.kind === 'source' ? (
          <a
            href={action.href}
            target="_blank"
            rel="noopener noreferrer"
            className="av-btn av-btn-secondary flex-1 !text-sm"
          >
            <ActionIcon size={15} aria-hidden="true" />
            {action.label}
          </a>
        ) : (
          <Link to={action.to} className="av-btn av-btn-secondary flex-1 !text-sm">
            <ActionIcon size={15} aria-hidden="true" />
            {action.label}
          </Link>
        )}

        <Link
          to={`/apps/${app.slug}`}
          className="av-btn av-btn-ghost !px-3 !text-sm"
          aria-label={`View details for ${app.name}`}
        >
          <Eye size={16} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
