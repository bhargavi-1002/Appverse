import { useCallback, useEffect, useMemo, useState } from 'react';

/* ------------------------------------------------------------------ *
 * AppVerse's own install prompt
 * ------------------------------------------------------------------ */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export type InstallSupport =
  | 'available' // beforeinstallprompt fired — we can install directly
  | 'installed' // already running as an installed app
  | 'ios-guide' // iOS Safari: no prompt event, but "Add to Home Screen" works
  | 'unsupported'; // no prompt event and no known manual route

export interface InstallPromptState {
  support: InstallSupport;
  /** True while the browser's own install dialog is open. */
  prompting: boolean;
  outcome: 'accepted' | 'dismissed' | null;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const promptListeners = new Set<(state: InstallPromptState) => void>();

let currentState: InstallPromptState = {
  support: 'unsupported',
  prompting: false,
  outcome: null,
};

function updateState(patch: Partial<InstallPromptState>) {
  currentState = { ...currentState, ...patch };
  promptListeners.forEach((listener) => listener(currentState));
}

/** True when the page is running as an installed app (standalone display). */
export function isRunningStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  if (typeof window.matchMedia === 'function') {
    if (window.matchMedia('(display-mode: standalone)').matches) return true;
    if (window.matchMedia('(display-mode: minimal-ui)').matches) return true;
    if (window.matchMedia('(display-mode: fullscreen)').matches) return true;
  }
  // iOS Safari exposes the standalone flag on the navigator instead.
  return (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

/**
 * Feature-based detection of whether this browser can install a web app.
 *
 * The `beforeinstallprompt` event is the real signal. We only fall back to
 * platform hints to decide whether to show the iOS instructions — we never
 * claim an install is possible because of a user-agent string alone.
 */
function detectSupport(): InstallSupport {
  if (isRunningStandalone()) return 'installed';
  if (deferredPrompt) return 'available';

  const isAppleTouch =
    typeof navigator !== 'undefined' &&
    'standalone' in navigator &&
    /Macintosh/.test(navigator.userAgent) &&
    navigator.maxTouchPoints > 1;

  if (isAppleTouch) return 'ios-guide';
  if (typeof navigator !== 'undefined' && /iPhone|iPad|iPod/.test(navigator.userAgent)) {
    return 'ios-guide';
  }
  return 'unsupported';
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    updateState({ support: 'available' });
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    updateState({ support: 'installed', outcome: 'accepted' });
  });
}

/**
 * Subscribe to the install prompt state.
 *
 * `canInstall` is feature-based: it is only true once the browser has told
 * us an install is actually possible.
 */
export function useInstallPrompt() {
  const [state, setState] = useState<InstallPromptState>(currentState);

  useEffect(() => {
    promptListeners.add(setState);
    updateState({ support: detectSupport() });
    return () => {
      promptListeners.delete(setState);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) {
      updateState({ support: detectSupport() });
      return 'unavailable' as const;
    }
    updateState({ prompting: true });
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      updateState({ outcome, support: detectSupport(), prompting: false });
      return outcome;
    } catch {
      updateState({ prompting: false });
      return 'dismissed' as const;
    }
  }, []);

  return useMemo(
    () => ({ ...state, promptInstall }),
    [state, promptInstall],
  );
}
