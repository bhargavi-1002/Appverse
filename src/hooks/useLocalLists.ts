import { useCallback, useEffect, useState } from 'react';
import {
  readFavorites,
  readRecent,
  readTracked,
  toggleFavorite,
  untrackInstall,
  type RecentEntry,
  type TrackedInstall,
} from '@/lib/storage';

/**
 * Local favourites. The list never leaves the visitor's device — there is no
 * account and no server involved.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => readFavorites());

  useEffect(() => {
    const sync = () => setFavorites(readFavorites());
    window.addEventListener('appverse:favorites', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('appverse:favorites', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const toggle = useCallback((slug: string) => {
    setFavorites(toggleFavorite(slug));
  }, []);

  return {
    favorites,
    isFavorite: useCallback((slug: string) => favorites.includes(slug), [favorites]),
    toggle,
  };
}

/** Recently opened applications, newest first. */
export function useRecentlyOpened() {
  const [recent, setRecent] = useState<RecentEntry[]>(() => readRecent());

  useEffect(() => {
    const sync = () => setRecent(readRecent());
    window.addEventListener('appverse:recent', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('appverse:recent', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return { recent };
}

/** Applications the visitor has chosen to keep track of. */
export function useTrackedInstalls() {
  const [tracked, setTracked] = useState<TrackedInstall[]>(() => readTracked());

  useEffect(() => {
    const sync = () => setTracked(readTracked());
    window.addEventListener('appverse:tracked', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('appverse:tracked', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const untrack = useCallback((slug: string) => {
    untrackInstall(slug);
    setTracked(readTracked());
  }, []);

  return { tracked, untrack };
}
