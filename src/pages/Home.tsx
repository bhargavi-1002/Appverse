import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Compass,
  Download,
  PackageCheck,
  Search,
  Sparkles,
  ShieldCheck,
  Smartphone,
  Monitor,
  Apple,
  Terminal,
} from 'lucide-react';
import { registry, categories, featuredApps, recentlyUpdated, technologies } from '@/data/apps';
import { AppCard } from '@/components/AppCard';
import { SectionHeading } from '@/components/SectionHeading';
import { useDocumentMeta, SITE_URL } from '@/lib/seo';
import { useFavorites } from '@/hooks/useLocalLists';
import { useInstallPrompt } from '@/lib/install';
import { cn } from '@/lib/utils';

const categoryIcons: Record<string, typeof Compass> = {
  Games: Sparkles,
  Productivity: PackageCheck,
  Utilities: ShieldCheck,
  Education: Sparkles,
  Communication: Smartphone,
  'Developer Tools': Terminal,
};

const platformGuides = [
  {
    Icon: Smartphone,
    title: 'Android',
    detail: 'Chrome and other Chromium browsers can install an app straight from the address bar.',
    accent: 'text-emerald',
  },
  {
    Icon: Apple,
    title: 'iOS',
    detail: 'Safari adds web apps to your home screen through the share sheet.',
    accent: 'text-ink',
  },
  {
    Icon: Monitor,
    title: 'Windows & macOS',
    detail: 'Edge and Chrome install apps in their own window with a launcher entry.',
    accent: 'text-cyan',
  },
  {
    Icon: Terminal,
    title: 'Linux',
    detail: 'Chromium browsers support the same install flow on desktop Linux.',
    accent: 'text-amber',
  },
];

export function HomePage() {
  const [query, setQuery] = useState('');
  const { favorites, toggle } = useFavorites();
  const { support, promptInstall, prompting } = useInstallPrompt();
  const navigate = useNavigate();

  useDocumentMeta({
    title: 'AppVerse — Your apps. Your ecosystem. One destination.',
    description:
      'AppVerse is a personal application marketplace: browse every project in one place, open the apps live in your browser, and install the ones that support installation.',
    path: '/',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'AppVerse',
      description: 'A marketplace of applications by Bhargavi.',
      url: SITE_URL,
      isPartOf: { '@type': 'WebSite', name: 'AppVerse', url: SITE_URL },
    },
  });

  const liveCount = useMemo(
    () => registry.filter((app) => app.deploymentStatus === 'live').length,
    [],
  );

  const stats = [
    { value: registry.length, label: 'Applications' },
    { value: liveCount, label: 'Live deployments' },
    { value: categories.length, label: 'Categories' },
    { value: technologies.length, label: 'Technologies' },
  ];

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    navigate(trimmed ? `/explore?q=${encodeURIComponent(trimmed)}` : '/explore');
  };

  return (
    <>
      {/* ----------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="av-aurora" aria-hidden="true" />
        <div
          className="av-grid-bg absolute inset-0 opacity-70"
          style={{
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, #000 30%, transparent 78%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, #000 30%, transparent 78%)',
          }}
          aria-hidden="true"
        />

        <div className="av-container relative z-10 pb-16 pt-14 sm:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-pill border border-accent/30 bg-accent-soft px-3.5 py-1 text-xs font-medium text-accent-text">
              <Sparkles size={13} aria-hidden="true" />
              One destination for every project
            </span>

            <h1 className="mt-6 font-display text-[2.6rem] font-bold leading-[1.05] tracking-tight text-ink sm:text-6xl">
              <span className="av-gradient-text">AppVerse</span>
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-balance text-lg leading-relaxed text-muted">
              Your apps. Your ecosystem. One destination. Browse every project, open the live apps in
              your browser, and install the ones that support it.
            </p>

            <form onSubmit={handleSearch} className="mx-auto mt-8 max-w-xl" role="search">
              <div className="flex items-center gap-2 rounded-lg border border-line bg-bg-elevated p-2 shadow-lg transition-colors focus-within:border-accent">
                <Search size={18} className="ml-2 shrink-0 text-subtle" aria-hidden="true" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search apps, categories…"
                  aria-label="Search applications"
                  className="h-11 min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-subtle"
                />
                <button type="submit" className="av-btn av-btn-primary !min-h-10 !px-4 !text-sm">
                  Search
                </button>
              </div>
            </form>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link to="/explore" className="av-btn av-btn-primary">
                <Compass size={16} aria-hidden="true" />
                Explore applications
              </Link>
              <Link to="/install" className="av-btn av-btn-secondary">
                <Download size={16} aria-hidden="true" />
                Installation guide
              </Link>
            </div>

            <dl className="mx-auto mt-12 grid max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-bg px-3 py-5 text-center">
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <span className="block font-display text-2xl font-bold text-ink">{stat.value}</span>
                    <span className="mt-1 block text-xs text-subtle">{stat.label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- Featured */}
      <section className="av-container py-16">
        <SectionHeading
          eyebrow="Handpicked"
          title="Featured applications"
          description="A curated selection from the catalogue — the ones worth opening first."
          action={
            <Link to="/explore" className="av-btn av-btn-secondary !min-h-10 !text-sm">
              View all
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          }
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredApps.map((app) => (
            <AppCard
              key={app.slug}
              app={app}
              isFavorite={favorites.includes(app.slug)}
              onToggleFavorite={toggle}
            />
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------- Recent */}
      <section className="av-container py-16">
        <SectionHeading
          eyebrow="Fresh"
          title="Recently updated"
          description="The projects that changed most recently, based on their last commit."
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recentlyUpdated.slice(0, 6).map((app) => (
            <AppCard
              key={app.slug}
              app={app}
              isFavorite={favorites.includes(app.slug)}
              onToggleFavorite={toggle}
            />
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------- Categories */}
      <section className="border-y border-line bg-bg-deep/40 py-16">
        <div className="av-container">
          <SectionHeading
            eyebrow="Browse"
            title="Jump to a category"
            description="Every application in AppVerse is filed under a category, so you can narrow things down quickly."
          />

          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const Icon = categoryIcons[category] ?? Compass;
              const count = registry.filter((app) => app.category === category).length;
              return (
                <li key={category}>
                  <Link
                    to={`/explore?category=${encodeURIComponent(category)}`}
                    className="group flex items-center gap-3.5 rounded-lg border border-line bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-line-strong hover:bg-surface-strong"
                  >
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-line bg-bg-elevated text-accent-text transition-colors group-hover:border-accent/40">
                      <Icon size={19} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-[15px] font-semibold text-ink">
                        {category}
                      </span>
                      <span className="block text-xs text-subtle">
                        {count} {count === 1 ? 'application' : 'applications'}
                      </span>
                    </span>
                    <ArrowRight
                      size={16}
                      className="shrink-0 text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-accent-text"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ----------------------------------------------- Install AppVerse */}
      <section id="install" className="av-container py-16">
        <div className="overflow-hidden rounded-xl border border-line bg-surface">
          <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.15fr_1fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-pill border border-emerald/30 bg-emerald/10 px-3 py-1 text-xs font-medium text-emerald">
                <PackageCheck size={13} aria-hidden="true" />
                Progressive Web App
              </span>
              <h2 className="mt-5 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                Install AppVerse itself
              </h2>
              <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-muted">
                AppVerse is a proper installable web app. Installed, it opens in its own window with
                no browser chrome, keeps working offline, and puts every application one tap away
                from your home screen.
              </p>

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
                ) : (
                  <Link to="/install#appverse" className="av-btn av-btn-primary">
                    <Download size={16} aria-hidden="true" />
                    How to install
                  </Link>
                )}
                <Link to="/install" className="av-btn av-btn-secondary">
                  Read the full guide
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-subtle">
                Installing is optional. Everything in the catalogue works in a normal browser tab.
              </p>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {platformGuides.map(({ Icon, title, detail, accent }) => (
                <li
                  key={title}
                  className="flex items-start gap-3 rounded-md border border-line bg-bg-elevated p-3.5"
                >
                  <Icon size={18} className={cn('mt-0.5 shrink-0', accent)} aria-hidden="true" />
                  <span>
                    <span className="block text-sm font-medium text-ink">{title}</span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-muted">{detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
