import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  Download,
  ExternalLink,
  Github,
  Globe,
  Monitor,
  Package,
  ShieldAlert,
  Smartphone,
  X,
} from 'lucide-react';
import type { AppEntry } from '@/data/schema';
import { platformLabels } from '@/data/types';
import { getManifestReport, manifestCacheGeneratedAt, type ManifestReport } from '@/lib/manifests';
import { formatBytes } from '@/lib/utils';
import { getInstallableAssets } from '@/lib/github';

export interface AppInstallPanelProps {
  app: AppEntry;
  /** Called when the visitor marks this app as tracked on their device. */
  onTrack?: (method: 'pwa' | 'home-screen' | 'download' | 'source') => void;
  isTracked?: boolean;
}

const statusCopy: Record<
  ManifestReport['status'],
  { label: string; tone: 'success' | 'danger'; detail: string }
> = {
  installable: {
    label: 'Installable PWA',
    tone: 'success',
    detail:
      'A browser offered its own install prompt for this deployment, which means every install criterion is satisfied.',
  },
  'not-installable': {
    label: 'Not installable',
    tone: 'danger',
    detail:
      'This deployment does not meet the criteria browsers require before they will offer an install prompt.',
  },
};

/**
 * The installation panel on an application page.
 *
 * It only ever offers an action that can actually work. When an application
 * is browser-only it says so and explains the manual route instead of showing
 * a decorative "Install" button.
 */
export function AppInstallPanel({ app, onTrack, isTracked }: AppInstallPanelProps) {
  const report = useMemo(() => getManifestReport(app.slug), [app.slug]);

  const assets = getInstallableAssets(app.slug);
  const hasLiveApp = Boolean(app.liveUrl) && app.deploymentStatus === 'live';

  /**
   * Registry assets and GitHub release assets describe the same thing in
   * different shapes, so they are normalised into one list before rendering.
   */
  const displayAssets = [
    ...app.downloadAssets.map((asset) => ({
      key: asset.url,
      name: asset.fileName,
      url: asset.url,
      sizeLabel: asset.size ?? 'Size not published',
      checksum: asset.checksum,
      platformLabel: platformLabels[asset.platform],
      source: asset.source,
    })),
    ...assets.map((asset) => ({
      key: asset.url,
      name: asset.name,
      url: asset.url,
      sizeLabel: asset.size ? formatBytes(asset.size) : 'Size not published',
      checksum: asset.checksum ?? undefined,
      platformLabel: undefined,
      source: 'GitHub Release',
    })),
  ];

  return (
    <section
      aria-labelledby="install-heading"
      className="rounded-lg border border-line bg-surface p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="install-heading" className="font-display text-base font-semibold text-ink">
          Installation
        </h2>
        {isTracked && (
          <span className="inline-flex items-center gap-1.5 rounded-pill border border-emerald/30 bg-emerald/10 px-2.5 py-0.5 text-xs font-medium text-emerald">
            <Check size={12} aria-hidden="true" />
            On your list
          </span>
        )}
      </div>

      <div className="mt-4 space-y-4">
        {/* ------------------------------------------------ PWA */}
        {app.installationType === 'pwa' && (
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-sm border border-line bg-bg-elevated p-3.5">
              <Package size={18} className="mt-0.5 shrink-0 text-emerald" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">Progressive Web App</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  This app is published as a PWA. Open it once and use your browser&apos;s install
                  prompt to add it to your device.
                </p>
              </div>
            </div>

            {hasLiveApp && app.liveUrl && (
              <a
                href={app.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="av-btn av-btn-primary w-full"
              >
                <Download size={16} aria-hidden="true" />
                Open to install
                <ExternalLink size={13} className="opacity-70" aria-hidden="true" />
              </a>
            )}
          </div>
        )}

        {/* ------------------------------------------------ Web only */}
        {app.installationType === 'web' && (
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-sm border border-line bg-bg-elevated p-3.5">
              <Globe size={18} className="mt-0.5 shrink-0 text-cyan" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">Browser application</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {hasLiveApp
                    ? 'This app runs in the browser. It is not published as an installable PWA, so your browser will not show an install banner — but you can still add it to your home screen and it will open without browser chrome.'
                    : 'This app is published as source. Open the repository and run it locally, or host it as a static site.'}
                </p>
              </div>
            </div>

            <ul className="space-y-2 text-sm text-muted">
              <li className="flex items-start gap-2">
                <Smartphone size={15} className="mt-0.5 shrink-0 text-subtle" aria-hidden="true" />
                <span>
                  <strong className="font-medium text-ink">Android:</strong> open in Chrome, then the
                  browser menu → &ldquo;Add to home screen&rdquo;.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Smartphone size={15} className="mt-0.5 shrink-0 text-subtle" aria-hidden="true" />
                <span>
                  <strong className="font-medium text-ink">iOS:</strong> open in Safari, tap Share →
                  &ldquo;Add to Home Screen&rdquo;. Safari is required.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Monitor size={15} className="mt-0.5 shrink-0 text-subtle" aria-hidden="true" />
                <span>
                  <strong className="font-medium text-ink">Desktop:</strong> Chromium browsers can
                  install the page as a standalone window from the address bar.
                </span>
              </li>
            </ul>

            {hasLiveApp && app.liveUrl && (
              <Link to={`/launch/${app.slug}`} className="av-btn av-btn-primary w-full">
                <Globe size={16} aria-hidden="true" />
                Open in browser
              </Link>
            )}
          </div>
        )}

        {/* ------------------------------------------------ APK */}
        {app.installationType === 'apk' && (
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-sm border border-amber/25 bg-amber/8 p-3.5">
              <ShieldAlert size={18} className="mt-0.5 shrink-0 text-amber" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">Android package</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  Android will warn you that the package came from outside the Play Store. That
                  warning is expected for a self-published build. Download it only from this page and
                  check the checksum below if one is published.
                </p>
              </div>
            </div>

            {app.downloadAssets.length === 0 ? (
              <p className="rounded-sm border border-line bg-bg-elevated p-3 text-sm text-muted">
                No package file is published yet, so there is nothing to download.
              </p>
            ) : (
              <ul className="space-y-2">
                {displayAssets.map((asset) => (
                  <li key={asset.key}>
                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-sm border border-line bg-bg-elevated p-3 transition-colors hover:border-line-strong"
                    >
                      <Download size={16} className="shrink-0 text-accent-text" aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">
                          {asset.name}
                        </span>
                        <span className="block text-xs text-subtle">
                          {asset.platformLabel ? `${asset.platformLabel} · ` : ''}
                          {asset.sizeLabel}
                          {asset.source ? ` · ${asset.source}` : ''}
                        </span>
                        {asset.checksum && (
                          <span className="mt-1 block truncate font-mono text-[11px] text-subtle">
                            sha256:{asset.checksum}
                          </span>
                        )}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* ------------------------------------------------ Desktop */}
        {app.installationType === 'desktop' && (
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-sm border border-line bg-bg-elevated p-3.5">
              <Monitor size={18} className="mt-0.5 shrink-0 text-indigo" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">Desktop build</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  Official installers for this project are listed below. Pick the build that matches
                  your operating system and processor architecture.
                </p>
              </div>
            </div>

            {app.downloadAssets.length === 0 && assets.length === 0 ? (
              <p className="rounded-sm border border-line bg-bg-elevated p-3 text-sm text-muted">
                No installer is published for this project yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {displayAssets.map((asset) => (
                  <li key={asset.key}>
                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-sm border border-line bg-bg-elevated p-3 transition-colors hover:border-line-strong"
                    >
                      <Download size={16} className="shrink-0 text-accent-text" aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">
                          {asset.name}
                        </span>
                        <span className="block text-xs text-subtle">{asset.sizeLabel}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* ------------------------------------------------ GitHub */}
        {app.installationType === 'github' && (
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-sm border border-line bg-bg-elevated p-3.5">
              <Github size={18} className="mt-0.5 shrink-0 text-muted" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">Source code only</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  This project is published as source. There is no packaged build and no public
                  deployment for it yet, so there is nothing to install — but the code runs in a
                  browser as soon as you serve the folder.
                </p>
              </div>
            </div>

            {app.repositoryUrl && (
              <a
                href={app.repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="av-btn av-btn-primary w-full"
              >
                <Github size={16} aria-hidden="true" />
                Open the repository
                <ExternalLink size={13} className="opacity-70" aria-hidden="true" />
              </a>
            )}
          </div>
        )}

        {/* ----------------------------------- Live verification */}
        {hasLiveApp && app.liveUrl && app.installationType !== 'pwa' && (
          <div className="rounded-sm border border-line bg-bg-elevated p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-ink">Installability check</p>
              <span className="text-xs text-subtle">Checked {manifestCacheGeneratedAt.slice(0, 10)}</span>
            </div>

            {report ? (
              <>
                <p
                  className={`mt-2 text-xs font-medium ${
                    statusCopy[report.status].tone === 'success' ? 'text-emerald' : 'text-rose'
                  }`}
                >
                  {statusCopy[report.status].label} — {statusCopy[report.status].detail}
                </p>
                <ul className="mt-3 space-y-1.5">
                  {report.criteria.map((criterion) => (
                    <li key={criterion.id} className="flex items-start gap-2 text-xs">
                      {criterion.passed === true ? (
                        <Check size={13} className="mt-0.5 shrink-0 text-emerald" aria-hidden="true" />
                      ) : criterion.passed === false ? (
                        <X size={13} className="mt-0.5 shrink-0 text-rose" aria-hidden="true" />
                      ) : (
                        <span className="mt-1.5 h-[13px] w-[13px] shrink-0 rounded-full border border-line" />
                      )}
                      <span className="text-muted">
                        <strong className="font-medium text-ink">{criterion.label}:</strong>{' '}
                        {criterion.detail}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="mt-2 text-xs text-subtle">
                This deployment has not been checked yet. Run{' '}
                <code className="font-mono">npm run verify:manifests</code> to verify it.
              </p>
            )}

            <p className="mt-3 text-[11px] leading-relaxed text-subtle">
              The check runs against the deployment from a real browser, so it reflects what your
              browser would actually find. It confirms what the deployment publishes — it cannot
              confirm that anything was installed on your device.
            </p>
          </div>
        )}

        {onTrack && (
          <button
            type="button"
            onClick={() =>
              onTrack(
                app.installationType === 'pwa'
                  ? 'pwa'
                  : app.installationType === 'github'
                    ? 'source'
                    : app.downloadAssets.length > 0
                      ? 'download'
                      : 'home-screen',
              )
            }
            className="av-btn av-btn-secondary w-full !text-sm"
          >
            <Check size={15} aria-hidden="true" />
            {isTracked ? 'Keep on my list' : 'Add to my install list'}
          </button>
        )}
      </div>
    </section>
  );
}
