import cache from '@/data/github-cache.json';

/**
 * Read-only access to the GitHub metadata cache.
 *
 * The cache is produced by `npm run sync:github` and committed to the
 * repository, so the site never makes a GitHub request while a visitor is
 * browsing. Only repositories that are explicitly listed in the registry are
 * ever fetched, and private repositories are never exposed.
 */

export interface GithubReleaseAsset {
  name: string;
  url: string;
  size: number | null;
  contentType: string | null;
  downloadCount: number;
  updatedAt: string | null;
  checksum: string | null;
}

export interface GithubRelease {
  tag: string;
  name: string;
  publishedAt: string | null;
  url: string;
  notes: string;
}

export interface GithubRepository {
  repositoryUrl: string;
  owner: string;
  repo: string;
  available: boolean;
  reason?: string;
  fullName?: string;
  description?: string | null;
  homepage?: string | null;
  language?: string | null;
  topics?: string[];
  stars?: number;
  forks?: number;
  openIssues?: number;
  license?: string | null;
  defaultBranch?: string;
  pushedAt?: string | null;
  updatedAt?: string | null;
  archived?: boolean;
  releases?: GithubReleaseAsset[];
  latestRelease?: GithubRelease | null;
}

interface CacheShape {
  generatedAt: string;
  repositories: Record<string, GithubRepository>;
}

const typedCache = cache as CacheShape;

export const githubCacheGeneratedAt = typedCache.generatedAt;

export function getGithubRepository(slug: string): GithubRepository | undefined {
  return typedCache.repositories[slug];
}

/** True when the repository could be read by the sync script. */
export function isRepositoryPublic(slug: string): boolean {
  return typedCache.repositories[slug]?.available === true;
}

/**
 * True when the repository is configured but could not be read anonymously —
 * it is private, renamed or deleted.
 *
 * The link is still shown: GitHub handles the sign-in. The visitor is told
 * up front so a 404 never looks like a broken link on the site.
 */
export function isRepositoryPrivate(slug: string): boolean {
  const repository = typedCache.repositories[slug];
  if (!repository) return false;
  return repository.available === false;
}

/**
 * Release assets that look like real installers or packages.
 * Source archives (.zip/.tar.gz of a tag) are filtered out because they are
 * not installable artifacts.
 */
export function getInstallableAssets(slug: string): GithubReleaseAsset[] {
  const repository = typedCache.repositories[slug];
  if (!repository?.available || !repository.releases?.length) return [];
  return repository.releases.filter((asset) => {
    const name = asset.name.toLowerCase();
    if (name.endsWith('.zip') || name.endsWith('.tar.gz') || name.endsWith('.tgz')) return false;
    if (name.includes('source code')) return false;
    return (
      name.endsWith('.exe') ||
      name.endsWith('.msi') ||
      name.endsWith('.dmg') ||
      name.endsWith('.apk') ||
      name.endsWith('.deb') ||
      name.endsWith('.rpm') ||
      name.endsWith('.appimage') ||
      name.endsWith('.pkg')
    );
  });
}

export function getLatestRelease(slug: string): GithubRelease | undefined {
  return typedCache.repositories[slug]?.latestRelease ?? undefined;
}
