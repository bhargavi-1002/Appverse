import { useEffect, useState } from 'react';
import { Check, Copy, Link2, QrCode as QrIcon, X, ExternalLink } from 'lucide-react';
import { QrCode } from './QrCode';
import { SITE_URL } from '@/lib/seo';

export interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  /** Path on this site, e.g. "/apps/cyber-runner". */
  path: string;
  title: string;
  description?: string;
}

export function ShareDialog({ open, onClose, path, title, description }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const url = `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  useEffect(() => {
    if (!open) return;
    setCopied(false);
    setShowQr(false);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard access can be blocked — the URL is visible for manual copy.
      setCopied(false);
    }
  };

  const shareNative = async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({ title, text: description ?? title, url });
        onClose();
        return;
      } catch {
        /* the visitor dismissed the share sheet */
      }
    }
    setShowQr(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Share ${title}`}
    >
      <button
        type="button"
        className="absolute inset-0 h-full w-full cursor-default bg-black/70 backdrop-blur-sm"
        aria-label="Close share dialog"
        onClick={onClose}
        tabIndex={-1}
      />

      <div className="av-animate-fade-up relative w-full max-w-md overflow-hidden rounded-lg border border-line bg-bg-elevated shadow-lg">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-base font-semibold text-ink">Share</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-sm text-muted transition-colors hover:bg-surface hover:text-ink"
            aria-label="Close share dialog"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <p className="text-sm text-muted">{description ?? title}</p>

          <div className="flex items-center gap-2 rounded-sm border border-line bg-surface p-2">
            <Link2 size={15} className="ml-1 shrink-0 text-subtle" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted">{url}</span>
            <button
              type="button"
              onClick={() => void copy()}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-sm border border-line bg-bg-elevated px-2.5 text-xs font-medium text-ink transition-colors hover:border-line-strong"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-emerald" aria-hidden="true" />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={13} aria-hidden="true" />
                  Copy
                </>
              )}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void shareNative()}
              className="av-btn av-btn-primary !min-h-10 flex-1 !text-sm"
            >
              <ExternalLink size={15} aria-hidden="true" />
              Share…
            </button>
            <button
              type="button"
              onClick={() => setShowQr((value) => !value)}
              className="av-btn av-btn-secondary !min-h-10 !text-sm"
              aria-expanded={showQr}
            >
              <QrIcon size={15} aria-hidden="true" />
              {showQr ? 'Hide QR' : 'QR code'}
            </button>
          </div>

          {showQr && (
            <div className="flex flex-col items-center gap-3 rounded-md border border-line bg-surface p-5">
              <QrCode value={url} size={168} label={`QR code linking to ${title}`} />
              <p className="max-w-[16rem] text-center text-xs leading-relaxed text-subtle">
                Scan with a phone camera to open this page on another device.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
