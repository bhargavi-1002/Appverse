/**
 * Local, privacy-friendly persistence.
 *
 * Everything here stays in the visitor's own browser. There is no analytics,
 * no fingerprinting and no server round-trip — the lists below are only ever
 * read back on the same device.
 */

const PREFIX = 'appverse:';

export const STORAGE_KEYS = {
  favorites: `${PREFIX}favorites`,
  recent: `${PREFIX}recent`,
  tracked: `${PREFIX}tracked`,
  theme: `${PREFIX}theme`,
  registryOverlay: `${PREFIX}registry-overlay`,
  dashboardEdits: `${PREFIX}dashboard-edits`,
} as const;

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function readString(key: string): string | null {
  if (!isBrowser()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeString(key: string, value: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* Storage can be full or blocked — the app still works without it. */
  }
}

export function readJson<T>(key: string, fallback: T): T {
  const raw = readString(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    writeString(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function removeKey(key: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------------------------------ *
 * Favourites
 * ------------------------------------------------------------------ */

export function readFavorites(): string[] {
  return readJson<string[]>(STORAGE_KEYS.favorites, []);
}

export function toggleFavorite(slug: string): string[] {
  const favorites = readFavorites();
  const next = favorites.includes(slug)
    ? favorites.filter((entry) => entry !== slug)
    : [slug, ...favorites];
  writeJson(STORAGE_KEYS.favorites, next);
  window.dispatchEvent(new CustomEvent('appverse:favorites'));
  return next;
}

/* ------------------------------------------------------------------ *
 * Recently opened
 * ------------------------------------------------------------------ */

const MAX_RECENT = 12;

export interface RecentEntry {
  slug: string;
  at: number;
}

export function readRecent(): RecentEntry[] {
  return readJson<RecentEntry[]>(STORAGE_KEYS.recent, []);
}

export function pushRecent(slug: string): void {
  const next = [{ slug, at: Date.now() }, ...readRecent().filter((e) => e.slug !== slug)].slice(
    0,
    MAX_RECENT,
  );
  writeJson(STORAGE_KEYS.recent, next);
  window.dispatchEvent(new CustomEvent('appverse:recent'));
}

/* ------------------------------------------------------------------ *
 * Tracked installations
 * ------------------------------------------------------------------ */

/**
 * The apps a visitor has chosen to keep track of. This is a personal
 * checklist — the browser cannot tell us what is actually installed on the
 * device, and we never claim that it can.
 */
export interface TrackedInstall {
  slug: string;
  /** How the visitor said they would install it. */
  method: 'pwa' | 'home-screen' | 'download' | 'source';
  at: number;
}

export function readTracked(): TrackedInstall[] {
  return readJson<TrackedInstall[]>(STORAGE_KEYS.tracked, []);
}

export function trackInstall(entry: TrackedInstall): TrackedInstall[] {
  const next = [entry, ...readTracked().filter((e) => e.slug !== entry.slug)];
  writeJson(STORAGE_KEYS.tracked, next);
  window.dispatchEvent(new CustomEvent('appverse:tracked'));
  return next;
}

export function untrackInstall(slug: string): void {
  writeJson(
    STORAGE_KEYS.tracked,
    readTracked().filter((entry) => entry.slug !== slug),
  );
  window.dispatchEvent(new CustomEvent('appverse:tracked'));
}

/* ------------------------------------------------------------------ *
 * Theme
 * ------------------------------------------------------------------ */

export type ThemePreference = 'dark' | 'light' | 'system';

export function readThemePreference(): ThemePreference {
  const value = readString(STORAGE_KEYS.theme);
  return value === 'light' || value === 'light' === true ? 'light' : value === 'dark' ? 'dark' : 'system';
}

export function writeThemePreference(preference: ThemePreference): void {
  writeString(STORAGE_KEYS.theme, preference);
}

export function applyTheme(preference: ThemePreference): 'dark' | 'light' {
  const prefersDark =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  const resolved = preference === 'system' ? (prefersDark ? 'dark' : 'light') : preference;
  document.documentElement.classList.toggle('light', resolved === 'light');
  document.documentElement.style.colorScheme = resolved;
  return resolved;
}
