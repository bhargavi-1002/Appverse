import { Link } from 'react-router-dom';
import { Heart, Compass } from 'lucide-react';
import { registry } from '@/data/apps';
import { AppCard } from '@/components/AppCard';
import { EmptyState } from '@/components/EmptyState';
import { SectionHeading } from '@/components/SectionHeading';
import { useFavorites } from '@/hooks/useLocalLists';
import { useDocumentMeta } from '@/lib/seo';

export function FavoritesPage() {
  const { favorites, toggle } = useFavorites();
  const apps = registry.filter((app) => favorites.includes(app.slug));

  useDocumentMeta({
    title: 'Favourites',
    description: 'The applications you have saved, stored privately in this browser.',
    path: '/favorites',
  });

  return (
    <div className="av-container py-12">
      <SectionHeading
        eyebrow="Saved"
        title="Your favourites"
        description="Saved on this device only. There is no account and nothing is uploaded."
      />

      <div className="mt-8">
        {apps.length === 0 ? (
          <EmptyState
            icon={<Heart size={22} />}
            title="Nothing saved yet"
            description="Tap the heart on any application to keep it here for quick access."
            action={
              <Link to="/explore" className="av-btn av-btn-primary !text-sm">
                <Compass size={15} aria-hidden="true" />
                Explore the catalogue
              </Link>
            }
          />
        ) : (
          <>
            <p className="mb-4 text-sm text-muted" aria-live="polite">
              {apps.length} saved {apps.length === 1 ? 'application' : 'applications'}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {apps.map((app) => (
                <AppCard
                  key={app.slug}
                  app={app}
                  isFavorite
                  onToggleFavorite={toggle}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
