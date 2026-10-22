import { useCallback, useEffect, useState } from 'react';
import {
  applyTheme,
  readThemePreference,
  writeThemePreference,
  type ThemePreference,
} from '@/lib/storage';

/**
 * Light / dark / system theme switch.
 *
 * The preference is stored locally and applied to the document root, which
 * swaps the CSS variables that drive the whole design system.
 */
export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(() => readThemePreference());
  const [resolved, setResolved] = useState<'dark' | 'light'>(() =>
    typeof document !== 'undefined'
      ? document.documentElement.classList.contains('light')
        ? 'light'
        : 'dark'
      : 'dark',
  );

  useEffect(() => {
    setResolved(applyTheme(preference));
    writeThemePreference(preference);

    if (preference !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setResolved(applyTheme('system'));
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [preference]);

  const update = useCallback((next: ThemePreference) => setPreference(next), []);

  return { preference, resolved, setPreference: update };
}
