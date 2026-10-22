import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  LayoutGrid,
  List,
  Search,
  SlidersHorizontal,
  X,
  PackageX,
  ArrowUpDown,
} from 'lucide-react';
import { registry } from '@/data/apps';
import { installationTypeLabels, platformLabels, type InstallationType, type Platform } from '@/data/types';
import { AppCard } from '@/components/AppCard';
import { EmptyState } from '@/components/EmptyState';
import { SectionHeading } from '@/components/SectionHeading';
import { useExploreFilters, applyFilters, availableTechnologies } from '@/hooks/useExploreFilters';
import { useFavorites } from '@/hooks/useLocalLists';
import { useDocumentMeta } from '@/lib/seo';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 9;

const sortOptions = [
  { value: 'featured', label: 'Featured order' },
  { value: 'newest', label: 'Recently updated' },
  { value: 'name', label: 'Name (A–Z)' },
] as const;

const installationOptions: InstallationType[] = ['pwa', 'web', 'apk', 'desktop', 'github'];
const platformOptions: Platform[] = ['web', 'android', 'ios', 'windows', 'macos', 'linux'];

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex min-h-9 items-center gap-1.5 rounded-pill border px-3 text-xs font-medium transition-colors',
        active
          ? 'border-accent/45 bg-accent-soft text-accent-text'
          : 'border-line bg-surface text-muted hover:border-line-strong hover:text-ink',
      )}
    >
      {children}
    </button>
  );
}

export function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { filters, update, toggleValue, clear, activeCount } = useExploreFilters();
  const { favorites, toggle } = useFavorites();
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const results = useMemo(() => applyFilters(filters), [filters]);
  const visibleResults = results.slice(0, visible);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [filters]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const app of registry) {
      counts.set(app.category, (counts.get(app.category) ?? 0) + 1);
    }
    return counts;
  }, []);

  useDocumentMeta({
    title: 'Explore applications',
    description:
      'Search and filter every application in AppVerse by name, category, supported platform and installation method.',
    path: '/explore',
  });

  const hasFilters = activeCount > 0;

  return (
    <div className="av-container py-12">
      <SectionHeading
        eyebrow="Marketplace"
        title="Explore applications"
        description={`${registry.length} applications, every one with its own page, live demo and honest installation notes.`}
      />

      {/* ------------------------------------------------------- Search */}
      <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-sm border border-line bg-bg-elevated px-3 focus-within:border-accent">
          <Search size={17} className="shrink-0 text-subtle" aria-hidden="true" />
          <input
            type="search"
            value={filters.query}
            onChange={(event) => update({ query: event.target.value })}
            placeholder="Search apps, categories…"
            aria-label="Search applications"
            className="h-12 w-full min-w-0 bg-transparent text-[15px] text-ink outline-none placeholder:text-subtle"
          />
          {filters.query && (
            <button
              type="button"
              onClick={() => update({ query: '' })}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-muted transition-colors hover:bg-surface hover:text-ink"
              aria-label="Clear search"
            >
              <X size={15} aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="sort">
            Sort applications
          </label>
          <div className="relative">
            <ArrowUpDown
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle"
              aria-hidden="true"
            />
            <select
              id="sort"
              value={filters.sort}
              onChange={(event) => update({ sort: event.target.value })}
              className="av-field !h-12 !pl-9 !pr-8 appearance-none text-sm"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div
            className="inline-flex items-center rounded-sm border border-line bg-surface p-0.5"
            role="group"
            aria-label="Layout"
          >
            <button
              type="button"
              onClick={() => update({ layout: 'grid' })}
              aria-pressed={filters.layout === 'grid'}
              className={cn(
                'inline-flex h-10 w-10 items-center justify-center rounded-sm transition-colors',
                filters.layout === 'grid'
                  ? 'bg-accent text-white'
                  : 'text-muted hover:bg-surface-strong hover:text-ink',
              )}
            >
              <LayoutGrid size={16} aria-hidden="true" />
              <span className="av-sr-only">Grid layout</span>
            </button>
            <button
              type="button"
              onClick={() => update({ layout: 'list' })}
              aria-pressed={filters.layout === 'list'}
              className={cn(
                'inline-flex h-10 w-10 items-center justify-center rounded-sm transition-colors',
                filters.layout === 'list'
                  ? 'bg-accent text-white'
                  : 'text-muted hover:bg-surface-strong hover:text-ink',
              )}
            >
              <List size={16} aria-hidden="true" />
              <span className="av-sr-only">List layout</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
            aria-controls="explore-filters"
            className="av-btn av-btn-secondary !min-h-12 !px-3.5 !text-sm lg:hidden"
          >
            <SlidersHorizontal size={15} aria-hidden="true" />
            Filters
            {hasFilters && (
              <span className="rounded-pill bg-accent px-1.5 text-[10px] font-semibold text-white">
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------- Filters */}
      <div
        id="explore-filters"
        className={cn(
          'mt-5 rounded-lg border border-line bg-surface p-5',
          filtersOpen ? 'block' : 'hidden lg:block',
        )}
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <fieldset>
            <legend className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-subtle">
              Category
            </legend>
            <div className="flex flex-wrap gap-1.5">
              {[...categoryCounts.entries()]
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([category, count]) => (
                  <FilterChip
                    key={category}
                    active={filters.categories.includes(category)}
                    onClick={() => toggleValue('categories', category)}
                  >
                    {category}
                    <span className="opacity-60">{count}</span>
                  </FilterChip>
                ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-subtle">
              Platform
            </legend>
            <div className="flex flex-wrap gap-1.5">
              {platformOptions.map((platform) => (
                <FilterChip
                  key={platform}
                  active={filters.platforms.includes(platform)}
                  onClick={() => toggleValue('platforms', platform)}
                >
                  {platformLabels[platform]}
                </FilterChip>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-subtle">
              Installation
            </legend>
            <div className="flex flex-wrap gap-1.5">
              {installationOptions.map((type) => (
                <FilterChip
                  key={type}
                  active={filters.installations.includes(type)}
                  onClick={() => toggleValue('installations', type)}
                >
                  {installationTypeLabels[type]}
                </FilterChip>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-subtle">
              Technology
            </legend>
            <div className="flex flex-wrap gap-1.5">
              {availableTechnologies.slice(0, 12).map((technology) => (
                <FilterChip
                  key={technology}
                  active={filters.technologies.includes(technology)}
                  onClick={() => toggleValue('technologies', technology)}
                >
                  {technology}
                </FilterChip>
              ))}
            </div>
          </fieldset>
        </div>

        {hasFilters && (
          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-4">
            <span className="text-xs text-subtle">
              {activeCount} active {activeCount === 1 ? 'filter' : 'filters'} ·{' '}
              {results.length} {results.length === 1 ? 'result' : 'results'}
            </span>
            <button
              type="button"
              onClick={clear}
              className="av-btn av-btn-ghost !min-h-9 !px-2.5 !text-xs"
            >
              <X size={13} aria-hidden="true" />
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------ Results */}
      <div className="mt-8">
        {results.length === 0 ? (
          <EmptyState
            icon={<PackageX size={22} />}
            title="No applications match those filters"
            description="Try removing a filter, searching for a different term, or clearing everything to see the full catalogue."
            action={
              <button type="button" onClick={clear} className="av-btn av-btn-primary !text-sm">
                Clear all filters
              </button>
            }
          />
        ) : (
          <>
            <p className="mb-4 text-sm text-muted" aria-live="polite">
              Showing {visibleResults.length} of {results.length}{' '}
              {results.length === 1 ? 'application' : 'applications'}
            </p>

            <div
              className={
                filters.layout === 'grid'
                  ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
                  : 'flex flex-col gap-3'
              }
            >
              {visibleResults.map((app) => (
                <AppCard
                  key={app.slug}
                  app={app}
                  layout={filters.layout}
                  isFavorite={favorites.includes(app.slug)}
                  onToggleFavorite={toggle}
                />
              ))}
            </div>

            {visible < results.length && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisible((count) => count + PAGE_SIZE)}
                  className="av-btn av-btn-secondary"
                >
                  Load {Math.min(PAGE_SIZE, results.length - visible)} more
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {filters.query && (
        <p className="mt-8 text-sm text-muted">
          Looking for something specific?{' '}
          <Link
            to={`/explore?q=${encodeURIComponent(filters.query)}`}
            className="font-medium text-accent-text underline-offset-4 hover:underline"
            onClick={(event) => {
              event.preventDefault();
              setSearchParams(searchParams, { replace: true });
            }}
          >
            Share this search
          </Link>{' '}
          — the filters are all encoded in the page URL, so you can bookmark it.
        </p>
      )}
    </div>
  );
}
