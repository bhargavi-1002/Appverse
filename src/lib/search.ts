import type { AppEntry } from '@/data/schema';

export interface SearchResult {
  app: AppEntry;
  score: number;
  /** Why this app matched — used for the "matched by" hint in the UI. */
  matchedOn: string;
}

function normalise(value: string): string {
  return value.toLowerCase().trim();
}

/**
 * Score a single application against a search query.
 *
 * The scoring favours name matches, then tags and category, then the
 * description and finally the technology list — so "snake" finds Neon Snake
 * Pro before it finds an app that merely mentions a snake in its copy.
 */
export function scoreApp(app: AppEntry, rawQuery: string): SearchResult | null {
  const query = normalise(rawQuery);
  if (!query) return null;

  const terms = query.split(/\s+/).filter(Boolean);
  let score = 0;
  const matched: string[] = [];

  for (const term of terms) {
    let termScore = 0;

    if (normalise(app.name) === term) {
      termScore += 120;
      matched.unshift('name');
    } else if (normalise(app.name).startsWith(term)) {
      termScore += 80;
      matched.push('name');
    } else if (normalise(app.name).includes(term)) {
      termScore += 55;
      matched.push('name');
    }

    if (normalise(app.tags.join(' ')).includes(term)) {
      termScore += 30;
      matched.push('tag');
    }

    if (normalise(app.category).includes(term)) {
      termScore += 25;
      matched.push('category');
    }

    if (normalise(app.technologies.join(' ')).includes(term)) {
      termScore += 18;
      matched.push('technology');
    }

    if (normalise(app.shortDescription).includes(term)) {
      termScore += 12;
      matched.push('description');
    }

    if (normalise(app.fullDescription).includes(term)) {
      termScore += 5;
    }

    if (termScore === 0) return null;
    score += termScore;
  }

  if (app.featured) score += 6;

  return {
    app,
    score,
    matchedOn: [...new Set(matched)].slice(0, 2).join(', ') || 'description',
  };
}

/** Rank the whole registry against a query. */
export function searchApps(apps: AppEntry[], query: string): SearchResult[] {
  if (!query.trim()) return [];
  return apps
    .map((app) => scoreApp(app, query))
    .filter((result): result is SearchResult => result !== null)
    .sort((a, b) => b.score - a.score || a.app.name.localeCompare(b.app.name));
}

/** Suggestions for the search box — names and tags that start with the query. */
export function suggestApps(apps: AppEntry[], query: string, limit = 6): AppEntry[] {
  const term = normalise(query);
  if (!term) return [];

  const suggestions = apps.filter((app) => {
    if (normalise(app.name).includes(term)) return true;
    if (app.tags.some((tag) => normalise(tag).startsWith(term))) return true;
    if (normalise(app.category).includes(term)) return true;
    return false;
  });

  return suggestions
    .sort((a, b) => {
      const aStarts = normalise(a.name).startsWith(term) ? 0 : 1;
      const bStarts = normalise(b.name).startsWith(term) ? 0 : 1;
      return aStarts - bStarts || a.name.localeCompare(b.name);
    })
    .slice(0, limit);
}
