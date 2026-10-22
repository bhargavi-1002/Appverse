import { Link } from 'react-router-dom';
import { Github, Heart, ExternalLink, ShieldCheck } from 'lucide-react';
import { Logo } from './Logo';
import { registry } from '@/data/apps';

const footerLinks = [
  {
    title: 'Marketplace',
    links: [
      { label: 'Discover', to: '/' },
      { label: 'Explore apps', to: '/explore' },
      { label: 'Favourites', to: '/favorites' },
    ],
  },
  {
    title: 'Install',
    links: [
      { label: 'Installation guide', to: '/install' },
      { label: 'Install AppVerse', to: '/install#appverse' },
      { label: 'Platform support', to: '/install#platforms' },
    ],
  },
  {
    title: 'Project',
    links: [
      { label: 'About AppVerse', to: '/about' },
      { label: 'Privacy', to: '/privacy' },
      { label: 'Owner dashboard', to: '/dashboard' },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-line bg-bg-deep/60">
      <div className="av-container py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted">
              A single home for every application Bhargavi builds — browse them, open them in your
              browser, and install the ones that support it.
            </p>
            <p className="mt-4 text-sm text-muted">
              <Link
                to="/install"
                className="font-medium text-accent-text underline-offset-4 hover:underline"
              >
                Install AppVerse
              </Link>{' '}
              for a standalone, offline-capable experience.
            </p>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <h2 className="font-display text-sm font-semibold text-ink">{group.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <hr className="av-hairline my-10" />

        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm text-muted">
              <Heart size={14} className="text-rose" aria-hidden="true" />
              Built by <strong className="font-semibold text-ink">Bhargavi</strong>
            </p>
            <p className="text-xs text-subtle">
              © {year} AppVerse. {registry.length} applications published.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="https://github.com/bhargavi-1002"
              target="_blank"
              rel="noopener noreferrer"
              className="av-btn av-btn-secondary !min-h-10 !px-3.5 !text-sm"
            >
              <Github size={15} aria-hidden="true" />
              GitHub
              <ExternalLink size={12} className="text-subtle" aria-hidden="true" />
            </a>
            <Link to="/privacy" className="av-btn av-btn-ghost !min-h-10 !px-3.5 !text-sm">
              <ShieldCheck size={15} aria-hidden="true" />
              Privacy
            </Link>
            <a
              href="https://github.com/bhargavi-1002?tab=repositories"
              target="_blank"
              rel="noopener noreferrer"
              className="av-btn av-btn-ghost !min-h-10 !px-3.5 !text-sm"
            >
              Report an issue
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
