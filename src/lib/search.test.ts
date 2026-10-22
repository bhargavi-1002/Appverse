import { describe, expect, it } from 'vitest';
import { registry } from '@/data/apps';
import { scoreApp, searchApps, suggestApps } from './search';

describe('searchApps', () => {
  it('returns nothing for an empty query', () => {
    expect(searchApps(registry, '   ')).toHaveLength(0);
  });

  it('finds an app by its name', () => {
    const results = searchApps(registry, 'snake');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].app.slug).toBe('snake-game');
  });

  it('is case insensitive', () => {
    const lower = searchApps(registry, 'snake');
    const upper = searchApps(registry, 'SNAKE');
    expect(upper.map((r) => r.app.slug)).toEqual(lower.map((r) => r.app.slug));
  });

  it('finds an app by its tag', () => {
    const results = searchApps(registry, 'minimax');
    expect(results.map((r) => r.app.slug)).toContain('tic-tak-toe');
  });

  it('finds an app by its technology', () => {
    const results = searchApps(registry, 'next.js');
    expect(results.map((r) => r.app.slug)).toContain('time-traveler');
  });

  it('requires every term to match', () => {
    expect(searchApps(registry, 'snake banana')).toHaveLength(0);
  });

  it('returns nothing for a term that matches nothing', () => {
    expect(searchApps(registry, 'zzzzz-not-a-real-term')).toHaveLength(0);
  });
});

describe('scoreApp', () => {
  it('scores an exact name match highest', () => {
    const exact = scoreApp(registry[0], registry[0].name);
    const partial = scoreApp(registry[0], registry[0].name.slice(0, 4));
    expect(exact!.score).toBeGreaterThan(partial!.score);
  });

  it('returns null when nothing matches', () => {
    expect(scoreApp(registry[0], 'zzzzz')).toBeNull();
  });

  it('records what matched', () => {
    const result = scoreApp(registry.find((a) => a.slug === 'snake-game')!, 'snake');
    expect(result!.matchedOn).toContain('name');
  });
});

describe('suggestApps', () => {
  it('suggests by name prefix', () => {
    const suggestions = suggestApps(registry, 'c');
    expect(suggestions.some((app) => app.slug === 'connect')).toBe(true);
  });

  it('returns nothing for an empty query', () => {
    expect(suggestApps(registry, '')).toHaveLength(0);
  });

  it('respects the limit', () => {
    expect(suggestApps(registry, 'a', 3)).toHaveLength(3);
  });
});
