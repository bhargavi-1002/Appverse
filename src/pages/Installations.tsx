import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Apple,
  Check,
  Chrome,
  Download,
  Globe,
  Info,
  Laptop,
  ListChecks,
  Monitor,
  Package,
  PackageCheck,
  ShieldCheck,
  Smartphone,
  Trash2,
  TriangleAlert,
} from 'lucide-react';
import { registry } from '@/data/apps';
import { installationTypeLabels } from '@/data/types';
import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { SectionHeading } from '@/components/SectionHeading';
import { useDocumentMeta } from '@/lib/seo';
import { useInstallPrompt } from '@/lib/install';
import { useFavorites, useTrackedInstalls } from '@/hooks/useLocalLists';
import { cn } from '@/lib/utils';

const platformGuides = [
  {
    id: 'android',
    Icon: Smartphone,
    title: 'Android',
    subtitle: 'Chrome, Edge and other Chromium browsers',
    steps: [
      'Open the application in your browser.',
      'Look for the install icon in the address bar, or open the browser menu and choose "Install app" or "Add to home screen".',
      'Confirm the prompt. The app is added to your launcher and opens in its own window.',
      'Launch it from your home screen or app drawer — it behaves like any other installed app.',
    ],
    note: 'Chromium browsers only offer the install prompt to sites that publish a valid web app manifest over HTTPS. If no prompt appears, the site is not installable — a home-screen shortcut still works.',
  },
  {
    id: 'ios',
    Icon: Apple,
    title: 'iOS & iPadOS',
    subtitle: 'Safari',
    steps: [
      'Open the app in Safari — Safari is required, Chrome on iOS cannot add web apps.',
      'Tap the Share button in the toolbar.',
      'Scroll down and choose "Add to Home Screen".',
      'Name the app and tap "Add". It now appears on your home screen and opens without browser chrome.',
    ],
    note: 'iOS never shows an install prompt. "Add to Home Screen" creates a home-screen shortcut that runs full-screen — it is not an App Store install.',
  },
  {
    id: 'windows',
    Icon: Monitor,
    title: 'Windows',
    subtitle: 'Edge and Chrome',
    steps: [
      'Open the application in Edge or Chrome.',
      'Click the install icon at the right of the address bar (or open the browser menu → "Install").',
      'Confirm, and the app is installed as a desktop application with its own launcher entry and taskbar icon.',
      'Pin it to the taskbar or Start menu for one-click access.',
    ],
    note: 'Edge and Chrome both install web apps on Windows 10 and 11. Firefox does not.',
  },
  {
    id: 'macos',
    Icon: Laptop,
    title: 'macOS',
    subtitle: 'Chrome, Edge and Safari',
    steps: [
      'In Chrome or Edge, open the app and use the install icon in the address bar.',
      'The app is added to your Applications folder and launches in its own window.',
      'In Safari, use File → "Add to Dock" (macOS 15 and later) for a similar result.',
    ],
    note: 'Safari on macOS can add web apps to the Dock on recent versions of macOS. Chrome and Edge work across all supported releases.',
  },
  {
    id: 'linux',
    Icon: Globe,
    title: 'Linux',
    subtitle: 'Chromium browsers',
    steps: [
      'Open the application in Chrome, Chromium or Brave.',
      'Use the install icon in the address bar.',
      'The app is installed as a desktop entry you can launch from your applications menu.',
    ],
    note: 'Any Chromium-based browser on Linux supports installing web apps. Other browsers do not.',
  },
];

const troubleshooting = [
  {
    problem: 'The install button never appears in the address bar.',
    fix: 'Browsers only offer it for sites served over HTTPS that publish a valid web app manifest with a name, a start URL, a standalone display mode and 192px and 512px icons. The AppVerse installability check on each app page tells you exactly which of those criteria are met.',
  },
  {
    problem: 'I installed the app and it still shows the browser toolbar.',
    fix: 'That is a home-screen shortcut rather than a full install. On Android and iOS you need "Add to Home Screen" / "Add to Home Screen" from the share sheet; on desktop, use the browser install icon.',
  },
  {
    problem: 'The install prompt did nothing.',
    fix: 'Dismissed prompts are remembered for a while — wait a few minutes, or clear the site data for that domain and try again.',
  },
  {
    problem: 'Can AppVerse tell me what is already installed on my device?',
    fix: 'No. A website cannot inspect the applications installed on a device, and AppVerse does not attempt to. The list below is a personal checklist you control, stored only in this browser.',
  },
  {
    problem: 'The app works but I want it back on my phone.',
    fix: 'Open the app on the phone and add it to the home screen there. The install state is per-device, so installing on a laptop does not install it on a phone.',
  },
];

export function InstallationsPage() {
  const { support, promptInstall, prompting } = useInstallPrompt();
  const { tracked, untrack } = useTrackedInstalls();
  const { favorites, toggle } = useFavorites();
  const [openGuide, setOpenGuide] = useState<string | null>('android');

  useDocumentMeta({
    title: 'Installation guide',
    description:
      'How to install AppVerse and its applications on Android, iOS, Windows, macOS and Linux — plus what a website can and cannot do about installs.',
    path: '/install',
  });

  const installable = useMemo(() => registry.filter((app) => app.installationType === 'pwa'), []);
  const browserOnly = useMemo(
    () => registry.filter((app) => app.installationType === 'web' && app.deploymentStatus === 'live'),
    [],
  );
  const sourceOnly = useMemo(() => registry.filter((app) => app.installationType === 'github'), []);

  const trackedApps = tracked
    .map((entry) => ({ entry, app: registry.find((app) => app.slug === entry.slug) }))
    .filter((item): item is { entry: (typeof tracked)[number]; app: (typeof registry)[number] } =>
      Boolean(item.app),
    );

  return (
    <div className="av-container py-12">
      <SectionHeading
        eyebrow="Installations"
        title="Install anything, on any device"
        description="AppVerse works as a website and installs as an app. Some of the applications in the catalogue can be installed on their own too — this page explains exactly how, and where that is not possible."
      />

      {/* --------------------------------------------- AppVerse itself */}
      <section
        id="appverse"
        className="mt-10 overflow-hidden rounded-xl border border-accent/25 bg-surface"
        aria-labelledby="appverse-install"
      >
        <div className="grid gap-8 p-6 sm:p-9 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-pill border border-accent/30 bg-accent-soft px-3 py-1 text-xs font-medium text-accent-text">
              <PackageCheck size={13} aria-hidden="true" />
              AppVerse itself
            </span>
            <h2
              id="appverse-install"
              className="mt-4 font-display text-2xl font-bold tracking-tight text-ink"
            >
              Install AppVerse as a Progressive Web App
            </h2>
            <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-muted">
              Installed, AppVerse opens in its own window with no browser chrome, keeps working
              offline, and starts up from your home screen or launcher like any other app.
            </p>

            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {[
                'Works offline — the catalogue is cached after your first visit',
                'Standalone window, no address bar',
                'No account, no sign-up, nothing tracked',
                'Updates automatically when a new version is published',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted">
                  <Check size={15} className="mt-0.5 shrink-0 text-emerald" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-7 flex flex-wrap gap-3">
              {support === 'available' ? (
                <button
                  type="button"
                  onClick={() => void promptInstall()}
                  disabled={prompting}
                  className="av-btn av-btn-primary"
                >
                  <Download size={16} aria-hidden="true" />
                  {prompting ? 'Installing…' : 'Install AppVerse'}
                </button>
              ) : support === 'installed' ? (
                <span className="av-btn av-btn-secondary cursor-default">
                  <Check size={16} className="text-emerald" aria-hidden="true" />
                  Already installed
                </span>
              ) : (
                <a href="#appverse-steps" className="av-btn av-btn-primary">
                  <Download size={16} aria-hidden="true" />
                  Show the manual steps
                </a>
              )}
              <Link to="/explore" className="av-btn av-btn-secondary">
                Browse the catalogue
              </Link>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-subtle">
              Installing is entirely optional — every page on this site works in a normal browser
              tab, and we never block content behind an install prompt.
            </p>
          </div>

          <div className="rounded-lg border border-line bg-bg-elevated p-5">
            <p className="text-sm font-medium text-ink">What your browser supports</p>
            <dl className="mt-3 space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <span
                  className={cn(
                    'mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-pill',
                    support === 'available' || support === 'installed'
                      ? 'bg-emerald/15 text-emerald'
                      : 'bg-amber/15 text-amber',
                  )}
                  aria-hidden="true"
                >
                  {support === 'available' || support === 'installed' ? (
                    <Check size={12} />
                  ) : (
                    <Info size={12} />
                  )}
                </span>
                <div>
                  <dt className="font-medium text-ink">One-click install</dt>
                  <dd className="text-muted">
                    {support === 'available'
                      ? 'Ready — your browser offered an install prompt.'
                      : support === 'installed'
                        ? 'AppVerse is running as an installed app right now.'
                        : 'Your browser has not offered an install prompt. Use the manual steps below — everything still works.'}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-pill bg-cyan/15 text-cyan" aria-hidden="true">
                  <Check size={12} />
                </span>
                <div>
                  <dt className="font-medium text-ink">Offline mode</dt>
                  <dd className="text-muted">
                    Enabled — a service worker caches the site so the catalogue is readable without
                    a connection.
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-pill bg-cyan/15 text-cyan" aria-hidden="true">
                  <Check size={12} />
                </span>
                <div>
                  <dt className="font-medium text-ink">Standalone display</dt>
                  <dd className="text-muted">
                    Enabled — the manifest requests standalone mode so the app opens without browser
                    chrome.
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* -------------------------------------------- What's installable */}
      <section id="platforms" className="mt-16">
        <SectionHeading
          eyebrow="Per app"
          title="What can be installed"
          description="Every application states how it is delivered. AppVerse never shows an install button for something that cannot actually be installed."
        />

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-line bg-surface p-5">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-emerald/30 bg-emerald/10 text-emerald">
              <Package size={18} aria-hidden="true" />
            </span>
            <h3 className="mt-4 font-display text-sm font-semibold text-ink">Installable PWAs</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {installable.length > 0
                ? `${installable.length} ${installable.length === 1 ? 'application is' : 'applications are'} published as installable web apps. Their pages verify the manifest before offering a prompt.`
                : 'None of the current applications publish an installable web app. They are browser applications that can be added to your home screen.'}
            </p>
          </div>

          <div className="rounded-lg border border-line bg-surface p-5">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-cyan/30 bg-cyan/10 text-cyan">
              <Globe size={18} aria-hidden="true" />
            </span>
            <h3 className="mt-4 font-display text-sm font-semibold text-ink">Browser applications</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {browserOnly.length} {browserOnly.length === 1 ? 'application runs' : 'applications run'}{' '}
              in a browser. You can add them to your home screen for a full-screen shortcut — they
              are not native installs.
            </p>
          </div>

          <div className="rounded-lg border border-line bg-surface p-5">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line bg-bg-elevated text-muted">
              <ListChecks size={18} aria-hidden="true" />
            </span>
            <h3 className="mt-4 font-display text-sm font-semibold text-ink">Source projects</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {sourceOnly.length} {sourceOnly.length === 1 ? 'project is' : 'projects are'} published
              as source code with no packaged build. Clone the repository and run it — source code on
              its own is not a ready-to-install application.
            </p>
          </div>
        </div>

        {/* My list */}
        <div className="mt-10">
          <h3 className="font-display text-lg font-semibold text-ink">My install list</h3>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">
            A personal checklist stored only in this browser. It records what you have chosen to
            install — a website cannot see what is actually installed on your device, and this list
            is never sent anywhere.
          </p>

          {trackedApps.length === 0 ? (
            <div className="mt-5 rounded-lg border border-dashed border-line bg-surface px-5 py-10 text-center">
              <p className="text-sm text-muted">
                Nothing on your list yet. Open any application and choose{' '}
                <strong className="font-medium text-ink">Add to my install list</strong> to keep
                track of it.
              </p>
              <Link to="/explore" className="av-btn av-btn-secondary mt-4 !text-sm">
                Find something to install
              </Link>
            </div>
          ) : (
            <ul className="mt-5 space-y-2.5">
              {trackedApps.map(({ entry, app }) => (
                <li
                  key={entry.slug}
                  className="flex items-center gap-3 rounded-md border border-line bg-surface p-3.5"
                >
                  <AppIcon src={app.icon} name={app.name} size={38} accent={app.accent} />
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/apps/${app.slug}`}
                      className="block truncate text-sm font-medium text-ink underline-offset-4 hover:underline"
                    >
                      {app.name}
                    </Link>
                    <p className="text-xs text-subtle">
                      Marked as {entry.method.replace('-', ' ')} ·{' '}
                      {installationTypeLabels[app.installationType]}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => untrack(entry.slug)}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-sm text-muted transition-colors hover:bg-surface-strong hover:text-rose"
                    aria-label={`Remove ${app.name} from your install list`}
                  >
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ----------------------------------------------- Platform guides */}
      <section id="appverse-steps" className="mt-16">
        <SectionHeading
          eyebrow="Step by step"
          title="Install on your device"
          description="The same catalogue, installed on five kinds of device."
        />

        <div className="mt-8 space-y-3">
          {platformGuides.map((guide) => {
            const open = openGuide === guide.id;
            return (
              <div key={guide.id} className="overflow-hidden rounded-lg border border-line bg-surface">
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpenGuide(open ? null : guide.id)}
                    aria-expanded={open}
                    aria-controls={`guide-${guide.id}`}
                    className="flex w-full items-center gap-3.5 p-4 text-left transition-colors hover:bg-surface-strong sm:p-5"
                  >
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-line bg-bg-elevated text-accent-text">
                      <guide.Icon size={18} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-[15px] font-semibold text-ink">
                        {guide.title}
                      </span>
                      <span className="block text-xs text-subtle">{guide.subtitle}</span>
                    </span>
                    <span
                      className={cn(
                        'text-sm font-medium transition-colors',
                        open ? 'text-accent-text' : 'text-muted',
                      )}
                      aria-hidden="true"
                    >
                      {open ? '−' : '+'}
                    </span>
                  </button>
                </h3>

                {open && (
                  <div id={`guide-${guide.id}`} className="border-t border-line px-4 pb-5 pt-4 sm:px-5">
                    <ol className="space-y-3">
                      {guide.steps.map((step, index) => (
                        <li key={step} className="flex gap-3">
                          <span
                            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-pill border border-accent/35 bg-accent-soft text-[11px] font-semibold text-accent-text"
                            aria-hidden="true"
                          >
                            {index + 1}
                          </span>
                          <span className="text-sm leading-relaxed text-muted">{step}</span>
                        </li>
                      ))}
                    </ol>
                    <p className="mt-4 flex items-start gap-2 rounded-sm border border-line bg-bg-elevated p-3 text-xs leading-relaxed text-subtle">
                      <Info size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
                      {guide.note}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* --------------------------------------------- Browser application */}
      <section className="mt-16">
        <SectionHeading
          eyebrow="Catalogue"
          title="Applications you can add to your home screen"
          description="These run in the browser today. Adding one to your home screen gives it a launcher icon and a full-screen window."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {browserOnly.map((app) => (
            <AppCard
              key={app.slug}
              app={app}
              isFavorite={favorites.includes(app.slug)}
              onToggleFavorite={toggle}
            />
          ))}
        </div>
      </section>

      {/* ------------------------------------------------- Troubleshooting */}
      <section className="mt-16">
        <SectionHeading
          eyebrow="Help"
          title="When the prompt does not appear"
          description="The most common reasons an install prompt never shows up."
        />
        <dl className="mt-8 space-y-4">
          {troubleshooting.map((item) => (
            <div key={item.problem} className="rounded-lg border border-line bg-surface p-5">
              <dt className="flex items-start gap-2.5 font-display text-sm font-semibold text-ink">
                <TriangleAlert size={16} className="mt-0.5 shrink-0 text-amber" aria-hidden="true" />
                {item.problem}
              </dt>
              <dd className="mt-2 pl-[26px] text-sm leading-relaxed text-muted">{item.fix}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* --------------------------------------------------- Privacy note */}
      <section className="mt-12 flex items-start gap-3 rounded-lg border border-line bg-surface p-5">
        <ShieldCheck size={18} className="mt-0.5 shrink-0 text-emerald" aria-hidden="true" />
        <div className="text-sm leading-relaxed text-muted">
          <p className="font-medium text-ink">Your list never leaves this device.</p>
          <p className="mt-1">
            Favourites, recently opened applications and this install list are stored in your
            browser&apos;s local storage. There is no account, no analytics and no server copy —{' '}
            <Link to="/privacy" className="font-medium text-accent-text underline-offset-4 hover:underline">
              read the privacy details
            </Link>
            .
          </p>
        </div>
      </section>

      <p className="mt-8 flex items-center gap-2 text-xs text-subtle">
        <Chrome size={13} aria-hidden="true" />
        Note: install support varies by browser and version. The steps above describe the current
        behaviour of Chrome, Edge, Safari and Chromium — Firefox does not support installing web
        apps on desktop.
      </p>
    </div>
  );
}
