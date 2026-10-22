/** Join class names, dropping falsy values. */
export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ');
}

/** Format an ISO date (YYYY-MM-DD) as a readable date. */
export function formatDate(value: string | undefined): string {
  if (!value) return '—';
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/** Human-friendly relative time, e.g. "3 months ago". */
export function formatRelative(value: string | undefined): string {
  if (!value) return '—';
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;

  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.round(diffMs / 86_400_000);
  if (diffDays < 1) return 'today';
  if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

  const diffMonths = Math.round(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;

  const diffYears = Math.round(diffDays / 365);
  return `${diffYears} year${diffYears === 1 ? '' : 's'} ago`;
}

/** Truncate a string on a word boundary. */
export function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  const slice = value.slice(0, max);
  const lastSpace = slice.lastIndexOf(' ');
  return `${(lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice).trimEnd()}…`;
}

/**
 * Validate a URL that will be used as a link.
 *
 * Only absolute https/http URLs are accepted. This rejects `javascript:`,
 * `data:`, `vbscript:` and every other dangerous scheme before a user can
 * ever click the link.
 */
export function isSafeExternalUrl(value: string | undefined | null): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

/** Return a safe external URL, or undefined when the value is not usable. */
export function safeUrl(value: string | undefined | null): string | undefined {
  return isSafeExternalUrl(value) ? value : undefined;
}

/** Format a byte count for display. */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value >= 10 || exponent === 0 ? Math.round(value) : value.toFixed(1)} ${units[exponent]}`;
}

/** Shuffle a copy of an array (Fisher-Yates). */
export function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Slugify a string for use in URLs and ids. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
