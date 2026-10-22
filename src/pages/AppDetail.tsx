import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  ExternalLink,
  Github,
  Globe,
  Heart,
  Play,
  Share2,
  ShieldCheck,
  Clock,
  Tag,
  Boxes,
  ScrollText,
} from 'lucide-react';
import { getAppBySlug, getRelatedApps } from '@/data/apps';
import { installationTypeLabels, platformLabels, verificationStatusLabels } from '@/data/types';
import { AppIcon } from '@/components/AppIcon';
import { AppCard } from '@/components/AppCard';
import { AppInstallPanel } from '@/components/AppInstallPanel';
import { InstallStatusBadge, PlatformChips } from '@/components/PlatformChips';
import { SectionHeading } from '@/components/SectionHeading';
import { ShareDialog } from '@/components/ShareDialog';
import { EmptyState } from '@/components/EmptyState';
import { useDocumentMeta, SITE_URL } from '@/lib/seo';
import { useFavorites, useTrackedInstalls } from '@/hooks/useLocalLists';
import { trackInstall } from '@/lib/storage';
import { formatDate, formatRelative, safeUrl } from '@/lib/utils';
import { getGithubRepository, getLatestRelease, isRepositoryPrivate } from '@/lib/github';

export function AppDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const app = getAppBySlug(slug);
  const { favorites, toggle } = useFavorites();
  const { tracked } = useTrackedInstalls();
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    if (app) document.title = `${app.name} · AppVerse`;
  }, [app]);

  const related = useMemo(() => (app ? getRelatedApps(app) : []), [app]);
  const repository = app ? getGithubRepository(app.slug) : undefined;
  const latestRelease = app ? getLatestRelease(app.slug) : undefined;
  const repositoryIsPrivate = app ? isRepositoryPrivate(app.slug) : false;

  useDocumentMeta({
    title: app ? `${app.name} — ${installationTypeLabels[app.installationType]}` : 'Application not found',
    description: app?.shortDescription ?? 'This application could not be found in the AppVerse catalogue.',
    path: app ? `/apps/${app.slug}` : '/apps/unknown',
    type: app ? 'article' : 'website',
    jsonLd: app
      ? {
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: app.name,
          description: app.shortDescription,
          applicationCategory: app.category,
          operatingSystem: app.supportedPlatforms
            .map((platform) => platformLabels[platform])
            .join(', '),
          url: app.liveUrl ?? `${SITE_URL}/apps/${app.slug}`,
          ...(app.liveUrl ? { sameAs: app.liveUrl } : {}),
          ...(app.repositoryUrl ? { codeRepository: app.repositoryUrl } : {}),
          ...(app.version ? { softwareVersion: app.version } : {}),
          author: { '@type': 'Person', name: 'Bhargavi' },
        }
      : undefined,
  });

  if (!app) {
    return (
      <div className="av-container py-20">
        <EmptyState
          icon={<AlertTriangle size={22} />}
          title="Application not found"
          description="There is no application in the catalogue with that address. It may have been renamed or removed."
          action={
            <Link to="/explore" className="av-btn av-btn-primary !text-sm">
              Browse all applications
            </Link>
          }
        />
      </div>
    );
  }

  const hasLiveApp = Boolean(app.liveUrl) && app.deploymentStatus === 'live';
  const liveUrl = safeUrl(app.liveUrl);
  const repoUrl = safeUrl(app.repositoryUrl);
  const isTracked = tracked.some((entry) => entry.slug === app.slug);
  const isFavorite = favorites.includes(app.slug);

  const handleTrack = (method: 'pwa' | 'home-screen' | 'download' | 'source') => {
    trackInstall({ slug: app.slug, method, at: Date.now() });
  };

  return (
    <div className="pb-8">
      {/* ------------------------------------------------------- Breadcrumb */}
      <div className="av-container pt-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-subtle">
          <Link to="/" className="transition-colors hover:text-ink">
            AppVerse
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            to={`/explore?category=${encodeURIComponent(app.category)}`}
            className="transition-colors hover:text-ink"
          >
            {app.category}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="truncate text-muted">{app.name}</span>
        </nav>
      </div>

      {/* ------------------------------------------------------------ Hero */}
      <header className="av-container pt-8">
        <div className="relative overflow-hidden rounded-xl border border-line bg-surface p-6 sm:p-8">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-25 blur-3xl"
            style={{ background: app.accent ?? '#7c5cff' }}
            aria-hidden="true"
          />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start">
            <AppIcon src={app.icon} name={app.name} size={84} accent={app.accent} />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                  {app.name}
                </h1>
                <InstallStatusBadge installationType={app.installationType} />
                {app.featured && (
                  <span className="rounded-pill border border-accent/30 bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent-text">
                    Featured
                  </span>
                )}
              </div>

              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
                {app.shortDescription}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                {hasLiveApp && liveUrl && (
                  <Link to={`/launch/${app.slug}`} className="av-btn av-btn-primary">
                    <Play size={16} aria-hidden="true" />
                    Open app
                  </Link>
                )}
              {repoUrl && (
                <a
                  href={repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="av-btn av-btn-secondary"
                >
                  <Github size={16} aria-hidden="true" />
                  Source code
                  <ExternalLink size={13} className="opacity-70" aria-hidden="true" />
                </a>
              )}
                <button
                  type="button"
                  onClick={() => setShareOpen(true)}
                  className="av-btn av-btn-secondary"
                >
                  <Share2 size={16} aria-hidden="true" />
                  Share
                </button>
                <button
                  type="button"
                  onClick={() => toggle(app.slug)}
                  aria-pressed={isFavorite}
                  className={
                    isFavorite
                      ? 'av-btn av-btn-secondary !border-rose/40 !text-rose'
                      : 'av-btn av-btn-secondary'
                  }
                >
                  <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} aria-hidden="true" />
                  {isFavorite ? 'Saved' : 'Save'}
                </button>
              </div>

              {app.deploymentStatus === 'placeholder' && (
                <div className="mt-5 flex items-start gap-3 rounded-md border border-amber/30 bg-amber/8 p-4">
                  <AlertTriangle size={17} className="mt-0.5 shrink-0 text-amber" aria-hidden="true" />
                  <div className="text-sm leading-relaxed">
                    <p className="font-medium text-ink">The public build is still a placeholder.</p>
                    <p className="mt-1 text-amber/90">
                      The deployment for this project currently serves a starter template rather
                      than the application itself. The full implementation lives in the repository —
                      run it locally and you get the real thing.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <dl className="relative mt-8 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-bg-elevated px-4 py-3.5">
              <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-subtle">
                <Tag size={12} aria-hidden="true" />
                Category
              </dt>
              <dd className="mt-1 text-sm font-medium text-ink">{app.category}</dd>
            </div>
            {app.version && (
              <div className="bg-bg-elevated px-4 py-3.5">
                <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-subtle">
                  <Boxes size={12} aria-hidden="true" />
                  Version
                </dt>
                <dd className="mt-1 text-sm font-medium text-ink">{app.version}</dd>
              </div>
            )}
            {app.lastUpdated && (
              <div className="bg-bg-elevated px-4 py-3.5">
                <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-subtle">
                  <Clock size={12} aria-hidden="true" />
                  Last updated
                </dt>
                <dd
                  className="mt-1 text-sm font-medium text-ink"
                  title={formatDate(app.lastUpdated)}
                >
                  {formatRelative(app.lastUpdated)}
                </dd>
              </div>
            )}
            <div className="bg-bg-elevated px-4 py-3.5">
              <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-subtle">
                <ShieldCheck size={12} aria-hidden="true" />
                Verified
              </dt>
              <dd className="mt-1 text-sm font-medium text-ink">
                {verificationStatusLabels[app.verificationStatus]}
              </dd>
            </div>
          </dl>
        </div>
      </header>

      {/* -------------------------------------------------------- Content */}
      <div className="av-container mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-6">
          {/* Overview */}
          <section
            aria-labelledby="overview-heading"
            className="rounded-lg border border-line bg-surface p-6"
          >
            <h2
              id="overview-heading"
              className="font-display text-lg font-semibold text-ink"
            >
              About this app
            </h2>
            <div className="mt-4 space-y-3.5 text-[15px] leading-relaxed text-muted">
              {app.fullDescription.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {app.features.length > 0 && (
              <>
                <h3 className="mt-7 font-display text-sm font-semibold text-ink">Highlights</h3>
                <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                  {app.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-muted">
                      <Check
                        size={15}
                        className="mt-0.5 shrink-0 text-emerald"
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {app.tags.length > 0 && (
              <>
                <h3 className="mt-7 font-display text-sm font-semibold text-ink">Tags</h3>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {app.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-pill border border-line bg-bg-elevated px-2.5 py-0.5 text-xs text-muted"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          {/* Screenshots */}
          {app.screenshots.length > 0 && (
            <section
              aria-labelledby="screenshots-heading"
              className="rounded-lg border border-line bg-surface p-6"
            >
              <h2
                id="screenshots-heading"
                className="font-display text-lg font-semibold text-ink"
              >
                Screenshots
              </h2>
              <p className="mt-1.5 text-sm text-subtle">
                Captured automatically from the live deployment.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {app.screenshots.map((shot, index) => (
                  <figure
                    key={shot}
                    className="overflow-hidden rounded-md border border-line bg-bg-elevated"
                  >
                    <img
                      src={shot}
                      alt={`${app.name} screenshot ${index + 1}`}
                      loading="lazy"
                      decoding="async"
                      width={1280}
                      height={800}
                      className="w-full"
                    />
                    <figcaption className="border-t border-line px-3 py-2 text-xs text-subtle">
                      {index === 0 ? 'Desktop view' : 'Mobile view'}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          )}

          {/* Installation steps */}
          {app.installationInstructions.length > 0 && (
            <section
              aria-labelledby="steps-heading"
              className="rounded-lg border border-line bg-surface p-6"
            >
              <h2 id="steps-heading" className="font-display text-lg font-semibold text-ink">
                How to install
              </h2>
              <div className="mt-4 space-y-6">
                {app.installationInstructions.map((guide) => (
                  <div key={guide.title}>
                    <h3 className="font-display text-sm font-semibold text-ink">{guide.title}</h3>
                    <ol className="mt-3 space-y-3">
                      {guide.steps.map((step, index) => (
                        <li key={step.title} className="flex gap-3">
                          <span
                            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-pill border border-accent/35 bg-accent-soft text-[11px] font-semibold text-accent-text"
                            aria-hidden="true"
                          >
                            {index + 1}
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-medium text-ink">{step.title}</span>
                            <span className="mt-0.5 block text-sm leading-relaxed text-muted">
                              {step.detail}
                            </span>
                            {step.code && (
                              <code className="mt-2 inline-block rounded-sm border border-line bg-bg-elevated px-2.5 py-1 font-mono text-xs text-accent-text">
                                {step.code}
                              </code>
                            )}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Release notes */}
          {app.changelog.length > 0 && (
            <section
              aria-labelledby="changelog-heading"
              className="rounded-lg border border-line bg-surface p-6"
            >
              <h2
                id="changelog-heading"
                className="flex items-center gap-2 font-display text-lg font-semibold text-ink"
              >
                <ScrollText size={18} className="text-subtle" aria-hidden="true" />
                Release notes
              </h2>
              <div className="mt-4 space-y-5">
                {app.changelog.map((entry) => (
                  <div key={`${entry.version}-${entry.date}`} className="border-l-2 border-line pl-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-sm font-semibold text-ink">
                        {entry.version}
                      </span>
                      <span className="text-xs text-subtle">{formatDate(entry.date)}</span>
                    </div>
                    <ul className="mt-2 space-y-1.5">
                      {entry.changes.map((change) => (
                        <li key={change} className="flex items-start gap-2 text-sm text-muted">
                          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-subtle" aria-hidden="true" />
                          {change}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Troubleshooting */}
          {app.troubleshooting.length > 0 && (
            <section
              aria-labelledby="troubleshooting-heading"
              className="rounded-lg border border-line bg-surface p-6"
            >
              <h2
                id="troubleshooting-heading"
                className="font-display text-lg font-semibold text-ink"
              >
                Troubleshooting
              </h2>
              <dl className="mt-4 space-y-4">
                {app.troubleshooting.map((item) => (
                  <div key={item.problem}>
                    <dt className="text-sm font-medium text-ink">{item.problem}</dt>
                    <dd className="mt-1 text-sm leading-relaxed text-muted">{item.fix}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {/* Verification */}
          <section
            aria-labelledby="verification-heading"
            className="rounded-lg border border-line bg-surface p-6"
          >
            <h2
              id="verification-heading"
              className="font-display text-lg font-semibold text-ink"
            >
              What was verified
            </h2>
            <p className="mt-1.5 text-sm text-subtle">
              AppVerse checks every entry before it is published. Here is exactly what was checked
              for this application.
            </p>
            <ul className="mt-4 space-y-2.5">
              {app.verificationNotes.map((note) => (
                <li key={note} className="flex items-start gap-2.5 text-sm leading-relaxed text-muted">
                  <Check size={15} className="mt-0.5 shrink-0 text-emerald" aria-hidden="true" />
                  {note}
                </li>
              ))}
            </ul>

            {repository?.available && (
              <div className="mt-6 rounded-sm border border-line bg-bg-elevated p-4">
                <p className="text-sm font-medium text-ink">
                  {repository.fullName} on GitHub
                </p>
                <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
                  {repository.language && <li>Language: {repository.language}</li>}
                  {repository.license && <li>License: {repository.license}</li>}
                  {repository.defaultBranch && <li>Branch: {repository.defaultBranch}</li>}
                  {repository.pushedAt && (
                    <li>Last push: {formatRelative(repository.pushedAt.slice(0, 10))}</li>
                  )}
                </ul>
                {latestRelease && (
                  <p className="mt-2 text-xs text-muted">
                    Latest release:{' '}
                    <a
                      href={latestRelease.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-accent-text underline-offset-4 hover:underline"
                    >
                      {latestRelease.tag}
                    </a>
                  </p>
                )}
              </div>
            )}
          </section>
        </div>

        {/* ------------------------------------------------------ Sidebar */}
        <aside className="space-y-6">
          <AppInstallPanel
            app={app}
            isTracked={isTracked}
            onTrack={(method) => {
              handleTrack(method);
            }}
          />

          <section className="rounded-lg border border-line bg-surface p-5">
            <h2 className="font-display text-sm font-semibold text-ink">Supported on</h2>
            <ul className="mt-3 space-y-2">
              {app.supportedPlatforms.map((platform) => (
                <li key={platform} className="flex items-center gap-2 text-sm text-muted">
                  <Globe size={14} className="shrink-0 text-subtle" aria-hidden="true" />
                  {platformLabels[platform]}
                </li>
              ))}
            </ul>
            <PlatformChips platforms={app.supportedPlatforms} className="mt-4" max={6} />
          </section>

          {app.permissions.length > 0 && (
            <section className="rounded-lg border border-line bg-surface p-5">
              <h2 className="font-display text-sm font-semibold text-ink">
                Permissions &amp; data
              </h2>
              <ul className="mt-3 space-y-2">
                {app.permissions.map((permission) => (
                  <li key={permission} className="flex items-start gap-2 text-sm leading-relaxed text-muted">
                    <ShieldCheck
                      size={14}
                      className="mt-0.5 shrink-0 text-subtle"
                      aria-hidden="true"
                    />
                    {permission}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs leading-relaxed text-subtle">
                {app.privacyUrl ? (
                  <a
                    href={safeUrl(app.privacyUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-accent-text underline-offset-4 hover:underline"
                  >
                    Read the privacy policy
                  </a>
                ) : (
                  'This project does not publish a separate privacy policy. AppVerse itself keeps nothing about you.'
                )}
              </p>
            </section>
          )}

          <section className="rounded-lg border border-line bg-surface p-5">
            <h2 className="font-display text-sm font-semibold text-ink">Links</h2>
            <ul className="mt-3 space-y-2">
              {liveUrl && (
                <li>
                  <a
                    href={liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-accent-text underline-offset-4 hover:underline"
                  >
                    <Globe size={14} aria-hidden="true" />
                    Official website
                    <ExternalLink size={12} className="opacity-70" aria-hidden="true" />
                  </a>
                </li>
              )}
              {repoUrl && (
                <li>
                  <a
                    href={repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-accent-text underline-offset-4 hover:underline"
                  >
                    <Github size={14} aria-hidden="true" />
                    GitHub repository
                    <ExternalLink size={12} className="opacity-70" aria-hidden="true" />
                  </a>
                  {repositoryIsPrivate && (
                    <span className="mt-1 block text-xs leading-relaxed text-subtle">
                      This repository is private. GitHub will ask you to sign in with an account
                      that has access.
                    </span>
                  )}
                </li>
              )}
              {app.homepageUrl && safeUrl(app.homepageUrl) && (
                <li>
                  <a
                    href={safeUrl(app.homepageUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-accent-text underline-offset-4 hover:underline"
                  >
                    <Globe size={14} aria-hidden="true" />
                    Project homepage
                    <ExternalLink size={12} className="opacity-70" aria-hidden="true" />
                  </a>
                </li>
              )}
              <li>
                <Link
                  to="/install"
                  className="inline-flex items-center gap-2 text-sm text-accent-text underline-offset-4 hover:underline"
                >
                  <ArrowLeft size={14} aria-hidden="true" />
                  Installation guide
                </Link>
              </li>
            </ul>

            <p className="mt-4 text-xs leading-relaxed text-subtle">
              Something broken?{' '}
              <a
                href={`https://github.com/bhargavi-1002/${app.slug === 'chrono-drift' ? 'time-traveler-game' : app.slug}/issues`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent-text underline-offset-4 hover:underline"
              >
                Report a broken link
              </a>
              .
            </p>
          </section>
        </aside>
      </div>

      {/* ------------------------------------------------------- Related */}
      {related.length > 0 && (
        <section className="av-container mt-16">
          <SectionHeading
            eyebrow="More like this"
            title="Related applications"
            action={
              <Link to="/explore" className="av-btn av-btn-secondary !min-h-10 !text-sm">
                Browse all
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            }
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((relatedApp) => (
              <AppCard
                key={relatedApp.slug}
                app={relatedApp}
                isFavorite={favorites.includes(relatedApp.slug)}
                onToggleFavorite={toggle}
              />
            ))}
          </div>
        </section>
      )}

      <ShareDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        path={`/apps/${app.slug}`}
        title={app.name}
        description={app.shortDescription}
      />
    </div>
  );
}
