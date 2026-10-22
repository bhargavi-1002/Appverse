import { describe, expect, it } from 'vitest';
import { registry } from '@/data/apps';
import { applyFilters, type ExploreFilters } from './useExploreFilters';

const base: ExploreFilters = {
  query: '',
  categories: [],
  platforms: [],
  installations: [],
  technologies: [],
  sort: 'featured',
  layout: 'grid',
};

describe('applyFilters', () => {
  it('returns the whole registry with no filters', () => {
    expect(applyFilters(base)).toHaveLength(registry.length);
  });

  it('filters by category', () => {
    const results = applyFilters({ ...base, categories: ['Games'] });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((app) => app.category === 'Games')).toBe(true);
  });

  it('filters by platform', () => {
    const results = applyFilters({ ...base, platforms: ['android'] });
    expect(results.every((app) => app.supportedPlatforms.includes('android'))).toBe(true);
  });

  it('filters by installation type', () => {
    const results = applyFilters({ ...base, installations: ['github'] });
    expect(results.every((app) => app.installationType === 'github')).toBe(true);
  });

  it('filters by technology', () => {
    const results = applyFilters({ ...base, technologies: ['Three.js'] });
    expect(results.map((app) => app.slug)).toContain('battery-buddy');
  });

  it('combines filters with AND', () => {
    const results = applyFilters({ ...base, categories: ['Games'], platforms: ['android'] });
    expect(
      results.every(
        (app) => app.category === 'Games' && app.supportedPlatforms.includes('android'),
      ),
    ).toBe(true);
  });

  it('sorts by name', () => {
    const results = applyFilters({ ...base, sort: 'name' });
    const names = results.map((app) => app.name);
    expect([...names].sort((a, b) => a.localeCompare(b))).toEqual(names);
  });

  it('sorts by most recently updated', () => {
    const results = applyFilters({ ...base, sort: 'newest' });
    const dates = results.map((app) => app.lastUpdated ?? '');
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it('ranks a text search above the default order', () => {
    const results = applyFilters({ ...base, query: 'snake' });
    expect(results[0].slug).toBe('snake-game');
  });

  it('returns an empty list when nothing matches', () => {
    expect(applyFilters({ ...base, query: 'zzzzz-not-real' })).toHaveLength(0);
  });
});
