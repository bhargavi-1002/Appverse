import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { AppEntry } from '@/data/schema';
import { categories, technologies, registry } from '@/data/apps';
import { searchApps } from '@/lib/search';

export type SortKey = 'featured' | 'newest' | 'name';

export interface ExploreFilters {
  query: string;
  categories: string[];
  platforms: string[];
  installations: string[];
  technologies: string[];
  sort: SortKey;
  layout: 'grid' | 'list';
}

/**
 * Maps each filter to the query-string parameter it is stored under.
 * Keeping this in one place means reading and writing can never drift apart.
 */
const PARAM_KEYS = {
  query: 'q',
  categories: 'category',
  platforms: 'platform',
  installations: 'install',
  technologies: 'tech',
  sort: 'sort',
  layout: 'layout',
} as const;

function readList(params: URLSearchParams, key: string): string[] {
  const value = params.get(key);
  if (!value) return [];
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function useExploreFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<ExploreFilters>(
    () => ({
      query: searchParams.get(PARAM_KEYS.query) ?? '',
      categories: readList(searchParams, PARAM_KEYS.categories),
      platforms: readList(searchParams, PARAM_KEYS.platforms),
      installations: readList(searchParams, PARAM_KEYS.installations),
      technologies: readList(searchParams, PARAM_KEYS.technologies),
      sort: (searchParams.get(PARAM_KEYS.sort) as SortKey) || 'featured',
      layout: searchParams.get(PARAM_KEYS.layout) === 'list' ? 'list' : 'grid',
    }),
    [searchParams],
  );

  const update = useCallback(
    (patch: Partial<Record<keyof ExploreFilters, string | string[]>>) => {
      const next = new URLSearchParams(searchParams);
      for (const [key, value] of Object.entries(patch)) {
        const param = PARAM_KEYS[key as keyof ExploreFilters];
        const serialized = Array.isArray(value) ? value.join(',') : (value ?? '');
        if (!serialized) next.delete(param);
        else next.set(param, serialized);
      }
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const toggleValue = useCallback(
    (
      key: 'categories' | 'platforms' | 'installations' | 'technologies',
      value: string,
    ) => {
      const current = filters[key];
      const next = current.includes(value)
        ? current.filter((entry) => entry !== value)
        : [...current, value];
      update({ [key]: next });
    },
    [filters, update],
  );

  const clear = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  const activeCount =
    filters.categories.length +
    filters.platforms.length +
    filters.installations.length +
    filters.technologies.length +
    (filters.query ? 1 : 0);

  return { filters, update, toggleValue, clear, activeCount };
}

/** Apply the active filters and sort to the registry. */
export function applyFilters(filters: ExploreFilters, source: AppEntry[] = registry): AppEntry[] {
  let results = source;

  if (filters.query.trim()) {
    const ranked = searchApps(results, filters.query);
    const order = new Map(ranked.map((entry, index) => [entry.app.slug, index]));
    results = results.filter((app) => order.has(app.slug));
    results = [...results].sort((a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0));
  }

  if (filters.categories.length) {
    results = results.filter((app) => filters.categories.includes(app.category));
  }

  if (filters.platforms.length) {
    results = results.filter((app) =>
      filters.platforms.some((platform) =>
        app.supportedPlatforms.includes(platform as AppEntry['supportedPlatforms'][number]),
      ),
    );
  }

  if (filters.installations.length) {
    results = results.filter((app) => filters.installations.includes(app.installationType));
  }

  if (filters.technologies.length) {
    results = results.filter((app) =>
      filters.technologies.some((technology) => app.technologies.includes(technology)),
    );
  }

  switch (filters.sort) {
    case 'name':
      results = [...results].sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'newest':
      results = [...results].sort((a, b) =>
        (b.lastUpdated ?? '').localeCompare(a.lastUpdated ?? ''),
      );
      break;
    case 'featured':
    default:
      results = [...results].sort(
        (a, b) => a.featuredOrder - b.featuredOrder || a.name.localeCompare(b.name),
      );
      break;
  }

  return results;
}

export const availableCategories = categories;
export const availableTechnologies = technologies;
