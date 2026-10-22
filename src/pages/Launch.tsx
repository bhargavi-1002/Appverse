import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  Maximize2,
  RefreshCw,
  X,
} from 'lucide-react';
import { getAppBySlug } from '@/data/apps';
import { AppIcon } from '@/components/AppIcon';
import { EmptyState } from '@/components/EmptyState';
import { useDocumentMeta } from '@/lib/seo';
import { pushRecent } from '@/lib/storage';
import { safeUrl } from '@/lib/utils';

type EmbedState = 'idle' | 'loading' | 'loaded' | 'blocked';

export function LaunchPage() {
  const { slug } = useParams<{ slug: string }>();
  const app = getAppBySlug(slug);
  const [embedOpen, setEmbedOpen] = useState(false);
  const [embedState, setEmbedState] = useState<EmbedState>('idle');
  const frameRef = useRef<HTMLIFrameElement>(null);

  const liveUrl = safeUrl(app?.liveUrl);
  const hasLiveApp = Boolean(liveUrl) && app?.deploymentStatus === 'live';

  useDocumentMeta({
    title: app ? `Launch ${app.name}` : 'Application not found',
    description: app
      ? `Open ${app.name} — ${app.shortDescription}`
      : 'This application could not be found in the AppVerse catalogue.',
    path: app ? `/launch/${app.slug}` : '/launch/unknown',
  });

  useEffect(() => {
    if (app && liveUrl) pushRecent(app.slug);
  }, [app, liveUrl]);

  useEffect(() => {
    if (!embedOpen) {
      setEmbedState('idle');
      return;
    }
    setEmbedState('loading');
    const timer = window.setTimeout(() => {
      // If the frame never reports back, the deployment most likely refuses
      // to be embedded (X-Frame-Options or a frame-ancestors policy).
      setEmbedState((state) => (state === 'loading' ? 'blocked' : state));
    }, 7000);

    return () => window.clearTimeout(timer);
  }, [embedOpen]);

  const openInNewTab = () => {
    if (!liveUrl) return;
    window.open(liveUrl, '_blank', 'noopener,noreferrer');
  };

  const openInSameTab = () => {
    if (!liveUrl) return;
    window.location.href = liveUrl;
  };

  if (!app) {
    return (
      <div className="av-container py-20">
        <EmptyState
          icon={<AlertTriangle size={22} />}
          title="Application not found"
          description="There is no application in the catalogue with that address."
          action={
            <Link to="/explore" className="av-btn av-btn-primary !text-sm">
              Browse all applications
            </Link>
          }
        />
      </div>
    );
  }

  if (!hasLiveApp || !liveUrl) {
    return (
      <div className="av-container py-20">
        <EmptyState
          icon={<AlertTriangle size={22} />}
          title={`${app.name} has no live deployment yet`}
          description={
            app.repositoryUrl
              ? 'There is nothing to open in the browser for this project right now. The source code is public — clone it and run it locally.'
              : 'There is no public URL configured for this application yet. Check back soon.'
          }
          action={
            <div className="flex flex-wrap justify-center gap-3">
              {app.repositoryUrl && (
                <a
                  href={app.repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="av-btn av-btn-primary !text-sm"
                >
                  Open the repository
                  <ExternalLink size={14} aria-hidden="true" />
                </a>
              )}
              <Link to={`/apps/${app.slug}`} className="av-btn av-btn-secondary !text-sm">
                Back to details
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="av-container py-10">
      <Link
        to={`/apps/${app.slug}`}
        className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft size={15} aria-hidden="true" />
        Back to {app.name}
      </Link>

      <div className="mt-6 overflow-hidden rounded-xl border border-line bg-surface">
        <div className="flex flex-col gap-4 border-b border-line p-5 sm:flex-row sm:items-center">
          <AppIcon src={app.icon} name={app.name} size={56} accent={app.accent} />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-xl font-bold tracking-tight text-ink">
              {app.name}
            </h1>
            <p className="mt-1 line-clamp-2 text-sm text-muted">{app.shortDescription}</p>
            <p className="mt-1.5 truncate font-mono text-xs text-subtle">{liveUrl}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={openInNewTab} className="av-btn av-btn-primary !text-sm">
              <ExternalLink size={15} aria-hidden="true" />
              Open in new tab
            </button>
            <button
              type="button"
              onClick={openInSameTab}
              className="av-btn av-btn-secondary !text-sm"
            >
              Open here
            </button>
            <button
              type="button"
              onClick={() => setEmbedOpen((open) => !open)}
              aria-expanded={embedOpen}
              className="av-btn av-btn-secondary !text-sm"
            >
              <Maximize2 size={15} aria-hidden="true" />
              {embedOpen ? 'Hide preview' : 'Preview here'}
            </button>
          </div>
        </div>

        {embedOpen && (
          <div className="relative">
            <div className="flex items-center justify-between border-b border-line bg-bg-elevated px-4 py-2.5">
              <p className="text-xs text-muted">
                Embedded preview. Some applications block embedding for security reasons.
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setEmbedState('loading');
                    if (frameRef.current) {
                      frameRef.current.src = liveUrl;
                    }
                  }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-sm text-muted transition-colors hover:bg-surface hover:text-ink"
                  aria-label="Reload preview"
                >
                  <RefreshCw size={14} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setEmbedOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-sm text-muted transition-colors hover:bg-surface hover:text-ink"
                  aria-label="Close preview"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="relative bg-bg-deep">
              <iframe
                ref={frameRef}
                src={liveUrl}
                title={`${app.name} preview`}
                className="h-[70vh] min-h-[420px] w-full border-0"
                onLoad={() => setEmbedState('loaded')}
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                referrerPolicy="strict-origin-when-cross-origin"
                loading="lazy"
              />

              {embedState !== 'loaded' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-bg-deep/95 p-6 text-center">
                  {embedState === 'blocked' ? (
                    <>
                      <AlertTriangle size={26} className="text-amber" aria-hidden="true" />
                      <div className="max-w-md">
                        <p className="font-display text-base font-semibold text-ink">
                          This app refused to load in a frame
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-muted">
                          That is the application&apos;s own security policy — it sends an
                          X-Frame-Options or Content-Security-Policy header that blocks embedding.
                          Opening it in its own tab is the supported way to use it.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <RefreshCw size={24} className="animate-spin text-subtle" aria-hidden="true" />
                      <p className="text-sm text-muted">Loading the preview…</p>
                    </>
                  )}
                  <button type="button" onClick={openInNewTab} className="av-btn av-btn-primary !text-sm">
                    <ExternalLink size={15} aria-hidden="true" />
                    Open in a new tab instead
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 border-t border-line p-4 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            You are about to open an application hosted outside AppVerse. It keeps its own privacy
            policy and its own data practices.
          </p>
          <Link
            to={`/apps/${app.slug}`}
            className="inline-flex shrink-0 items-center gap-1.5 font-medium text-accent-text underline-offset-4 hover:underline"
          >
            Details, install notes and source
          </Link>
        </div>
      </div>
    </div>
  );
}
