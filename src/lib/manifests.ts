import cache from '@/data/manifest-cache.json';

/**
 * Read-only access to the installability verification results.
 *
 * The check is performed by `npm run verify:manifests`, which runs on the
 * server side with a real browser. A browser on AppVerse cannot fetch a
 * cross-origin manifest without CORS headers, so the results are verified once
 * and committed rather than being re-checked on every page load.
 */

export interface ManifestCriterion {
  id: string;
  label: string;
  passed: boolean | null;
  detail: string;
}

export interface ManifestReport {
  status: 'installable' | 'not-installable';
  manifestUrl: string | null;
  manifestName: string | null;
  manifestDisplay: string | null;
  criteria: ManifestCriterion[];
}

interface CacheShape {
  generatedAt: string;
  apps: Record<string, ManifestReport>;
}

const typedCache = cache as CacheShape;

export const manifestCacheGeneratedAt = typedCache.generatedAt;

export function getManifestReport(slug: string): ManifestReport | undefined {
  return typedCache.apps[slug];
}
