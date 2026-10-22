import { useEffect, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';

/**
 * Service worker update prompt.
 *
 * A new version of AppVerse is downloaded in the background. The visitor is
 * told, and can choose when to reload — nothing changes underneath them
 * mid-task.
 */
export function PwaUpdateToast() {
  const [registration, setRegistration] = useState<
    ServiceWorkerRegistration | null
  >(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const onControllerChange = () => {
      // A new worker has taken over — offer the reload.
      void navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) setRegistration(registration);
      });
    };

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    const check = async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg?.waiting) setRegistration(reg);
      } catch {
        /* ignore */
      }
    };

    void check();
    const interval = window.setInterval(() => void check(), 60_000);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === 'APPVERSE_UPDATE_READY') setRegistration(event.data.registration ?? null);
    };
    navigator.serviceWorker?.addEventListener('message', onMessage);
    return () => navigator.serviceWorker?.removeEventListener('message', onMessage);
  }, []);

  if (!registration || dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-lg border border-line bg-bg-elevated p-4 shadow-lg"
    >
      <div className="flex items-start gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-line bg-surface text-accent-text">
          <RefreshCw size={16} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink">A new version of AppVerse is ready</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Reload when you are at a good stopping point to pick up the latest changes.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => {
                registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }}
              className="av-btn av-btn-primary !min-h-9 !px-3 !text-xs"
            >
              Reload now
            </button>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="av-btn av-btn-ghost !min-h-9 !px-3 !text-xs"
            >
              Later
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-muted transition-colors hover:bg-surface hover:text-ink"
          aria-label="Dismiss update notice"
        >
          <X size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
