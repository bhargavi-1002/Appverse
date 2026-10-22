import { Link } from 'react-router-dom';
import {
  Boxes,
  Compass,
  Github,
  Heart,
  PackageCheck,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { registry, categories, technologies } from '@/data/apps';
import { SectionHeading } from '@/components/SectionHeading';
import { useDocumentMeta } from '@/lib/seo';
import { Logo } from '@/components/Logo';

export function AboutPage() {
  useDocumentMeta({
    title: 'About AppVerse',
    description:
      'AppVerse is a personal application marketplace built by Bhargavi — one place for every web app, game and utility, with honest installation notes.',
    path: '/about',
  });

  const principles = [
    {
      Icon: ShieldCheck,
      title: 'Honest install states',
      detail:
        'An application is only called installable when its manifest has been checked. Everything else says exactly what it is — a web app, a source project, a placeholder build.',
    },
    {
      Icon: Boxes,
      title: 'Real data only',
      detail:
        'No invented download counts, ratings or user numbers. The statistics on this site are counted from the registry itself.',
    },
    {
      Icon: Sparkles,
      title: 'Configuration over code',
      detail:
        'Adding an application means adding a record to the registry. The schema validates it, the build fails if it is wrong, and the site picks it up.',
    },
    {
      Icon: PackageCheck,
      title: 'Privacy first',
      detail:
        'Favourites, history and the install list live in your browser. There is no account, no tracking and no analytics.',
    },
  ];

  return (
    <div className="av-container py-12">
      <section className="mx-auto max-w-3xl text-center">
        <Logo className="justify-center" />
        <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          One home for everything I build
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
          AppVerse is my own application marketplace. It started as a need — my projects were
          scattered across GitHub repositories, Vercel deployments and folders on a hard drive, and
          there was no single place to find them. Now there is: every project gets a page, a live
          demo, honest installation notes and a link back to its source.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to="/explore" className="av-btn av-btn-primary">
            <Compass size={16} aria-hidden="true" />
            Explore the catalogue
          </Link>
          <Link to="/install" className="av-btn av-btn-secondary">
            <PackageCheck size={16} aria-hidden="true" />
            Installation guide
          </Link>
        </div>
      </section>

      <section className="mt-16">
        <SectionHeading
          eyebrow="How it works"
          title="Four rules this site follows"
          description="The constraints are the product. They keep every button on the site honest."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {principles.map((principle) => (
            <div key={principle.title} className="rounded-lg border border-line bg-surface p-5">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line bg-bg-elevated text-accent-text">
                <principle.Icon size={18} aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-display text-[15px] font-semibold text-ink">
                {principle.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{principle.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <SectionHeading eyebrow="By the numbers" title="The catalogue today" />
        <dl className="mt-8 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Applications', value: registry.length },
            { label: 'Categories', value: categories.length },
            { label: 'Technologies', value: technologies.length },
            {
              label: 'Live deployments',
              value: registry.filter((app) => app.deploymentStatus === 'live').length,
            },
          ].map((stat) => (
            <div key={stat.label} className="bg-surface px-5 py-6 text-center">
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="block font-display text-3xl font-bold text-ink">{stat.value}</span>
                <span className="mt-1 block text-xs text-subtle">{stat.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-16 flex flex-col items-center gap-4 rounded-xl border border-line bg-surface p-8 text-center">
        <Heart size={22} className="text-rose" aria-hidden="true" />
        <p className="font-display text-lg font-semibold text-ink">Built by Bhargavi</p>
        <p className="max-w-md text-sm leading-relaxed text-muted">
          Every application in the catalogue was designed, written and shipped by Bhargavi. The
          source for most of them is public — have a look at how they work.
        </p>
        <a
          href="https://github.com/bhargavi-1002"
          target="_blank"
          rel="noopener noreferrer"
          className="av-btn av-btn-secondary !text-sm"
        >
          <Github size={15} aria-hidden="true" />
          Browse the GitHub profile
        </a>
      </section>
    </div>
  );
}
