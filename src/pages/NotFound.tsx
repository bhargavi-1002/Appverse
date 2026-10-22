import { Link } from 'react-router-dom';
import { Compass, Home, PackageX, Search } from 'lucide-react';
import { useDocumentMeta } from '@/lib/seo';

export function NotFoundPage() {
  useDocumentMeta({
    title: 'Page not found',
    description: 'That page does not exist in AppVerse.',
    path: '/404',
  });

  return (
    <div className="av-container flex min-h-[62vh] flex-col items-center justify-center py-16 text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-lg border border-line bg-surface text-subtle">
        <PackageX size={24} aria-hidden="true" />
      </span>

      <p className="mt-6 font-display text-6xl font-bold tracking-tight text-ink">404</p>
      <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink">
        This page does not exist
      </h1>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
        The link may be out of date, or the application it pointed to has been renamed. The
        catalogue below has everything that is currently published.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="av-btn av-btn-primary">
          <Home size={16} aria-hidden="true" />
          Back to home
        </Link>
        <Link to="/explore" className="av-btn av-btn-secondary">
          <Compass size={16} aria-hidden="true" />
          Explore applications
        </Link>
      </div>

      <p className="mt-8 inline-flex items-center gap-2 text-sm text-subtle">
        <Search size={14} aria-hidden="true" />
        Press{' '}
        <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-xs">
          /
        </kbd>{' '}
        to search the catalogue from anywhere.
      </p>
    </div>
  );
}
